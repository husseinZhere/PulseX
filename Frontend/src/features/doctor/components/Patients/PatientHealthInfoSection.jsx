import {
    HiOutlineEnvelope,
    HiOutlineIdentification,
    HiOutlineMapPin,
    HiOutlinePhone,
} from 'react-icons/hi2';
import { LuActivity, LuDroplets, LuHeartPulse, LuRuler, LuScale } from 'react-icons/lu';

const formatDate = (value) => {
    if (!value) return 'Not set';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Not set';
    return parsed.toLocaleDateString('en-GB');
};

const formatValue = (value, unit = '') => {
    if (value === null || value === undefined || value === '') return 'Not set';
    return unit ? `${value} ${unit}` : `${value}`;
};

const InfoItem = ({ icon, label, value }) => (
    <div className="rounded-xl border border-[#E2E8F0] dark:border-gray-700 bg-[#F8FAFC] dark:bg-[#1E293B] p-3">
        <p className="mb-1 flex items-center gap-1.5 text-[12px] text-[#64748B] dark:text-gray-400">
            {icon}
            {label}
        </p>
        <p className="text-[14px] font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{value || 'Not set'}</p>
    </div>
);

const HealthCard = ({ icon, label, value }) => (
    <article className="rounded-xl border border-[#E2E8F0] dark:border-gray-700 bg-[#F8FAFC] dark:bg-[#1E293B] p-3">
        <p className="mb-1 flex items-center gap-1.5 text-[12px] text-[#64748B] dark:text-gray-400">
            {icon}
            {label}
        </p>
        <p className="text-[14px] font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{value}</p>
    </article>
);

const PatientHealthInfoSection = ({ patient }) => {
    const healthInfo = patient.healthInfo || null;
    const hasHealthInfo = Boolean(
        healthInfo && (
            healthInfo.height ||
            healthInfo.weight ||
            healthInfo.bloodPressure ||
            healthInfo.bloodSugar ||
            healthInfo.cholesterol ||
            healthInfo.bloodCount ||
            healthInfo.heartRate
        )
    );

    return (
        <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Patient extended details">
            <article className="rounded-2xl border border-[#E2E8F0] dark:border-gray-700 bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none" aria-labelledby="patient-profile-details-title">
                <h2 id="patient-profile-details-title" className="text-[20px] font-bold text-[#0F172A] dark:text-[#E2E8F0]">
                    Patient Profile Details
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoItem icon={<HiOutlineEnvelope />} label="Email" value={patient.email} />
                    <InfoItem icon={<HiOutlinePhone />} label="Phone" value={patient.phoneNumber} />
                    <InfoItem icon={<HiOutlineMapPin />} label="Location" value={patient.location} />
                    <InfoItem icon={<HiOutlineIdentification />} label="Date of Birth" value={formatDate(patient.dateOfBirth)} />
                    <InfoItem icon={<HiOutlineIdentification />} label="Risk Last Updated" value={formatDate(patient.riskAssessedAt)} />
                </div>

                {patient.about ? (
                    <div className="mt-4 rounded-xl border border-[#E2E8F0] dark:border-gray-700 bg-[#F8FAFC] dark:bg-[#1E293B] p-3">
                        <p className="mb-1 text-[12px] text-[#64748B] dark:text-gray-400">About</p>
                        <p className="text-[14px] leading-relaxed text-[#0F172A] dark:text-[#E2E8F0]">{patient.about}</p>
                    </div>
                ) : null}
            </article>

            <article className="rounded-2xl border border-[#E2E8F0] dark:border-gray-700 bg-white dark:bg-[#111827] p-5 shadow-sm dark:shadow-none" aria-labelledby="patient-health-info-title">
                <h2 id="patient-health-info-title" className="text-[20px] font-bold text-[#0F172A] dark:text-[#E2E8F0]">
                    Health Information
                </h2>

                {!hasHealthInfo ? (
                    <div className="mt-4 rounded-xl border border-dashed border-[#CBD5E1] dark:border-gray-600 bg-[#F8FAFC] dark:bg-[#1E293B] p-5 text-[14px] text-[#64748B] dark:text-gray-400">
                        This patient has not submitted health information from settings yet.
                    </div>
                ) : (
                    <>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <HealthCard icon={<LuRuler />} label="Height" value={formatValue(healthInfo.height, 'cm')} />
                            <HealthCard icon={<LuScale />} label="Weight" value={formatValue(healthInfo.weight, 'kg')} />
                            <HealthCard icon={<LuActivity />} label="Blood Pressure" value={formatValue(healthInfo.bloodPressure)} />
                            <HealthCard icon={<LuDroplets />} label="Blood Sugar" value={formatValue(healthInfo.bloodSugar, 'mg/dL')} />
                            <HealthCard icon={<LuActivity />} label="Cholesterol" value={formatValue(healthInfo.cholesterol, 'mg/dL')} />
                            <HealthCard icon={<LuActivity />} label="Blood Count" value={formatValue(healthInfo.bloodCount)} />
                            <HealthCard icon={<LuHeartPulse />} label="Heart Rate" value={formatValue(healthInfo.heartRate)} />
                        </div>
                        <p className="mt-3 text-[12px] text-[#64748B] dark:text-gray-400">
                            Last updated: {formatDate(healthInfo.lastUpdated)}
                        </p>
                    </>
                )}
            </article>
        </section>
    );
};

export default PatientHealthInfoSection;
