import { BaseService } from "../../config/basic.service";

export const AdminProjectService = {
  getAllProjects() {
    return BaseService.get({ url: "/api/admin/projects" });
  },

  getProjectForGroup(groupCode) {
    return BaseService.get({ url: `/api/admin/groups/${groupCode}/project` });
  },

  createProject(groupCode, payload) {
    return BaseService.post({ url: `/api/admin/groups/${groupCode}/project`, payload });
  },

  updateProject(groupCode, payload) {
    return BaseService.put({ url: `/api/admin/groups/${groupCode}/project`, payload });
  },

  linkGithub(groupCode, payload) {
    return BaseService.post({
      url: `/api/admin/groups/${groupCode}/project/integrations/github`,
      payload,
    });
  },
};
