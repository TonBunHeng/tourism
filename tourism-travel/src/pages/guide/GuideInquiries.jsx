import { HelpCircle } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';

export default function GuideInquiries() {
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb
          items={[
            { label: 'Guide Portal', to: '/guide/dashboard' },
            { label: 'Tourist Inquiries' }
          ]}
        />
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Tourist Inquiries & Assistance</h1>
          <p className="text-xs text-gray-500">Answer traveler questions and provide verified destination insights.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl border border-gray-200 dark:border-zinc-800 text-center space-y-3">
          <HelpCircle className="w-12 h-12 text-blue-500 mx-auto opacity-70" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No Pending Inquiries</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            All tourist Q&A requests have been resolved by local AngkorVerses guides.
          </p>
        </div>
      </div>
    </div>
  );
}
