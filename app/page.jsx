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
        <main className="min-h-screen p-8 bg-slate-900 text-white">
          <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">Commander Recommender</h1>
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Section */}
            <section className="space-y-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div>
                <label className="block mb-2 font-semibold">Select Your Colors</label>
                <div className="flex gap-2">
                  {['W', 'U', 'B', 'R', 'G'].map(color => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        prefs.preferredColors.includes(color) 
                        ? 'border-white scale-110 shadow-lg' 
                        : 'border-transparent opacity-50'
                      }`}
                      style={{ backgroundColor: getColorHex(color) }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
    
              <div>
                <label className="block mb-2 font-semibold">Budget Tier</label>
                <select 
                  className="w-full bg-slate-700 p-2 rounded"
                  value={prefs.budget}
                  onChange={(e) => setPrefs({...prefs, budget: e.target.value})}
                >
                  <option value="low">Budget ($)</option>
                  <option value="mid">Average ($$)</option>
                  <option value="high">Premium ($$$)</option>
                </select>
              </div>
    
              <button 
                onClick={handleRecommend}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition-colors"
              >
                {loading ? 'Consulting the Oracle...' : 'Find My Commander'}
              </button>
            </section>
    
            {/* Results Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Top Recommendations</h2>
              {results.length > 0 ? (
                results.map((deck) => (
                  <div key={deck.id} className="flex bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition-all">
                    <img src={deck.imageUrl} alt={deck.commanderName} className="w-24 object-cover" />
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{deck.commanderName}</h3>
                      <p className="text-sm text-slate-400">{deck.strategy.join(', ')}</p>
                      <div className="flex gap-1 mt-2">
                        {deck.colors.map(c => (
                          <span key={c} className="text-xs px-2 py-0.5 rounded bg-slate-700">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No recommendations yet. Adjust your filters and click Recommend!</p>
              )}
            </section>
          </div>
        </main>
    );
}

function getColorHex(color)
{
    const map = { W: '#f8f1d1', U: '#0e68ab', B: '#150b00', R: '#d3202a', G: '#00733e' };
    return map[color];
}

