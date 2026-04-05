import { useState } from 'react';
import { Zap, AlertTriangle, Code2, CheckCircle2, X, RefreshCw, Bot, Play, Square, Rocket } from 'lucide-react';
import { useWeb3 } from '../lib/Web3Context';
import { ethers } from 'ethers';
import { ADDRESSES, AAVE_POOL_ABI, ERC20_ABI, SUPPORTED_CHAINS } from '../lib/contracts';
import { FLASHLOAN_ARB_ABI, FLASHLOAN_ARB_BYTECODE } from '../lib/FlashLoanArbContract';

export default function Flashloan() {
  const { address, provider, chainId, switchNetwork } = useWeb3();
  
  const [assetAddress, setAssetAddress] = useState(ADDRESSES.BASE_SEPOLIA.USDC);
  const [amount, setAmount] = useState('1000');
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleAutomatedFlashloan = async () => {
    if (!provider || !address) {
      setErrorMessage('Please connect your wallet first.');
      setShowErrorModal(true);
      return;
    }

    if (chainId !== SUPPORTED_CHAINS.BASE_SEPOLIA) {
      setErrorMessage('Please switch to Base Sepolia testnet to execute this flashloan.');
      setShowErrorModal(true);
      return;
    }

    if (!ethers.isAddress(assetAddress)) {
      setErrorMessage('Invalid asset address.');
      setShowErrorModal(true);
      return;
    }

    setIsExecuting(true);
    setLogs([]);
    addLog('Initiating Automated Flashloan Execution...');

    try {
      const signer = await provider.getSigner();
      
      // Step 1: Deploy Contract
      addLog('Step 1/3: Deploying FlashLoanArb Contract...');
      const factory = new ethers.ContractFactory(FLASHLOAN_ARB_ABI, FLASHLOAN_ARB_BYTECODE, signer);
      const contract = await factory.deploy(ADDRESSES.BASE_SEPOLIA.AAVE_POOL);
      await contract.waitForDeployment();
      const botAddress = await contract.getAddress();
      addLog(`✅ Contract deployed at: ${botAddress}`);

      // Step 2: Fund Premium
      addLog('Step 2/3: Funding Flashloan Premium (0.05%)...');
      const parsedAmount = ethers.parseUnits(amount, 6); // Assuming USDC (6 decimals)
      const premium = (parsedAmount * 5n) / 10000n; // 0.05% of amount
      
      const usdcContract = new ethers.Contract(assetAddress, ERC20_ABI, signer);
      
      // Check user balance first
      const balance = await usdcContract.balanceOf(address);
      if (balance < premium) {
        throw new Error(`Insufficient funds for premium. You need at least ${ethers.formatUnits(premium, 6)} USDC to cover the Aave flashloan fee. Use the DEX to wrap ETH or get tokens.`);
      }

      addLog(`Transferring ${ethers.formatUnits(premium, 6)} USDC to contract for fee...`);
      const fundTx = await usdcContract.transfer(botAddress, premium);
      await fundTx.wait();
      addLog(`✅ Premium funded successfully.`);

      // Step 3: Execute Arbitrage
      addLog('Step 3/3: Executing Flashloan Arbitrage...');
      const botContract = new ethers.Contract(botAddress, FLASHLOAN_ARB_ABI, signer);
      
      const execTx = await botContract.startArbitrage(assetAddress, parsedAmount);
      addLog(`Transaction submitted. Hash: ${execTx.hash}`);
      
      const receipt = await execTx.wait();
      
      if (receipt.status === 1) {
        addLog(`✅ Flashloan executed successfully in block ${receipt.blockNumber}!`);
        addLog(`🎯 Arbitrage complete. Premium paid.`);
      } else {
        throw new Error("Transaction reverted by the EVM.");
      }
    } catch (error: any) {
      console.error(error);
      let msg = error.message || 'Transaction failed or was rejected.';
      if (error.code === 'ACTION_REJECTED') {
        msg = 'User rejected the transaction.';
      } else if (error.message.includes('revert')) {
        msg = 'Transaction reverted. The Aave pool may not have enough liquidity, or the premium was not sufficient.';
      }
      setErrorMessage(msg);
      setShowErrorModal(true);
      addLog(`🛑 Execution Failed: ${msg}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 relative">
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

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="h-8 w-8 text-indigo-400" /> 1-Click Flashloan Arbitrage
          </h2>
          <p className="mt-2 text-slate-400">Instantly deploy, fund, and execute a real Aave V3 flashloan on Base Sepolia.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-3xl border border-white/10 bg-[#13131a] p-6 shadow-2xl">
          <div className="mb-6 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4 flex items-start gap-3 text-indigo-400">
            <Bot className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold mb-1">Automated Execution</p>
              <p>This tool automatically deploys the <code className="bg-indigo-500/20 px-1 rounded">FlashLoanArb</code> contract, transfers the exact 0.05% premium from your wallet to prevent reverts, and executes the flashloan in one seamless sequence.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">Asset Address (USDC on Base Sepolia)</label>
              <input 
                type="text" 
                value={assetAddress}
                onChange={(e) => setAssetAddress(e.target.value)}
                disabled={isExecuting}
                className="w-full rounded-xl border border-white/10 bg-[#1c1c24] p-3 text-white outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">Borrow Amount (USDC)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isExecuting}
                className="w-full rounded-xl border border-white/10 bg-[#1c1c24] p-3 text-white outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
              />
            </div>

            <div className="pt-4 border-t border-white/10">
              {chainId !== SUPPORTED_CHAINS.BASE_SEPOLIA ? (
                <button 
                  onClick={() => switchNetwork(SUPPORTED_CHAINS.BASE_SEPOLIA)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-4 font-bold text-white shadow-lg hover:bg-amber-700 transition-all"
                >
                  Switch to Base Sepolia
                </button>
              ) : (
                <button 
                  onClick={handleAutomatedFlashloan}
                  disabled={isExecuting || !amount || !assetAddress}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExecuting ? (
                    <><RefreshCw className="h-5 w-5 animate-spin" /> Executing Sequence...</>
                  ) : (
                    <><Rocket className="h-5 w-5" /> Execute 1-Click Flashloan</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Terminal */}
        <div className="rounded-3xl border border-white/10 bg-[#0a0a0c] p-0 shadow-2xl overflow-hidden flex flex-col h-[300px]">
          <div className="flex items-center justify-between bg-[#13131a] px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Code2 className="h-4 w-4" /> Execution Logs
            </div>
            <button onClick={() => setLogs([])} className="text-xs text-slate-500 hover:text-slate-300">Clear</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-slate-600 flex flex-col items-center justify-center h-full">
                <p>Ready to execute.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className={`${
                    log.includes('✅') ? 'text-emerald-400' : 
                    log.includes('🛑') ? 'text-red-400' : 
                    log.includes('🎯') ? 'text-indigo-400' :
                    'text-slate-300'
                  }`}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
