import { Deck, Preferences } from '../types';

interface ScryfallResponse 
{
    data: any[];
}
export async function getRecommendations(prefs:Preferences): Promise <Deck[]>
{
    const response=await fetch('https://api.scryfall.com/cards/search?q=is%3Acommander%20legal%3Acommander');
    const data=(await response.json()) as ScryfallResponse;

    const allCommanders:Deck[]=data.data.map((card:any)=>({
        id:card.id,
        commanderName:card.name,
        colors:card.colors,
        strategy: inferStrategy(card.oracle_text || "",card.name), 
        budget: calculateBudget(card.prices.usd),
        bracket: 3, // Default value
        imageUrl: card.image_uris?.normal

    }));

    return allCommanders
    .map(deck => ({
      deck,
      score: calculateScore(deck, prefs)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) // Return top 10
    .map(item => item.deck);
}

function inferStrategy(oracleText: string, name: string): string[]
{
    const strategies:string[]=[];
    const text=oracleText?.toLowerCase() ||"";

    const mappings: Record<string, string[]> = 
    {
        "Artifacts": ["artifact", "equipment", "vehicle"],
        "Graveyard": ["return from your graveyard", "dredge", "reanimate"],
        "Spellslinger": ["instants and sorcery", "instant or sorcery"],
        "Tokens": ["create a", "token"],
        "Lifegain": ["gain life", "lifelink"],
        "Counters": ["+1/+1 counter", "proliferate"],
        "Tribal": ["zombie", "goblin", "elf", "dragon", "sliver"],
        "Voltron": ["aura", "equipment", "enchanted creature"],
        "Aristocrats": ["sacrifice a creature", "when a creature dies"],
    };
    for (const [strategy, keywords] of Object.entries(mappings)) 
    {
        if (keywords.some(keyword => text.includes(keyword))) 
        {
          strategies.push(strategy);
        }
    }
    return strategies;
}

function calculateBudget(usdPrice:string |undefined):'low'|'mid'|'high'
{
    if(!usdPrice)
    {
        return 'mid';
    }
    const price=parseFloat(usdPrice);
    if(price<2.00)
    {
        return 'low';
    }
    if(price<15.00)
    {
        return 'mid';
    }
    return 'high';

}

function calculateScore(deck:Deck,prefs:Preferences):number
{
    let score=0;

    //checks color preferences
    const colorMatch=deck.colors.filter(c => prefs.preferredColors.includes(c)).length;
    score+=colorMatch*10;

    //checks against prefered strategies
    const strategyMatch = deck.strategy.filter(s => prefs.preferredStrategies.includes(s)).length;
    score+=strategyMatch*10;

    //checks budget
    if(deck.budget===prefs.budget)
    {
        score+=30;
    }

    //checks prefered brackets
    const bracketDif=Math.abs(deck.bracket - prefs.highestBracket)
    score-=bracketDif*5;

    return score;
}