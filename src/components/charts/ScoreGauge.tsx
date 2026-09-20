'use client';

import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

const data = [{ value: 81 }];

export function ScoreGauge({ value }: { value: number }) {
  return (
    <div className="relative w-40 h-40">
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      <RadialBarChart
        width={160}
        height={160}
        innerRadius="80%"
        outerRadius="100%"
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar
          dataKey="value"
          cornerRadius={999}
          fill="url(#scoreGradient)"
          background={{ fill: '#1e1b3a' }}
        />
      </RadialBarChart>

      <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">
        {value}
      </div>
    </div>
  );
}