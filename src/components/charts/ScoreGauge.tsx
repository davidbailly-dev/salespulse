'use client';

import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

type ScoreGaugeProps = {
    value: number;
    min?: number;
    max?: number;
    unit?: string;
};

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function ScoreGauge({ value, min = 0, max = 100, unit }: ScoreGaugeProps) {
    const clampedValue = clamp(value, min, max);
    const data = [{ value: clampedValue }];

    return (
        <div className="relative w-40 h-40">
            <svg width={0} height={0}>
                <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--color-secondary-400)" />
                        <stop offset="100%" stopColor="var(--color-primary-600)" />
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
                <PolarAngleAxis type="number" domain={[min, max]} tick={false} />
                <RadialBar
                    dataKey="value"
                    cornerRadius={999}
                    fill="url(#scoreGradient)"
                    background={{ fill: 'var(--color-border)' }}
                />
            </RadialBarChart>

            <div className="absolute inset-0 flex items-center justify-center text-white">
                <div>
                    <span className="text-3xl font-bold mr-1">{clampedValue}</span>
                    <span>{unit}</span>
                </div>
            </div>
        </div>
    );
}
