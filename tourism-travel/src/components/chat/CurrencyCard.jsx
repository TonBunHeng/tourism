import { DollarSign } from 'lucide-react';

export default function CurrencyCard({ currency, language = 'en' }) {
  const isKm = language === 'km';

  if (!currency) return null;

  const amountUsd = currency.amount_usd || 1;
  const rate = currency.rate || currency.exchange_rate || 4107;
  const amountKhr = currency.amount_khr || Math.round(amountUsd * rate);

  return (
    <div className="mt-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 shadow-2xs w-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-1.5">
          <DollarSign size={16} className="text-emerald-500" />
          <span className="font-bold text-xs text-slate-900 dark:text-white">
            {isKm ? 'អត្រាប្តូរប្រាក់' : 'Currency Exchange'}
          </span>
        </div>
        {currency.source && (
          <span className="text-[10px] text-slate-400">
            {currency.source}
          </span>
        )}
      </div>

      <div className="flex items-center justify-around py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <span className="text-xs text-slate-500 block">USD</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            ${amountUsd}
          </span>
        </div>

        <span className="text-slate-400 font-bold text-xs">➔</span>

        <div className="text-center">
          <span className="text-xs text-slate-500 block">KHR</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {Number(amountKhr).toLocaleString()} ៛
          </span>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-center text-slate-400 dark:text-slate-500">
        1 USD = {Number(rate).toLocaleString()} KHR
      </div>
    </div>
  );
}

