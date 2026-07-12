"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";

const GlobalBarShape = (props: any) => {
  const { x, y, width, height } = props;
  const gap = 1;
  const h = Math.max(0, height - gap);
  return (
    <rect
      x={x}
      y={y - gap}
      width={width}
      height={h}
      fill="#B8F25E"
      rx={6}
      ry={6}
    />
  );
};

const NepalBarShape = (props: any) => {
  const { x, y, width, height } = props;
  const gap = 1;
  const h = Math.max(0, height - gap);
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={h}
      fill="#111111"
      rx={6}
      ry={6}
    />
  );
};

const formatYAxis = (value: number) => {
  return `${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border-light bg-surface p-4 shadow-lg">
        <p className="mb-1.5 text-sm font-semibold text-text-primary">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1.5 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-secondary">
              {entry.name}:{" "}
              <span className="font-semibold text-text-primary">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const globalBase = [2.6, 2.5, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6];
const nepalBase = [0.8, 0.7, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8];
const now = new Date();
const defaultData = Array.from({ length: 8 }, (_, i) => {
  const d = new Date(now.getFullYear(), now.getMonth() - 8 + i, 1);
  const idx = d.getMonth();
  return { month: months[idx], global: globalBase[idx], nepal: nepalBase[idx] };
});

export default function IncomeChart() {
  const [co2Data, setCo2Data] = useState(defaultData);
  const [barSize, setBarSize] = useState(33);

  useEffect(() => {
    const check = () => setBarSize(window.innerWidth < 640 ? 18 : 33);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("/api/co2")
      .then((res) => res.json())
      .then((data) => {
        if (data.monthly) setCo2Data(data.monthly);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      className="rounded-[18px] lg:rounded-[24px] bg-surface p-4 lg:p-5 shadow-sm flex flex-col h-full"
      style={{
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        fontFamily: "var(--font-inter), Inter, sans-serif",
      }}
    >
      <div className="mb-3 lg:mb-4">
        <h2 className="text-lg lg:text-2xl font-medium text-text-primary">Monthly CO₂ Emissions</h2>
        <p className="mt-1 text-xs lg:text-base text-text-muted">
          Global CO₂ · Nepal CO₂
        </p>
      </div>

      <div className="rounded-[14px] lg:rounded-[16px] bg-surface-alt p-3 lg:p-4 flex-1 flex flex-col">
        <div className="mb-2 lg:mb-3 flex items-center justify-between">
          <h3 className="text-sm lg:text-lg font-semibold text-text-primary">
            Monthly trend
          </h3>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-1 lg:gap-2">
              <div className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5 rounded-full bg-[#B8F25E]" />
              <span className="text-[10px] lg:text-base text-text-secondary">Global</span>
            </div>
            <div className="flex items-center gap-1 lg:gap-2">
              <div className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5 rounded-full bg-[#111111]" />
              <span className="text-[10px] lg:text-base text-text-secondary">Nepal</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[180px] lg:min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={co2Data}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
              barCategoryGap="8%"
              barGap={0}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-default)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                dy={8}
              />
              <YAxis
                width={20}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 11, textAnchor: "start" }}
                tickFormatter={formatYAxis}
                domain={[0, 6]}
                ticks={[0, 1, 2, 3, 4, 5, 6]}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.02)" }}
              />
              <Bar
                dataKey="nepal"
                stackId="stack"
                fill="#111111"
                shape={<NepalBarShape />}
                barSize={barSize}
                animationDuration={1000}
                animationEasing="ease-out"
              />
              <Bar
                dataKey="global"
                stackId="stack"
                fill="#B8F25E"
                shape={<GlobalBarShape />}
                barSize={barSize}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
