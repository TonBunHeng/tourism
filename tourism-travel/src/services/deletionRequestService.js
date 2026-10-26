import api from "./api";

export const deletionRequestService = {
  async getDeletionRequests(params = {}) {
    return await api.get("/deletion-requests", { params });
  },

  async createDeletionRequest(data) {
    const payload = {
      request_type: data.request_type || "account",
      reason: data.reason,
      email: data.email,
      additional_info: data.additional_info || (data.email ? "Account email: " + data.email : null),
      items: data.items || [],
      ...data,
    };
    return await api.post("/deletion-requests", payload);
  },
};

export default deletionRequestService;
