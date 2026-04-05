import { useState } from 'react';
import { ArrowDown, Settings, Info, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { useWeb3 } from '../lib/Web3Context';
import { ethers } from 'ethers';
import { ADDRESSES, WETH_ABI, SUPPORTED_CHAINS } from '../lib/contracts';

export default function Dex() {
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapDirection, setSwapDirection] = useState<'ETH_TO_WETH' | 'WETH_TO_ETH'>('ETH_TO_WETH');
  const { address, balance, provider, chainId, switchNetwork } = useWeb3();

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSwap = async () => {
    if (!provider || !address) {
      setErrorMessage('Please connect your wallet first.');
      setShowErrorModal(true);
      return;
    }
    if (chainId !== SUPPORTED_CHAINS.BASE_SEPOLIA) {
      setErrorMessage('Please switch to Base Sepolia testnet to use OmniSwap.');
      setShowErrorModal(true);
      return;
    }
    if (!payAmount || parseFloat(payAmount) <= 0) {
      setErrorMessage('Please enter a valid amount.');
      setShowErrorModal(true);
      return;
    }
    
    setIsSwapping(true);
    try {
      const signer = await provider.getSigner();
      const wethContract = new ethers.Contract(ADDRESSES.BASE_SEPOLIA.WETH, WETH_ABI, signer);
      
      let tx;
      
      if (swapDirection === 'ETH_TO_WETH') {
        tx = await wethContract.deposit({
          value: ethers.parseEther(payAmount)
        });
      } else {
        tx = await wethContract.withdraw(ethers.parseEther(payAmount));
      }
      
      await tx.wait();
      alert(`Swap transaction confirmed! Hash: ${tx.hash}`);
      setPayAmount('');
      setReceiveAmount('');
    } catch (error: any) {
      console.error(error);
      let msg = error.message || 'Transaction failed';
      if (error.code === 'ACTION_REJECTED') msg = 'User rejected the transaction.';
      setErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setIsSwapping(false);
    }
  };

  const toggleDirection = () => {
    setSwapDirection(prev => prev === 'ETH_TO_WETH' ? 'WETH_TO_ETH' : 'ETH_TO_WETH');
    setPayAmount(receiveAmount);
    setReceiveAmount(payAmount);
  };

  return (
    <div className="mx-auto max-w-md relative">
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
        <h2 className="text-3xl font-bold text-white">OmniSwap DEX</h2>
        <p className="mt-2 text-slate-400">Wrap and unwrap ETH instantly on Base Sepolia.</p>
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
            <span>Balance: {swapDirection === 'ETH_TO_WETH' ? (balance ? parseFloat(balance).toFixed(4) : '0.00') : '...'} {swapDirection === 'ETH_TO_WETH' ? 'ETH' : 'WETH'}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input 
              type="number" 
              placeholder="0.0"
              value={payAmount}
              onChange={(e) => {
                setPayAmount(e.target.value);
                setReceiveAmount(e.target.value); // 1:1 ratio
              }}
              disabled={isSwapping}
              className="w-full bg-transparent text-4xl font-semibold text-white outline-none placeholder:text-slate-600 disabled:opacity-50"
            />
            <button className="flex shrink-0 items-center gap-2 rounded-full bg-[#2a2a35] px-4 py-2 font-medium text-white hover:bg-[#323240]">
              <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029" alt="ETH" className="h-6 w-6" />
              {swapDirection === 'ETH_TO_WETH' ? 'ETH' : 'WETH'}
            </button>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="relative -my-2 flex justify-center z-10">
          <button 
            onClick={toggleDirection}
            className="rounded-xl border-4 border-[#13131a] bg-[#2a2a35] p-2 text-white hover:bg-[#323240] transition-colors"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        </div>

        {/* Receive Section */}
        <div className="rounded-2xl bg-[#1c1c24] p-4">
          <div className="mb-2 flex justify-between text-sm text-slate-400">
            <span>You receive</span>
            <span>Balance: {swapDirection === 'WETH_TO_ETH' ? (balance ? parseFloat(balance).toFixed(4) : '0.00') : '...'} {swapDirection === 'WETH_TO_ETH' ? 'ETH' : 'WETH'}</span>
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
              <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029" alt="ETH" className="h-6 w-6" />
              {swapDirection === 'ETH_TO_WETH' ? 'WETH' : 'ETH'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 space-y-2 px-4 pb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1">Exchange Rate <Info className="h-3 w-3"/></span>
            <span className="text-white">1 ETH = 1 WETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Network Fee</span>
            <span className="text-emerald-400">Standard Gas</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Route</span>
            <span className="text-white">Direct Smart Contract</span>
          </div>
        </div>

        {chainId !== SUPPORTED_CHAINS.BASE_SEPOLIA ? (
          <button 
            onClick={() => switchNetwork(SUPPORTED_CHAINS.BASE_SEPOLIA)}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-600 py-4 text-lg font-bold text-white shadow-lg hover:bg-amber-700 transition-all"
          >
            Switch to Base Sepolia
          </button>
        ) : (
          <button 
            onClick={handleSwap}
            disabled={isSwapping || !payAmount}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSwapping ? <><RefreshCw className="h-5 w-5 animate-spin" /> Swapping on Chain...</> : (address ? 'Swap Instantly' : 'Connect Wallet to Swap')}
          </button>
        )}
      </div>
    </div>
  );
}
