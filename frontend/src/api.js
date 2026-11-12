import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const validateCode = (code) => axios.post(`${API}/draw/validate`, { code });
export const spin = (code) => axios.post(`${API}/draw/spin`, { code });
export const getMyCodes = () => axios.get(`${API}/codes/my?user_id=guest`);
export const getRecentWinners = () => axios.get(`${API}/winners/recent`);
export const getPoolStats = () => axios.get(`${API}/pool/stats`);
export const claimPrize = (code, account_id) => axios.post(`${API}/draw/claim`, { code, account_id });
export const adminGetClaims = () => axios.get(`${API}/admin/claims`);
export const adminPayClaim = (code) => axios.post(`${API}/admin/claims/${code}/pay`);
export const adminBatchGen = (amount, count) => axios.post(`${API}/admin/codes/batch`, { amount, count });
export const adminGetCodes = () => axios.get(`${API}/admin/codes`);
