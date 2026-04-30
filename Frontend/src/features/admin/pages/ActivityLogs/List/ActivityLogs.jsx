import { useEffect } from 'react';
import ActivityLogsView from '../../../components/ActivityLogs/List/ActivityLogsView';
import { applyActivityLogsSeo } from '../shared/seo';

export default function ActivityLogsPage() {
  useEffect(() => {
    applyActivityLogsSeo({
      title: 'Activity Logs | PulseX Admin',
      description: 'Track recent admin changes, user actions, and system activity logs in PulseX.',
      keywords: 'PulseX activity logs, admin audit trail, system activity',
    });
  }, []);

  return (
    <main aria-label="Activity logs page" className="h-full">
      <ActivityLogsView />
    </main>
  );
}