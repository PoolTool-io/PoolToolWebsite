/**
 * Central API client for the PoolTool 2026 backend.
 * REST and WebSocket contracts follow docs/FRONTEND_API_SPEC.md.
 * Set VUE_APP_API_URL at build time for production (e.g. https://api.pooltool.io).
 * If unset, uses same host as the page on port 3004.
 */
import axios from "axios";

function getApiBase() {
  if (process.env.VUE_APP_API_URL) return process.env.VUE_APP_API_URL;
  if (typeof window !== "undefined")
    return `http://${window.location.hostname}:3004`;
  return "http://localhost:3004";
}

const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

export function updateUserSettings(userId, settings, favorites, extra) {
  const body = { settings, favorites };
  if (extra) Object.assign(body, extra);
  return api.put(`/api/user/${userId}/settings`, body);
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

export function getStakeHistMeta(address) {
  return api.get(`/api/stake_hist_meta/${address}`);
}

export function pivotRewards(stakeKeys) {
  const keys = Array.isArray(stakeKeys) ? stakeKeys : [stakeKeys];
  return api.post("/api/pivotrewards", { stake_keys: keys.slice(0, 5) });
}

/**
 * Fetch raw stake history JSON directly from S3 and compute pivot client-side.
 * Returns { data: { "epoch": { ...pivotFields }, ... } } to match old getStakeHist shape.
 */
export async function fetchStakeHistFromS3(s3Url) {
  const resp = await fetch(s3Url);
  if (!resp.ok) return { data: {} };
  const raw = await resp.json();
  return { data: computePivot(raw) };
}

/**
 * Fetch raw stake history from S3 and return ONLY the entry for the given epoch.
 * Much lighter than fetching + pivoting the full history.
 */
export async function fetchStakeHistEpoch(s3Url, epoch) {
  const resp = await fetch(s3Url);
  if (!resp.ok) return null;
  const raw = await resp.json();
  const entry = raw[String(epoch)];
  if (!entry) return null;
  return {
    amount: entry.amount || 0,
    delegatedTo: entry.delegated_to_pool || "None",
    delegatedToTicker: entry.delegated_to_ticker || null,
    operatorRewards: entry.operator_rewards || 0,
    stakeRewards: entry.stake_rewards || 0,
    pending: entry.pending != null ? entry.pending : (entry.forecast || false),
    rewardsSentTo: entry.rewards_sent_to || null,
    rewardAddrDetails: entry.reward_address_details || {},
  };
}

function computePivot(raw) {
  const epochs = Object.keys(raw)
    .filter((k) => /^\d+$/.test(k))
    .map(Number)
    .sort((a, b) => a - b);

  let lifeAmount = 0;
  let lifeOp = 0;
  let lifeStake = 0;
  let epochsStaked = 0;
  const result = {};

  for (const ep of epochs) {
    const r = raw[String(ep)];
    const amount = r.amount || 0;
    const opRew = r.operator_rewards || 0;
    const stRew = r.stake_rewards || 0;
    lifeAmount += amount;
    lifeOp += opRew;
    lifeStake += stRew;
    if (amount > 0) epochsStaked++;

    result[String(ep)] = {
      delegatedTo: r.delegated_to_pool || "None",
      delegatedToTicker: r.delegated_to_ticker || null,
      amount: amount,
      forecast: r.forecast || false,
      pending: r.pending != null ? r.pending : (r.forecast || false),
      lifeAmount: lifeAmount,
      lifeOperatorRewards: lifeOp,
      lifeStakeRewards: lifeStake,
      operatorRewards: opRew,
      stakeRewards: stRew,
      rewardsSentTo: r.rewards_sent_to || null,
      rewardAddrDetails: r.reward_address_details || {},
      epochsStaked: epochsStaked,
    };
  }
  return result;
}

// ── ROS Histograms ───────────────────────────────────

export function getRosHistogram(type, epoch) {
  const params = { type };
  if (epoch != null) params.epoch = epoch;
  return api.get("/api/ros_histogram", { params });
}

// ── Health ────────────────────────────────────────────

export function getHealth() {
  return api.get("/health");
}

export default api;
