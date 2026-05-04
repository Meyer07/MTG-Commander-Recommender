export interface Deck
{
    id:string;
    commanderName:string;
    colors:string[];
    strategy:string[];
    budget:'low'|'mid'|'high';
    bracket:number;//1-5
    imageUrl:string;
   
}

export interface Preferences
{
    preferredColors:string[];
    preferredStrategies:string[];
    highestBracket:number;
    budget:'low'|'mid'|'high';
    colorCount: 1 | 2 | 3 | 4 | 5 | 'any';
}