import { useState, useEffect } from 'react';
import { Droplets, CheckCircle2 } from 'lucide-react';
import { useWeb3 } from '../lib/Web3Context';

export default function Faucet() {
  const { address } = useWeb3();
  const [walletAddress, setWalletAddress] = useState('');
  const [token, setToken] = useState('USDC');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    if (address) {
      setWalletAddress(address);
    }
  }, [address]);

  const handleRequest = () => {
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <Droplets className="h-8 w-8 text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">Universal Testnet Faucet</h2>
        <p className="mt-2 text-slate-400">Get free testnet tokens instantly for any blockchain to build and test your dApps.</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#13131a] p-6 shadow-2xl">
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-400">Select Testnet Token</label>
            <select 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1c1c24] p-4 text-white outline-none focus:border-blue-500 appearance-none"
            >
              <option value="USDC">USDC (Circle Testnet)</option>
              <option value="ETH">ETH (Goerli/Sepolia)</option>
              <option value="SOL">SOL (Solana Devnet)</option>
              <option value="MATIC">MATIC (Mumbai)</option>
              <option value="BNB">BNB (BSC Testnet)</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-400">Wallet Address</label>
            <input 
              type="text" 
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#1c1c24] p-4 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
            <p className="text-sm text-blue-200 text-center">
              You will receive <strong className="text-white">10,000 {token}</strong> instantly.
            </p>
          </div>

          <button 
            onClick={handleRequest}
            disabled={status !== 'idle' || !walletAddress}
            className={`w-full rounded-xl py-4 text-lg font-bold text-white transition-all ${
              status === 'success' 
                ? 'bg-emerald-500 hover:bg-emerald-600' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {status === 'loading' ? 'Processing...' : 
             status === 'success' ? <span className="flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5"/> Sent Successfully!</span> : 
             'Request Tokens'}
          </button>
        </div>
      </div>
    </div>
  );
}
