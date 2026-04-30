import { useEffect } from 'react';
import SettingsProfileView from '../../../components/SettingsProfile/Profile/SettingsProfileView';
import { applySettingsProfileSeo } from '../shared/seo';

export default function SettingsProfilePage() {
  useEffect(() => {
    applySettingsProfileSeo({
      title: 'Settings & Profile | PulseX Admin',
      description: 'Manage admin personal information, password, and account preferences in PulseX.',
      keywords: 'PulseX admin settings, profile settings, account preferences',
    });
  }, []);

  return (
    <main aria-label="Settings and profile page" className="h-full">
      <SettingsProfileView />
    </main>
  );
}