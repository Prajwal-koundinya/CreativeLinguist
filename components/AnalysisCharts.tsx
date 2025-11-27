import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { WordFrequency } from '../types';

interface AnalysisChartsProps {
  data: WordFrequency[];
}

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ data }) => {
  return (
    <div className="w-full h-64 bg-[#121212] rounded-lg p-4 border border-gray-800 neon-border">
      <h3 className="text-neon-blue font-mono mb-4 text-sm font-bold uppercase tracking-wider">
        Top Word Frequency
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="word" 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#9ca3af', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#000', 
              borderColor: '#06b6d4',
              color: '#fff'
            }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#06b6d4' : '#84cc16'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalysisCharts;