<template>
  <div>
    <v-alert v-if="this.pool == null" color="error">Pool Not Found</v-alert>
    <genesis-bar
      v-if="!ismobile"
      :showBlockIcons="showBlockIcons"
      :ispulseVisible="ispulseVisible"
      currency="ada"
      :mini="true"
      :genesis="genesis"
      :nightmode="nightmode"
    ></genesis-bar>
    <div v-if="this.pool != null">
      <v-breadcrumbs
        class="pl-0 pt-0 pb-0"
        :dark="nightmode"
        :items="breadcrumbs"
        ><template v-slot:divider>
          <v-icon>mdi-forward</v-icon>
        </template></v-breadcrumbs
      >

      <pool-widget
        :poolstats="poolstats"
        :reward_address="reward_address"
        :owners="owners"
        class="pb-1"
        :pool="pool"
        :nightmode="nightmode"
        :currentGenesis="genesis"
        thisheight="0"
      ></pool-widget>
      <v-tabs dark show-arrows class="mb-0">
        <v-tab :to="'/pool/' + this.$route.params.poolid + '/epochs'">{{
          $t("global.epoch")
        }}</v-tab>
        <v-tab :to="'/pool/' + this.$route.params.poolid + '/blocks'">{{
          $t("global.blocks")
        }}</v-tab>
        <v-tab :to="'/pool/' + this.$route.params.poolid + '/orphans'">{{
          $t("global.orphans")
        }}</v-tab>
        <v-tab :to="'/pool/' + this.$route.params.poolid + '/metrics'">{{
          $t("app.poolPage.metrics")
        }}</v-tab>
        <v-tab :to="'/pool/' + this.$route.params.poolid + '/curve'">{{
          $t("app.poolPage.curves")
        }}</v-tab>
        <v-tab
          v-if="isSignedIn && (poolIsMine || !pool.claimed)"
          :to="'/pool/' + this.$route.params.poolid + '/manage'"
          >{{ $t("app.poolPage.manage") }}</v-tab
        >
        <v-tab
          v-if="!pool.genesis_pool && network == 'Mainnet'"
          :to="'/pool/' + this.$route.params.poolid + '/awards'"
          >{{ $t("app.poolPage.awards") }}</v-tab
        >
        <v-tab
          v-if="isAdmin"
          :to="'/pool/' + this.$route.params.poolid + '/admin'"
          >{{ $t("app.poolPage.admin") }}</v-tab
        >
      </v-tabs>
      <router-view
        :owners="owners"
        :poolstats="poolstats"
        :userData="userData"
        :poolIsMine="poolIsMine"
        :pool="this.pool"
        :userId="userId"
        :nightmode="nightmode"
        :genesis="genesis"
      ></router-view>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase";
import pooltable from "@/mixins/pooltable";
export default {
  props: [
    "nightmode",
    "userId",
    "ispulseVisible",
    "currency",
    "ismobile",
    "showBlockIcons",
  ],
  mixins: [pooltable],

  data() {
    return {
      genesisLoaded: true,
      pool_raw: {},
      owners_raw: {},
      poolstats: {
        firstEpoch: 0,
        metadataHash: "",
        description: "",
        metadataUrl: "",
        mdLastCheck: "",
        homePage: "",
        delegatorCount: "",
        public_note: "",
        pooltoolbot_subscribers: 0,
      },
    };
  },
  updated() {
    this.$emit("isLoaded", true);
  },

  components: {
    PoolWidget: () => import("@/components/PoolWidget"),
    GenesisBar: () => import("@/components/GenesisBar"),
  },
  watch: {
    pool_id: {
      immediate: true,
      handler(new_pool_id) {
        this.$store.dispatch("bindSinglePool", new_pool_id);
      },
    },
    poolindex: {
      immediate: true,
      handler() {
        if (
          this.poolindex != null &&
          typeof this.$route.params.poolid !== "undefined"
        ) {
          this.$rtdbBind(
            "poolstats",
            db.ref(this.network + "/pool_stats/" + this.$route.params.poolid)
          );
        }
      },
    },
  },
  computed: {
    isAdmin: function () {
      return (
        this.userData != null &&
        typeof this.userData.authority != "undefined" &&
        this.userData.authority == "administrator"
      );
    },
    pool_id: function () {
      return this.$route.params.poolid;
    },
    pool: function () {
      var ls = this.$store.getters.getPools;
      if (this.poolindex != null) {
        var selected_pool = ls[this.poolindex];
        console.log(this.rewards);
        selected_pool["height"] = this.heights;
        selected_pool["blockstake"] = this.activestake;

        selected_pool["roi"] =
          this.rewards["epochRos"] != null ? this.rewards["epochRos"] : 0;

        selected_pool["epoch_tax"] =
          this.rewards["epochTax"] != null ? this.rewards["epochTax"] : 0;

        selected_pool["epoch_rewards"] =
          this.rewards["epochRewards"] != null
            ? this.rewards["epochRewards"]
            : 0;

        selected_pool["lifetimeroi"] =
          this.rewards["lifetimeRos"] != null ? this.rewards["lifetimeRos"] : 0;

        selected_pool["lifetimeStake"] =
          this.rewards["lifetimeStake"] != null
            ? this.rewards["lifetimeStake"]
            : 0;

        selected_pool["lifetimeTax"] =
          this.rewards["lifetimeTax"] != null ? this.rewards["lifetimeTax"] : 0;

        selected_pool["lifetimeRewards"] =
          this.rewards["lifetimeRewards"] != null
            ? this.rewards["lifetimeRewards"]
            : 0;

        selected_pool["roifcp1"] =
          this.rewardsnp1["epochRos"] != null ? this.rewardsnp1["epochRos"] : 0;

        selected_pool["fcp1EpochTax"] =
          this.rewardsnp1["fcp1EpochTax"] != null
            ? this.rewardsnp1["fcp1EpochTax"]
            : 0;

        selected_pool["fcp1EpochRewards"] =
          this.rewardsnp1["fcp1EpochRewards"] != null
            ? this.rewardsnp1["fcp1EpochRewards"]
            : 0;

        return selected_pool;
      }
      return {};
    },
    poolindex: function () {
      var ls = this.$store.getters.getPoolIndex;

      return this.$route.params.poolid in ls
        ? ls[this.$route.params.poolid]
        : null;
    },

    heights: function () {
      var ls = this.$store.getters.heights;
      return this.$route.params.poolid in ls
        ? ls[this.$route.params.poolid]
        : 0;
    },
    rewardstake: function () {
      var ls = this.$store.getters.rewardstake;
      if (this.genesis.epoch - 2 in ls) {
        return this.$route.params.poolid in ls[this.genesis.epoch - 2]
          ? ls[this.genesis.epoch - 2][this.$route.params.poolid]
          : 0;
      }
      return 0;
    },
    activestake: function () {
      var ls = this.$store.getters.activestake;
      return this.$route.params.poolid in ls
        ? ls[this.$route.params.poolid]
        : 0;
    },
    rewards: function () {
      var ls = this.$store.getters.rewards;
      return this.$route.params.poolid in ls
        ? ls[this.$route.params.poolid]
        : 0;
    },
    rewardsnp1: function () {
      var ls = this.$store.getters.activestake;
      return this.$route.params.poolid in ls
        ? ls[this.$route.params.poolid]
        : 0;
    },

    reward_address: function () {
      return this.poolstats.reward_address;
    },
    owners: function () {
      if (
        this.poolstats != null &&
        typeof this.poolstats.owners != "undefined"
      ) {
        return this.poolstats.owners;
      }
      return [];
    },
    refetch_watch: function () {
      return this.pool.poolpubkey;
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },

    saturationpoint: function () {
      return this.genesis.total_utxo / 500;
    },

    genesis: function () {
      return this.$store.getters.getGenesis;
    },
    isInactive: function () {
      return this.$store.getters.getIsInactive;
    },
    isSignedIn: function () {
      return this.$store.getters.getIsSignedIn;
    },

    pooladdstripes: function () {
      return false;
    },

    breadcrumbs: function () {
      return [
        {
          text: "Home",
          disabled: false,
          to: "/",
        },
        {
          text: this.$options.filters.ellipsiscrypto(
            this.$route.params.poolid,
            16
          ),
          disabled: true,
          to: "/pools/" + this.$route.params.poolid,
        },
      ];
    },

    userData: function () {
      return this.$store.getters.getUserData;
    },
    poolIsMine: function () {
      if (
        this.userData != null &&
        typeof this.userData.myPools != "undefined"
      ) {
        return (
          Object.keys(this.userData.myPools).indexOf(
            this.$route.params.poolid
          ) > -1
        );
      } else {
        return false;
      }
    },
  },
  async created() {},
  beforeDestroy() {},
  methods: {},
};
</script>
