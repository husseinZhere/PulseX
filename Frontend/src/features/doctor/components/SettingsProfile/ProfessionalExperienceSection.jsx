import { LuBriefcaseBusiness, LuGraduationCap, LuTrash2 } from 'react-icons/lu';
import { HiOutlineCheck, HiOutlinePlus } from 'react-icons/hi2';

const ExperienceCard = ({ item, index, onChange, onDelete }) => {
  const icon = item.type === 'work' ? <LuBriefcaseBusiness className="text-[14px] text-[#2563EB]" /> : <LuGraduationCap className="text-[14px] text-[#9333EA]" />;

  return (
    <article className="rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827]">{icon}</span>
        <button
          type="button"
          onClick={onDelete}
          className="cursor-pointer text-[#EF4444] transition-colors hover:text-[#DC2626]"
          aria-label={`Delete experience ${index + 1}`}
        >
          <LuTrash2 className="text-[13px]" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[14px] font-bold text-[#4a5565]">Type</span>
          <input
            type="text"
            value={item.typeLabel}
            onChange={(event) => onChange('typeLabel', event.target.value)}
            className="h-11 w-full rounded-[10px] border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827] px-3 text-[14px] lg:text-[16px] text-[#111827] dark:text-gray-100 outline-none text-[#111827] dark:text-gray-100 focus:border-[#333CF5]"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[14px] font-bold text-[#4a5565]">Institution</span>
          <input
            type="text"
            value={item.institution}
            onChange={(event) => onChange('institution', event.target.value)}
            className="h-11 w-full rounded-[10px] border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827] px-3 text-[14px] lg:text-[16px] text-[#111827] dark:text-gray-100 outline-none text-[#111827] dark:text-gray-100 focus:border-[#333CF5]"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-[14px] font-bold text-[#4a5565]">Title/Position</span>
          <input
            type="text"
            value={item.position}
            onChange={(event) => onChange('position', event.target.value)}
            className="h-11 w-full rounded-[10px] border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827] px-3 text-[14px] lg:text-[16px] text-[#111827] dark:text-gray-100 outline-none text-[#111827] dark:text-gray-100 focus:border-[#333CF5]"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[14px] font-bold text-[#4a5565]">Start Date</span>
          <input
            type="text"
            value={item.startDate}
            onChange={(event) => onChange('startDate', event.target.value)}
            className="h-11 w-full rounded-[10px] border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827] px-3 text-[14px] lg:text-[16px] text-[#111827] dark:text-gray-100 outline-none text-[#111827] dark:text-gray-100 focus:border-[#333CF5]"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[14px] font-bold text-[#4a5565]">End Date</span>
          <input
            type="text"
            value={item.endDate}
            onChange={(event) => onChange('endDate', event.target.value)}
            className="h-11 w-full rounded-[10px] border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827] px-3 text-[14px] lg:text-[16px] text-[#111827] dark:text-gray-100 outline-none text-[#111827] dark:text-gray-100 focus:border-[#333CF5]"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-[14px] font-bold text-[#4a5565]">Description</span>
          <textarea
            rows={3}
            value={item.description}
            onChange={(event) => onChange('description', event.target.value)}
            placeholder="Describe your role and responsibilities..."
            className="w-full rounded-[10px] border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827] px-3 py-2 text-[14px] lg:text-[16px] text-[#111827] dark:text-gray-100 outline-none text-[#111827] dark:text-gray-100 focus:border-[#333CF5]"
          />
        </label>
      </div>
    </article>
  );
};

const ProfessionalExperienceSection = ({ experiences, onAdd, onChange, onDeleteRequest, onSave }) => {
  return (
    <section className="overflow-hidden rounded-[16px] border border-[#E5E7EB] dark:border-gray-700 bg-white dark:bg-[#111827]" aria-labelledby="doctor-exp-title">
      <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] dark:border-gray-700 bg-gradient-to-r from-[#eef2ff] to-[#eff6ff] dark:from-[#0B1120] dark:to-[#111827] px-6 py-4">
        <div className="flex items-center gap-2">
          <LuBriefcaseBusiness className="text-[20px] text-[#2563EB]" />
          <h2 id="doctor-exp-title" className="text-[18px] font-bold text-[#101828] dark:text-[#E2E8F0]">Professional Experience</h2>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="cursor-pointer inline-flex h-10 items-center justify-center gap-2 rounded-[24px] bg-[#4f39f6] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#3d2ccd]"
        >
          <HiOutlinePlus className="text-[16px]" /> Add Experience
        </button>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        {experiences.map((item, index) => (
          <ExperienceCard
            key={item.id}
            item={item}
            index={index}
            onChange={(field, value) => onChange(item.id, field, value)}
            onDelete={() => onDeleteRequest(item.id)}
          />
        ))}

        <div className="pt-6 flex justify-end">
          <button
            type="button"
            onClick={onSave}
            className="cursor-pointer inline-flex h-12 w-full sm:w-[200px] items-center justify-center gap-2 rounded-[24px] bg-[#333CF5] text-[16px] font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#2C34D8]"
          >
            <HiOutlineCheck className="text-[18px]" /> Save Experience
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalExperienceSection;
