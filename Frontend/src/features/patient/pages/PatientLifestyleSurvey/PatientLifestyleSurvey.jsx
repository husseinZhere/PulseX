import React, { useEffect, useState } from 'react';
import { MdOutlineBloodtype, MdOutlineFavorite } from 'react-icons/md';
import { LuActivity, LuBeer, LuMoonStar } from 'react-icons/lu';
import { FaSmoking, FaUsers } from 'react-icons/fa';
import LifestyleSurveyHeader from '../../components/LifestyleSurvey/LifestyleSurveyHeader';
import LifestyleSurveyResults from '../../components/LifestyleSurvey/LifestyleSurveyResults';
import QuestionSection from '../../components/LifestyleSurvey/QuestionSection';
import { analyzeHealthSurvey } from '../../../../services/healthService';

const mapCholesterol = (value = '') => {
  const normalized = value.toLowerCase();
  if (normalized.includes('borderline')) return 'Borderline';
  if (normalized.includes('high')) return 'High';
  return 'Normal';
};

const mapSleep = (value = '') => {
  const normalized = value.toLowerCase();
  if (normalized.includes('less')) return '< 6';
  if (normalized.includes('more')) return '> 8';
  return '6-8';
};

const normalize = (v) => {
  if (!v) return 'Low';
  const s = v.toLowerCase();
  if (s.startsWith('high')) return 'High';
  if (s.startsWith('med')) return 'Medium';
  return 'Low';
};

const PatientLifestyleSurvey = () => {
  const [formData, setFormData] = useState({
    cholesterol: '',
    sleepHours: '',
    smoking: '',
    alcohol: '',
    activity: '',
    prevIssues: '',
    familyHistory: '',
  });
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Lifestyle Survey | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Complete a quick lifestyle survey to assess heart health.');
    }
  }, []);

  const handleSelect = (question, value) => {
    setFormData((prev) => ({ ...prev, [question]: value }));
  };

  const handleSubmit = async () => {
    const requiredAnswers = Object.values(formData).every(Boolean);
    if (!requiredAnswers) {
      setError('Please answer all questions before viewing results.');
      setShowResults(false);
      return;
    }

    setSubmitting(true);
    setError('');
    setResult(null);
    setShowResults(false);

    try {
      const payload = {
        cholesterolLevel: mapCholesterol(formData.cholesterol || ''),
        sleepHours: mapSleep(formData.sleepHours || ''),
        isSmoker: /yes/i.test(formData.smoking || ''),
        alcoholConsumption: normalize(formData.alcohol),
        physicalActivity: normalize(formData.activity),
        hasPreviousHeartIssues: /yes/i.test(formData.prevIssues || ''),
        hasFamilyHistory: /yes/i.test(formData.familyHistory || ''),
      };
      const resp = await analyzeHealthSurvey(payload);
      const surveyResult = resp?.data || resp;

      if (!surveyResult || typeof surveyResult !== 'object') {
        throw new Error('Invalid response received from survey analyzer');
      }

      setResult(surveyResult);
      setShowResults(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Submit failed');
      setShowResults(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen p-[24px] bg-white dark:bg-[#111827] rounded-[32px]">
      <LifestyleSurveyHeader />
      <p className="text-[18px] text-gray-500 dark:text-gray-400 mb-10">
        Answer these quick questions about your daily habits to help our AI analyze your heart health baseline.
      </p>

      <section className="flex flex-col gap-10" aria-label="Survey questions">
        <QuestionSection
          icon={<MdOutlineBloodtype className="text-red-500" />}
          label="Cholesterol Level"
          question="Select your latest cholesterol level:"
          options={['Normal (<200 mg/dL)', 'Borderline (200–239 mg/dL)', 'High (≥240 mg/dL)']}
          selected={formData.cholesterol}
          onSelect={(v) => handleSelect('cholesterol', v)}
        />

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <QuestionSection
            className="flex-1 w-full"
            icon={<LuMoonStar className="text-purple-600" />}
            label="Sleep Hours Per Day"
            question="How many hours do you sleep per day?"
            options={['Less than 6 hours', '6–8 hours', 'More than 8 hours']}
            selected={formData.sleepHours}
            onSelect={(v) => handleSelect('sleepHours', v)}
          />
          <QuestionSection
            className="flex-1 w-full"
            icon={<FaSmoking className="text-gray-500" />}
            label="Smoking"
            question="Do you smoke?"
            options={['Yes', 'No']}
            selected={formData.smoking}
            onSelect={(v) => handleSelect('smoking', v)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <QuestionSection
            icon={<LuBeer className="text-blue-400" />}
            label="Alcohol Consumption"
            question="How often do you drink alcohol?"
            options={['Low', 'Medium', 'High']}
            selected={formData.alcohol}
            onSelect={(v) => handleSelect('alcohol', v)}
          />
          <QuestionSection
            icon={<LuActivity className="text-teal-500" />}
            label="Physical Activity"
            question="How active are you during the week?"
            options={['Low', 'Medium', 'High']}
            selected={formData.activity}
            onSelect={(v) => handleSelect('activity', v)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <QuestionSection
            icon={<MdOutlineFavorite className="text-red-600" />}
            label="Previous Heart Issues"
            question="Have you ever had any heart-related issues before?"
            options={['Yes', 'No']}
            selected={formData.prevIssues}
            onSelect={(v) => handleSelect('prevIssues', v)}
          />
          <QuestionSection
            icon={<FaUsers className="text-stone-600" />}
            label="Family History"
            question="Has anyone in your family had heart-related diseases?"
            options={['Yes', 'No']}
            selected={formData.familyHistory}
            onSelect={(v) => handleSelect('familyHistory', v)}
          />
        </div>

        <div className="flex justify-center pt-4 pb-8 mt-20">
          <button
            className="px-14 py-3.5 rounded-[28px] bg-brand-main hover:bg-[#2830d4] disabled:bg-[#9AA0FF] disabled:cursor-not-allowed text-white text-[14px] font-semibold shadow-[0_4px_12px_rgba(51,60,245,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(51,60,245,0.35)] transition-all cursor-pointer"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Analyzing...' : 'View Results'}
          </button>
        </div>

        {error && (
          <p className="text-center text-sm text-red-600 dark:text-red-400 -mt-5">{error}</p>
        )}
      </section>

      {showResults && result && <LifestyleSurveyResults result={result} />}

      <footer className="sr-only">
        <p>End of lifestyle survey page.</p>
      </footer>
    </main>
  );
};

export default PatientLifestyleSurvey;
