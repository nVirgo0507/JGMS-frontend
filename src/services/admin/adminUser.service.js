import { BaseService } from "../../config/basic.service";

export const AdminUserService = {
  getAllUsers() {
    return BaseService.get({ url: "/api/admin/users" });
  },

  getUsersByRole(role) {
    return BaseService.get({ url: `/api/admin/users/role/${role}` });
  },

  searchUsers(q, role) {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (role) params.append("role", role);
    return BaseService.get({ url: `/api/admin/users/search?${params.toString()}` });
  },

  getUser(userIdentifier) {
    return BaseService.get({ url: `/api/admin/users/${userIdentifier}` });
  },

  createUser(payload) {
    return BaseService.post({ url: "/api/admin/users", payload });
  },

  updateUser(userIdentifier, payload) {
    return BaseService.put({ url: `/api/admin/users/${userIdentifier}`, payload });
  },

  deleteUser(userIdentifier) {
    return BaseService.remove({ url: `/api/admin/users/${userIdentifier}` });
  },

  setStatus(userIdentifier, status) {
    return BaseService.patch({ url: `/api/admin/users/${userIdentifier}/status`, payload: { status } });
  },

  setGithub(userIdentifier, githubUsername) {
    return BaseService.post({ url: `/api/admin/users/${userIdentifier}/github`, payload: { githubUsername } });
  },

  removeGithub(userIdentifier) {
    return BaseService.remove({ url: `/api/admin/users/${userIdentifier}/github` });
  },

  setJira(userIdentifier, jiraAccountId) {
    return BaseService.post({ url: `/api/admin/users/${userIdentifier}/jira`, payload: { jiraAccountId } });
  },

  removeJira(userIdentifier) {
    return BaseService.remove({ url: `/api/admin/users/${userIdentifier}/jira` });
  },
};
