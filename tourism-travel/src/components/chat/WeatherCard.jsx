import { CloudRain, Sun, Cloud, Droplets, Wind, Info } from 'lucide-react';

export default function WeatherCard({ weather, language = 'en' }) {
  const isKm = language === 'km';

  if (!weather || !weather.current) {
    return null;
  }

  const cond = (weather.current.condition || '').toLowerCase();
  const isRainy = cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower');
  const isClear = cond.includes('clear') || cond.includes('sun');

  const WeatherIcon = isRainy ? CloudRain : isClear ? Sun : Cloud;
  const iconColor = isRainy
    ? 'text-blue-500'
    : isClear
    ? 'text-amber-500'
    : 'text-slate-400';

  return (
    <div className="mt-2.5 rounded-xl bg-gradient-to-br from-blue-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-blue-100 dark:border-slate-800 p-2.5 shadow-2xs w-full">
      {/* Top row: Icon, Province, Condition, and Temperatures */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-1.5">
          <WeatherIcon size={20} className={iconColor} />
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
              {weather.province} {weather.province_km ? `(${weather.province_km})` : ''}
            </h4>
            <span className="text-[10px] text-slate-500">
              {isKm && weather.current.condition_km
                ? weather.current.condition_km
                : weather.current.condition}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-black text-[#003E83] dark:text-blue-400">
            {weather.current.temperature_c ?? 31}°C
          </span>
          <span className="text-[10px] text-slate-400 block -mt-1">
            {weather.current.temperature_f ?? 88}°F
          </span>
        </div>
      </div>

      {/* Metrics Row: Rain, Humidity, Wind */}
      <div className="flex items-center justify-around py-1 px-2 rounded-lg bg-white/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 mb-2 text-[10px]">
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
          <CloudRain size={10} className="text-blue-500" />
          <span>
            {weather.current.rain_probability || 20}% {isKm ? 'ភ្លៀង' : 'rain'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
          <Droplets size={10} className="text-blue-400" />
          <span>
            {weather.current.humidity_percent || 70}% {isKm ? 'សំណើម' : 'humidity'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
          <Wind size={10} className="text-teal-500" />
          <span>{weather.current.wind_speed_kmh || 10} km/h</span>
        </div>
      </div>

      {/* Travel Advice / Suitability callout */}
      {(weather.travel_suitability || weather.travel_advice_en || weather.travel_advice_km) && (
        <div className="p-1.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-start gap-1.5 text-[11px]">
          <Info size={13} className="text-[#003E83] dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-slate-700 dark:text-slate-300 text-[10px] leading-tight">
            <strong className="text-[#003E83] dark:text-blue-300">
              {weather.travel_suitability || (isKm ? 'ការណែនាំ៖' : 'Travel Advice:')}:
            </strong>{' '}
            {isKm
              ? weather.travel_advice_km || weather.travel_advice_en
              : weather.travel_advice_en || weather.travel_advice_km}
          </p>
        </div>
      )}
    </div>
  );
}

