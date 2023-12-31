import Vue from 'vue'
import Vuex from 'vuex'
import { vuexfireMutations, firebaseAction } from 'vuexfire'
import { preference } from 'vue-preferences'

import { db } from '@/firebase'

Vue.use(Vuex)

const network_raw = preference('network', { defaultValue: 'Mainnet' });

function processPoolRemoved(snapshot,state) {
    let pooldata=snapshot.val()
        db.ref(state.network+'/stake_pools').child(snapshot.key).child('d').get().then(val=>{
            let d = val.val()
            let update=false
            if("d" in pooldata && pooldata["d"]==false&& d==true) {
                update=true
                pooldata["d"]=true
            }else if("d" in pooldata && pooldata["d"]==true&& d==false) {
                update=true
                pooldata["d"]=false
            }
            if(update) {  
                if(Object.keys(state.poolindex).indexOf(snapshot.key)=="-1") {
                    const daindex = (state.pools.push(convertPool(pooldata,state))) - 1
                    Vue.set(state.poolindex, snapshot.key, daindex)
                    Vue.set(state.pools, daindex, convertPool(pooldata,state))
                }else{
                    Vue.set(state.pools, state.poolindex[snapshot.key], convertPool(pooldata,state))
                }
            }
        })
}
function processPool(snapshot,state) {
    
    if(Object.keys(state.poolindex).indexOf(snapshot.key)=="-1") {
        const daindex = (state.pools.push(convertPool(snapshot.val(),state))) - 1
        Vue.set(state.poolindex, snapshot.key, daindex)
        Vue.set(state.pools, daindex, convertPool(snapshot.val(),state))
    }else{
        Vue.set(state.pools, state.poolindex[snapshot.key], convertPool(snapshot.val(),state))
    }
}

function convertPool(a,state) {
    var b={
        poolpubkey:a.id!=null?a.id:'', //
        ticker:"t" in a?a.t:a.ticker, //
        groupname: "g" in a && a.g != null?a.g.trim():'', //
        pool_name: "n" in a?a.n:a.name, //
        rank: "r" in a?a.r:a.rank, //
        live_stake: "ls" in a?a.ls:0,
        onlineRelays: a.o,
        offlineRelays: a.oo,
        saturation: "s" in a?a.s:a.saturation,//
        poolcost: "f" in a?a.f:a.fixedFee,//
        fpoolcost: "ff" in a?a.ff:a.afixedFee,//
        poolmargin: "m" in a?(a.m/100):(a.variableFee/100), //
        fpoolmargin: "fm" in a?(a.fm/100):(a.avariableFee/100),//
        poolpledge: "p" in a?a.p:a.pledge, //
        fpoolpledge: "fp" in a?a.fp:a.apledge,//
        poolpledgevalue: "ap" in a?a.ap:a.actualPledge || 0, //
        itn_verified: "i" in a?a.i:a.itnVerified,//
        epoch_blocks: "b" in a?(a.b!=null?a.b:0):(a.epochBlocks!=null?a.epochBlocks:0),//
        epochBlocksEpoch: "eb" in a?(a.eb!=null?a.eb:0):(a.epochBlocksEpoch!=null?a.epochBlocksEpoch:0),//
        life_blocks: "l" in a?(a.l!=null?a.l:0):(a.totalBlocks!=null?a.totalBlocks:0),//
        genesis_pool: "x" in a?a.x:a.isGenesis,//
        pool_retired: "d" in a?a.d:a.isRetired,//
        assigned_slots: "z" in a?a.z:a.assigned_slots,//
        assigned_slots_epoch: "ez" in a?a.ez:a.assigned_slots_epoch,//
        imposter: "xx" in a?a.xx:a.imposter,//
        lifetime_per_blocks: "zl" in a?a.zl:a.lifetime_per_blocks,//
        lifetime_per_slots: "zs" in a?a.zs:a.lifetime_per_slots,//,
        
        lifetime_ros: "lros" in a?a.lros:0,
        sixros: "sr" in a?a.sr:0,
        twelveros: "tr" in a?a.tr:0
    }
    if(b.lifetime_per_blocks>0&&b.lifetime_per_slots>0&&(b.assigned_slots_epoch>=state.sync_data.currentepoch-1)) {
        b['lifetime_performance']=b.lifetime_per_blocks/b.lifetime_per_slots
    }else{
        b['lifetime_performance']=null
    }
    return b
}


export const store = new Vuex.Store({
    state: {
        promotions:{},
        singlepoolssub: {},
        retiredPoolsSubscribed: false, 
        poolsSubscribed: false,
        now: Date.now(),
        intervalTimer: null,
        display_user: {},
        langs_raw: {},
        quietEpoch: {},
        portfolios_loaded: false,
        poolsdata: [],
        network: network_raw.get(),
        active_stake: 0,
        total_utxo: 0,
        sync_data: {

            countplatform: [],
            countversion: [],
            currentepoch: 251,
            currentslot: 271083,
            distribution: {
                5292060: 5,
                5292061: 292},
            histogram: "[[], []]",
            histogramhash: "5fdc8c0918e65ce8267ac39e0ecf71b32f7ab2ad244598a4fbff11daefea02f1",
            histogramheight: 5292060,
            majoritymax: 5292061,
            max: 5292061,
            min: 5292060,
            reportingstatus: {
                lasthash: 297,
                lasthashparent: 0,
                lasthashparentepoch: 0,
                lasthashparentepochslot: 0,
                platform: 297,
                version: 295
            },
            lasthash: 297,
            lasthashparent: 0,
            lasthashparentepoch: 0,
            lasthashparentepochslot: 0,
            platform: 297,
            version: 295
        },

        isSignedIn: false,
        most_recent_block: {
            block: 5266872,
            epoch: null,
            fees: 0,
            hash: "fafb6802d21683d2f8d6d5858b60de2de961fa41c4fd6e340e24351685b61563",
            leaderPoolId: "2df92e9f9cbe0a719bb26f2fe264c829d435c40cd43ee0a623f7114b",
            leaderPoolName: "SPACE TWO: Infinite Rewards",
            leaderPoolTicker: "SP₳CE",
            output: 0,
            size: 3,
            slot: 195552,
            time: 1611806643000,
            transactions: 0
        },

        ecosystem: {
            activePools: 1532,
            averageFixedFee: 351367270,
            averagePledge: 252990096912,
            averageVariableFee: 2.564924760601917,
            decentralizationLevel: 74,
            delegators: 162802,
            desiredPoolNumber: 500,
            offlineRelays: 717,
            onlineRelays: 3615,
            saturatedPools: 94,
            saturationLevel: 63722390365118,
            totalHonoredPledge: 2331148913964287,
            totalStaked: 22230566031338370,
            totalStakedFormatted: "₳22.23B (69.77%)",
            treasury: 68000000000000
        },
        epoch_data: {
            blocks: "9730",
            epoch: 244,
            fees: 5940850316,
            lastBlockTime: 1611808167000,
            progress: 45,
            progressMessage: "Ending in 3 days",
            totalOutput: 10885885636774264,
            transactions: 26398,
        },
        livedata: {
            decentralisation: 0.26,
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
            treasuryGrowthRate: 0.2
        },
        livedata_old: {
            decentralisation: 0.26,
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
            treasuryGrowthRate: 0.2
        },
        isInactive: false,
        pools: [],
        poolindex: [],
        locales: [],
        pools_raw: [],
        //livestake: {},
        rewards: {},
        rewardsnp1: {},
        rewardstake: {},
        activestake: {},
            mary_db_sync_status_pool_forecast_calculated_epoch: null,
            mary_db_sync_status_pool_actuals_calculated_epoch: null,
            mary_db_sync_status_forecast_rewards_complete_epoch: null,
            mary_db_sync_status_actual_rewards_complete_epoch: null,
            mary_db_sync_status_new_rewards_complete_epoch: 0,
            mary_db_sync_status_portfolios: {},
        heights: {},
        portfolios: {},
        admin_message: {chillin:false,message:"",title:""},
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

        unbindUserData: firebaseAction(({ unbindFirebaseRef }) => {
               unbindFirebaseRef('userData')
        }),

        bindUserData: firebaseAction(({ state, bindFirebaseRef}) => {
            bindFirebaseRef ('userData',db.ref(state.network+'/users/privMeta/'+state.userId))
            bindFirebaseRef ('userDataPub',db.ref(state.network+'/users/pubMeta/'+state.userId))
            bindFirebaseRef ('userDataPriv',db.ref(state.network+'/users/privMeta/'+state.userId))
        }),
        bindPoolsRetired: firebaseAction(({ state, unbindFirebaseRef}) => {
            if(!state.retiredPoolsSubscribed) {
                const poolsRef = db.ref(state.network+'/stake_pools').orderByChild("d").equalTo(true)
                poolsRef.on(
                    'child_added',
                    (snapshot) => {
                        if(typeof state.singlepoolssub[snapshot.key]!="undefined") { 
                            const livedata = "singlepoolssub."+String(snapshot.key)
                            unbindFirebaseRef(livedata)
                        }
                        processPool(snapshot,state)
                    },
                )
                poolsRef.on(
                    'child_changed',
                    snapshot => {
                        processPool(snapshot,state)
                    },
                )
                poolsRef.on(
                    'child_moved',
                    snapshot => {
                        processPool(snapshot,state)
                    },
                )
                poolsRef.on(
                    'child_removed',
                    snapshot => {
                        processPoolRemoved(snapshot,state)
                    },
                )
                state.retiredPoolsSubscribed=true
            }
        }),
        bindSinglePool: firebaseAction(({ state, bindFirebaseRef},pool_id) => {
            if(Object.keys(state.poolindex).indexOf(pool_id)=="-1") {
                if(typeof state.singlepoolssub[pool_id]=="undefined") {
                    const livedata = "singlepoolssub."+String(pool_id)
                    bindFirebaseRef (livedata,db.ref(state.network + "/stake_pools").child(pool_id),{
                        serialize: (snapshot) => {
                          var pooldata = snapshot.val();
                          if(pooldata!=null){
                            if(Object.keys(state.poolindex).indexOf(pool_id)=="-1") {
                                const daindex = (state.pools.push(convertPool(pooldata,state))) - 1
                                Vue.set(state.poolindex, pool_id, daindex)
                                Vue.set(state.pools, daindex, convertPool(pooldata,state))
                            }else{
                                Vue.set(state.pools, state.poolindex[pool_id], convertPool(pooldata,state))
                            }
                          }
                          return pooldata
                        }
                    })
                }
            }
        }),
                                          
        
        bindPools: firebaseAction(({ state, unbindFirebaseRef}) => {
            if(!state.poolsSubscribed) {
                const poolsRef = db.ref(state.network+'/stake_pools').orderByChild("d").equalTo(false)
                poolsRef.on(
                    'child_added',
                    (snapshot) => {
                        //if we have bound a single pool listener, lets remove it
                        if(typeof state.singlepoolssub[snapshot.key]!="undefined") { 
                            const livedata = "singlepoolssub."+String(snapshot.key)
                            unbindFirebaseRef(livedata)
                        }
                        processPool(snapshot,state)
                    },
                )
                poolsRef.on(
                    'child_changed',
                    snapshot => {
                        processPool(snapshot,state)
                    },
                )
                poolsRef.on(
                    'child_moved',
                    snapshot => {
                        processPool(snapshot,state)
                    },
                )
                poolsRef.on(
                    'child_removed',
                    snapshot => {
                        processPoolRemoved(snapshot,state)
                    },
                )
                state.poolsSubscribed=true
            }
        }),


        bindGenesis: firebaseAction(({ state, bindFirebaseRef}) => { //, unbindFirebaseRef
            bindFirebaseRef ('promotions',db.ref(state.network+'/promotions'))
            bindFirebaseRef ('heights',db.ref(state.network+'/stake_pool_columns/heights'))
            //bindFirebaseRef ('livestake',db.ref(state.network+'/stake_pool_columns/livestake'))
            bindFirebaseRef ('mary_db_sync_status_pool_forecast_calculated_epoch',db.ref(state.network+'/mary_db_sync_status/pool_forecast_calculated_epoch'))
            bindFirebaseRef ('mary_db_sync_status_pool_actuals_calculated_epoch',db.ref(state.network+'/mary_db_sync_status/pool_actuals_calculated_epoch'))

            bindFirebaseRef ('mary_db_sync_status_forecast_rewards_complete_epoch',db.ref(state.network+'/mary_db_sync_status/forecast_rewards_complete_epoch'))
            bindFirebaseRef ('mary_db_sync_status_actual_rewards_complete_epoch',db.ref(state.network+'/mary_db_sync_status/actual_rewards_complete_epoch'))
            bindFirebaseRef ('mary_db_sync_status_new_rewards_complete_epoch',db.ref(state.network+'/mary_db_sync_status/new_rewards_complete_epoch'))
            bindFirebaseRef ('mary_db_sync_status_portfolios',db.ref(state.network+'/mary_db_sync_status/portfolios'))

            bindFirebaseRef ('admin_message',db.ref(state.network+'/admin_message/web'))
            bindFirebaseRef ('quietEpoch',db.ref(state.network+'/recent_block/epoch'))
            bindFirebaseRef ('langs_raw',db.ref(state.network+'/languages'))




            bindFirebaseRef ('most_recent_block', db.ref(state.network+'/recent_block')).then(()=> {

                bindFirebaseRef ('livedata_old', db.ref(state.network+'/epoch_params/'+(state.most_recent_block.epoch - 1)))
                bindFirebaseRef ('livedata', db.ref(state.network+'/epoch_params/'+state.most_recent_block.epoch))
                bindFirebaseRef ('epoch_data', db.ref(state.network+'/epochs/'+state.most_recent_block.epoch))

                bindFirebaseRef ('active_stake', db.ref(state.network+'/total_active_stake').child(state.most_recent_block.epoch))
            })
            bindFirebaseRef ('sync_data', db.ref(state.network+'/syncdata'))
            bindFirebaseRef ('ecosystem', db.ref(state.network+'/ecosystem'))

        }),
        updatePools({commit},poolsdata) {
            commit("updatePools",poolsdata)
        },
        updateGenesis({commit},genesisdata) {
            commit("updateGenesis",genesisdata)
        }
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
        setDisplayUser(state,{userid,data}) {
            Vue.set(state.display_user, userid, data)
        },
        setUserId(state,data) {
            state.userId=data
        },
        portfolios_loaded(state,data) {
            state.portfolios_loaded=data
        },
        rewards(state,data) {

            state.rewards=data
        },
        portfolios(state,data) {
            state.portfolios=data
        },

        rewardsnp1(state,data) {
            state.rewardsnp1=data
        },
        rewardstake(state,data) {
            state.rewardstake=data
        },
        activestake(state,data) {
            state.activestake=data
        },
        setNetwork(state,data) {
            state.network=data
            network_raw.set(data)
        },


        setSyncData(state,data) {
            state.sync_data = data
        },
        setEpochData(state,data) {
            state.epoch_data = data
        },
        setEcosystem(state,data) {
            state.ecosystem = data
        },
        setCurrentEpoch(state,data) {
            state.current_epoch = data
        },
        setLivedataOld(state,data) {
            state.livedata_old = data
        },
        setLivedata(state,data) {
            state.livedata = data
        },
        setMostRecentBlock(state,data) {
            state.most_recent_block = data
        },

        updateLocales(state,locales) {
            state.locales = locales
        },
        setInactive(state,value) {
            state.isInactive = value
        },
        setIsSignedIn(state,value) {
            state.isSignedIn = value
        },
        updateGenesis(state,genesisdata) {
            state.genesis=genesisdata
        },
        ...vuexfireMutations,
    },
    getters: {
        getUserType: state => {
            if(!state.isSignedIn) {
                return ""
            }else{
                if(state.userDataPriv!=null&&typeof state.userDataPriv.myPools != "undefined" && state.userDataPriv.myPools!=null && Object.keys(state.userDataPriv.myPools).length>0) {
                    return "Operator"
                }else{
                    return "Delegator"
                }
            }
        },
        getNow: state => state.now,
        getDisplayUsers: state => state.display_user,
       
        getUserData: state => state.userData,
        getUserDataPub: state => state.userDataPub,
        getUserDataPriv: state => state.userDataPriv,
        
        getUserId: state=>state.userId,
        admin_message: state=>state.admin_message,
        getNetwork: state => state.network,
        getPools: state => {
            return state.pools
        },
        portfolios_loaded: state => state.portfolios_loaded,
        portfolios: state => state.portfolios,
        rewardsnp1: state => state.rewardsnp1,
        heights: state => state.heights,
        rewards: state => state.rewards,
        activestake: state => state.activestake,
        rewardstake: state => state.rewardstake,
       
        getLanguages: state => state.langs_raw,
        getQuietEpoch: state => state.quietEpoch['.value'],
        getRawPools: state => state.pools_raw,
        getEpochData: state => state.epoch_data,
        getEcosystem: state =>state.ecosystem,
        getCurrentEpoch: state =>state.current_epoch,
        getLivedata: state =>state.livedata,
        getLivedataOld: state =>state.livedata_old,
        getMostRecentBlock: state => state.most_recent_block,
        getIsSignedIn: state => state.isSignedIn&&state.network=="Mainnet",
        getPoolIndex: state => state.poolindex,

        getIsInactive: state => state.isInactive,
        getNewRewardsCompleteEpoch: state => state.mary_db_sync_status_new_rewards_complete_epoch!=null?state.mary_db_sync_status_new_rewards_complete_epoch['.value']:0,
        getGenesis: state => {
            return {
                blockstake: state.active_stake!=null?state.active_stake['.value']:0,
                total_utxo: state.ecosystem!=null?state.ecosystem.total_utxo:0,
                epoch: state.most_recent_block!=null?state.most_recent_block.epoch:0,
                BlockNo: state.most_recent_block!=null?state.most_recent_block.block:0,
                blockHash: state.most_recent_block!=null?state.most_recent_block.hash:'',
                total_staked: state.ecosystem!=null?state.ecosystem.totalStaked:0,
                total_staked_addresses: state.ecosystem!=null?state.ecosystem.delegators:0,
                epochLength: state.ecosystem!=null?state.ecosystem.epochLength:1,
                activeSlotCoeff: state.ecosystem!=null?state.ecosystem.activeSlotCoeff:0.05,
                slot_in_epoch: state.most_recent_block!=null?state.most_recent_block.slot:0,
                prices: state.ecosystem!=null?state.ecosystem.prices:{},
                forecast_rewards_complete_epoch: state.mary_db_sync_status_forecast_rewards_complete_epoch!=null?state.mary_db_sync_status_forecast_rewards_complete_epoch['.value']:0,
                actual_rewards_complete_epoch: state.mary_db_sync_status_actual_rewards_complete_epoch!=null?state.mary_db_sync_status_actual_rewards_complete_epoch['.value']:0,
                new_rewards_complete_epoch: state.mary_db_sync_status_new_rewards_complete_epoch!=null?state.mary_db_sync_status_new_rewards_complete_epoch['.value']:0,
                pool_forecast_calculated_epoch: state.mary_db_sync_status_pool_forecast_calculated_epoch!=null?state.mary_db_sync_status_pool_forecast_calculated_epoch['.value']:0,
                pool_actuals_calculated_epoch: state.mary_db_sync_status_pool_actuals_calculated_epoch!=null?state.mary_db_sync_status_pool_actuals_calculated_epoch['.value']:0,
                
                portfolios: state.mary_db_sync_status_portfolios,
                livedata2: {
                    max_livestake: state.ecosystem!=null?state.ecosystem.maxLiveStake:0,
                    min_livestake: 0,
                    total_blockstake: state.active_stake!=null?state.active_stake['.value']:0,
                    active_pools: state.ecosystem!=null?state.ecosystem.activePools:0,
                    total_epoch_blocks: state.epoch_data!=null?state.epoch_data.blocks:0
                },
                livedata1_old: {
                    reserves: state.ecosystem!=null?state.ecosystem.reserves:0,
                    rho: state.livedata_old!=null?state.livedata_old.monetaryExpandRate:0,
                    tau: state.livedata_old!=null?state.livedata_old.treasuryGrowthRate:0
                },
                livedata1: {
                    decentralisationParam: state.livedata!=null?state.livedata.decentralisation:1,
                    reserves: state.ecosystem!=null?state.ecosystem.reserves:0,
                    rho: state.livedata!=null?state.livedata.monetaryExpandRate:0,
                    tau: state.livedata!=null?state.livedata.treasuryGrowthRate:0,
                    a0: state.livedata!=null?state.livedata.influence:0
                },
                senddata: {
                    majoritymax: state.sync_data!=null?state.sync_data.majoritymax:0,
                    syncd: state.sync_data!=null?state.sync_data.syncd:{},
                    samples: state.sync_data!=null?state.sync_data.samples:0,
                    histogramheight: state.sync_data!=null?state.sync_data.histogramheight:0,
                    currentepoch: state.sync_data!=null?state.sync_data.currentepoch:0,
                    histogramhash: state.sync_data!=null?state.sync_data.histogramhash:''}
            }
        },
        getLocales: state => state.locales
    }

})


