import { ChevronDown, ShieldCheck, Users as UsersIcon } from 'lucide-react';

export default function UsersToolbar({
  totalCount,
  selectedRole,
  onRoleChange,
  roles = [],
  selectedStatus,
  onStatusChange,
  statuses = [],
  quickFilter,
  onQuickFilterChange
}) {
  return (
    <div className="px-4 md:px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title & Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
              All Users
            </h2>
            {totalCount !== undefined && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#003E83] dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                {totalCount} {totalCount === 1 ? 'user' : 'users'}
              </span>
            )}
          </div>

          {/* Quick Segment Tabs */}
          {onQuickFilterChange && (
            <div className="flex items-center bg-gray-100 dark:bg-zinc-800/80 p-0.5 rounded-md text-xs font-medium border border-gray-200 dark:border-zinc-700/60 ml-1">
              <button
                type="button"
                onClick={() => onQuickFilterChange('all')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  quickFilter === 'all' 
                    ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs' 
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <UsersIcon className="w-3.5 h-3.5" /> All Users
              </button>
              <button
                type="button"
                onClick={() => onQuickFilterChange('admins')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  quickFilter === 'admins' 
                    ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 font-semibold shadow-xs' 
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Staff
              </button>
            </div>
          )}
        </div>

        {/* Right Controls Container */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Role Filter */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role === "All" ? "All Roles" : role}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] focus:border-transparent bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] text-sm cursor-pointer shadow-xs font-medium"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status === "All" ? "All Statuses" : status}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
