import { useState } from 'react';
import { ArrowDown, Settings, Info } from 'lucide-react';
import { useWeb3 } from '../lib/Web3Context';

export default function Dex() {
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const { address, balance, provider } = useWeb3();

  const handleSwap = async () => {
    if (!provider || !address) {
      alert('Please connect your wallet first.');
      return;
    }
    if (!payAmount || parseFloat(payAmount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    
    try {
      const signer = await provider.getSigner();
      // Sending a 0 value transaction to self to simulate the swap interaction
      const tx = await signer.sendTransaction({
        to: address,
        value: 0,
        data: '0x' // Empty data for simulation
      });
      alert(`Swap transaction submitted! Hash: ${tx.hash}`);
    } catch (error: any) {
      console.error(error);
      alert(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white">OmniSwap DEX</h2>
        <p className="mt-2 text-slate-400">Swap any token across 1,240+ blockchains instantly with zero slippage.</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#13131a] p-2 shadow-2xl shadow-indigo-500/10">
        <div className="mb-2 flex items-center justify-between px-4 pt-4">
          <span className="text-sm font-medium text-slate-400">Swap</span>
          <button className="text-slate-400 hover:text-white">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Pay Section */}
        <div className="rounded-2xl bg-[#1c1c24] p-4">
          <div className="mb-2 flex justify-between text-sm text-slate-400">
            <span>You pay</span>
            <span>Balance: {balance ? parseFloat(balance).toFixed(4) : '0.00'} ETH</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input 
              type="number" 
              placeholder="0.0"
              value={payAmount}
              onChange={(e) => {
                setPayAmount(e.target.value);
                setReceiveAmount(e.target.value ? (parseFloat(e.target.value) * 0.052).toFixed(4) : '');
              }}
              className="w-full bg-transparent text-4xl font-semibold text-white outline-none placeholder:text-slate-600"
            />
            <button className="flex shrink-0 items-center gap-2 rounded-full bg-[#2a2a35] px-4 py-2 font-medium text-white hover:bg-[#323240]">
              <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029" alt="ETH" className="h-6 w-6" />
              ETH
            </button>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="relative -my-2 flex justify-center z-10">
          <button className="rounded-xl border-4 border-[#13131a] bg-[#2a2a35] p-2 text-white hover:bg-[#323240]">
            <ArrowDown className="h-5 w-5" />
          </button>
        </div>

        {/* Receive Section */}
        <div className="rounded-2xl bg-[#1c1c24] p-4">
          <div className="mb-2 flex justify-between text-sm text-slate-400">
            <span>You receive</span>
            <span>Balance: 0.0 BTC</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input 
              type="number" 
              placeholder="0.0"
              value={receiveAmount}
              readOnly
              className="w-full bg-transparent text-4xl font-semibold text-white outline-none placeholder:text-slate-600"
            />
            <button className="flex shrink-0 items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=029" alt="BTC" className="h-6 w-6" />
              BTC
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 space-y-2 px-4 pb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1">Exchange Rate <Info className="h-3 w-3"/></span>
            <span className="text-white">1 ETH = 0.052 BTC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Network Fee</span>
            <span className="text-emerald-400">Free (Axiom Subsidized)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Route</span>
            <span className="text-white">Omni-Router (Best Price)</span>
          </div>
        </div>

        <button 
          onClick={handleSwap}
          className="mt-2 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-purple-500 transition-all"
        >
          {address ? 'Swap Instantly' : 'Connect Wallet to Swap'}
        </button>
      </div>
    </div>
  );
}
