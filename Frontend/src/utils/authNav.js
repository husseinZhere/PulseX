import { getStoredUser } from './api';

// Resolve the dashboard route for the currently-stored user (or a passed user).
// Returns null when nobody is logged in.
export const getDashboardPath = (user) => {
  const u = user ?? getStoredUser();
  if (!u) return null;
  const role = u.role ?? u.Role;
  if (role === 0 || role === 'Admin') return '/admin/dashboard';
  if (role === 1 || role === 'Doctor') return '/doctor/dashboard';
  return '/patient/dashboard';
};

export const isLoggedIn = () => Boolean(getStoredUser());

// Where a "Get Started / Start Your Journey" CTA should point: the user's
// dashboard when logged in, otherwise the register page.
export const getStartedPath = () => getDashboardPath() ?? '/register';
