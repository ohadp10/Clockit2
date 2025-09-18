import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function PerformanceChart({ 
  data = [], 
  title = "גרף ביצועים",
  type = "area", 
  dataKey = "views",
  height = 300 
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">אין נתונים להצגה</p>
      </div>
    );
  }

  const formatXAxisLabel = (value) => {
    try {
      return format(new Date(value), 'dd/MM', { locale: he });
    } catch {
      return value;
    }
  };

  const formatTooltipLabel = (value) => {
    try {
      return format(new Date(value), 'dd/MM/yyyy', { locale: he });
    } catch {
      return value;
    }
  };

  const chartProps = {
    data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={formatTooltipLabel}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={formatTooltipLabel}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey={dataKey} fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      default: // area
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={formatTooltipLabel}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#3b82f6" 
              fill="#3b82f6"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        );
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}