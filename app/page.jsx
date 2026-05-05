"use client";
import { useState, useEffect } from 'react';
import { getRecommendations } from '../lib/recommend';

export default function Home() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [synergyCards, setSynergyCards] = useState({});
    const [loadingSynergy, setLoadingSynergy] = useState(false);
    
    const [prefs, setPrefs] = useState({
        preferredColors: [],
        preferredStrategies: [],
        budget: 'mid',
        highestBracket: 3,
        colorCount: 'any',
    });

    useEffect(() => {
        if (selectedCard) {
            fetchSynergy(selectedCard);
        } else {
            setSynergyCards({});
        }
    }, [selectedCard]);

    const fetchSynergy = async (commander) => {
        setLoadingSynergy(true);
        try {
            // Extracts core themes from the oracle text to ensure synergy shifts per commander
            const themes = ["artifact", "creature", "token", "spell", "land", "graveyard", "counter", "draw"];
            const text = commander.oracleText.toLowerCase();
            const foundTheme = themes.find(t => text.includes(t)) || "creature";

            const colors = commander.colors.join('').toLowerCase();
            const query = `ci:${colors} o:${foundTheme} -is:commander -name:"${commander.commanderName}" order:edhrec`;
            
            const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            
            if (data.data) {
                const categorized = data.data.reduce((acc, card) => {
                    const type = card.type_line.split('—')[0].trim().split(' ').pop();
                    const validTypes = ['Creature', 'Artifact', 'Enchantment', 'Sorcery', 'Instant', 'Land'];
                    
                    if (validTypes.includes(type)) {
                        if (!acc[type]) acc[type] = [];
                        if (acc[type].length < 4) acc[type].push(card);
                    }
                    return acc;
                }, {});
                setSynergyCards(categorized);
            }
        } catch (err) {
            console.error("The Archive is resisting access:", err);
        } finally {
            setLoadingSynergy(false);
        }
    };

    const handleRecommend = async () => {
        setLoading(true);
        try {
            const recommendations = await getRecommendations(prefs);
            setResults(recommendations);
        } catch (error) {
            console.error("Consultation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleColor = (color) => {
        setPrefs(prev => ({
            ...prev,
            preferredColors: prev.preferredColors.includes(color)
              ? prev.preferredColors.filter(c => c !== color)
              : [...prev.preferredColors, color]
          }));
    };

    const toggleStrategy = (strat) => {
        setPrefs(prev => ({
            ...prev,
            preferredStrategies: prev.preferredStrategies.includes(strat)
                ? prev.preferredStrategies.filter(s => s !== strat)
                : [...prev.preferredStrategies, strat]
        }));
    };

    const getColorHex = (color) => {
        const map = { W: '#f8f1d1', U: '#0e68ab', B: '#150b00', R: '#d3202a', G: '#00733e' };
        return map[color];
    };

    const getEDHRECLink = (name) => {
        if (!name) return "#";
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[,']/g, '').replace(/[^\w-]/g, '');
        return `https://edhrec.com/commanders/${slug}`;
    };

    return (
        <main className="min-h-screen p-4 md:p-8 bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
            <header className="max-w-6xl mx-auto mb-12 text-center">
                <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase tracking-tighter">
                    Commander Oracle
                </h1>
                <p className="text-slate-400 tracking-widest uppercase text-[10px] font-bold">Arcane Deck Intelligence</p>
            </header>
            
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                <aside className="lg:col-span-4 space-y-6">
                    <section className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 shadow-2xl sticky top-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">
                            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                            Refine Search
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <label className="block mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Color Complexity</label>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[1, 2, 3, 4, 5, 'No'].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setPrefs({ ...prefs, colorCount: num })}
                                            className={`py-2 rounded-lg border text-[10px] font-black transition-all ${
                                                prefs.colorCount === num 
                                                ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
                                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                                            }`}
                                        >
                                            {num === 'any' ? 'ALL' : `${num} COLOR`}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                    {['W', 'U', 'B', 'R', 'G'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => toggleColor(color)}
                                            className={`w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center font-bold ${
                                                prefs.preferredColors.includes(color) 
                                                ? 'border-white scale-110 ring-4 ring-blue-500/10' 
                                                : 'border-transparent opacity-30 grayscale hover:opacity-100 hover:grayscale-0'
                                            }`}
                                            style={{ backgroundColor: getColorHex(color), color: color === 'W' ? '#000' : '#fff' }}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tactical Focus</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["Artifacts", "Graveyard", "Spellslinger", "Tokens", "Lifegain", "Counters", "Tribal", "Voltron", "Aristocrats"].map((strat) => (
                                        <button
                                            key={strat}
                                            onClick={() => toggleStrategy(strat)}
                                            className={`py-2 px-3 rounded-lg border text-[10px] font-bold transition-all ${
                                                prefs.preferredStrategies.includes(strat)
                                                    ? 'bg-purple-600 border-purple-400 text-white'
                                                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                                            }`}
                                        >
                                            {strat.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Investment</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['low', 'mid', 'high'].map((tier) => (
                                        <button
                                            key={tier}
                                            onClick={() => setPrefs({...prefs, budget: tier})}
                                            className={`py-2 rounded-lg border text-xs font-black transition-all ${
                                                prefs.budget === tier 
                                                ? 'bg-slate-100 border-white text-slate-900' 
                                                : 'bg-slate-900 border-slate-800 text-slate-500'
                                            }`}
                                        >
                                            {tier === 'low' ? '$' : tier === 'mid' ? '$$' : '$$$'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleRecommend}
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-black text-xs tracking-widest transition-all ${
                                    loading 
                                    ? 'bg-slate-700 cursor-not-allowed text-slate-500' 
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white shadow-2xl'
                                }`}
                            >
                                {loading ? 'SCRIBING RESULTS...' : 'CONSULT THE ORACLE'}
                            </button>
                        </div>
                    </section>
                </aside>

                <section className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold tracking-tight text-white">Top Resonances</h2>
                        {results.length > 0 && (
                            <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                {results.length} Matches Found
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {results.length > 0 ? (
                            results.map((deck) => (
                                <div 
                                    key={deck.id} 
                                    onClick={() => setSelectedCard(deck)}
                                    className="cursor-pointer group flex flex-col bg-slate-800/30 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-500 shadow-lg"
                                >
                                    <div className="relative h-44 w-full overflow-hidden">
                                        <img src={deck.imageUrl} alt={deck.commanderName} className="h-full w-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                                    </div>
                                    <div className="p-5 flex flex-col justify-between flex-grow">
                                        <h3 className="font-bold text-md text-white leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[3rem]">
                                            {deck.commanderName}
                                        </h3>
                                        <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-700/30">
                                            <div className="flex -space-x-1.5">
                                                {deck.colors?.map(c => (
                                                    <span key={c} className="w-4 h-4 rounded-full border-2 border-slate-900 shadow-sm" style={{ backgroundColor: getColorHex(c) }}></span>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700 uppercase tracking-widest">
                                                {deck.budget === 'high' ? '$$$' : deck.budget === 'mid' ? '$$' : '$'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-800/50 rounded-[2rem] bg-slate-900/20">
                                <p className="text-slate-500 text-sm font-medium italic">The library is silent. Choose your path above.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {selectedCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setSelectedCard(null)}></div>
                    <div className="relative bg-[#0b1120] border border-slate-700 w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                        <button onClick={() => setSelectedCard(null)} className="absolute top-6 right-6 z-20 w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700 hover:bg-slate-700 transition-colors text-white">✕</button>
                        
                        <div className="flex flex-col md:flex-row h-full overflow-hidden">
                            {/* Scrollable Left Side */}
                            <div className="md:w-1/3 p-8 border-r border-slate-800 bg-slate-900/20 overflow-y-auto h-full">
                                <div className="flex flex-col items-center">
                                    <img src={selectedCard.imageUrl} alt={selectedCard.commanderName} className="w-full max-w-xs rounded-2xl shadow-2xl mb-6 shadow-blue-500/10" />
                                    <div className="w-full">
                                        <h2 className="text-2xl font-black text-white mb-2">{selectedCard.commanderName}</h2>
                                        <div className="flex gap-2 mb-6">
                                            {selectedCard.colors?.map(c => (
                                                <span key={c} className="w-5 h-5 rounded-full border border-slate-900 shadow-sm" style={{ backgroundColor: getColorHex(c) }}></span>
                                            ))}
                                        </div>
                                        <div className="space-y-6">
                                            <section>
                                                <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3">Keywords</h3>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {selectedCard.keywords?.length > 0 ? (
                                                        selectedCard.keywords.map(k => (
                                                            <span key={k} className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-[9px] font-bold text-purple-300 uppercase italic">
                                                                {k}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-slate-600 text-[9px] uppercase font-bold italic tracking-tighter">No Keywords Found</span>
                                                    )}
                                                </div>

                                                <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Oracle Text</h3>
                                                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-400 whitespace-pre-wrap mb-4">
                                                    {selectedCard.oracleText}
                                                </div>
                                            </section>
                                            <a href={getEDHRECLink(selectedCard.commanderName)} target="_blank" className="block w-full py-3 bg-blue-600 text-white font-black rounded-xl text-center text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all">Full Strategy Deck</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Right Side */}
                            <div className="md:w-2/3 p-8 overflow-y-auto h-full bg-slate-900/40">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Component Resonance</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Synergistic components matching this commander's mechanics</p>
                                    </div>
                                    {loadingSynergy && <div className="flex gap-1"><span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span><span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-75"></span><span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-150"></span></div>}
                                </div>

                                <div className="space-y-10">
                                    {Object.entries(synergyCards).length > 0 ? (
                                        Object.entries(synergyCards).map(([type, cards]) => (
                                            <section key={type}>
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-2 flex justify-between">
                                                    {type}s <span>Thematic Fit</span>
                                                </h4>
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                    {cards.map(card => (
                                                        <div key={card.id} className="group relative aspect-[3/4] bg-slate-800 rounded-lg overflow-hidden border border-slate-700/50 hover:border-blue-500 transition-all shadow-lg">
                                                            <img 
                                                                src={card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal} 
                                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform" 
                                                                alt={card.name} 
                                                            />
                                                            <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                                                <p className="text-[10px] font-bold text-white leading-tight">{card.name}</p>
                                                                <p className="text-[9px] text-blue-400 font-mono mt-1">{card.mana_cost}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        ))
                                    ) : (
                                        !loadingSynergy && (
                                            <div className="py-20 text-center flex flex-col items-center">
                                                <div className="w-12 h-12 border-2 border-dashed border-slate-800 rounded-full mb-4 animate-spin-slow"></div>
                                                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest italic">Awaiting mechanical resonance...</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}