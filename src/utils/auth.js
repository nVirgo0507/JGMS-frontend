import { LOCAL_STORAGE, ROLE } from "../consts/const";
import { ROUTER_URL } from "../consts/router.const";

export const normalizeRole = (rawRole) => {
  if (!rawRole) return null;
  const value = String(rawRole).trim().toUpperCase();
  const cleaned = value.replace(/\s+/g, "_");

  if (cleaned === "ADMIN") return ROLE.ADMIN;
  if (cleaned === "LECTURER") return ROLE.LECTURER;
  if (cleaned === "TEAM_LEADER" || cleaned === "LEADER") return ROLE.TEAM_LEADER;
  if (
    cleaned === "TEAM_MEMBER" ||
    cleaned === "MEMBER" ||
    cleaned === "STUDENT"
  )
    return ROLE.TEAM_MEMBER;

  return cleaned;
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE.AUTH_USER);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore malformed data and fall back to other keys.
  }

  try {
    const rawAdmin = localStorage.getItem(LOCAL_STORAGE.ACCOUNT_ADMIN);
    if (rawAdmin) {
      const adminUser = JSON.parse(rawAdmin);
      if (!adminUser?.role && !adminUser?.userRole) {
        return { ...adminUser, role: ROLE.ADMIN };
      }
      return adminUser;
    }
  } catch {
    return null;
  }

  return null;
};

export const clearStoredUser = () => {
  localStorage.removeItem(LOCAL_STORAGE.AUTH_USER);
  localStorage.removeItem(LOCAL_STORAGE.ACCOUNT_ADMIN);
};

export const getUserRole = (user) => {
  if (!user) return null;
  const rawRole =
    user.role ||
    user.userRole ||
    user?.account?.role ||
    user?.account?.userRole;
  return normalizeRole(rawRole);
};

export const getDashboardPathByRole = (role) => {
  switch (normalizeRole(role)) {
    case ROLE.ADMIN:
      return ROUTER_URL.ADMIN.DASHBOARD;
    case ROLE.LECTURER:
      return ROUTER_URL.LECTURER.DASHBOARD;
    case ROLE.TEAM_LEADER:
      return ROUTER_URL.TEAM_LEADER.DASHBOARD;
    case ROLE.TEAM_MEMBER:
      return ROUTER_URL.TEAM_MEMBER.DASHBOARD;
    default:
      return ROUTER_URL.COMMON.LOGIN;
  }
};
