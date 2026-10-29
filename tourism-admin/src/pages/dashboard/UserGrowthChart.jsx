import { User, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../i18n';

const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthNamesKh = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];

const weekDaysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekDaysKh = ['ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហ', 'សុក្រ', 'សៅរ៍', 'អាទិត្យ'];

const monthWeeksEn = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
const monthWeeksKh = ['សប្តាហ៍ទី ១', 'សប្តាហ៍ទី ២', 'សប្តាហ៍ទី ៣', 'សប្តាហ៍ទី ៤'];

const todayHoursEn = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM'];
const todayHoursKh = ['១២ យប់', '៤ ព្រឹក', '៨ ព្រឹក', '១២ ថ្ងៃ', '៤ រសៀល', '៨ យប់'];

const labelMapKh = {
  'Jan': 'មករា', 'Feb': 'កុម្ភៈ', 'Mar': 'មីនា', 'Apr': 'មេសា', 'May': 'ឧសភា', 'Jun': 'មិថុនា',
  'Jul': 'កក្កដា', 'Aug': 'សីហា', 'Sep': 'កញ្ញា', 'Oct': 'តុលា', 'Nov': 'វិច្ឆិកា', 'Dec': 'ធ្នូ',
  'Mon': 'ច័ន្ទ', 'Tue': 'អង្គារ', 'Wed': 'ពុធ', 'Thu': 'ព្រហ', 'Fri': 'សុក្រ', 'Sat': 'សៅរ៍', 'Sun': 'អាទិត្យ',
  'Week 1': 'សប្តាហ៍ទី ១', 'Week 2': 'សប្តាហ៍ទី ២', 'Week 3': 'សប្តាហ៍ទី ៣', 'Week 4': 'សប្តាហ៍ទី ៤',
  '12 AM': '១២ យប់', '4 AM': '៤ ព្រឹក', '8 AM': '៨ ព្រឹក', '12 PM': '១២ ថ្ងៃ', '4 PM': '៤ រសៀល', '8 PM': '៨ យប់',
};

export default function UserGrowthChart({ growthData, timeRange = 'yearly', isLoading = false }) {
  const { t, currentLang } = useLanguage();
  const currentYear = new Date().getFullYear();
  const isKh = currentLang === 'KH';

  // Purely database-driven: if growthData is empty or loading, fallback appropriately by timeRange
  const fallbackList = timeRange === 'today'
    ? (isKh ? todayHoursKh : todayHoursEn)
    : timeRange === 'weekly'
    ? (isKh ? weekDaysKh : weekDaysEn)
    : timeRange === 'monthly'
    ? (isKh ? monthWeeksKh : monthWeeksEn)
    : (isKh ? monthNamesKh : monthNamesEn);

  // Only use growthData if it matches the expected timeframe item count
  const isMatchingLength = Array.isArray(growthData) && (
    (timeRange === 'today' && growthData.length === 6) ||
    (timeRange === 'weekly' && growthData.length === 7) ||
    (timeRange === 'monthly' && growthData.length === 4) ||
    (timeRange === 'yearly' && growthData.length === 12)
  );

  const chartData = isMatchingLength
    ? growthData.map(item => {
        const rawLabel = item.label || item.month || item.period;
        const displayLabel = (isKh && labelMapKh[rawLabel]) ? labelMapKh[rawLabel] : rawLabel;
        const rawFullLabel = item.fullLabel || item.label || item.month;
        const displayFullLabel = (isKh && labelMapKh[rawFullLabel]) ? labelMapKh[rawFullLabel] : rawFullLabel;

        return {
          ...item,
          label: displayLabel,
          fullLabel: displayFullLabel,
        };
      })
    : fallbackList.map((label) => ({
        label,
        month: label,
        period: label,
        fullLabel: label,
        unitsSold: 0,
        totalTransaction: 0,
      }));

  const totalTravelers = chartData.reduce((acc, curr) => acc + (Number(curr.unitsSold ?? curr.users) || 0), 0);

  const getSubtitle = () => {
    switch (timeRange) {
      case 'today':
        return t('dashboard.growthSubtitleToday', 'Hourly active engagement and visits from database (Today)');
      case 'weekly':
        return t('dashboard.growthSubtitleWeekly', 'Daily active engagement and visits from database (Last 7 Days)');
      case 'monthly':
        return t('dashboard.growthSubtitleMonthly', 'Weekly active engagement and visits from database (This Month)');
      case 'yearly':
      default:
        return t('dashboard.growthSubtitleYearly', { year: currentYear }, 'Monthly active engagement and visits from database ({year})');
    }
  };

  const getBadgeLabel = () => {
    switch (timeRange) {
      case 'today':
        return t('dashboard.registeredTravelersToday', '{count} Registered Travelers (Today)').replace('{count}', totalTravelers.toLocaleString());
      case 'weekly':
        return t('dashboard.registeredTravelersWeekly', '{count} Registered Travelers (This Week)').replace('{count}', totalTravelers.toLocaleString());
      case 'monthly':
        return t('dashboard.registeredTravelersMonthly', '{count} Registered Travelers (This Month)').replace('{count}', totalTravelers.toLocaleString());
      case 'yearly':
      default:
        return t('dashboard.registeredTravelersYearly', { count: totalTravelers.toLocaleString(), year: currentYear }, '{count} Registered Travelers ({year})');
    }
  };

  return (
    <div className={`w-full bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-6 transition-opacity duration-200 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm md:text-base text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('dashboard.userGrowthTitle', 'User Growth & Platform Traffic')}</span>
          </h3>
          <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
            {getSubtitle()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-900/50">
            <TrendingUp className="w-3.5 h-3.5" />
            {getBadgeLabel()}
          </span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%" key={`growth-${timeRange}-${currentLang}`}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#D1D5DB' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value, name) => [value, name]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullLabel || label}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                fontSize: 12,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="plainline"
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
            <Line
              type="monotone"
              dataKey="unitsSold"
              name={t('dashboard.newTravelers', 'New Travelers')}
              stroke="#4472C4"
              strokeWidth={3}
              dot={{ r: 3, fill: '#4472C4' }}
              activeDot={{ r: 5, fill: '#4472C4' }}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="totalTransaction"
              name={t('dashboard.platformActivity', 'Platform Activity')}
              stroke="#ED7D31"
              strokeWidth={3}
              dot={{ r: 3, fill: '#ED7D31' }}
              activeDot={{ r: 5, fill: '#ED7D31' }}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
