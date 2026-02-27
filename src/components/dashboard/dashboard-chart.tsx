"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DashboardChartProps {
  pipeline: {
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
    rejected: number;
  };
}

const colors = [
  "#6b7280",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#10b981",
  "#ef4444",
];

export function DashboardChart({ pipeline }: DashboardChartProps) {
  const data = [
    { name: "Applied", count: pipeline.applied },
    { name: "Screening", count: pipeline.screening },
    { name: "Interview", count: pipeline.interview },
    { name: "Offer", count: pipeline.offer },
    { name: "Hired", count: pipeline.hired },
    { name: "Rejected", count: pipeline.rejected },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            fontSize: "13px",
          }}
          formatter={(value: number) => [value, "Candidates"]}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
