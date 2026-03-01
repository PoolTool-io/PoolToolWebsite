/**
 * Central API client for the PoolTool 2026 backend.
 * Replaces all Firebase RTDB reads and api.pooltool.io REST calls.
 */
import axios from "axios";

function resolveApiBase() {
  if (process.env.VUE_APP_API_URL) return process.env.VUE_APP_API_URL;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3004`;
  }
  return "http://localhost:3004";
}
const API_BASE = resolveApiBase();

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

export function getPoolHistory(poolId) {
  return api.get(`/api/pool/${poolId}/history`);
}

export function getPoolBlocks(poolId, epoch) {
  return api.get(`/api/pool/${poolId}/blocks/${epoch}`);
}

export function getPoolAwards(poolId) {
  return api.get(`/api/pool/${poolId}/awards`);
}

// ── Blocks ────────────────────────────────────────────

export function getBlocks(epoch) {
  return api.get(`/api/blocks/${epoch}`);
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

// ── Rewards ───────────────────────────────────────────

export function getStakeHist(address) {
  return api.get(`/api/stake_hist/${address}`);
}

export function pivotRewards(stakeKey, startEpoch, endEpoch) {
  return api.post("/api/pivotrewards", {
    stake_key: stakeKey,
    start_epoch: startEpoch,
    end_epoch: endEpoch,
  });
}

// ── Health ────────────────────────────────────────────

export function getHealth() {
  return api.get("/health");
}

export default api;
