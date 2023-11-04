<template>
  <div class="genesis-wrapper">
    <v-row
      v-if="!mini"
      dense
      :class="{
        'd-flex justify-space-between': true,

        pulseVisible: ispulseVisible,
      }"
    >
      <v-col cols="12" xs="12" sm="6" md="4">
        <genesis-bar-item
          :leftTitle1="$t('app.genesisBar.totalStaked')"
          :leftTitle2="`${currencysymbol}${valueFormat(
            this.$options.filters.toada(totalsupply),
            '0,0.0a'
          )} ${$t('app.genesisBar.totalSupply')}`"
          :rightTitle1="`${currencysymbol}${valueFormat(
            this.$options.filters.toada(totalstaked),
            '0,0.00a'
          )}`"
          :rightTitle2="totalstakepercent | fpercent"
        />
      </v-col>
      <v-col cols="12" xs="12" sm="6" md="4">
        <genesis-bar-item
          :leftTitle1="$t('app.genesisBar.activePools')"
          :leftTitle2="$t('app.genesisBar.atLeastOneLovelaceStaked')"
          :rightTitle1="valueFormat(genesis.livedata2.active_pools, '0,0')"
          :tooltip="
            (genesis.senddata.syncd / genesis.senddata.samples) | fpercent
          "
          :tooltip-title="`${genesis.senddata.syncd} / ${
            genesis.senddata.samples
          } ${$t('app.genesisBar.reportingLastHourSynchronized')}`"
        />
      </v-col>
      <v-col cols="12" xs="12" sm="6" md="4">
        <genesis-bar-item
          :leftTitle1="$t('app.genesisBar.totalStakeAddresses')"
          :leftTitle2="`${currencysymbol}${valueFormat(
            this.$options.filters.toada(epochrewardpot),
            '0,0.0a'
          )} ${$t('app.genesisBar.epochRewardPot')}`"
          :rightTitle1="valueFormat(genesis.total_staked_addresses, '0,0')"
        />
      </v-col>
    </v-row>

    <v-row
      dense
      :class="{
        'flex-md-nowrap justify-space-between flex-lg-nowrap flex-xl-nowrap flex-sm-wrap d-flex': true,

        pulseVisible: ispulseVisible,
      }"
    >
      <v-col cols="12" xs="12" sm="4" md="4" class="flex-grow-1 flex-shrink-1">
        <genesis-bar-item
          :leftTitle1="$t('global.epoch')"
          :leftTitle2="`${$t('app.genesisBar.ends')} ${countdowntimer}`"
          :rightTitle1="genesis.epoch"
        />
      </v-col>

      <v-col cols="12" xs="12" sm="4" md="4" class="flex-grow-1 flex-shrink-1">
        <genesis-bar-item
          :progress="`${genesis.slot_in_epoch} (${epochperc}%)`"
          :progressValue="epochperc"
        />
      </v-col>
      <v-col cols="12" xs="12" sm="4" md="4" class="flex-grow-1 flex-shrink-1">
        <genesis-bar-item
          :leftTitle1="$t('global.height')"
          :leftTitle1Error="leftTitle1Error"
          :leftTitle2="`${$t('global.epochBlocks')}: ${valueFormat(
            genesis.livedata2.total_epoch_blocks,
            '0,0'
          )}`"
          :rightTitle1="valueFormat(genesis.BlockNo, '0,0')"
          :tooltip="valueFormat(genesis.senddata.majoritymax, '0,0')"
          :tooltip-title="$t('app.genesisBar.liveMaxReportedTip')"
        />
      </v-col>
    </v-row>
  </div>
</template>


<script>
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import currenciesjson from "../json/currencies.json";
export default {
  name: "genesis-bar",
  props: [
    "currency",
    "mini",
    "genesis",
    "nightmode",
    "ispulseVisible",
    "ismobile",
    "showBlockIcons",
  ],
  created() {
    this.$store.dispatch("pollNow");
  },
  destroyed() {},
  components: {
    GenesisBarItem: () => import("@/components/GenesisBarItem"),
  },
  data() {
    return {
      currencies: currenciesjson,
      barcolor: "rgba(13, 72, 160, 0.75)", //'#0033AD'//
    };
  },
  methods: {
    valueFormat(value, format) {
      return this.$options.filters.numFormat(value, format);
    },
  },
  updated: function () {
    this.$emit("isLoaded", true);
  },

  computed: {
    leftTitle1Error: function () {
      if (
        typeof this.genesis != "undefined" &&
        this.genesis != null &&
        typeof this.genesis.senddata != "undefined" &&
        typeof this.genesis.BlockNo != "undefined" &&
        this.genesis.senddata.majoritymax - this.genesis.BlockNo > 10
      ) {
        return "(Out Of Sync)";
      }
      return "";
    },
    now: function () {
      return this.$store.getters.getNow;
    },
    admin_message_showing: function () {
      var am = this.$store.getters.admin_message;
      return am.title != "" && am.message != "";
    },
    currencysymbol: function () {
      return this.currencies.find((a) => a.code == this.currency)[
        "symbol_native"
      ];
    },
    totalstaked: function () {
      if (typeof this.genesis.prices[this.currency] != "undefined") {
        return this.genesis.total_staked * this.genesis.prices[this.currency];
      }
      return this.genesis.total_staked;
    },
    totalsupply: function () {
      if (typeof this.genesis.prices[this.currency] != "undefined") {
        return this.genesis.total_utxo * this.genesis.prices[this.currency];
      }
      return this.genesis.total_utxo;
    },
    epochrewardpot: function () {
      var er =
        this.genesis.livedata1_old.reserves *
        this.genesis.livedata1_old.rho *
        (1 - this.genesis.livedata1_old.tau);
      if (typeof this.genesis.prices[this.currency] != "undefined") {
        return er * this.genesis.prices[this.currency];
      }
      return er;
    },
    mainnet_network: function () {
      return this.$store.getters.getNetwork == "Mainnet";
    },
    countdowntimer: function () {
      var value =
        this.genesis.epochLength - this.genesis.slot_in_epoch + this.now / 1000;
      if (value * 1000 < this.now) {
        value = this.now / 1000;
      }
      return formatDistanceToNow(value * 1000);
    },
    totalstakepercent: function () {
      if (this.genesis.total_utxo > 0) {
        return this.genesis.total_staked / this.genesis.total_utxo;
      }
      return 0;
    },
    epochperc: function () {
      if (this.genesis.epochLength > 0) {
        return parseInt(
          (this.genesis.slot_in_epoch / this.genesis.epochLength) * 100
        );
      }
      return 0;
    },
    // slot: function () {
    //     if (this.genesis.epochLength > 0) {
    //         return (this.genesis.SlotNo + this.genesis.epoch_offset) % this.genesis.epochLength
    //     }
    //     return 0
    // },

    // kesperiod: function () {
    //     if (this.genesis.slotsPerKESPeriod > 0) {
    //         return Math.floor((this.genesis.SlotNo) / this.genesis.slotsPerKESPeriod)
    //     }
    //     return 0

    // }
  },
};
</script>
<style scoped>
.pulseNotVisible {
  padding-bottom: 0px;
  margin-bottom: 0px;
  margin-right: 50px;
}
.pulseVisible {
  padding-bottom: 0px;
  margin-bottom: 0px;
  margin-right: -4px;
}
</style>
