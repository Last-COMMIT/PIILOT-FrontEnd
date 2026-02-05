"use client";

import * as React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export interface DoughnutChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }>;
}

export interface DoughnutChartProps {
  data: DoughnutChartData;
  height?: number | string;
  className?: string;
  showLegend?: boolean;
}

export function DoughnutChart({
  data,
  height = 240,
  className,
  showLegend = true,
}: DoughnutChartProps) {
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: "bottom",
        labels: {
          color: "#94a3b8",
          font: { size: 10 },
          padding: 8,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#94a3b8",
        borderColor: "rgba(148, 163, 184, 0.2)",
        borderWidth: 1,
        padding: 8,
      },
    },
    cutout: "62%",
  };

  const style = typeof height === "number" ? { height: `${height}px` } : { height };
  return (
    <div className={className} style={style}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

