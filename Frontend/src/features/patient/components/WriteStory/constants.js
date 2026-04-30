export const CATEGORIES = ["Lifestyle", "Health", "Challenges", "Recovery"];

export const WRITE_STORY_CSS_VARS = {
  "--ws-muted": "#757575",
  "--ws-danger": "#E7000B",
  "--ws-border": "#E5E7EB",
  "--ws-chip-lifestyle": "#FFA940",
  "--ws-chip-health": "#2B7FFF",
  "--ws-chip-challenges": "#8B5CF6",
  "--ws-chip-recovery": "#10B981",
  "--ws-editor-muted": "#6A7282",
  "--ws-editor-bg": "#F6F7F8",
};

export const chipStyle = (cat, selected) => {
  if (selected) {
    switch (cat) {
      case "Lifestyle":
        return "bg-[var(--ws-chip-lifestyle)] text-white border-[var(--ws-chip-lifestyle)] shadow-sm";
      case "Health":
        return "bg-[var(--ws-chip-health)] text-white border-[var(--ws-chip-health)] shadow-sm";
      case "Challenges":
        return "bg-[var(--ws-chip-challenges)] text-white border-[var(--ws-chip-challenges)] shadow-sm";
      case "Recovery":
        return "bg-[var(--ws-chip-recovery)] text-white border-[var(--ws-chip-recovery)] shadow-sm";
      default:
        return "bg-brand-main text-white border-brand-main";
    }
  }

  return "bg-white text-slate-600 border-gray-200 hover:border-brand-main hover:text-brand-main transition-all duration-200";
};
