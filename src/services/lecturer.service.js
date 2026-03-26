import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const LecturerService = {
  getProfile() {
    return BaseService.get({
      url: API.LECTURER.PROFILE,
      isLoading: true,
    });
  },

  getGroups(options = {}) {
    return BaseService.get({
      url: API.LECTURER.GROUPS,
      isLoading: options.isLoading ?? true,
    });
  },

  getGroupDetails(groupCode) {
    return BaseService.get({
      url: `${API.LECTURER.GROUPS}/${groupCode}`,
      isLoading: true,
    });
  },

  getGroupMembers(groupCode) {
    return BaseService.get({
      url: `${API.LECTURER.GROUPS}/${groupCode}/members`,
      isLoading: true,
    });
  },

  getGroupRequirements(groupCode) {
    return BaseService.get({
      url: `${API.LECTURER.GROUPS}/${groupCode}/requirements`,
      isLoading: true,
    });
  },

  getGroupTasks(groupCode) {
    return BaseService.get({
      url: `${API.LECTURER.GROUPS}/${groupCode}/tasks`,
      isLoading: true,
    });
  },

  getGroupProgressReports(groupCode) {
    return BaseService.get({
      url: `${API.LECTURER.GROUPS}/${groupCode}/progress-reports`,
      isLoading: true,
    });
  },

  exportProgressReport(groupCode, reportId) {
    return BaseService.get({
      url: `${API.LECTURER.GROUPS}/${groupCode}/progress-reports/${reportId}/export`,
      isLoading: true,
      responseType: "blob", // Assuming export is a file
    });
  },

  getCommitStatistics(groupCode) {
    return BaseService.get({
      url: `${API.LECTURER.GROUPS}/${groupCode}/commit-statistics`,
      isLoading: true,
    });
  },
};
