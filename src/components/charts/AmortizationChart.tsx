import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../lib/calculations';
import type { AmortizationDataPoint } from '../../types';

interface AmortizationChartProps {
  data: AmortizationDataPoint[];
}

export function AmortizationChart({ data }: AmortizationChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="dieselGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="electricGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k €`}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              padding: '12px 16px',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
          <Area
            type="monotone"
            dataKey="Diesel"
            stroke="#f59e0b"
            strokeWidth={3}
            fill="url(#dieselGradient)"
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Area
            type="monotone"
            dataKey="E-LKW"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#electricGradient)"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
