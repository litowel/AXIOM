import { useState, useEffect } from 'react';
import { Droplets, CheckCircle2, ExternalLink, AlertTriangle, RefreshCw, Info, ArrowRight, Globe } from 'lucide-react';
import { useWeb3 } from '../lib/Web3Context';

export default function Faucet() {
  const { address, chainId } = useWeb3();
  const [walletAddress, setWalletAddress] = useState('');
  const [token, setToken] = useState('USDC');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');
  const [explorerUrl, setExplorerUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (address) {
      setWalletAddress(address);
    }
  }, [address]);

  const getExplorerUrl = (chain: bigint | null, hash: string) => {
    const chainNum = chain ? Number(chain) : null;
    switch (chainNum) {
      case 1: return `https://etherscan.io/tx/${hash}`;
      case 11155111: return `https://sepolia.etherscan.io/tx/${hash}`;
      case 5: return `https://goerli.etherscan.io/tx/${hash}`;
      case 137: return `https://polygonscan.com/tx/${hash}`;
      case 80001: return `https://mumbai.polygonscan.com/tx/${hash}`;
      case 56: return `https://bscscan.com/tx/${hash}`;
      case 97: return `https://testnet.bscscan.com/tx/${hash}`;
      case 42161: return `https://arbiscan.io/tx/${hash}`;
      case 421613: return `https://goerli.arbiscan.io/tx/${hash}`;
      case 8453: return `https://basescan.org/tx/${hash}`;
      case 84531: return `https://goerli.basescan.org/tx/${hash}`;
      case 84532: return `https://sepolia.basescan.org/tx/${hash}`;
      default: return `https://sepolia.etherscan.io/tx/${hash}`; // Fallback to Sepolia for testnets
    }
  };

  const handleRequest = async () => {
    if (!walletAddress) {
      setErrorMessage('Please enter a valid wallet address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    setTxHash('');

    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: walletAddress,
          token: token,
          chainId: chainId ? Number(chainId) : null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process faucet request');
      }

      setTxHash(data.txHash);
      setExplorerUrl(getExplorerUrl(chainId, data.txHash));
      setStatus('success');
    } catch (error: any) {
      console.error("Faucet request failed:", error);
      setErrorMessage(error.message);
      setStatus('error');
    }
  };

  const resetFaucet = () => {
    setStatus('idle');
    setTxHash('');
    setExplorerUrl('');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <Droplets className="h-8 w-8 text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">Universal Testnet Faucet</h2>
        <p className="mt-2 text-slate-400">Get free testnet tokens instantly for any blockchain to build and test your dApps.</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#13131a] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Public Gateway Faucet</h3>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <Globe className="h-3 w-3" />
            Official Gateways Active
          </span>
        </div>
        
        {status === 'success' ? (
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            
            <div>
              <p className="text-lg text-white mb-4">
                20 testnet {token} is on its way to your wallet and should appear shortly.
              </p>
              
              <a 
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 break-all text-sm block mb-8"
              >
                {explorerUrl}
              </a>
            </div>

            <button 
              onClick={resetFaucet}
              className="w-full rounded-xl py-4 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all"
            >
              Get more tokens
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Select Testnet Token</label>
              <select 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={status === 'loading'}
                className="w-full rounded-xl border border-white/10 bg-[#1c1c24] p-3 text-white outline-none focus:border-blue-500 appearance-none disabled:opacity-50"
              >
                <option value="USDC">USDC (Circle Testnet)</option>
                <option value="ETH">ETH (Sepolia/Goerli)</option>
                <option value="SOL">SOL (Solana Devnet)</option>
                <option value="MATIC">MATIC (Mumbai)</option>
                <option value="BNB">BNB (BSC Testnet)</option>
                <option value="ARB">ARB (Arbitrum Goerli)</option>
                <option value="BASE">ETH (Base Sepolia)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Wallet Address</label>
              <input 
                type="text" 
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                disabled={status === 'loading'}
                className="w-full rounded-xl border border-white/10 bg-[#1c1c24] p-3 text-white outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
              <p className="text-sm text-blue-200 text-center">
                You will receive <strong className="text-white">20 testnet {token}</strong> instantly.
                <br/><span className="text-xs opacity-70 mt-1 block text-emerald-400">Routed automatically through official public gateways. 100% Gas Free.</span>
              </p>
            </div>

            {status === 'error' && (
              <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <button 
              onClick={handleRequest}
              disabled={status === 'loading' || !walletAddress}
              className={`w-full rounded-xl py-4 text-lg font-bold text-white transition-all ${
                'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2"><RefreshCw className="h-5 w-5 animate-spin"/> Processing...</span>
              ) : (
                'Request Tokens'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
