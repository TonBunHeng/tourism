import { useState } from 'react';
import {
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const PIE_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#F43F5E', // Rose
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#EC4899', // Pink
  '#F97316', // Orange
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] px-3.5 py-2.5 rounded-lg shadow-xl border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-xs min-w-[140px] pointer-events-none z-50">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: data.payload.color || data.fill }}
          />
          <span className="font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">
            {data.name}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] pt-0.5">
          <span>Places: <strong className="font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{data.value}</strong></span>
          <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded text-[10px]">
            {data.payload.percentage || Math.round((data.percent || 0) * 100)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function QuickActions({ distribution = [] }) {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  const rawCategories = Array.isArray(distribution) ? distribution : [];
  const totalPlaces = rawCategories.reduce((sum, item) => sum + (Number(item.count) || 0), 0);

  const pieData = rawCategories.map((item, index) => {
    const count = Number(item.count) || 0;
    const pct = totalPlaces > 0 ? Math.round((count / totalPlaces) * 100) : 0;
    return {
      name: item.name,
      value: count,
      percentage: pct,
      color: PIE_COLORS[index % PIE_COLORS.length],
    };
  });

  return (
    <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-blue-500" />
              <span>Category Distribution</span>
            </h3>
            <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
              Destinations grouped by category from database
            </p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* View Content: Larger Pie Chart */}
        <div className="h-80 w-full relative flex items-center justify-center">
          {rawCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-400 text-xs">
              <PieChartIcon className="w-8 h-8 mb-2 stroke-1 text-gray-300 dark:text-zinc-600" />
              <p>No category distribution available</p>
            </div>
          ) : (
            <>
              {/* Donut Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                {hoveredItem ? (
                  <div className="flex flex-col items-center justify-center text-center px-4 transition-all duration-200">
                    <span className="text-3xl font-extrabold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] leading-tight tracking-tight">
                      {hoveredItem.value}
                    </span>
                    <span
                      className="text-xs font-bold truncate max-w-[130px] mt-0.5"
                      style={{ color: hoveredItem.color }}
                    >
                      {hoveredItem.name}
                    </span>
                    <span className="text-[10px] font-semibold text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                      {hoveredItem.percentage}% of total
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center transition-all duration-200">
                    <span className="text-3xl font-extrabold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] leading-tight tracking-tight">
                      {totalPlaces}
                    </span>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                      Total Places
                    </span>
                  </div>
                )}
              </div>

              <div className="w-full h-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={118}
                      paddingAngle={2.5}
                      dataKey="value"
                      onMouseEnter={(_, index) => setHoveredItem(pieData[index])}
                      onMouseLeave={() => setHoveredItem(null)}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="transparent"
                          className="cursor-pointer transition-opacity hover:opacity-90"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip />}
                      wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
