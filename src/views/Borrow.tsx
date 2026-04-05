import { useState } from 'react';
import { ShieldCheck, Zap, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { useWeb3 } from '../lib/Web3Context';
import { ethers } from 'ethers';
import { ADDRESSES, AAVE_POOL_ABI, ERC20_ABI, SUPPORTED_CHAINS } from '../lib/contracts';

export default function Borrow() {
  const [amount, setAmount] = useState('');
  const [actionType, setActionType] = useState<'supply' | 'borrow'>('supply');
  const [isProcessing, setIsProcessing] = useState(false);
  const { address, provider, chainId, switchNetwork } = useWeb3();
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAction = async () => {
    if (!provider || !address) {
      setErrorMessage('Please connect your wallet first.');
      setShowErrorModal(true);
      return;
    }
    if (chainId !== SUPPORTED_CHAINS.BASE_SEPOLIA) {
      setErrorMessage('Please switch to Base Sepolia testnet to use Aave V3.');
      setShowErrorModal(true);
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid amount.');
      setShowErrorModal(true);
      return;
    }
    
    setIsProcessing(true);
    try {
      const signer = await provider.getSigner();
      const poolContract = new ethers.Contract(ADDRESSES.BASE_SEPOLIA.AAVE_POOL, AAVE_POOL_ABI, signer);
      const usdcContract = new ethers.Contract(ADDRESSES.BASE_SEPOLIA.USDC, ERC20_ABI, signer);
      
      const parsedAmount = ethers.parseUnits(amount, 6); // USDC has 6 decimals
      
      if (actionType === 'supply') {
        // 1. Check Allowance
        const allowance = await usdcContract.allowance(address, ADDRESSES.BASE_SEPOLIA.AAVE_POOL);
        if (allowance < parsedAmount) {
          const approveTx = await usdcContract.approve(ADDRESSES.BASE_SEPOLIA.AAVE_POOL, ethers.MaxUint256);
          await approveTx.wait();
        }
        
        // 2. Supply
        const tx = await poolContract.supply(
          ADDRESSES.BASE_SEPOLIA.USDC,
          parsedAmount,
          address,
          0
        );
        await tx.wait();
        alert(`Successfully supplied ${amount} USDC to Aave V3! Hash: ${tx.hash}`);
      } else {
        // Borrow
        // interestRateMode: 2 for Variable
        const tx = await poolContract.borrow(
          ADDRESSES.BASE_SEPOLIA.USDC,
          parsedAmount,
          2,
          0,
          address
        );
        await tx.wait();
        alert(`Successfully borrowed ${amount} USDC from Aave V3! Hash: ${tx.hash}`);
      }
      
      setAmount('');
    } catch (error: any) {
      console.error(error);
      let msg = error.message || 'Transaction failed';
      if (error.code === 'ACTION_REJECTED') msg = 'User rejected the transaction.';
      else if (error.message.includes('revert')) msg = 'Transaction reverted by Aave. Check your health factor and collateral.';
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl relative">
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-[#13131a] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-500" /> Error
              </h3>
              <button onClick={() => setShowErrorModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-slate-300 text-sm mb-6">{errorMessage}</p>
            <button 
              onClick={() => setShowErrorModal(false)}
              className="w-full rounded-xl bg-red-500/20 border border-red-500/30 py-3 font-bold text-red-400 hover:bg-red-500/30 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white">Aave V3 Lending</h2>
        <p className="mt-2 text-slate-400">Supply USDC as collateral and borrow against it directly on-chain.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Action Form */}
        <div className="rounded-3xl border border-white/10 bg-[#13131a] p-6 shadow-2xl">
          <h3 className="mb-6 text-xl font-semibold text-white">DeFi Money Market</h3>
          
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Action</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setActionType('supply')}
                  disabled={isProcessing}
                  className={`rounded-xl border p-3 text-center transition-all ${actionType === 'supply' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'} disabled:opacity-50`}
                >
                  Supply USDC
                </button>
                <button 
                  onClick={() => setActionType('borrow')}
                  disabled={isProcessing}
                  className={`rounded-xl border p-3 text-center transition-all ${actionType === 'borrow' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'} disabled:opacity-50`}
                >
                  Borrow USDC
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">Amount (USDC)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
                <input 
                  type="number" 
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isProcessing}
                  className="w-full rounded-xl border border-white/10 bg-[#1c1c24] py-4 pl-10 pr-4 text-2xl font-bold text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="rounded-xl bg-indigo-500/10 p-4 border border-indigo-500/20">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Protocol</span>
                <span className="font-bold text-emerald-400">Aave V3</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Network</span>
                <span className="font-bold text-white">Base Sepolia</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Execution</span>
                <span className="font-bold text-white flex items-center gap-1"><Zap className="h-3 w-3 text-amber-400"/> Direct Smart Contract</span>
              </div>
            </div>

            {chainId !== SUPPORTED_CHAINS.BASE_SEPOLIA ? (
              <button 
                onClick={() => switchNetwork(SUPPORTED_CHAINS.BASE_SEPOLIA)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-4 text-lg font-bold text-white shadow-lg hover:bg-amber-700 transition-all"
              >
                Switch to Base Sepolia
              </button>
            ) : (
              <button 
                onClick={handleAction}
                disabled={isProcessing || !amount}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <><RefreshCw className="h-5 w-5 animate-spin" /> Processing on Chain...</>
                ) : (
                  address ? (actionType === 'supply' ? 'Approve & Supply' : 'Borrow') : 'Connect Wallet'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Info & Stats */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#13131a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Real DeFi Integration</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              This interface interacts directly with the official Aave V3 smart contracts on the Base Sepolia testnet.
            </p>
            <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
              <li>No simulated transactions.</li>
              <li>Requires real testnet ETH for gas.</li>
              <li>Requires real testnet USDC.</li>
              <li>Subject to Aave's collateralization ratios and health factor requirements.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
