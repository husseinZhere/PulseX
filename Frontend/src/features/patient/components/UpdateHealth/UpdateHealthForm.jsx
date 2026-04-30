import { useEffect, useState } from 'react';
import {
  LuActivity,
  LuDroplet,
  LuRuler,
  LuShieldPlus,
} from 'react-icons/lu';
import { FaHeartPulse } from 'react-icons/fa6';
import Toast from '../../../../components/Toast/Toast';
import NumberField from './NumberField';
import SelectField from './SelectField';
import { getMyHealthData } from '../../../../services/healthService';
import { updateHealthData } from '../../../../services/patientService';
import {
  BLOOD_COUNT_OPTIONS,
  BLOOD_PRESSURE_OPTIONS,
  HEART_RATE_OPTIONS,
  coerceHealthMetricSelection,
  getHealthMetricLabel,
  getHealthMetricStorageValue,
} from '../../../../utils/healthMetrics';

const normalizeDataType = (value) => String(value || '').replace(/[^a-z0-9]/gi, '').toLowerCase();

const latestByType = (items, ...types) => {
  const accepted = types.map(normalizeDataType);
  return [...(items || [])]
    .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
    .find((item) => accepted.includes(normalizeDataType(item.dataType)));
};

const UpdateHealthForm = ({ onSave }) => {
  const [toast, setToast] = useState({ visible: false, title: '', msg: '' });
  const [form, setForm] = useState({
    heartRate: '',
    bloodPressure: '',
    bloodCount: '',
    height: '',
    bloodSugar: '',
    weight: '',
    cholesterol: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let ignore = false;

    const loadCurrentHealthData = async () => {
      try {
        const healthData = await getMyHealthData();
        if (ignore) return;

        const heartRate = latestByType(healthData, 'HeartRate', 'Heart Rate');
        const bloodPressure = latestByType(healthData, 'BloodPressure', 'Blood Pressure');
        const bloodCount = latestByType(healthData, 'BloodCount', 'Blood Count');
        const height = latestByType(healthData, 'Height');
        const bloodSugar = latestByType(healthData, 'BloodSugar', 'Blood Sugar');
        const weight = latestByType(healthData, 'Weight');
        const cholesterol = latestByType(healthData, 'Cholesterol');

        setForm((current) => ({
          ...current,
          heartRate: current.heartRate || coerceHealthMetricSelection('heartRate', heartRate?.value),
          bloodPressure: current.bloodPressure || coerceHealthMetricSelection('bloodPressure', bloodPressure?.value),
          bloodCount: current.bloodCount || coerceHealthMetricSelection('bloodCount', bloodCount?.value),
          height: current.height || height?.value || '',
          bloodSugar: current.bloodSugar || bloodSugar?.value || '',
          weight: current.weight || weight?.value || '',
          cholesterol: current.cholesterol || cholesterol?.value || '',
        }));
      } catch (err) {
        console.error('Loading health data failed', err);
      }
    };

    loadCurrentHealthData();
    return () => { ignore = true; };
  }, []);

  const showToast = (title, msg) => {
    setToast({ visible: true, title, msg });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  };

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.heartRate) e.heartRate = 'Required';
    if (!form.bloodPressure) e.bloodPressure = 'Required';
    if (!form.bloodCount) e.bloodCount = 'Required';
    if (!form.height) e.height = 'Required';
    if (!form.bloodSugar) e.bloodSugar = 'Required';
    if (!form.weight) e.weight = 'Required';
    if (!form.cholesterol) e.cholesterol = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const { addHealthData } = await import('../../../../services/healthService');

      const entries = [
        { dataType: 'HeartRate', value: getHealthMetricStorageValue('heartRate', form.heartRate), unit: 'bpm' },
        { dataType: 'BloodPressure', value: getHealthMetricStorageValue('bloodPressure', form.bloodPressure), unit: 'mmHg' },
        { dataType: 'BloodCount', value: getHealthMetricStorageValue('bloodCount', form.bloodCount), unit: '%' },
        { dataType: 'Height', value: String(form.height), unit: 'cm' },
        { dataType: 'BloodSugar', value: String(form.bloodSugar), unit: 'mg/dL' },
        { dataType: 'Weight', value: String(form.weight), unit: 'kg' },
        { dataType: 'Cholesterol', value: String(form.cholesterol), unit: 'mg/dL' },
      ];

      await Promise.all([
        updateHealthData({
          heartRate: getHealthMetricLabel('heartRate', form.heartRate),
          bloodPressure: getHealthMetricLabel('bloodPressure', form.bloodPressure),
          bloodCount: getHealthMetricLabel('bloodCount', form.bloodCount),
          height: Number(form.height),
          bloodSugar: Number(form.bloodSugar),
          weight: Number(form.weight),
          cholesterol: Number(form.cholesterol),
        }),
        ...entries.map((entry) => addHealthData(entry)),
      ]);

      showToast('Health Data Updated', 'Your health information has been saved successfully.');
      onSave();
    } catch (err) {
      showToast('Save Failed', err?.response?.data?.message || err?.message || 'Please try again.');
    }
  };

  return (
    <section className="overflow-hidden bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm" aria-labelledby="update-health-title">
      <aside aria-live="polite">
        <Toast
          visible={toast.visible}
          title={toast.title}
          message={toast.msg}
          type="success"
          onClose={() => setToast((t) => ({ ...t, visible: false }))}
        />
      </aside>

      <article>
        <header className="flex items-center justify-center mx-8 my-6">
          <h2 id="update-health-title" className="text-[#101828] dark:text-[#E2E8F0] font-bold text-3xl">
            Updating Health Data
          </h2>
        </header>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2">
              <SelectField
                label="Heart Rate"
                icon={<FaHeartPulse />}
                iconLabel="Heart rate"
                value={form.heartRate}
                onChange={(v) => set('heartRate', v)}
                options={HEART_RATE_OPTIONS}
                placeholder="Select your heart rate range"
                required
              />
              {errors.heartRate && (
                <p className="text-[#DC2626] text-xs mt-1">{errors.heartRate}</p>
              )}
            </div>

            <div>
              <NumberField
                label="Height"
                icon={<LuRuler />}
                iconLabel="Height"
                value={form.height}
                onChange={(v) => set('height', v)}
                placeholder="cm"
                unit="cm"
                required
              />
              {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
            </div>

            <div className="sm:col-span-2">
              <SelectField
                label="Blood Pressure"
                icon={<LuDroplet />}
                iconLabel="Blood pressure"
                value={form.bloodPressure}
                onChange={(v) => set('bloodPressure', v)}
                options={BLOOD_PRESSURE_OPTIONS}
                placeholder="Select your blood pressure range"
                required
              />
              {errors.bloodPressure && (
                <p className="text-red-500 text-xs mt-1">{errors.bloodPressure}</p>
              )}
            </div>

            <div>
              <NumberField
                label="Blood Sugar"
                icon={<LuActivity />}
                iconLabel="Blood sugar"
                value={form.bloodSugar}
                onChange={(v) => set('bloodSugar', v)}
                placeholder="mg/dL"
                unit="mg/dL"
                required
              />
              {errors.bloodSugar && (
                <p className="text-red-500 text-xs mt-1">{errors.bloodSugar}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <SelectField
                label="Blood Count"
                icon={<LuActivity />}
                iconLabel="Blood count"
                value={form.bloodCount}
                onChange={(v) => set('bloodCount', v)}
                options={BLOOD_COUNT_OPTIONS}
                placeholder="Select your blood count range"
                required
              />
              {errors.bloodCount && (
                <p className="text-red-500 text-xs mt-1">{errors.bloodCount}</p>
              )}
            </div>

            <div>
              <NumberField
                label="Weight"
                icon={<LuActivity />}
                iconLabel="Weight"
                value={form.weight}
                onChange={(v) => set('weight', v)}
                placeholder="kg"
                unit="kg"
                required
              />
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            </div>

            <div>
              <NumberField
                label="Cholesterol"
                icon={<LuShieldPlus />}
                iconLabel="Cholesterol"
                value={form.cholesterol}
                onChange={(v) => set('cholesterol', v)}
                placeholder="mg/dL"
                unit="mg/dL"
                required
              />
              {errors.cholesterol && (
                <p className="text-red-500 text-xs mt-1">{errors.cholesterol}</p>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button
              onClick={handleSave}
              className="cursor-pointer bg-brand-main hover:bg-blue-700 text-white px-12 py-3 rounded-full font-bold flex items-center gap-2 transition-colors text-sm shadow-md shadow-blue-200 mt-4"
            >
              Save  Changes
            </button>
          </div>
        </div>
      </article>
    </section>
  );
};

export default UpdateHealthForm;
