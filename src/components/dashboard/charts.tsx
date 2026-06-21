'use client';

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { brand, brandChartColors } from '@/lib/brand';

const tickStyle = { fontSize: 11, fill: brand.muted };
const tooltipStyle = {
  fontSize: 12,
  borderRadius: 8,
  border: `1px solid color-mix(in srgb, var(--brand-green) 20%, transparent)`,
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, subtitle, children, className }: ChartCardProps) {
  return (
    <div className={`dash-card p-4 ${className ?? ''}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-brand-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[11px] text-brand-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function AreaChartCard({
  title, subtitle, data, dataKey, xKey = 'name',
}: {
  title: string; subtitle?: string;
  data: Record<string, string | number>[];
  dataKey: string; xKey?: string;
}) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={brand.green} stopOpacity={0.15} />
              <stop offset="95%" stopColor={brand.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in srgb, var(--brand-green) 6%, transparent)" />
          <XAxis dataKey={xKey} tick={tickStyle} axisLine={false} tickLine={false} />
          <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey={dataKey} stroke={brand.green} strokeWidth={2} fill="url(#areaGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function BarChartCard({
  title, subtitle, data, dataKey, xKey = 'name',
}: {
  title: string; subtitle?: string;
  data: Record<string, string | number>[];
  dataKey: string; xKey?: string;
}) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in srgb, var(--brand-green) 6%, transparent)" vertical={false} />
          <XAxis dataKey={xKey} tick={tickStyle} axisLine={false} tickLine={false} />
          <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey={dataKey} fill={brand.green} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function PieChartCard({
  title, subtitle, data,
}: {
  title: string; subtitle?: string;
  data: { name: string; value: number }[];
}) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={brandChartColors[i % brandChartColors.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/** Generate weekly activity data from enrollment count */
export function buildWeeklyActivity(total: number) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((name, i) => ({
    name,
    lessons: Math.max(0, Math.round(total * (0.08 + (i % 3) * 0.04) + (i * 2))),
    hours: Math.max(0, Math.round(total * 0.05 + i * 0.5)),
  }));
}

export function buildMonthlyEnrollments(total: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((name, i) => ({
    name,
    enrollments: Math.max(0, Math.round(total * (0.1 + i * 0.08))),
  }));
}
