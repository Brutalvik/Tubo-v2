import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PlusCircle, DollarSign, Zap, Car as CarIcon } from 'lucide-react';
import { TRANSLATIONS } from '../../constants';

interface HostDashboardProps {
  onAddListing: () => void;
  language: string;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({ onAddListing, language }) => {
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS['English'];

  const data = [
    { name: 'M', earnings: 400000 },
    { name: 'T', earnings: 300000 },
    { name: 'W', earnings: 200000 },
    { name: 'T', earnings: 278000 },
    { name: 'F', earnings: 189000 },
    { name: 'S', earnings: 239000 },
    { name: 'S', earnings: 349000 },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome Header & Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-tubo-500 to-tubo-700 rounded-2xl p-6 text-white shadow-lg shadow-tubo-200 dark:shadow-none flex flex-col justify-between min-h-[180px]">
          <div>
             <h1 className="text-xl font-bold mb-1">{t.hostDashboard}</h1>
             <p className="text-tubo-100 text-sm mb-4">{t.hostDashboardDesc}</p>
          </div>
          
          <div className="flex gap-3">
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-tubo-100" />
                      <span className="text-xs font-medium text-tubo-50">{t.weekly}</span>
                  </div>
                  <p className="text-lg font-bold">IDR 1.9M</p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-yellow-300" />
                      <span className="text-xs font-medium text-tubo-50">{t.active}</span>
                  </div>
                  <p className="text-lg font-bold">3 {t.cars}</p>
              </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
           {/* Chart */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1 min-h-[180px]">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{t.earningsTrend}</h3>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#9ca3af'}} 
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  />
                  <Bar dataKey="earnings" radius={[4, 4, 4, 4]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#0d9488' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <button 
        onClick={onAddListing}
        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3.5 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 active:scale-[0.98] hover:bg-gray-700 dark:hover:bg-gray-200 transition-all"
      >
        <PlusCircle className="h-5 w-5" />
        {t.listNewCar}
      </button>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t.recentBookings}</h3>
            <span className="text-xs text-tubo-600 font-medium cursor-pointer hover:underline">{t.viewAll}</span>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <CarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">Toyota Avanza</h4>
                        <p className="text-[10px] text-gray-500">24 Oct - 27 Oct</p>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">{t.paid}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};