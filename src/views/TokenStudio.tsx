import { useState } from 'react';
import { Coins, Rocket, CheckCircle2 } from 'lucide-react';
import { useWeb3 } from '../lib/Web3Context';

export default function TokenStudio() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const { address, provider } = useWeb3();

  const handleDeploy = async () => {
    if (!provider || !address) {
      alert('Please connect your wallet first.');
      return;
    }
    
    try {
      const signer = await provider.getSigner();
      // Sending a 0 value transaction to self to simulate contract deployment
      const tx = await signer.sendTransaction({
        to: address,
        value: 0,
        data: '0x' // Empty data for simulation
      });
      alert(`Token ${symbol} Deployed & Listed Successfully! Hash: ${tx.hash}`);
      setStep(1);
      setName('');
      setSymbol('');
      setSupply('');
    } catch (error: any) {
      console.error(error);
      alert(`Deployment failed: ${error.message}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white">Token Studio</h2>
        <p className="mt-2 text-slate-400">Create, issue, and list ERC tokens on any blockchain instantly. Zero coding required.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Steps */}
        <div className="col-span-1 space-y-4">
          {[
            { num: 1, title: 'Token Details', desc: 'Name, Symbol, Supply' },
            { num: 2, title: 'Select Chain', desc: 'Ethereum, Solana, etc.' },
            { num: 3, title: 'Auto-List', desc: 'Deploy to OmniSwap DEX' },
          ].map((s) => (
            <div key={s.num} className={`rounded-2xl border p-4 transition-all ${step === s.num ? 'border-indigo-500 bg-indigo-500/10' : step > s.num ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 bg-white/5'}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${step === s.num ? 'bg-indigo-500 text-white' : step > s.num ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                  {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                </div>
                <div>
                  <h4 className={`font-semibold ${step === s.num ? 'text-indigo-400' : step > s.num ? 'text-emerald-400' : 'text-slate-400'}`}>{s.title}</h4>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Area */}
        <div className="col-span-1 lg:col-span-2 rounded-3xl border border-white/10 bg-[#13131a] p-6 shadow-2xl">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-semibold text-white">Define Your Token</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="mb-2 block text-sm font-medium text-slate-400">Token Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Global Peace Coin" 
                    className="w-full rounded-xl border border-white/10 bg-[#1c1c24] p-3 text-white outline-none focus:border-indigo-500" 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="mb-2 block text-sm font-medium text-slate-400">Token Symbol</label>
                  <input 
                    type="text" 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="e.g. GPC" 
                    className="w-full rounded-xl border border-white/10 bg-[#1c1c24] p-3 text-white outline-none focus:border-indigo-500" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-400">Initial Supply</label>
                  <input 
                    type="number" 
                    value={supply}
                    onChange={(e) => setSupply(e.target.value)}
                    placeholder="1000000000" 
                    className="w-full rounded-xl border border-white/10 bg-[#1c1c24] p-3 text-white outline-none focus:border-indigo-500" 
                  />
                </div>
              </div>
              <button 
                onClick={() => setStep(2)} 
                disabled={!name || !symbol || !supply}
                className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Next Step
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-semibold text-white">Select Blockchain</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Ethereum', 'Solana', 'Binance Smart Chain', 'Polygon', 'Arbitrum', 'Optimism'].map((chain) => (
                  <button key={chain} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1c1c24] p-4 text-left hover:border-indigo-500 hover:bg-indigo-500/10">
                    <div className="h-8 w-8 rounded-full bg-white/10"></div>
                    <span className="font-medium text-white">{chain}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="w-1/3 rounded-xl border border-white/10 bg-transparent py-3 font-bold text-white hover:bg-white/5">Back</button>
                <button onClick={() => setStep(3)} className="w-2/3 rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700">Next Step</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-semibold text-white">Review & Deploy</h3>
              <div className="rounded-xl bg-[#1c1c24] p-4 space-y-3">
                <div className="flex justify-between"><span className="text-slate-400">Token</span><span className="font-bold text-white">{name || 'Global Peace Coin'} ({symbol || 'GPC'})</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Supply</span><span className="font-bold text-white">{supply ? parseInt(supply).toLocaleString() : '1,000,000,000'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Chain</span><span className="font-bold text-white">Ethereum (ERC-20)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Auto-List on OmniSwap</span><span className="font-bold text-emerald-400">Yes (Free)</span></div>
              </div>
              
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                Your token will be instantly tradable across all 1,240+ integrated DEXs via OmniSwap routing.
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="w-1/3 rounded-xl border border-white/10 bg-transparent py-3 font-bold text-white hover:bg-white/5">Back</button>
                <button 
                  onClick={handleDeploy} 
                  className="flex w-2/3 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-bold text-white hover:from-indigo-400 hover:to-purple-500"
                >
                  <Rocket className="h-5 w-5" /> {address ? 'Deploy & List Now' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
