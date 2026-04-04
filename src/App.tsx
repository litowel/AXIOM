import { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Landmark, 
  Coins, 
  Droplets, 
  Cpu,
  Wallet,
  Globe,
  Menu,
  X,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from './lib/utils';
import { useWeb3 } from './lib/Web3Context';
import Dashboard from './views/Dashboard';
import Dex from './views/Dex';
import Borrow from './views/Borrow';
import TokenStudio from './views/TokenStudio';
import Faucet from './views/Faucet';
import AppBuilder from './views/AppBuilder';
import Flashloan from './views/Flashloan';

type View = 'dashboard' | 'dex' | 'borrow' | 'token-studio' | 'faucet' | 'app-builder' | 'flashloan';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { address, connect } = useWeb3();

  const navigation = [
    { name: 'Global Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: 'OmniSwap DEX', id: 'dex', icon: ArrowRightLeft },
    { name: 'Sovereign Lending', id: 'borrow', icon: Landmark },
    { name: 'Flashloan Bot', id: 'flashloan', icon: Zap },
    { name: 'Token Studio', id: 'token-studio', icon: Coins },
    { name: 'Testnet Faucet', id: 'faucet', icon: Droplets },
    { name: 'Axiom Forge (AI Builder)', id: 'app-builder', icon: Cpu },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'dex': return <Dex />;
      case 'borrow': return <Borrow />;
      case 'flashloan': return <Flashloan />;
      case 'token-studio': return <TokenStudio />;
      case 'faucet': return <Faucet />;
      case 'app-builder': return <AppBuilder />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out border-r border-white/10 bg-[#0f0f13]",
          isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-20"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
          <div className="mb-10 flex items-center justify-center md:justify-start md:px-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className={cn(
              "ml-3 text-xl font-bold tracking-tight text-white transition-opacity duration-300",
              !isSidebarOpen && "md:hidden"
            )}>
              AXIOM
            </span>
          </div>
          
          <ul className="space-y-2 font-medium">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentView(item.id as View)}
                    className={cn(
                      "group flex w-full items-center rounded-xl p-3 transition-all duration-200",
                      isActive 
                        ? "bg-indigo-500/10 text-indigo-400" 
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 shrink-0 transition-colors duration-200",
                      isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                    )} />
                    <span className={cn(
                      "ml-3 whitespace-nowrap transition-opacity duration-300",
                      !isSidebarOpen && "md:hidden"
                    )}>
                      {item.name}
                    </span>
                    {isActive && (
                      <ChevronRight className={cn(
                        "ml-auto h-4 w-4 opacity-0 transition-opacity duration-200 md:opacity-100",
                        !isSidebarOpen && "md:hidden"
                      )} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto pt-8">
            <div className={cn(
              "rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 border border-indigo-500/20",
              !isSidebarOpen && "md:hidden"
            )}>
              <h4 className="mb-2 text-sm font-semibold text-indigo-300">Live Network</h4>
              <p className="text-sm font-bold text-white mt-1">Omni-Chain Active</p>
              <p className="mt-1 text-xs text-slate-400">Connected to 1,240 Protocols</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "p-4 transition-all duration-300 ease-in-out md:p-8",
        isSidebarOpen ? "md:ml-64" : "md:ml-20"
      )}>
        {/* Topbar */}
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white md:block"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-white md:text-2xl">
              {navigation.find(n => n.id === currentView)?.name}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 md:flex">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="text-sm font-medium text-slate-300">Network Live</span>
            </div>
            <button 
              onClick={connect}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200",
                address 
                  ? "bg-white/10 text-white hover:bg-white/20 border border-white/10" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/25"
              )}
            >
              <Wallet className="h-4 w-4" />
              {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Connect Wallet'}
            </button>
          </div>
        </header>

        {/* View Content */}
        <main className="mx-auto max-w-7xl">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
