import axios from "axios";

// Fall back to same-origin "/api" when REACT_APP_BACKEND_URL is not set at build time
// (self-hosted Docker / Nginx builds). Otherwise the URL becomes "undefined/api/..." and every call 404s.
const BACKEND = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/+$/, "");
const API = `${BACKEND}/api`;

export const getToken = () => sessionStorage.getItem("admin_token") || "";
export const setToken = (t) => sessionStorage.setItem("admin_token", t);
export const clearToken = () => sessionStorage.removeItem("admin_token");

const api = axios.create({ baseURL: API });
api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        clearToken();
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export const validateCode = (code) => api.post(`/draw/validate`, { code });
export const spin = (code) => api.post(`/draw/spin`, { code });
export const getMyCodes = () => api.get(`/codes/my?user_id=guest`);
export const getRecentWinners = () => api.get(`/winners/recent`);
export const getPoolStats = () => api.get(`/pool/stats`);
export const claimPrize = (code, account_id) => api.post(`/draw/claim`, { code, account_id });

export const adminLogin = (password) => api.post(`/admin/login`, { password });
export const adminGetClaims = () => api.get(`/admin/claims`);
export const adminPayClaim = (code) => api.post(`/admin/claims/${code}/pay`);
export const adminBatchGen = (amount, count) => api.post(`/admin/codes/batch`, { amount, count });
export const adminGetCodes = (status, amount) => {
  const p = new URLSearchParams();
  if (status) p.set("status", status);
  if (amount) p.set("amount", amount);
  return api.get(`/admin/codes?${p.toString()}`);
};
export const adminGetStats = () => api.get(`/admin/stats`);
export const adminGetSettings = () => api.get(`/admin/settings`);
export const adminUpdateSettings = (data) => api.post(`/admin/settings`, data);

const downloadCsv = async (path, filename) => {
  const r = await api.get(path, { responseType: "blob" });
  const url = URL.createObjectURL(r.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportCodes = (status, amount) => {
  const p = new URLSearchParams();
  if (status) p.set("status", status);
  if (amount) p.set("amount", amount);
  return downloadCsv(`/admin/export/codes?${p.toString()}`, "codes.csv");
};
export const exportClaims = (status) => {
  const p = new URLSearchParams();
  if (status) p.set("status", status);
  return downloadCsv(`/admin/export/claims?${p.toString()}`, "claims.csv");
};
