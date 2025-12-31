
import { db } from "@/firebase";
export default {
    name: 'Pooltable',

    filters: {
        
      
        grouproi: function (stake, reward) {
            if (stake == 0 || stake == null || isNaN(stake)) return 0
            if (reward == 0 || reward == null || isNaN(stake)) return 0
            return Math.pow((reward / stake) + 1, (365 / 5)) - 1
        },
        roi: function (roi) {
            return Math.pow((roi) + 1, (365 / 5)) - 1
        },
        renderstakepercent: function (stake, totalstake) {
            return totalstake == 0 ? ' ' : (stake / totalstake) < 0.0000001 ? ' ' : (stake / totalstake)
        },

    },
    computed: {
        network: function () {
            return this.$store.getters.getNetwork;
          },
        genesis: function () {
            return this.$store.getters.getGenesis
        },
        ecosystem: function() {
            return this.$store.getters.getEcosystem
        },
       
        heights: function() {
            return this.$store.getters.heights
        },
        rewardstake: function() {
            return this.$store.getters.rewardstake
        },
        activestake: function() {
            return this.$store.getters.activestake
        },
        rewards: function() {
            return this.$store.getters.rewards
        },
        rewardsnp1: function() {
            return this.$store.getters.rewardsnp1
        },
        saturationpoint: function() {
            
            return this.ecosystem.saturation!=null?this.ecosystem.saturation:0
        }
    },
    methods: {
        updatePoolField(field,item, newvalue) {
            var writename="xxxx"
            var writetable="xxxx"
            switch(field) {
                case 'groupname':
                    writename="g"
                    writetable="stake_pools"
                break;
            }
            if (newvalue == item[field]) return
            var variables = {}
            variables[writename] = newvalue
            db.ref(this.network + "/"+writetable+"/" + item.poolpubkey).update(variables); //
        },

        
        customSort(items, index, isDesc) {
            items.sort((a, b) => {
                switch (index[0]) {
                    case 'height':
                        a['height']=a.poolpubkey in this.heights?this.heights[a.poolpubkey]:0
                        b['height']=b.poolpubkey in this.heights?this.heights[b.poolpubkey]:0
                        if (a['height'] == 1 && b['height'] == 1) {
                            return a['poolpubkey'] < b['poolpubkey'] ? (isDesc[0] ? -1 : 1) : (!isDesc[0] ? -1 : 1)

                        } else if (a['height'] == 1 && b['height'] != 1) {
                            return (isDesc[0] ? -1 : 1)
                        } else if (a['height'] != 1 && b['height'] == 1) {
                            return (!isDesc[0] ? -1 : 1)
                        } else if (a['height'] == 1 && b['height'] > 1) {
                            return (isDesc[0] ? -1 : 1)
                        } else if (a['height'] > 1 && b['height'] == 1) {
                            return (!isDesc[0] ? -1 : 1)
                        } else if (a['height'] > 1 && b['height'] > 1) {
                            if (a['height'] != b['height']) {
                                return a['height'] > b['height'] ? (isDesc[0] ? -1 : 1) : (!isDesc[0] ? -1 : 1)
                            } else {
                                return a['poolpubkey'] < b['poolpubkey'] ? (isDesc[0] ? -1 : 1) : (!isDesc[0] ? -1 : 1)
                            }

                        } else if (a['height'] == 0 || a['height'] == null) {
                            return (!isDesc[0] ? -1 : 1)
                        } else if (b['height'] == 0 || b['height'] == null) {
                            return (isDesc[0] ? -1 : 1)
                        } else {
                            return (isDesc[0] ? -1 : 1)
                        }

                        /* eslint-disable no-unreachable */
                        break
                    case 'pool_name':
                        var sorta, sortb

                        // if (a['name'] == "" || a['name'] == null) {
                        //     if (a['pool_md_name'] == "" || a['pool_md_name'] == null) {
                        //         sorta = a['poolpubkey']
                        //     } else {
                        //         sorta = a['pool_md_name'].trim()
                        //     }
                        // } else {
                        //     sorta = a['pool_name'].trim()
                        // }

                        // if (b['pool_name'] == "" || b['pool_name'] == null) {
                        //     if (b['pool_md_name'] == "" || b['pool_md_name'] == null) {
                        //         sortb = b['poolpubkey']
                        //     } else {
                        //         sortb = b['pool_md_name'].trim()
                        //     }
                        // } else {
                        //     sortb = b['pool_name'].trim()
                        // }
                        sorta = 'pool_name' in a&&typeof a['pool_name'] != "undefined"&&a['pool_name']!=null?a['pool_name'].trim():a['poolpubkey']
                        sortb = 'pool_name' in b&&typeof b['pool_name'] != "undefined"&&b['pool_name']!=null?b['pool_name'].trim():b['poolpubkey']
                        if (!isDesc[0]) {
                            return sorta < sortb ? -1 : 1;
                        } else {
                            return sortb < sorta ? -1 : 1;
                        }
                        /* eslint-disable no-unreachable */
                        break
                    case "livestake":
                    case "livestakepercent":
                    
                        if (!isDesc[0]) {
                            return parseInt(a['live_stake']) < parseInt(b['live_stake']) ? -1 : 1;
                        } else {
                            return parseInt(b['live_stake']) < parseInt(a['live_stake']) ? -1 : 1;
                        }
                        /* eslint-disable no-unreachable */
                        break
                    case "grouplivestake":
                    case "grouplivestakepercent":
                        if (!isDesc[0]) {
                            return parseInt(a['grouplivestake'] ) < parseInt(b['grouplivestake']) ? -1 : 1;
                        } else {
                            return parseInt(b['grouplivestake']) < parseInt(a['grouplivestake']) ? -1 : 1;
                        }
                        /* eslint-disable no-unreachable */
                        break
                    case 'groupblockstake':
                    case 'groupactivestakepercent':
                        if (!isDesc[0]) {
                            return parseInt(a['groupblockstake'] ) < parseInt(b['groupblockstake']) ? -1 : 1;
                        } else {
                            return parseInt(b['groupblockstake']) < parseInt(a['groupblockstake']) ? -1 : 1;
                        }
                        /* eslint-disable no-unreachable */
                        break
                    case "blockstake":
                    case "activestakepercent":
                        if (!isDesc[0]) {
                            return parseInt((a['poolpubkey'] in this.activestake&&this.activestake[a['poolpubkey']])?this.activestake[a['poolpubkey']]:0) < parseInt((b['poolpubkey'] in this.activestake&&this.activestake[b['poolpubkey']])?this.activestake[b['poolpubkey']]:0) ? -1 : 1;
                        } else {
                            return parseInt((b['poolpubkey'] in this.activestake&&this.activestake[b['poolpubkey']])?this.activestake[b['poolpubkey']]:0) < parseInt((a['poolpubkey'] in this.activestake&&this.activestake[a['poolpubkey']])?this.activestake[a['poolpubkey']]:0) ? -1 : 1;
                        }
                        /* eslint-disable no-unreachable */
                        break

                    case "epoch_blocks":
                    case "epoch_blocks_percent":
                        if (!isDesc[0]) {
                            return parseInt(a['epochBlocksEpoch']==this.genesis.epoch?a['epoch_blocks']:0) < parseInt(b['epochBlocksEpoch']==this.genesis.epoch?b['epoch_blocks']:0) ? -1 : 1;
                        } else {
                            return parseInt(b['epochBlocksEpoch']==this.genesis.epoch?b['epoch_blocks']:0) < parseInt(a['epochBlocksEpoch']==this.genesis.epoch?a['epoch_blocks']:0) ? -1 : 1;
                        }
                        /* eslint-disable no-unreachable */
                        break
                    case "lifetimeroi":
                        a.lifetimeroi=a.poolpubkey in this.rewards&&'lifetimeRos' in this.rewards[a.poolpubkey]?this.rewards[a.poolpubkey]['lifetimeRos']:0
                        b.lifetimeroi=b.poolpubkey in this.rewards&&'lifetimeRos' in this.rewards[b.poolpubkey]?this.rewards[b.poolpubkey]['lifetimeRos']:0
                        if (!isDesc[0]) {
                            return a.lifetimeroi < b.lifetimeroi ? -1 : 1;
                        } else {
                            return b.lifetimeroi < a.lifetimeroi ? -1 : 1;
                        }

                        /* eslint-disable no-unreachable */
                        break
                    case 'roi':
                        b['roi']=b['poolpubkey'] in this.rewards?this.rewards[b['poolpubkey']]['epochRos']:0
                        a['roi']=a['poolpubkey'] in this.rewards?this.rewards[a['poolpubkey']]['epochRos']:0
                        if (!isDesc[0]) { //low on top to high
                            if (b['roi'] == 0 || b['roi'] == null) return 1
                            if (a['roi'] == 0 || a['roi'] == null) return -1
                            return a['roi'] < b['roi'] ? -1 : 1;
                        } else {
                            if (b['roi'] == 0 || b['roi'] == null) return -1
                            if (a['roi'] == 0 || a['roi'] == null) return 1
                            return b['roi'] < a['roi'] ? -1 : 1;
                        }
                        /* eslint-disable no-unreachable */
                        break
                    case 'roifcp1':
                        b['roifcp1']=b['poolpubkey'] in this.rewardsnp1?this.rewardsnp1[b['poolpubkey']]['epochRos']:0
                        a['roifcp1']=a['poolpubkey'] in this.rewardsnp1?this.rewardsnp1[a['poolpubkey']]['epochRos']:0
                        if (!isDesc[0]) { //low on top to high
                            if (b['roifcp1'] == 0 || b['roifcp1'] == null) return 1
                            if (a['roifcp1'] == 0 || a['roifcp1'] == null) return -1
                            return a['roifcp1'] < b['roifcp1'] ? -1 : 1;
                        } else {
                            if (b['roifcp1'] == 0 || b['roifcp1'] == null) return -1
                            if (a['roifcp1'] == 0 || a['roifcp1'] == null) return 1
                            return b['roifcp1'] < a['roifcp1'] ? -1 : 1;
                        }
                        /* eslint-disable no-unreachable */
                        break
                    case 'favorite':
                        var aindx = this.favorites.indexOf(a['poolpubkey'])
                        var bindx = this.favorites.indexOf(b['poolpubkey'])
                        if (!isDesc[0]) { //low on top to high

                            if (aindx == -1) {
                                return -1
                            } else if (bindx == -1) {
                                return 1
                            } else {
                                return aindx > bindx ? -1 : 1
                            }
                        } else {
                            if (aindx == -1) {
                                return 1
                            } else if (bindx == -1) {
                                return -1
                            } else {
                                return aindx < bindx ? -1 : 1
                            }
                        }
                        /* eslint-disable no-unreachable */
                        break
                    case 'poolcost':
                        /* eslint-disable no-unreachable */
                        if (!isDesc[0]) {
                            return a[index[0]] < b[index[0]] ? -1 : 1;
                        } else {
                            return b[index[0]] < a[index[0]] ? -1 : 1;
                        }
                        break
                    case 'poolmargin':
                        if(typeof a[index[0]] == "undefined" || isNaN(a[index[0]])) a[index[0]]=0
                        if(typeof b[index[0]] == "undefined"|| isNaN(b[index[0]])) b[index[0]]=0
                        
                        if (!isDesc[0]) {
                            return a[index[0]] < b[index[0]] ? -1 : 1;
                        } else {
                            return b[index[0]] < a[index[0]] ? -1 : 1;
                        }
                        /* eslint-disable no-unreachable */
                        break
                    

                    default:
                        if(typeof a[index[0]] == "undefined") a[index[0]]=0
                        if(typeof b[index[0]] == "undefined") b[index[0]]=0
                        if (!isDesc[0]) {
                            return a[index[0]] < b[index[0]] ? -1 : 1;
                        } else {
                            return b[index[0]] < a[index[0]] ? -1 : 1;
                        }
                }
            });
            return items;
        },
        // lifetimeroi: function (item, currentEpoch) {

        //     if (item.first_epoch != null && item.lifetime_rewards != null && item.lifetime_rewards > 0 && currentEpoch != item.first_epoch) {
        //         const compoundingperiods = (currentEpoch - item.first_epoch - 1)
        //         const roioverspan = item.lifetime_rewards / ((item.lifetime_stake - item.donestake - item.blockstake) / compoundingperiods)
        //         return Math.pow(roioverspan + 1, 1 / (compoundingperiods / (365 / 5))) - 1
        //     }
        //     return 0

        // },


        paintred: function (livestake, poolcount = 1) {
            return livestake > this.saturationpoint * poolcount ? "saturated" :""
        },
    },

}