/**
 * Central API client for the PoolTool 2026 backend.
 * REST and WebSocket contracts follow docs/FRONTEND_API_SPEC.md.
 * API host is hardcoded to 34.209.51.89:3004.
 */
import axios from "axios";

const API_HOST = "34.209.51.89:3004";
const API_BASE = `http://${API_HOST}`;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Auth ──────────────────────────────────────────────

export function login(stakeKey, password) {
  return api.post("/auth/login", { stake_key: stakeKey, password });
}

export function register(stakeKey, password) {
  return api.post("/auth/register", { stake_key: stakeKey, password });
}

export function startVerification(stakeKey, userId, password) {
  return api.post("/auth/verify", {
    stake_key: stakeKey,
    user_id: userId,
    password,
  });
}

export function checkVerification(stakeKey) {
  return api.get(`/auth/verify/${stakeKey}`);
}

export function resetPassword(stakeKey, newPassword) {
  return api.post("/auth/reset_password", {
    stake_key: stakeKey,
    new_password: newPassword,
  });
}

export function checkReset(stakeKey) {
  return api.get(`/auth/check_reset/${stakeKey}`);
}

export function queryAddress(stakeKey) {
  return api.post("/auth/queryaddress", { stake_key: stakeKey });
}

// ── User ──────────────────────────────────────────────

export function getUser(userId) {
  return api.get(`/api/user/${userId}`);
}

export function updateUserSettings(userId, settings, favorites) {
  return api.put(`/api/user/${userId}/settings`, { settings, favorites });
}

export function addFavorite(userId, poolId) {
  return api.post(`/api/user/${userId}/favorites`, { pool_id: poolId });
}

export function removeFavorite(userId, poolId) {
  return api.delete(`/api/user/${userId}/favorites/${poolId}`);
}

// ── Pools ─────────────────────────────────────────────

export function getPools() {
  return api.get("/api/pools");
}

export function getPool(poolId) {
  return api.get(`/api/pool/${poolId}`);
}

export function getPoolHistory(poolId, limit = 30) {
  return api.get(`/api/pool/${poolId}/history`, { params: limit != null ? { limit } : {} });
}

export function getPoolBlocks(poolId, epoch) {
  return api.get(`/api/pool/${poolId}/blocks/${epoch}`);
}

export function getPoolAwards(poolId) {
  return api.get(`/api/pool/${poolId}/awards`);
}

// ── Blocks ────────────────────────────────────────────

export function getBlocks(epoch, limit) {
  const params = limit != null ? { limit } : {};
  return api.get(`/api/blocks/${epoch}`, { params });
}

export function searchBlocksByHeight(epoch, blockHeight) {
  return api.get(`/api/blocks/${epoch}`, { params: { block_height: blockHeight } });
}

export function getRecentBlock() {
  return api.get("/api/recent_block");
}

// ── Epoch / Protocol ──────────────────────────────────

export function getEpoch(epoch) {
  return api.get(`/api/epoch/${epoch}`);
}

export function getEpochParams(epoch) {
  return api.get(`/api/epoch_params/${epoch}`);
}

export function getActiveStake(epoch) {
  return api.get(`/api/active_stake/${epoch}`);
}

export function getExchangeRates() {
  return api.get("/api/epoch_exchange_rates");
}

// ── Ecosystem ─────────────────────────────────────────

export function getEcosystem() {
  return api.get("/api/ecosystem");
}

export function getSyncData() {
  return api.get("/api/syncdata");
}

export function getHeights() {
  return api.get("/api/heights");
}

export function getTickers2026() {
  return api.get("/api/tickers2026");
}

// ── Translations / i18n (§2.7) ─────────────────────────

export function getTranslations() {
  return api.get("/api/translations");
}

export function getTranslationsLocale(locale) {
  return api.get(`/api/translations/${locale}`);
}

export function getLanguages() {
  return api.get("/api/languages");
}

// ── Rewards / stake ───────────────────────────────────
// pivotRewards: max 5 keys per spec §2.5

export function getStakeHist(address) {
  return api.get(`/api/stake_hist/${address}`);
}

export function pivotRewards(stakeKeys) {
  const keys = Array.isArray(stakeKeys) ? stakeKeys : [stakeKeys];
  return api.post("/api/pivotrewards", { stake_keys: keys.slice(0, 5) });
}

// ── Health ────────────────────────────────────────────

export function getHealth() {
  return api.get("/health");
}

export default api;
