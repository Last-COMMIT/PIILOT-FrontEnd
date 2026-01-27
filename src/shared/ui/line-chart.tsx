"use client";

import * as React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

export interface LineChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }>;
}

export interface LineChartProps {
  data: LineChartData;
  height?: number;
  className?: string;
}

export function LineChart({ data, height = 240, className }: LineChartProps) {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#94a3b8",
        borderColor: "rgba(148, 163, 184, 0.2)",
        borderWidth: 2,
        padding: 8,
        displayColors: false,
      },
    },
    layout: { padding: { bottom: 10 } },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { size: 12 },
          padding: 0,
        },
        border: { color: "rgba(148, 163, 184, 0.2)" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(148, 163, 184, 0.1)" },
        ticks: {
          color: "#94a3b8",
          font: { size: 14 },
        },
        border: { color: "rgba(148, 163, 184, 0.2)" },
      },
    },
    elements: {
      line: { tension: 0.4, borderWidth: 2 },
      point: { radius: 4, hoverRadius: 6 },
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d) => ({
      ...d,
      borderColor: d.borderColor ?? "rgb(34, 211, 238)",
      backgroundColor: d.backgroundColor ?? "rgba(34, 211, 238, 0.12)",
      pointBackgroundColor: d.borderColor ?? "rgb(34, 211, 238)",
      pointBorderColor: d.borderColor ?? "rgb(34, 211, 238)",
      pointHoverBackgroundColor: d.borderColor ?? "rgb(34, 211, 238)",
      pointHoverBorderColor: d.borderColor ?? "rgb(34, 211, 238)",
      fill: d.fill ?? true,
    })),
  };

  return (
    <div className={className} style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
