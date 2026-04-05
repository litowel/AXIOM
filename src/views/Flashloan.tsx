import { useState } from 'react';
import { Zap, AlertTriangle, Code2, X, RefreshCw, Rocket, ArrowRightLeft, Landmark, Flame, Info } from 'lucide-react';
import { useWeb3 } from '../lib/Web3Context';
import { ethers } from 'ethers';
import { ADDRESSES, ERC20_ABI, SUPPORTED_CHAINS } from '../lib/contracts';
import { FLASHLOAN_EXECUTOR_ABI, FLASHLOAN_EXECUTOR_BYTECODE } from '../lib/FlashLoanExecutorContract';

const STRATEGIES = [
  {
    id: 0,
    name: 'Arbitrage',
    icon: ArrowRightLeft,
    description: 'Exploit price differences across exchanges without upfront capital.',
    tutorial: '1. Borrow asset A.\n2. Swap A for B on DEX 1.\n3. Swap B for A on DEX 2.\n4. Repay loan + premium.\n5. Keep the profit.',
    notes: 'Requires highly liquid pairs and low slippage. Gas costs must be factored into profitability.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  {
    id: 1,
    name: 'Collateral Swap',
    icon: RefreshCw,
    description: 'Swap your collateral without repaying your debt.',
    tutorial: '1. Flashloan new collateral.\n2. Repay debt to unlock old collateral.\n3. Swap old collateral for new.\n4. Repay flashloan.',
    notes: 'Useful when you expect your current collateral to drop in value, or want to switch to a higher-yielding asset.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  {
    id: 2,
    name: 'Liquidation',
    icon: Flame,
    description: 'Liquidate undercollateralized positions and earn a bonus.',
    tutorial: '1. Flashloan the debt asset.\n2. Repay the target user\'s debt.\n3. Receive their collateral + liquidation bonus.\n4. Swap collateral to repay flashloan.',
    notes: 'Highly competitive. Requires fast execution and monitoring of health factors across the protocol.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20'
  },
  {
    id: 3,
    name: 'Refinance',
    icon: Landmark,
    description: 'Move debt to a protocol with better interest rates.',
    tutorial: '1. Flashloan debt amount.\n2. Repay expensive debt on Protocol A.\n3. Withdraw collateral from A.\n4. Deposit collateral in Protocol B.\n5. Borrow from B to repay flashloan.',
    notes: 'Saves money long-term but requires paying the 0.05% flashloan premium upfront.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20'
  }
];

export default function Flashloan() {
  const { address, provider, chainId, switchNetwork } = useWeb3();
  
  const [selectedStrategy, setSelectedStrategy] = useState<number>(0);
  const [assetAddress, setAssetAddress] = useState(ADDRESSES.BASE_SEPOLIA.USDC);
  const [amount, setAmount] = useState('1000');
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleExecuteStrategy = async () => {
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
    addLog(`Initiating ${STRATEGIES[selectedStrategy].name} Strategy...`);

    try {
      const signer = await provider.getSigner();
      
      // Step 1: Deploy Contract
      addLog('Step 1/3: Deploying FlashLoanExecutor Contract...');
      const factory = new ethers.ContractFactory(FLASHLOAN_EXECUTOR_ABI, FLASHLOAN_EXECUTOR_BYTECODE, signer);
      const contract = await factory.deploy(ADDRESSES.BASE_SEPOLIA.AAVE_POOL);
      await contract.waitForDeployment();
      const executorAddress = await contract.getAddress();
      addLog(`✅ Contract deployed at: ${executorAddress}`);

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
      const fundTx = await usdcContract.transfer(executorAddress, premium);
      await fundTx.wait();
      addLog(`✅ Premium funded successfully.`);

      // Step 3: Execute Strategy
      addLog(`Step 3/3: Executing Flashloan (${STRATEGIES[selectedStrategy].name})...`);
      const executorContract = new ethers.Contract(executorAddress, FLASHLOAN_EXECUTOR_ABI, signer);
      
      // executeFlashLoan(asset, amount, strategy, data)
      const execTx = await executorContract.executeFlashLoan(
        assetAddress, 
        parsedAmount, 
        selectedStrategy, 
        "0x" // Empty data for MVP
      );
      addLog(`Transaction submitted. Hash: ${execTx.hash}`);
      
      const receipt = await execTx.wait();
      
      if (receipt.status === 1) {
        addLog(`✅ Flashloan executed successfully in block ${receipt.blockNumber}!`);
        addLog(`🎯 Strategy complete. Premium paid.`);
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

  const activeStrategy = STRATEGIES[selectedStrategy];
  const ActiveIcon = activeStrategy.icon;

  return (
    <div className="mx-auto max-w-5xl space-y-8 relative">
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
            <Zap className="h-8 w-8 text-indigo-400" /> Executive Flashloan
          </h2>
          <p className="mt-2 text-slate-400">1-Click Multi-Strategy Flashloan Executor on Base Sepolia.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Strategy Selection & Execution */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Strategy Selector */}
          <div className="rounded-3xl border border-white/10 bg-[#13131a] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Select Strategy</h3>
            <div className="grid grid-cols-2 gap-3">
              {STRATEGIES.map((strategy) => {
                const Icon = strategy.icon;
                const isSelected = selectedStrategy === strategy.id;
                return (
                  <button
                    key={strategy.id}
                    onClick={() => setSelectedStrategy(strategy.id)}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                      isSelected 
                        ? `${strategy.bg} ${strategy.border} ring-1 ring-indigo-500/50` 
                        : 'border-white/5 bg-[#1c1c24] hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mb-3 ${isSelected ? strategy.color : 'text-slate-400'}`} />
                    <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {strategy.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Execution Form */}
          <div className="rounded-3xl border border-white/10 bg-[#13131a] p-6 shadow-2xl">
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
                    onClick={handleExecuteStrategy}
                    disabled={isExecuting || !amount || !assetAddress}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExecuting ? (
                      <><RefreshCw className="h-5 w-5 animate-spin" /> Executing Sequence...</>
                    ) : (
                      <><Rocket className="h-5 w-5" /> Execute Strategy</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Strategy Details & Terminal */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          {/* Strategy Info Card */}
          <div className={`rounded-3xl border ${activeStrategy.border} ${activeStrategy.bg} p-6 shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <ActiveIcon className={`h-8 w-8 ${activeStrategy.color}`} />
              <h3 className="text-xl font-bold text-white">{activeStrategy.name}</h3>
            </div>
            
            <p className="text-slate-300 text-sm mb-6">
              {activeStrategy.description}
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tutorial</h4>
                <div className="bg-black/20 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-line font-mono leading-relaxed">
                  {activeStrategy.tutorial}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Info className="h-3 w-3" /> Notes
                </h4>
                <p className="text-sm text-slate-400">
                  {activeStrategy.notes}
                </p>
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="rounded-3xl border border-white/10 bg-[#0a0a0c] p-0 shadow-2xl overflow-hidden flex flex-col flex-1 min-h-[250px]">
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
    </div>
  );
}
