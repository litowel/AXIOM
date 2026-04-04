import { useState } from 'react';
import { Cpu, Send, Sparkles, Code2, Rocket } from 'lucide-react';

export default function AppBuilder() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'building' | 'done'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const handleBuild = () => {
    if (!prompt) return;
    setStatus('building');
    setLogs(['Analyzing prompt intent...', 'Selecting optimal blockchain (Ethereum L2 detected)...']);
    
    setTimeout(() => {
      setLogs(l => [...l, 'Writing smart contracts (Solidity)...']);
    }, 1500);
    
    setTimeout(() => {
      setLogs(l => [...l, 'Compiling contracts...', 'Deploying to zkSync Era...']);
    }, 3000);

    setTimeout(() => {
      setLogs(l => [...l, 'Generating React frontend...', 'Connecting Web3 hooks...']);
    }, 4500);

    setTimeout(() => {
      setLogs(l => [...l, 'App successfully deployed to Axiom Edge Network!']);
      setStatus('done');
    }, 6000);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          <Cpu className="h-8 w-8 text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">Axiom Forge (AI Builder)</h2>
        <p className="mt-2 text-slate-400">Prompt anything. Axiom AI writes the contracts, builds the UI, and deploys it live instantly.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Area */}
        <div className="flex flex-col space-y-4">
          <div className="flex-1 rounded-3xl border border-white/10 bg-[#13131a] p-6 shadow-2xl">
            <label className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Sparkles className="h-5 w-5 text-purple-400" /> What do you want to build?
            </label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Build a decentralized lottery where tickets cost 1 USDC and the winner is drawn every Friday automatically. Deploy it on a cheap L2."
              className="h-48 w-full resize-none rounded-xl border border-white/10 bg-[#1c1c24] p-4 text-white outline-none focus:border-purple-500"
            />
            
            <div className="mt-4 flex flex-wrap gap-2">
              {['NFT Marketplace', 'Yield Aggregator', 'DAO Voting', 'Prediction Market'].map(suggestion => (
                <button 
                  key={suggestion}
                  onClick={() => setPrompt(`Build a ${suggestion} that...`)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <button 
              onClick={handleBuild}
              disabled={status === 'building' || !prompt}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-4 text-lg font-bold text-white shadow-lg shadow-purple-500/25 hover:bg-purple-700 disabled:opacity-50"
            >
              {status === 'building' ? 'Forging App...' : <><Send className="h-5 w-5" /> Generate & Deploy</>}
            </button>
          </div>
        </div>

        {/* Output/Terminal Area */}
        <div className="rounded-3xl border border-white/10 bg-[#0f0f13] p-6 font-mono shadow-2xl">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Code2 className="h-4 w-4" /> Build Terminal
            </div>
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
              <div className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
            </div>
          </div>
          
          <div className="h-[300px] overflow-y-auto text-sm">
            {status === 'idle' && (
              <div className="text-slate-500">Waiting for prompt...</div>
            )}
            {logs.map((log, i) => (
              <div key={i} className="mb-2 flex items-start gap-2">
                <span className="text-purple-400">❯</span>
                <span className="text-slate-300">{log}</span>
              </div>
            ))}
            {status === 'building' && (
              <div className="flex items-center gap-2 text-purple-400 animate-pulse">
                <span>❯</span>
                <div className="h-4 w-2 bg-purple-400"></div>
              </div>
            )}
            {status === 'done' && (
              <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                <Rocket className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
                <h4 className="mb-2 text-lg font-bold text-white">App is Live!</h4>
                <p className="mb-4 text-sm text-emerald-200">Your decentralized application has been deployed.</p>
                <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white hover:bg-emerald-600">
                  Open App
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
