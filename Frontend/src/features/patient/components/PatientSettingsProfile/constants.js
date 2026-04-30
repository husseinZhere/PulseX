export function checkReqs(val) {
  return {
    length: val.length >= 8,
    mixed: /[a-z]/.test(val) && /[A-Z]/.test(val),
    number: /\d/.test(val),
  };
}

const FALLBACK_STORY_IMAGE =
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=300&q=80";

export const MOCK_STORIES = [
  {
    id: 1,
    title: "Nutrition Changes That Transformed My Health",
    tags: ["Lifestyle", "Health"],
    excerpt:
      "When I first joined PulseX six months ago, I was struggling with chronic fatigue..",
    date: "March 12, 2024",
    views: 1247,
    likes: 132,
    comments: 89,
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    title: "How Exercise Became My Medicine",
    tags: ["Fitness", "Recovery"],
    excerpt:
      "Three months ago, I could barely walk up a flight of stairs without getting winded...",
    date: "March 5, 2024",
    views: 892,
    likes: 76,
    comments: 42,
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=300&q=80",
  },
];

export function getInitialFormFromPatient(patient) {
  const fullName = (patient?.name ?? "").trim();
  const [firstName = "", ...restName] = fullName.split(" ");
  return {
    firstName,
    lastName: restName.join(" "),
    email: patient?.email ?? "",
    phone: patient?.phone ?? "",
    dob: patient?.dateOfBirth ?? "",
    location: patient?.location ?? patient?.address ?? "",
    gender: patient?.gender ?? "",
  };
}

export function getPatientStories(patient) {
  if (!Array.isArray(patient?.stories)) return [];

  return patient.stories.map((story, index) => ({
    id: story?.id ?? story?.storyId ?? index + 1,
    title: story?.title ?? "Untitled Story",
    tags: Array.isArray(story?.tags) ? story.tags : [],
    excerpt: story?.excerpt ?? story?.description ?? "",
    date: story?.date ?? story?.publishedAt ?? "",
    views: Number(story?.views ?? story?.viewCount ?? 0),
    likes: Number(story?.likes ?? story?.likeCount ?? 0),
    comments: Number(story?.comments ?? story?.commentCount ?? 0),
    image:
      story?.image ??
      story?.coverImage ??
      story?.thumbnail ??
      FALLBACK_STORY_IMAGE,
  }));
}

export function getStoriesWithFallback(patient) {
  return getPatientStories(patient);
}

export function formatWithUnit(value, unit) {
  if (value === null || value === undefined || value === "") return "--";
  return unit ? `${value} ${unit}` : `${value}`;
}
