import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface LatencyChartProps {
  endpoint: {
    id: string;
    name: string;
    status: string;
    responseTime: number;
    url: string;
    history?: Array<{
      timestamp: string;
      responseTime: number;
      status: string;
    }>;
  };
  timeRange?: '1h' | '6h' | '24h' | '7d';
}

export default function LatencyChart({ endpoint, timeRange = '1h' }: LatencyChartProps) {
  const [data, setData] = useState<Array<{time: string, ms: number, status: string}>>([]);
  const [loading, setLoading] = useState(true);

  // Gerar dados históricos baseados no endpoint
  useEffect(() => {
    setLoading(true);
    
    // Se o endpoint tem histórico, use-o
    if (endpoint.history && endpoint.history.length > 0) {
      const formattedData = endpoint.history.slice(-20).map((point, index) => ({
        time: `${index * 5}m`,
        ms: point.responseTime,
        status: point.status
      }));
      setData(formattedData);
    } else {
      // Gerar dados fictícios baseados no tempo de resposta atual
      const generatedData = Array.from({ length: 20 }, (_, i) => {
        const baseTime = endpoint.responseTime;
        const variation = Math.sin(i * 0.5) * 30 + (Math.random() * 20 - 10);
        const ms = Math.max(10, baseTime + variation);
        
        return {
          time: `${i * 5}m`,
          ms: Math.round(ms),
          status: ms > 200 ? 'slow' : ms > 500 ? 'error' : 'online'
        };
      });
      setData(generatedData);
    }
    
    setLoading(false);
  }, [endpoint.id, endpoint.responseTime, endpoint.history]);

  // Define a cor baseada no status
  const chartColor = useMemo(() => {
    switch (endpoint.status) {
      case 'online': return '#10b981';
      case 'slow': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'offline': return '#6366f1';
      default: return '#6366f1';
    }
  }, [endpoint.status]);

  // Limites de referência
  const warningThreshold = 200;
  const errorThreshold = 500;

  // Estatísticas
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    
    const values = data.map(d => d.ms);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Calcular variação
    const lastValue = values[values.length - 1];
    const prevValue = values[Math.max(0, values.length - 5)];
    const change = lastValue - prevValue;
    const changePercent = prevValue > 0 ? (change / prevValue) * 100 : 0;
    
    return { avg, max, min, change, changePercent };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="latency-tooltip">
          <p className="time">{label} ago</p>
          <p className="value" style={{ color: chartColor }}>
            {payload[0].value}ms
          </p>
          <p className="status">
            Status: <span className={`status-${payload[0].payload.status || 'online'}`}>
              {payload[0].payload.status || 'online'}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="latency-chart loading">
        <div className="loading-spinner"></div>
        <p>Loading latency data...</p>
      </div>
    );
  }

  return (
    <div className="latency-chart-container">
      <div className="latency-header">
        <div className="latency-title">
          <h4>Latency History</h4>
          <div className="time-range-selector">
            {['1h', '6h', '24h', '7d'].map(range => (
              <button
                key={range}
                className={`time-range-btn ${timeRange === range ? 'active' : ''}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        {stats && (
          <div className="latency-stats">
            <div className="stat">
              <span className="stat-label">Current</span>
              <span className="stat-value" style={{ color: chartColor }}>
                {endpoint.responseTime}ms
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Average</span>
              <span className="stat-value">{stats.avg}ms</span>
            </div>
            <div className="stat">
              <span className="stat-label">Peak</span>
              <span className="stat-value">{stats.max}ms</span>
            </div>
            <div className="stat">
              <span className="stat-label">Trend</span>
              <span className={`stat-value ${stats.changePercent > 0 ? 'trend-up' : 'trend-down'}`}>
                {stats.changePercent > 0 ? '↑' : '↓'} {Math.abs(stats.changePercent).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="latency-chart-wrapper">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${endpoint.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.05)" 
              vertical={false} 
            />
            
            {/* Linha de referência para warning */}
            <ReferenceLine 
              y={warningThreshold} 
              stroke="#f59e0b" 
              strokeDasharray="3 3" 
              strokeOpacity={0.5}
              label={{
                value: 'Warning',
                position: 'right',
                fill: '#f59e0b',
                fontSize: 10
              }}
            />
            
            {/* Linha de referência para erro */}
            <ReferenceLine 
              y={errorThreshold} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              strokeOpacity={0.5}
              label={{
                value: 'Error',
                position: 'right',
                fill: '#ef4444',
                fontSize: 10
              }}
            />
            
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickMargin={8}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickMargin={8}
              tickFormatter={(value) => `${value}ms`}
              domain={[0, 'dataMax + 100']}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area 
              type="monotone" 
              dataKey="ms" 
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#gradient-${endpoint.id})`}
              animationDuration={1000}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="latency-footer">
        <div className="thresholds">
          <div className="threshold">
            <div className="threshold-dot" style={{ background: '#10b981' }}></div>
            <span>&lt; 200ms</span>
          </div>
          <div className="threshold">
            <div className="threshold-dot" style={{ background: '#f59e0b' }}></div>
            <span>200-500ms</span>
          </div>
          <div className="threshold">
            <div className="threshold-dot" style={{ background: '#ef4444' }}></div>
            <span>&gt; 500ms</span>
          </div>
        </div>
        <div className="latency-info">
          Last updated: Just now
        </div>
      </div>
    </div>
  );
}