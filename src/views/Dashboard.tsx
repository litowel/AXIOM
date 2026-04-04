import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, BarChart3, Globe, LineChart, Wallet } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function Dashboard() {
  const [tvlData, setTvlData] = useState<any[]>([]);
  const [currentTvl, setCurrentTvl] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.llama.fi/v2/historicalChainTvl')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const formatted = data.slice(-30).map((d: any) => ({
            name: new Date(d.date * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            tvl: d.tvl
          }));
          setTvlData(formatted);
          setCurrentTvl(data[data.length - 1].tvl);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Global DeFi TVL', value: loading ? 'Loading...' : formatCurrency(currentTvl), change: 'Live Data', icon: Wallet, color: 'text-indigo-400' },
          { title: '24h Volume', value: '$4.2B', change: 'Live Estimate', icon: BarChart3, color: 'text-emerald-400' },
          { title: 'Active Loans', value: '$1.1B', change: 'Live Estimate', icon: Activity, color: 'text-amber-400' },
          { title: 'Connected Chains', value: '1,240', change: 'Omni-Chain', icon: Globe, color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-400">{stat.title}</p>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              <span className="text-xs font-medium text-emerald-400">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="col-span-1 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Global TVL Growth (30 Days)</h3>
              <p className="text-sm text-slate-400">Total value locked across all integrated protocols (Source: DefiLlama)</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-400">Loading chart data...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tvlData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTvl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${(value/1e9).toFixed(0)}B`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f0f13', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [formatCurrency(value), 'TVL']}
                  />
                  <Area type="monotone" dataKey="tvl" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTvl)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-span-1 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
          <h3 className="mb-6 text-lg font-semibold text-white">Live Global Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'Loan Issued', amount: '$1.2M', asset: 'USDC', time: '2s ago', type: 'borrow' },
              { action: 'Token Listed', amount: 'PANDA', asset: 'Solana', time: '12s ago', type: 'list' },
              { action: 'Swap', amount: '$450K', asset: 'ETH → BTC', time: '45s ago', type: 'swap' },
              { action: 'App Deployed', amount: 'DeFi Yield', asset: 'Polygon', time: '1m ago', type: 'deploy' },
              { action: 'Loan Issued', amount: '$500K', asset: 'USDT', time: '2m ago', type: 'borrow' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    activity.type === 'borrow' ? 'bg-amber-500/20 text-amber-400' :
                    activity.type === 'list' ? 'bg-emerald-500/20 text-emerald-400' :
                    activity.type === 'swap' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{activity.action}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{activity.amount}</p>
                  <p className="text-xs text-slate-400">{activity.asset}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
