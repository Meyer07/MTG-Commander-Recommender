"use client";
import { useState } from 'react';
import { getRecommendations } from '../lib/recommend';

export default function Home() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null); 
    const [prefs, setPrefs] = useState({
        preferredColors: [],
        preferredStrategies: [],
        budget: 'mid',
        highestBracket: 3,
        colorCount: 'any',
    });

    const handleRecommend = async () => {
        setLoading(true);
        try {
            const recommendations = await getRecommendations(prefs);
            setResults(recommendations);
        } catch (error) {
            console.error("Oracle failed to find resonance:", error);
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

    return (
        <main className="min-h-screen p-4 md:p-8 bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Header Section */}
            <header className="max-w-6xl mx-auto mb-12 text-center">
                <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase tracking-tighter">
                    Commander Oracle
                </h1>
                <p className="text-slate-400 tracking-widest uppercase text-[10px] font-bold">Arcane Deck Intelligence</p>
            </header>
            
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Sidebar */}
                <aside className="lg:col-span-4 space-y-6">
                    <section className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 shadow-2xl sticky top-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">
                            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                            Refine Search
                        </h2>

                        <div className="space-y-8">
                            {/* Color Complexity */}
                            <div>
                                <label className="block mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Color Complexity</label>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[1, 2, 3, 4, 5, 'any'].map((num) => (
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

                            {/* Tactical Focus */}
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

                            {/* Investment */}
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

                {/* Results Grid */}
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
                                        <div>
                                            <h3 className="font-bold text-md text-white leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[3rem]">
                                                {deck.commanderName}
                                            </h3>
                                        </div>

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

            {/* Detailed View Modal */}
            {selectedCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedCard(null)}></div>
                    <div className="relative bg-[#0b1120] border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                        <button onClick={() => setSelectedCard(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700 hover:bg-slate-700 transition-colors text-white">✕</button>
                        
                        {/* Card Image Wrapper */}
                        <div className="md:w-1/2 h-80 md:h-auto overflow-hidden bg-black flex items-center justify-center">
                            <img src={selectedCard.imageUrl} alt={selectedCard.commanderName} className="max-w-full max-h-full object-contain p-2" />
                        </div>

                        {/* Details Pane */}
                        <div className="md:w-1/2 p-8 overflow-y-auto flex flex-col bg-slate-900/30">
                            <h2 className="text-3xl font-black text-white mb-2 leading-tight">{selectedCard.commanderName}</h2>
                            <div className="flex gap-2 mb-8">
                                {selectedCard.colors?.map(c => (
                                    <span key={c} className="w-5 h-5 rounded-full border border-slate-900 shadow-sm" style={{ backgroundColor: getColorHex(c) }}></span>
                                ))}
                            </div>

                            <div className="space-y-8 flex-grow">
                                {/* Oracle Text Box */}
                                <section>
                                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Oracle Text & Abilities</h3>
                                    <div className="bg-[#050914] border border-slate-800 rounded-xl p-5 font-mono text-xs leading-relaxed text-slate-300 shadow-inner max-h-64 overflow-y-auto">
                                        {selectedCard.oracleText ? (
                                            selectedCard.oracleText.split('\n').map((line, i) => (
                                                <p key={i} className={i > 0 ? "mt-3" : ""}>{line}</p>
                                            ))
                                        ) : (
                                            <span className="italic text-slate-600">Oracle text failed to manifest.</span>
                                        )}
                                    </div>
                                </section>

                                {/* Keywords Section */}
                                <section>
                                    <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3">Card Keywords</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCard.keywords?.length > 0 ? (
                                            selectedCard.keywords.map(k => (
                                                <span key={k} className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md text-[10px] font-bold text-purple-300 uppercase italic">
                                                    {k}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-600 text-[10px] uppercase font-bold italic tracking-tighter">No Keywords Found</span>
                                        )}
                                    </div>
                                </section>
                            </div>

                            <a 
                                href={`https://edhrec.com/commanders/${selectedCard.commanderName.toLowerCase().replace(/ /g, '-')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 w-full py-4 bg-white text-slate-900 font-black rounded-xl text-center text-[10px] uppercase tracking-widest hover:bg-blue-400 transition-colors shadow-xl"
                            >
                                View Strategy on EDHREC
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}