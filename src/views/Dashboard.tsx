import { Activity, Wallet, ArrowUpRight, ArrowDownRight, Copy, Check, AlertCircle } from 'lucide-react';
import { useWeb3 } from '../lib/Web3Context';
import { useState } from 'react';
import { SUPPORTED_CHAINS } from '../lib/contracts';

export default function Dashboard() {
  const { address, balance, usdcBalance, aaveDeposit, aaveDebt, chainId, switchNetwork } = useWeb3();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isBaseSepolia = chainId === SUPPORTED_CHAINS.BASE_SEPOLIA;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm text-slate-400">System Operational</span>
        </div>
      </div>

      {address && !isBaseSepolia && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-400">
            <AlertCircle className="h-5 w-5" />
            <span>You are connected to an unsupported network. Please switch to Base Sepolia to see your real DeFi balances.</span>
          </div>
          <button 
            onClick={() => switchNetwork(SUPPORTED_CHAINS.BASE_SEPOLIA)}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm font-medium transition-colors"
          >
            Switch Network
          </button>
        </div>
      )}

      {/* Connected Wallet Info */}
      {address && (
        <div className="rounded-2xl border border-white/10 bg-[#13131a] p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Connected Wallet</p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-bold text-white">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <button 
                  onClick={handleCopyAddress}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  title="Copy Address"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">Network</p>
                <p className="font-medium text-white">
                  {chainId === SUPPORTED_CHAINS.BASE_SEPOLIA ? 'Base Sepolia' : chainId === SUPPORTED_CHAINS.MAINNET ? 'Ethereum Mainnet' : `Chain ID: ${chainId}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real Balances Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#13131a] p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">ETH Balance</p>
            <Wallet className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="mt-4 text-3xl font-bold text-white">
            {balance ? parseFloat(balance).toFixed(4) : '0.0000'} <span className="text-lg text-slate-500">ETH</span>
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#13131a] p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">USDC Balance</p>
            <Activity className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-4 text-3xl font-bold text-white">
            {usdcBalance ? parseFloat(usdcBalance).toFixed(2) : '0.00'} <span className="text-lg text-slate-500">USDC</span>
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#13131a] p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Aave Supplied</p>
            <ArrowUpRight className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-4 text-3xl font-bold text-white">
            {aaveDeposit ? parseFloat(aaveDeposit).toFixed(2) : '0.00'} <span className="text-lg text-slate-500">aUSDC</span>
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#13131a] p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Aave Borrowed</p>
            <ArrowDownRight className="h-5 w-5 text-red-400" />
          </div>
          <p className="mt-4 text-3xl font-bold text-white">
            {aaveDebt ? parseFloat(aaveDebt).toFixed(2) : '0.00'} <span className="text-lg text-slate-500">debtUSDC</span>
          </p>
        </div>
      </div>

      {/* Developer Logs / Status */}
      <div className="rounded-2xl border border-white/10 bg-[#13131a] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">System Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <p className="font-medium text-white">Web3 Provider</p>
              <p className="text-sm text-slate-400">Ethers.js v6 BrowserProvider</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${address ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {address ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <p className="font-medium text-white">Aave V3 Integration</p>
              <p className="text-sm text-slate-400">Base Sepolia Pool</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${isBaseSepolia ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
              {isBaseSepolia ? 'Active' : 'Standby'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Uniswap Router</p>
              <p className="text-sm text-slate-400">V2/V3 Swap Execution</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${isBaseSepolia ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
              {isBaseSepolia ? 'Active' : 'Standby'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
