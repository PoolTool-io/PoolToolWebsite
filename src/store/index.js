import Vue from "vue";
import Vuex from "vuex";
import { preference } from "vue-preferences";
import { wsClient } from "@/services/ws";
import {
  getPools,
  getPool,
  getEcosystem,
  getSyncData,
  getHeights,
  getRecentBlock,
  getEpochParams,
  getEpoch,
  getActiveStake,
  getUser,
} from "@/services/api";

Vue.use(Vuex);

const network_raw = preference("network", { defaultValue: "Mainnet" });

function convertPool(a, state) {
  // Spec §4: descriptive keys only (no compressed keys).
  const b = {
    pool_id: a.pool_id ?? "",
    ticker: a.ticker ?? "",
    pool_name: a.pool_name ?? "",
    group_name: (a.group_name != null ? a.group_name : "").trim(),
    live_stake: a.live_stake ?? 0,
    online_relays: a.online_relays != null ? a.online_relays : 0,
    offline_relays: a.offline_relays != null ? a.offline_relays : 0,
    saturation: a.saturation ?? 0,
    cost: a.cost ?? 0,
    future_cost: a.future_cost ?? null,
    margin: a.margin != null ? a.margin : 0,
    future_margin: a.future_margin != null ? a.future_margin : 0,
    pledge: a.pledge ?? 0,
    future_pledge: a.future_pledge ?? null,
    pool_pledge_value: a.pool_pledge_value ?? 0,
    itn_verified: a.itn_verified,
    epoch_blocks: a.epoch_blocks ?? 0,
    epoch_blocks_epoch: a.epoch_blocks_epoch ?? null,
    life_blocks: a.life_blocks ?? 0,
    genesis: a.genesis,
    retired: a.retired,
    assigned_slots: a.assigned_slots ?? 0,
    assigned_slots_epoch: a.assigned_slots_epoch ?? null,
    imposter: a.imposter,
    lifetime_per_blocks: a.lifetime_per_blocks ?? 0,
    lifetime_per_slots: a.lifetime_per_slots ?? 0,
    lifetime_ros: a.lifetime_ros ?? 0,
    one_month_ros: a.one_month_ros ?? 0,
    two_month_ros: a.two_month_ros ?? 0,
  };
  if (
    b.lifetime_per_blocks > 0 &&
    b.lifetime_per_slots > 0 &&
    b.assigned_slots_epoch >= (state.sync_data.currentepoch || 0) - 1
  ) {
    b.lifetime_performance = b.lifetime_per_blocks / b.lifetime_per_slots;
  } else {
    b.lifetime_performance = null;
  }
  return b;
}

export const store = new Vuex.Store({
  state: {
    promotions: {},
    singlepoolssub: {},
    retiredPoolsSubscribed: false,
    poolsSubscribed: false,
    now: Date.now(),
    intervalTimer: null,
    display_user: {},
    langs_raw: {},
    quietEpoch: {},
    poolsdata: [],
    network: network_raw.get(),
    active_stake: 0,
    total_utxo: 0,
    sync_data: {
      countplatform: [],
      countversion: [],
      currentepoch: 251,
      currentslot: 271083,
      distribution: {},
      histogram: "[[], []]",
      histogramhash: "",
      histogramheight: 0,
      majoritymax: 0,
      max: 0,
      min: 0,
      reportingstatus: {},
      lasthash: 0,
      lasthashparent: 0,
    },
    isSignedIn: false,
    most_recent_block: {
      block: 0,
      epoch: null,
      fees: 0,
      hash: "",
      leaderPoolId: "",
      leaderPoolName: "",
      leaderPoolTicker: "",
      output: 0,
      size: 0,
      slot: 0,
      time: 0,
      transactions: 0,
    },
    ecosystem: {
      activePools: 0,
      averageFixedFee: 0,
      averagePledge: 0,
      averageVariableFee: 0,
      decentralizationLevel: 0,
      delegators: 0,
      desiredPoolNumber: 500,
      offlineRelays: 0,
      onlineRelays: 0,
      saturatedPools: 0,
      saturationLevel: 0,
      totalHonoredPledge: 0,
      totalStaked: 0,
      totalStakedFormatted: "",
      treasury: 0,
    },
    epoch_data: {
      blocks: "0",
      epoch: 0,
      fees: 0,
      lastBlockTime: 0,
      progress: 0,
      progressMessage: "",
      totalOutput: 0,
      transactions: 0,
    },
    livedata: {
      decentralisation: 0,
      influence: 0.3,
      keyDeposit: 2000000,
      maxBhSize: 1100,
      maxBlockSize: 65536,
      maxEpoch: 18,
      maxTxSize: 16384,
      minFeeA: 44,
      minFeeB: 155381,
      minPoolCost: 340000000,
      minUtxoValue: 1000000,
      monetaryExpandRate: 0.003,
      optimalPoolCount: 500,
      poolDeposit: 500000000,
      protocolMajor: 3,
      protocolMinor: 0,
      treasuryGrowthRate: 0.2,
    },
    livedata_old: {
      decentralisation: 0,
      influence: 0.3,
      monetaryExpandRate: 0.003,
      treasuryGrowthRate: 0.2,
    },
    isInactive: false,
    pools: [],
    poolindex: [],
    locales: [],
    pools_raw: [],
    rewards: {},
    rewardsnp1: {},
    rewardstake: {},
    activestake: {},
    mary_db_sync_status_pool_forecast_calculated_epoch: null,
    mary_db_sync_status_pool_actuals_calculated_epoch: null,
    mary_db_sync_status_forecast_rewards_complete_epoch: null,
    mary_db_sync_status_actual_rewards_complete_epoch: null,
    mary_db_sync_status_new_rewards_complete_epoch: 0,
    heights: {},
    admin_message: { chillin: false, message: "", title: "" },
    userId: null,
    userData: {},
    userDataPub: {},
    userDataPriv: {},
  },

  actions: {
    pollNow({ commit, state }) {
      if (!state.intervalTimer) {
        commit("setIntervalTimer", () => commit("now"));
      }
    },
    clearPollNow({ commit }) {
      commit("clearIntervalTimer");
    },

    async bindUserData({ state, commit }) {
      if (!state.userId) return;
      try {
        const resp = await getUser(state.userId);
        const data = resp.data;
        commit("setUserData", data);
        commit("setUserDataPub", data);
        commit("setUserDataPriv", data);
      } catch (e) {
        console.warn("Failed to load user data:", e);
      }
      // Subscribe to real-time user updates via WS
      wsClient.subscribe(
        "user_data",
        { user_id: state.userId },
        (data) => {
          commit("setUserData", data);
          commit("setUserDataPriv", data);
        }
      );
    },

    unbindUserData({ commit }) {
      wsClient.unsubscribe("user_data");
      commit("setUserData", {});
      commit("setUserDataPub", {});
      commit("setUserDataPriv", {});
    },

    async bindPools({ state, commit }) {
      if (state.poolsSubscribed) return;
      state.poolsSubscribed = true;

      try {
        const resp = await getPools();
        const poolsArr = resp.data;
        poolsArr.forEach((poolData) => {
          const poolId = poolData.pool_id ?? poolData.id;
          if (!poolId) return;
          const converted = convertPool(poolData, state);
          if (Object.keys(state.poolindex).indexOf(poolId) === -1) {
            const idx = state.pools.push(converted) - 1;
            Vue.set(state.poolindex, poolId, idx);
          } else {
            Vue.set(state.pools, state.poolindex[poolId], converted);
          }
        });
        commit("setActivestakeFromPools");
      } catch (e) {
        console.warn("Failed to load pools:", e);
      }

      // Real-time pool updates via WS
      wsClient.subscribe("pools", {}, (data) => {
        if (Array.isArray(data)) {
          data.forEach((poolData) => {
            const poolId = poolData.pool_id ?? poolData.id;
            if (!poolId) return;
            const converted = convertPool(poolData, state);
            if (Object.keys(state.poolindex).indexOf(poolId) === -1) {
              const idx = state.pools.push(converted) - 1;
              Vue.set(state.poolindex, poolId, idx);
            } else {
              Vue.set(state.pools, state.poolindex[poolId], converted);
            }
          });
          commit("setActivestakeFromPools");
        }
      });
    },

    bindPoolsRetired({ state }) {
      // Retired pools are included in the main pools fetch (pool_retired flag)
      state.retiredPoolsSubscribed = true;
    },

    async bindSinglePool({ state, commit }, poolId) {
      if (Object.keys(state.poolindex).indexOf(poolId) !== -1) return;
      try {
        const resp = await getPool(poolId);
        const data = resp.data;
        const poolData = data && data.pool != null ? data.pool : data;
        if (poolData && (poolData.pool_id || poolData.id)) {
          const converted = convertPool(poolData, state);
          if (Object.keys(state.poolindex).indexOf(poolId) === -1) {
            const idx = state.pools.push(converted) - 1;
            Vue.set(state.poolindex, poolId, idx);
          } else {
            Vue.set(state.pools, state.poolindex[poolId], converted);
          }
          commit("setActivestakeFromPools");
        }
      } catch (e) {
        console.warn("Failed to load single pool:", poolId, e);
      }
    },

    async bindGenesis({ state, commit }) {
      wsClient.connect();

      // Fetch all genesis/global data in parallel
      const [ecosystemResp, syncResp, heightsResp, recentBlockResp] =
        await Promise.allSettled([
          getEcosystem(),
          getSyncData(),
          getHeights(),
          getRecentBlock(),
        ]);

      if (ecosystemResp.status === "fulfilled") {
        commit("setEcosystem", ecosystemResp.value.data);
      }
      if (syncResp.status === "fulfilled") {
        commit("setSyncData", syncResp.value.data);
      }
      if (heightsResp.status === "fulfilled") {
        state.heights = heightsResp.value.data;
      }
      if (recentBlockResp.status === "fulfilled") {
        commit("setMostRecentBlock", recentBlockResp.value.data);

        const epoch = recentBlockResp.value.data.epoch;
        if (epoch && epoch > 100) {
          const [epResp, epOldResp, epochDataResp, activeStakeResp] =
            await Promise.allSettled([
              getEpochParams(epoch),
              getEpochParams(epoch - 1),
              getEpoch(epoch),
              getActiveStake(epoch),
            ]);

          if (epResp.status === "fulfilled") {
            commit("setLivedata", epResp.value.data);
          }
          if (epOldResp.status === "fulfilled") {
            commit("setLivedataOld", epOldResp.value.data);
          }
          if (epochDataResp.status === "fulfilled") {
            commit("setEpochData", epochDataResp.value.data);
          }
          if (activeStakeResp.status === "fulfilled") {
            state.active_stake = activeStakeResp.value.data;
          }
        }
      }

      // Subscribe to real-time recent_block updates
      wsClient.subscribe("recent_block", {}, (data) => {
        commit("setMostRecentBlock", data);
        // Keep sync_data in sync so getGenesis.senddata.currentepoch/slot/height update
        if (data && (data.epoch != null || data.block != null || data.slot != null)) {
          commit("setSyncDataFromBlock", {
            currentepoch: data.epoch,
            currentslot: data.slot,
            histogramheight: data.block,
          });
        }
      });

      // Subscribe to real-time ecosystem updates
      wsClient.subscribe("ecosystem", {}, (data) => {
        if (data != null && typeof data === "object") {
          commit("setEcosystem", data);
        }
      });

      // Subscribe to live syncdata updates (majoritymax / syncd / samples from tipsApiApp)
      wsClient.subscribe("syncdata", {}, (data) => {
        commit("mergeSyncDataLive", data);
      });
    },

    updatePools({ commit }, poolsdata) {
      commit("updatePools", poolsdata);
    },
    updateGenesis({ commit }, genesisdata) {
      commit("updateGenesis", genesisdata);
    },
  },

  mutations: {
    setIntervalTimer(state) {
      state.intervalTimer = setInterval(() => {
        state.now = Date.now();
      }, 1000);
    },
    clearIntervalTimer(state) {
      if (state.intervalTimer) {
        clearInterval(state.intervalTimer);
      }
    },
    setDisplayUser(state, { userid, data }) {
      Vue.set(state.display_user, userid, data);
    },
    setUserId(state, data) {
      state.userId = data;
    },
    setUserData(state, data) {
      state.userData = data;
    },
    setUserDataPub(state, data) {
      state.userDataPub = data;
    },
    setUserDataPriv(state, data) {
      state.userDataPriv = data;
    },
    rewards(state, data) {
      state.rewards = data;
    },
    rewardsnp1(state, data) {
      state.rewardsnp1 = data;
    },
    rewardstake(state, data) {
      state.rewardstake = data;
    },
    activestake(state, data) {
      state.activestake = data;
    },
    setActivestakeFromPools(state) {
      const map = {};
      for (let i = 0; i < state.pools.length; i++) {
        const p = state.pools[i];
        if (p && p.pool_id != null) map[p.pool_id] = p.live_stake ?? 0;
      }
      state.activestake = map;
    },
    setNetwork(state, data) {
      state.network = data;
      network_raw.set(data);
    },
    setSyncData(state, data) {
      state.sync_data = data;
    },
    setSyncDataFromBlock(state, data) {
      if (!state.sync_data) state.sync_data = {};
      if (data.currentepoch != null) state.sync_data.currentepoch = data.currentepoch;
      if (data.currentslot != null) state.sync_data.currentslot = data.currentslot;
      if (data.histogramheight != null) state.sync_data.histogramheight = data.histogramheight;
    },
    mergeSyncDataLive(state, data) {
      if (!state.sync_data) state.sync_data = {};
      if (data.majoritymax != null) Vue.set(state.sync_data, "majoritymax", data.majoritymax);
      if (data.syncd != null) Vue.set(state.sync_data, "syncd", data.syncd);
      if (data.samples != null) Vue.set(state.sync_data, "samples", data.samples);
    },
    setEpochData(state, data) {
      state.epoch_data = data;
    },
    setEcosystem(state, data) {
      if (data != null && typeof data === "object") {
        state.ecosystem = data;
      }
    },
    setCurrentEpoch(state, data) {
      state.current_epoch = data;
    },
    setLivedataOld(state, data) {
      state.livedata_old = data;
    },
    setLivedata(state, data) {
      state.livedata = data;
    },
    setMostRecentBlock(state, data) {
      state.most_recent_block = data;
    },
    updateLocales(state, locales) {
      state.locales = locales;
    },
    setInactive(state, value) {
      state.isInactive = value;
    },
    setIsSignedIn(state, value) {
      state.isSignedIn = value;
    },
    updateGenesis(state, genesisdata) {
      state.genesis = genesisdata;
    },
    updatePools(state, poolsdata) {
      state.poolsdata = poolsdata;
    },
  },

  getters: {
    getUserType: (state) => {
      if (!state.isSignedIn) return "";
      if (
        state.userDataPriv != null &&
        typeof state.userDataPriv.myPools != "undefined" &&
        state.userDataPriv.myPools != null &&
        Object.keys(state.userDataPriv.myPools).length > 0
      ) {
        return "Operator";
      }
      return "Delegator";
    },
    getNow: (state) => state.now,
    getDisplayUsers: (state) => state.display_user,
    getUserData: (state) => state.userData,
    getUserDataPub: (state) => state.userDataPub,
    getUserDataPriv: (state) => state.userDataPriv,
    getUserId: (state) => state.userId,
    admin_message: (state) => state.admin_message,
    getNetwork: (state) => state.network,
    getPools: (state) => state.pools,
    rewardsnp1: (state) => state.rewardsnp1,
    heights: (state) => state.heights,
    rewards: (state) => state.rewards,
    activestake: (state) => state.activestake,
    rewardstake: (state) => state.rewardstake,
    getLanguages: (state) => state.langs_raw,
    getQuietEpoch: (state) =>
      state.quietEpoch && state.quietEpoch[".value"]
        ? state.quietEpoch[".value"]
        : state.most_recent_block ? state.most_recent_block.epoch : 0,
    getRawPools: (state) => state.pools_raw,
    getEpochData: (state) => state.epoch_data,
    getEcosystem: (state) => state.ecosystem,
    getCurrentEpoch: (state) => state.current_epoch,
    getLivedata: (state) => state.livedata,
    getLivedataOld: (state) => state.livedata_old,
    getMostRecentBlock: (state) => state.most_recent_block,
    getIsSignedIn: (state) => state.isSignedIn && state.network === "Mainnet",
    getPoolIndex: (state) => state.poolindex,
    getIsInactive: (state) => state.isInactive,
    getNewRewardsCompleteEpoch: (state) =>
      state.mary_db_sync_status_new_rewards_complete_epoch != null &&
      state.mary_db_sync_status_new_rewards_complete_epoch[".value"]
        ? state.mary_db_sync_status_new_rewards_complete_epoch[".value"]
        : state.most_recent_block ? state.most_recent_block.epoch : 0,
    getGenesis: (state) => {
      const activeStakeVal =
        state.active_stake != null
          ? typeof state.active_stake === "object" &&
            state.active_stake.total_active_stake != null
            ? state.active_stake.total_active_stake
            : typeof state.active_stake === "number"
            ? state.active_stake
            : 0
          : 0;
      return {
        blockstake: activeStakeVal,
        total_utxo: state.ecosystem != null ? state.ecosystem.total_utxo : 0,
        epoch:
          state.most_recent_block != null ? state.most_recent_block.epoch : 0,
        BlockNo:
          state.most_recent_block != null ? state.most_recent_block.block : 0,
        blockHash:
          state.most_recent_block != null ? state.most_recent_block.hash : "",
        total_staked:
          state.ecosystem != null ? state.ecosystem.total_staked : 0,
        total_staked_addresses:
          state.ecosystem != null ? state.ecosystem.delegators : 0,
        epoch_reward_pot: state.ecosystem != null ? state.ecosystem.rewardpot : null,
        epochLength: 432000,
        activeSlotCoeff: 0.05,
        slot_in_epoch:
          state.most_recent_block != null
            ? (() => {
                const b = state.most_recent_block;
                const epochLen = 432000;
                let es = b.epoch_slot != null ? b.epoch_slot : b.slot;
                if (es >= epochLen && b.slot != null) es = b.slot % epochLen;
                return es;
              })()
            : 0,
        prices: state.ecosystem != null ? state.ecosystem.prices || {} : {},
        forecast_rewards_complete_epoch:
          state.most_recent_block ? state.most_recent_block.epoch : 0,
        actual_rewards_complete_epoch:
          state.most_recent_block ? state.most_recent_block.epoch - 1 : 0,
        new_rewards_complete_epoch:
          state.most_recent_block ? state.most_recent_block.epoch : 0,
        pool_forecast_calculated_epoch:
          state.most_recent_block ? state.most_recent_block.epoch : 0,
        pool_actuals_calculated_epoch:
          state.most_recent_block ? state.most_recent_block.epoch - 1 : 0,
        livedata2: {
          max_livestake:
            state.ecosystem != null ? state.ecosystem.maxLiveStake : 0,
          min_livestake: 0,
          total_blockstake: activeStakeVal,
          active_pools:
            state.ecosystem != null ? state.ecosystem.active_pools : 0,
          total_epoch_blocks:
            state.epoch_data != null ? state.epoch_data.blocks : 0,
        },
        livedata1_old: {
          reserves: state.ecosystem != null ? state.ecosystem.reserves : 0,
          rho: state.livedata_old != null ? state.livedata_old.monetary_expansion_rate : 0,
          tau: state.livedata_old != null ? state.livedata_old.treasury_growth_rate : 0,
        },
        livedata1: {
          decentralisationParam:
            state.livedata != null ? state.livedata.decentralisation : 0,
          reserves: state.ecosystem != null ? state.ecosystem.reserves : 0,
          rho: state.livedata != null ? state.livedata.monetary_expansion_rate : 0,
          tau: state.livedata != null ? state.livedata.treasury_growth_rate : 0,
          a0: state.livedata != null ? state.livedata.influence : 0,
        },
        senddata: {
          majoritymax:
            state.sync_data != null ? state.sync_data.majoritymax : 0,
          syncd: state.sync_data != null ? state.sync_data.syncd : 0,
          samples: state.sync_data != null ? state.sync_data.samples : 0,
          histogramheight:
            state.sync_data != null ? state.sync_data.histogramheight : 0,
          currentepoch:
            state.sync_data != null ? state.sync_data.currentepoch : 0,
          histogramhash:
            state.sync_data != null ? state.sync_data.histogramhash : "",
        },
      };
    },
    getLocales: (state) => state.locales,
  },
});
