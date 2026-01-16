import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../lib/calculations';
import type { SensitivityResult } from '../../types';

interface TornadoChartProps {
  data: SensitivityResult[];
  baseTCO: number;
}

export function TornadoChart({ data, baseTCO }: TornadoChartProps) {
  // Transform data for tornado chart
  const chartData = data.map((item) => ({
    label: item.label,
    low: item.lowTCO - baseTCO,
    high: item.highTCO - baseTCO,
    lowValue: item.lowValue,
    highValue: item.highValue,
    impact: item.impactPercent,
  }));

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-sm text-slate-600">TCO sinkt (positiv)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-sm text-slate-600">TCO steigt (negativ)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 60, left: 100, bottom: 0 }}
          >
            <XAxis
              type="number"
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k €`}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 12, fill: '#334155' }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(Math.abs(value))}
              labelFormatter={(label) => `Parameter: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                padding: '12px 16px',
              }}
            />
            <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={2} />
            <Bar dataKey="low" name="Niedrig (-20%)">
              {chartData.map((entry, index) => (
                <Cell key={`low-${index}`} fill={entry.low < 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
            <Bar dataKey="high" name="Hoch (+20%)">
              {chartData.map((entry, index) => (
                <Cell key={`high-${index}`} fill={entry.high < 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Impact Summary */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h4 className="font-semibold text-slate-700 mb-3">Einfluss-Ranking</h4>
        <div className="space-y-2">
          {data.slice(0, 5).map((item, index) => (
            <motion.div
              key={item.parameter}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm font-medium text-slate-500 w-6">{index + 1}.</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className="text-sm font-bold text-slate-900">±{item.impactPercent.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.impactPercent * 5, 100)}%` }}
                    transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
