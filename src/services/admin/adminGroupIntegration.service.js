import { BaseService } from "../../config/basic.service";

export const AdminGroupIntegrationService = {
  // ── GitHub ──────────────────────────────────────────────
  /** GET /api/github/{projectId}/integration */
  getGithubIntegration(projectId) {
    return BaseService.get({ url: `/api/github/${projectId}/integration` });
  },

  /** POST /api/admin/groups/{groupCode}/project/integrations/github
   *  payload: { apiToken, repoOwner, repoName, repoUrl }
   */
  configureGithub(groupCode, payload) {
    return BaseService.post({
      url: `/api/admin/groups/${groupCode}/project/integrations/github`,
      payload,
    });
  },

  /** POST /api/github/{projectId}/sync
   *  payload: { forceFullResync: boolean }
   */
  syncGithub(projectId, forceFullResync = false) {
    return BaseService.post({
      url: `/api/github/${projectId}/sync`,
      payload: { forceFullResync },
    });
  },

  // ── Jira ────────────────────────────────────────────────
  /** GET /api/jira/groups/{groupCode}/integration */
  getJiraIntegration(groupCode) {
    return BaseService.get({ url: `/api/jira/groups/${groupCode}/integration` });
  },

  /** POST /api/jira/groups/{groupCode}/integration
   *  payload: { jiraUrl, jiraEmail, apiToken, projectKey }
   */
  configureJira(groupCode, payload) {
    return BaseService.post({
      url: `/api/jira/groups/${groupCode}/integration`,
      payload,
    });
  },

  /** PUT /api/jira/groups/{groupCode}/integration
   *  payload: { jiraUrl, jiraEmail, apiToken, projectKey }
   */
  updateJira(groupCode, payload) {
    return BaseService.put({
      url: `/api/jira/groups/${groupCode}/integration`,
      payload,
    });
  },

  /** DELETE /api/jira/groups/{groupCode}/integration */
  deleteJira(groupCode) {
    return BaseService.remove({ url: `/api/jira/groups/${groupCode}/integration` });
  },

  /** GET /api/jira/groups/{groupCode}/integration/test */
  testJira(groupCode) {
    return BaseService.get({ url: `/api/jira/groups/${groupCode}/integration/test` });
  },

  /** POST /api/jira/groups/{groupCode}/sync */
  syncJira(groupCode) {
    return BaseService.post({ url: `/api/jira/groups/${groupCode}/sync`, payload: {} });
  },

  /** GET /api/jira/integrations — all jira integrations overview */
  getAllJiraIntegrations() {
    return BaseService.get({ url: `/api/jira/integrations` });
  },
};
