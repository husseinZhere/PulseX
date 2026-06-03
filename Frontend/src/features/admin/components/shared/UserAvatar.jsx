import { useState } from 'react';

// Deterministic gradient per name so each user keeps a consistent colour —
// Facebook/Instagram-style initials avatar when no photo is uploaded.
const GRADIENTS = [
  'from-[#6366F1] to-[#8B5CF6]',
  'from-[#0EA5E9] to-[#2563EB]',
  'from-[#F43F5E] to-[#EC4899]',
  'from-[#10B981] to-[#059669]',
  'from-[#F59E0B] to-[#F97316]',
  'from-[#14B8A6] to-[#0891B2]',
];

const getInitials = (name = '') => {
  const clean = String(name).replace(/^dr\.?\s/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const pickGradient = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
};

const UserAvatar = ({ src, name, size = 36, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const dim = { width: size, height: size };
  const showImg = src && !failed;

  if (showImg) {
    return (
      <img
        src={src}
        alt={name || 'User'}
        style={dim}
        onError={() => setFailed(true)}
        className={`rounded-full object-cover shrink-0 border border-gray-100 dark:border-gray-800 ${className}`}
      />
    );
  }

  return (
    <div
      style={{ ...dim, fontSize: Math.round(size * 0.4) }}
      className={`rounded-full shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br ${pickGradient(name || '')} ${className}`}
      aria-label={name || 'User'}
    >
      {getInitials(name)}
    </div>
  );
};

export default UserAvatar;
