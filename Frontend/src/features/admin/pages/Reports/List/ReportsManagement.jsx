import { useEffect } from 'react';
import ReportsManagementView from '../../../components/Reports/List/ReportsManagementView';
import { applyReportsSeo } from '../shared/seo';

export default function ReportsManagementPage() {
  useEffect(() => {
    applyReportsSeo({
      title: 'Reports Management | PulseX Admin',
      description: 'Review and manage reported stories, comments, and replies in the PulseX admin panel.',
      keywords: 'PulseX reports, admin moderation, report management',
    });
  }, []);

  return (
    <main aria-label="Reports management page" className="h-full">
      <ReportsManagementView />
    </main>
  );
}