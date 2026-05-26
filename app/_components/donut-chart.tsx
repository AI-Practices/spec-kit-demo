'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { ChartDataset } from '@/lib/chart-data';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: ChartDataset;
  formatAmount: (cents: number) => string;
}

export default function DonutChart({ data, formatAmount }: DonutChartProps) {
  const chartData = {
    labels: data.segments.map((s) => s.label),
    datasets: [
      {
        data: data.segments.map((s) => s.value),
        backgroundColor: data.segments.map((s) => s.color),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            const value = context.raw as number;
            const seg = data.segments[context.dataIndex];
            if (!seg) return '';
            return ` ${seg.label}: ${formatAmount(value)} (${seg.percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
