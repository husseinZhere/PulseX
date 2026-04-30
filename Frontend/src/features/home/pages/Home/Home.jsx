import React, { useEffect } from 'react';
import Hero from '../../components/Hero/Hero';
import Doctors from '../../components/Doctors/Doctors';
import Features from '../../components/Features/Features';
import Stories from '../../components/Stories/Stories';
import About from '../../components/JourneyTimeline/JourneyTimeline';
import { useTheme } from '../../../../context/ThemeContext';

const Home = () => {
  const { resetToLight } = useTheme();

  // Landing page is always light mode regardless of user preference
  useEffect(() => {
    resetToLight();
  }, [resetToLight]);

  useEffect(() => {
    const pageTitle = 'PulseX | AI-Powered Heart Health Monitoring';
    const pageDescription =
      'PulseX offers AI-powered cardiovascular monitoring, risk scoring, remote cardiologist follow-ups, and emergency-ready health access.';
    const pageUrl = `${window.location.origin}/`;

    document.title = pageTitle;

    const upsertMeta = (key, value, attr = 'name') => {
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    upsertMeta('description', pageDescription);
    upsertMeta('robots', 'index, follow');
    upsertMeta('og:title', pageTitle, 'property');
    upsertMeta('og:description', pageDescription, 'property');
    upsertMeta('og:type', 'website', 'property');
    upsertMeta('og:url', pageUrl, 'property');
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', pageTitle);
    upsertMeta('twitter:description', pageDescription);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    const schemaId = 'home-webpage-schema';
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageTitle,
      description: pageDescription,
      url: pageUrl,
      inLanguage: 'en'
    };

    let schemaTag = document.getElementById(schemaId);
    if (!schemaTag) {
      schemaTag = document.createElement('script');
      schemaTag.setAttribute('type', 'application/ld+json');
      schemaTag.setAttribute('id', schemaId);
      document.head.appendChild(schemaTag);
    }
    schemaTag.textContent = JSON.stringify(schema);
  }, []);

  return (
    <main className="overflow-hidden bg-[#FAFAFA] dark:bg-[#020617] font-inter" role="main" aria-label="PulseX Home">
      <Hero />
      <Doctors />
      <Features />
      <Stories />
      <About />
    </main>
  );
};

export default Home;