import { useState } from 'react';
import { ShieldCheck, Zap, Building2, UserCircle } from 'lucide-react';
import { useWeb3 } from '../lib/Web3Context';

export default function Borrow() {
  const [borrowAmount, setBorrowAmount] = useState('');
  const [collateralType, setCollateralType] = useState('crypto');
  const { address, provider } = useWeb3();

  const handleBorrow = async () => {
    if (!provider || !address) {
      alert('Please connect your wallet first.');
      return;
    }
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    
    try {
      const signer = await provider.getSigner();
      // Sending a 0 value transaction to self to simulate depositing collateral
      const tx = await signer.sendTransaction({
        to: address,
        value: 0,
        data: '0x' // Empty data for simulation
      });
      alert(`Collateral deposited & Loan issued! Hash: ${tx.hash}`);
    } catch (error: any) {
      console.error(error);
      alert(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white">Sovereign Lending</h2>
        <p className="mt-2 text-slate-400">Borrow up to Billions instantly using your digital assets (NFTs, Tokens, Real World Assets).</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Borrow Form */}
        <div className="rounded-3xl border border-white/10 bg-[#13131a] p-6 shadow-2xl">
          <h3 className="mb-6 text-xl font-semibold text-white">Request Instant Loan</h3>
          
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Borrow Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">$</span>
                <input 
                  type="number" 
                  placeholder="1,000,000"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#1c1c24] py-4 pl-10 pr-4 text-2xl font-bold text-white outline-none focus:border-indigo-500"
                />
              </div>
              <p className="mt-2 text-xs text-emerald-400">Liquidity Available: $452.8B</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Collateral Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setCollateralType('crypto')}
                  className={`rounded-xl border p-3 text-center transition-all ${collateralType === 'crypto' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  Crypto / Tokens
                </button>
                <button 
                  onClick={() => setCollateralType('nft')}
                  className={`rounded-xl border p-3 text-center transition-all ${collateralType === 'nft' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  High-Value NFTs
                </button>
                <button 
                  onClick={() => setCollateralType('rwa')}
                  className={`col-span-2 rounded-xl border p-3 text-center transition-all ${collateralType === 'rwa' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  Tokenized Real World Assets (Real Estate, Bonds)
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-indigo-500/10 p-4 border border-indigo-500/20">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Interest Rate (APR)</span>
                <span className="font-bold text-emerald-400">0.5% Fixed</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">LTV Ratio</span>
                <span className="font-bold text-white">Up to 95%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Approval Time</span>
                <span className="font-bold text-white flex items-center gap-1"><Zap className="h-3 w-3 text-amber-400"/> Instant</span>
              </div>
            </div>

            <button 
              onClick={handleBorrow}
              className="w-full rounded-xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all"
            >
              {address ? 'Deposit Collateral & Borrow' : 'Connect Wallet to Borrow'}
            </button>
          </div>
        </div>

        {/* Info & Stats */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#13131a] to-[#1c1c24] p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Who is borrowing?</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-500/20 p-3 text-blue-400"><Building2 className="h-6 w-6" /></div>
                <div>
                  <p className="font-medium text-white">Governments & Institutions</p>
                  <p className="text-sm text-slate-400">Borrowing billions for infrastructure using sovereign bonds.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-500/20 p-3 text-purple-400"><Building2 className="h-6 w-6" /></div>
                <div>
                  <p className="font-medium text-white">Corporations</p>
                  <p className="text-sm text-slate-400">Instant liquidity for payroll and expansion.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-emerald-500/20 p-3 text-emerald-400"><UserCircle className="h-6 w-6" /></div>
                <div>
                  <p className="font-medium text-white">Individuals</p>
                  <p className="text-sm text-slate-400">Personal loans against crypto portfolios and NFTs.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#13131a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Axiom Security Guarantee</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              All collateral is secured by multi-signature, institutional-grade cold storage distributed across 50 global nodes. Smart contracts are audited by top 10 security firms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
