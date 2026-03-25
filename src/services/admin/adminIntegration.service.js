import { BaseService } from "../../config/basic.service";

export const AdminIntegrationService = {
  getIntegrations() {
    return BaseService.get({ url: "/api/admin/integrations" });
  },

  testIntegration(integrationType) {
    return BaseService.post({
      url: `/api/admin/integrations/test?integrationType=${integrationType}`,
      payload: {},
    });
  },
};
