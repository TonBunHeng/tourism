import { useMemo } from 'react';
import { Bell, Mail, Smartphone, UserPlus, Star, Calendar, Trash2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../i18n';

export default function NotificationTab({ settings, setSettings }) {
  const { t } = useLanguage();

  const handleToggle = (field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const channelToggles = useMemo(() => [
    {
      id: 'pushNotifications',
      title: t('settings.pushNotifTitle', 'Web Push Notifications'),
      desc: t('settings.pushNotifDesc', 'Receive real-time browser desktop pop-up alerts for high-priority incidents.'),
      icon: Bell,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      id: 'emailNotifications',
      title: t('settings.emailNotifTitle', 'Email Notification Digest'),
      desc: t('settings.emailNotifDesc', 'Deliver administrative digests and daily operational summaries to official contact email.'),
      icon: Mail,
      color: 'text-[var(--color-purple-text)] dark:text-[var(--color-purple-dark-text)] bg-[var(--color-purple-bg)] dark:bg-[var(--color-purple-dark-bg)]'
    },
    {
      id: 'smsNotifications',
      title: t('settings.smsNotifTitle', 'Urgent SMS Alert Channel'),
      desc: t('settings.smsNotifDesc', 'Transmit critical security breaches and server outages via SMS to designated admin numbers.'),
      icon: Smartphone,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    }
  ], [t]);

  const alertToggles = useMemo(() => [
    {
      id: 'newUserAlert',
      title: t('settings.alertNewUserTitle', 'New Tourist / Partner Registration'),
      desc: t('settings.alertNewUserDesc', 'Notify administrator when a new user registers on the portal or mobile app.'),
      icon: UserPlus,
      color: 'text-[var(--color-success-text)] dark:text-[var(--color-success-dark-text)] bg-[var(--color-success-bg)] dark:bg-[var(--color-success-dark-bg)]'
    },
    {
      id: 'newReviewAlert',
      title: t('settings.alertNewReviewTitle', 'New Destination Review & Rating'),
      desc: t('settings.alertNewReviewDesc', 'Notify when a tourist submits a new review requiring moderation.'),
      icon: Star,
      color: 'text-[var(--color-purple-text)] dark:text-[var(--color-purple-dark-text)] bg-[var(--color-purple-bg)] dark:bg-[var(--color-purple-dark-bg)]'
    },
    {
      id: 'newEventAlert',
      title: t('settings.alertNewEventTitle', 'Tourism & Cultural Event Published'),
      desc: t('settings.alertNewEventDesc', 'Broadcast internal notifications when cultural events are scheduled.'),
      icon: Calendar,
      color: 'text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)]'
    },
    {
      id: 'deletionRequestAlert',
      title: t('settings.alertDeletionRequestTitle', 'Account & Data Deletion Requests'),
      desc: t('settings.alertDeletionRequestDesc', 'Immediate high-priority alert when a tourist submits a data deletion request.'),
      icon: Trash2,
      color: 'text-[var(--color-danger-text)] dark:text-[var(--color-danger-dark-text)] bg-[var(--color-danger-bg)] dark:bg-[var(--color-danger-dark-bg)]'
    },
    {
      id: 'securityAlert',
      title: t('settings.alertSecurityTitle', 'Security Incidents & IP Lockouts'),
      desc: t('settings.alertSecurityDesc', 'Trigger immediate notification upon multiple failed logins or unauthorized access attempts.'),
      icon: ShieldAlert,
      color: 'text-[var(--color-warning-text)] dark:text-[var(--color-warning-dark-text)] bg-[var(--color-warning-bg)] dark:bg-[var(--color-warning-dark-bg)]'
    }
  ], [t]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
          {t('settings.notificationsTitle', 'Notification & Alert Preferences')}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-1">
          {t('settings.notificationsSubtitle', 'Configure real-time delivery channels and customize administrative alerts for platform activities.')}
        </p>
      </div>

      {/* Card 1: Notification Delivery Channels */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <Bell className="w-4 h-4 text-[var(--color-primary)]" />
          {t('settings.cardDeliveryChannels', 'Notification Delivery Channels')}
        </h3>

        <div className="space-y-3">
          {channelToggles.map((item) => {
            const Icon = item.icon;
            const isEnabled = Boolean(settings[item.id]);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div className={`p-2.5 rounded-md shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggle(item.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-md peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-md after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 2: Administrative Activity Alerts */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] flex items-center gap-2 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] pb-3">
          <Star className="w-4 h-4 text-[var(--color-primary)]" />
          {t('settings.cardEventAlerts', 'Administrative Platform Event Alerts')}
        </h3>

        <div className="space-y-3">
          {alertToggles.map((item) => {
            const Icon = item.icon;
            const isEnabled = Boolean(settings[item.id]);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)]/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div className={`p-2.5 rounded-md shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggle(item.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-md peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-md after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
