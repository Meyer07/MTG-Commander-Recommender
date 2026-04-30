"use client";
import {useState} from 'react';
import {getRecommendations} from '../lib/recommend';

export default function Home()
{
    const [results,setResults]=useState([]);
    const [loading,setLoading]=useState(false);
    const [prefs,setPrefs]=useState({
        preferredColors:[],
        preferredStrategies:[],
        budget:'mid',
        highestBracket:3,
    });


    const handleRecommend=async()=>
    {
        setLoading(true);
        try
        {
            const recommendations=await getRecommendations(prefs);
            setResults(recommendations);
        } catch(error)
        {
            console.error("Failed to get recommendations",error);
        }finally
        {
            setLoading(false);
        }
    };

    const toggleColor=(color)=>
    {
        setPrefs(prev => ({
            ...prev,
            preferredColors: prev.preferredColors.includes(color)
              ? prev.preferredColors.filter(c => c !== color)
              : [...prev.preferredColors, color]
          }));
    };


  return (
      <main className="min-h-screen p-4 md:p-8 bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
        {/* Header with subtle glow */}
        <header className="max-w-6xl mx-auto mb-12 text-center">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Commander Oracle
          </h1>
          <p className="text-slate-400 tracking-wide uppercase text-sm font-semibold">MTG Deck Recommendations</p>
        </header>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel - Takes up 4 columns */}
          <aside className="lg:col-span-4 space-y-6">
            <section className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                Your Preferences
              </h2>
    
              <div className="space-y-8">
                {/* Color Selection */}
                <div>
                  <label className="block mb-3 text-sm font-medium text-slate-400">Identity</label>
                  <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    {['W', 'U', 'B', 'R', 'G'].map(color => (
                      <button
                        key={color}
                        onClick={() => toggleColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center font-bold ${
                          prefs.preferredColors.includes(color) 
                          ? 'border-white scale-110 ring-4 ring-blue-500/20' 
                          : 'border-transparent opacity-40 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: getColorHex(color), color: color === 'W' ? '#000' : '#fff' }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
    
                {/* Budget Selection */}
                <div>
                  <label className="block mb-3 text-sm font-medium text-slate-400">Investment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'mid', 'high'].map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setPrefs({...prefs, budget: tier})}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase transition-all ${
                          prefs.budget === tier 
                          ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                          : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
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
                  className={`w-full py-4 rounded-xl font-black text-lg transition-all transform active:scale-95 ${
                    loading 
                    ? 'bg-slate-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/20'
                  }`}
                >
                  {loading ? 'SCRIBING...' : 'REVEAL COMMANDERS'}
                </button>
              </div>
            </section>
          </aside>
    
          {/* Results Panel - Takes up 8 columns */}
          <main className="lg:col-span-8">
            <h2 className="text-2xl font-bold mb-6">Top 10 Resonances</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.length > 0 ? (
                results.map((deck) => (
                  <div key={deck.id} className="group flex bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300">
                    <div className="relative w-32 shrink-0 overflow-hidden">
                      <img 
                        src={deck.imageUrl} 
                        alt={deck.commanderName} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    </div>
                    <div className="p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                          {deck.commanderName}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">
                          {deck.strategy.slice(0, 2).join(' • ')}
                        </p>
                      </div>
                      <div className="flex gap-1.5 mt-4">
                        {deck.colors.map(c => (
                          <span key={c} className="w-5 h-5 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: getColorHex(c) }}></span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                  <p className="text-slate-600 italic">The library is empty. Select your paths and consult the oracle.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </main>
    );
}

function getColorHex(color)
{
    const map = { W: '#f8f1d1', U: '#0e68ab', B: '#150b00', R: '#d3202a', G: '#00733e' };
    return map[color];
}

