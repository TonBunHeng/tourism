import { Users as UsersIcon, UserCheck, ShieldCheck, Clock } from "lucide-react";

export default function UsersStats({ users = [] }) {
  const safeUsers = Array.isArray(users) ? users : [];
  const total = safeUsers.length;
  const activeCount = safeUsers.filter(u => u.status === "Active" || u.onlineStatus === "Online").length;
  const offlineCount = safeUsers.filter(u => u.status !== "Active" && u.onlineStatus !== "Online").length;
  const adminCount = safeUsers.filter(u => u.role === "Super Admin" || u.role === "Admin").length;

  const stats = [
    {
      label: "Total Registered Users",
      value: total.toLocaleString(),
      subtext: "Tourist & staff accounts",
      icon: UsersIcon,
      color: "text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]",
      bg: "bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]"
    },
    {
      label: "Active Accounts",
      value: activeCount.toLocaleString(),
      subtext: `${total > 0 ? Math.round((activeCount / total) * 100) : 0}% active engagement`,
      icon: UserCheck,
      color: "text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)]",
      bg: "bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]"
    },
    {
      label: "Inactive / Suspended",
      value: offlineCount.toLocaleString(),
      subtext: "Inactive member accounts",
      icon: Clock,
      color: "text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)]",
      bg: "bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]"
    },
    {
      label: "Administrators",
      value: adminCount.toLocaleString(),
      subtext: "Full system access permissions",
      icon: ShieldCheck,
      color: "text-[var(--color-purple-text)] dark:text-[var(--color-purple-dark-text)]",
      bg: "bg-[var(--color-purple-bg)] dark:bg-[var(--color-purple-dark-bg)]"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md p-4 shadow-xs border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] font-medium truncate">
                  {stat.label}
                </p>
                <p className="text-lg md:text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] mt-1 tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-md shrink-0 ${stat.bg}`}>
                <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted-light)] dark:text-[var(--color-text-secondary-dark)] mt-2">
              {stat.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
