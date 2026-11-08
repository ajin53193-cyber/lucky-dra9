import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const validateCode = (code) => axios.post(`${API}/draw/validate`, { code });
export const spin = (code) => axios.post(`${API}/draw/spin`, { code });
export const getMyCodes = () => axios.get(`${API}/codes/my?user_id=guest`);
export const getMyCoupons = () => axios.get(`${API}/coupons/my?user_id=guest`);
export const getRecentWinners = () => axios.get(`${API}/winners/recent`);
export const getPoolStats = () => axios.get(`${API}/pool/stats`);
export const getInviteInfo = () => axios.get(`${API}/invite/info?user_id=guest`);
export const getLeaderboard = () => axios.get(`${API}/invite/leaderboard`);
export const redeemCoupon = (coupon_code, address, network) => axios.post(`${API}/coupons/redeem`, { coupon_code, address, network });
