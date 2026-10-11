"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#64748b"];

type WeeklyPoint = { week: string; hours: number; points: number; sessions: number };
type MonthlyPoint = { month: string; hours: number; points: number; sessions: number };
type CategoryPoint = { category: string; hours: number; count: number };

export function WeeklyHoursChart({ data }: { data: WeeklyPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Legend />
          <Bar dataKey="hours" name="Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="sessions" name="Sessions" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyHoursChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
          <Legend />
          <Bar dataKey="hours" name="Hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="points" name="Score pts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ data }: { data: CategoryPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-12">No category data yet</p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="hours"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ category, hours }) => `${category}: ${hours}h`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
