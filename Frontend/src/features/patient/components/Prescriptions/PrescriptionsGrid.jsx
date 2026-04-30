import PrescriptionCard from './PrescriptionCard';

const PrescriptionsGrid = ({ items, visible, onView, onDownload }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-12 text-center text-[#9ca3af] text-[14px] shadow-sm">
        No prescriptions found.
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Prescriptions">
      {items.map((p, idx) => (
        <PrescriptionCard
          key={p.id}
          item={p}
          index={idx}
          visible={visible}
          onView={() => onView(p)}
          onDownload={onDownload}
        />
      ))}
    </section>
  );
};

export default PrescriptionsGrid;
