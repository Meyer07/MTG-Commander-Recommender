export interface Deck
{
    id:string;
    commanderName:string;
    colors:string[];
    budget:'low'|'mid'|'high';
    bracket:number;//1-5
    imageURL:string
}

export interface Preferences
{
    preferredColors:string[];
    preferredStrategies:string[];
    highestBracket:number;
    budget:'low'|'mid'|'high';

}