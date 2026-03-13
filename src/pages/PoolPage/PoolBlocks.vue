<template>
  <div>
    <v-card :dark="nightmode">
      <v-card-title class="my-0 py-0">
        {{ $t("global.blocks") }}
        <v-spacer></v-spacer>
        <v-switch
          :color="nightmode ? 'blue darken-2' : 'blue lighten-1'"
          dense
          v-model="showPropDelay"
          label="Prop Delays"
          class="mx-2"
        ></v-switch>
        <v-spacer></v-spacer>
        <vue-numeric-input
          v-model="target_epoch"
          align="center"
          :min="1"
          :step="1"
        ></vue-numeric-input>
      </v-card-title>
      <v-data-table
        :dark="nightmode"
        must-sort
        :sort-by.sync="blocksSortBy"
        :sort-desc.sync="blocksSortDesc"
        :page.sync="blocksPage"
        :items-per-page.sync="blocksItemsPerPage"
        dense
        :headers="this.tableheaders"
        :items="blocks"
        item-key="hash"
        class="elevation-1"
        :footer-props="{
          'items-per-page-options': [5, 10, 50, 100],
        }"
      >
        <template #[`item.time`]="{ item }">
          {{ item.time | date("MMMM do yyyy, h:mm:ss a") }}
        </template>
        <template #[`item.competitive`]="{ item }">
          <span v-if="item.classification != null">
            <span v-if="item.classification == 'competitive'">
              <router-link
                style="text-decoration: none; color: inherit"
                text
                :to="{
                  name: 'recentBlocksHeight',
                  params: {
                    height: item.block,
                  },
                }"
              >
                <v-chip
                  style="cursor: pointer"
                  small
                  :color="item.slotBattle ? 'purple' : 'blue'"
                  ><v-icon left class="yellow--text">mdi-crown</v-icon
                  ><v-icon left>mdi-fencing</v-icon>
                  {{ item.slotBattle ? "SLOT" : "HEIGHT" }}
                  <v-icon right small>mdi-arrow-right-bold-circle</v-icon>
                </v-chip></router-link
              ></span
            ><span v-else>
              <router-link
                style="text-decoration: none; color: inherit"
                text
                :to="{
                  name: 'recentBlocksHeight',
                  params: {
                    height: item.block,
                  },
                }"
              >
                <v-chip style="cursor: pointer" small color="red"
                  ><v-icon left>mdi-silverware-fork</v-icon> FORKER
                  <v-icon right small>mdi-arrow-right-bold-circle</v-icon>
                </v-chip></router-link
              >
            </span>
          </span>
        </template>
        <template #[`item.hash`]="{ item }">
          <span v-if="item.hash != null">
            {{ item.hash | ellipsiscrypto }}
            <v-btn text x-small icon v-clipboard="item.hash">
              <v-icon x-small>mdi-content-copy</v-icon>
            </v-btn>
          </span>
        </template>
        <template #[`item.propdelay`]="{ item }">
          <prop-delay-chart
            :nightmode="nightmode"
            :block="item.block"
            :hash="item.hash"
          />
        </template>
        <template #[`item.explore`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                small
                @click="explore(item)"
                color="primary"
              >
                <v-icon dense medium>mdi-arrow-right-bold-circle</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("app.networkHealth.exploreBlock") }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-card :dark="nightmode" v-if="recent_blocks.length">
      <v-card-title class="my-0 py-0">
        {{ $t("app.networkHealth.exploreBlock") }}
      </v-card-title>
      <v-data-table
        :dark="nightmode"
        disable-pagination
        disable-sort
        hide-default-footer
        dense
        :headers="this.exploretableheaders"
        :items="recent_blocks"
        item-key="tkey"
        class="elevation-1"
      >
        <template #[`item.chained`]="{ item }">
          <v-icon color="success" v-if="item.chained">mdi-cube</v-icon>
          <v-icon color="error" v-else>mdi-cube-outline</v-icon>
        </template>
        <template #[`item.time`]="{ item }">
          {{ item.time | date("MMMM do yyyy, h:mm:ss a") }}
        </template>
        <template #[`item.hash`]="{ item }">
          <span v-if="item.hash != null">
            {{ item.hash | ellipsiscrypto }}
            <v-btn text x-small icon v-clipboard="item.hash">
              <v-icon x-small>mdi-content-copy</v-icon>
            </v-btn>
          </span>
        </template>
        <template #[`item.propdelay`]="{ item }">
          <prop-delay-chart
            v-if="item.chained"
            :nightmode="nightmode"
            :block="item.block"
            :hash="item.hash"
          />
        </template>

        <template #[`item.leaderPoolId`]="{ item }">
          {{ item.leaderPoolId | ellipsiscrypto }}
          <v-btn
            v-if="item.leaderPoolId"
            text
            x-small
            icon
            v-clipboard="item.leaderPoolId"
          >
            <v-icon x-small>mdi-content-copy</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <div id="exploreblock"></div>
  </div>
</template>

<script>
import VueNumericInput from "vue-numeric-input";
import { getPoolBlocks, searchBlocksByHeight } from "@/services/api";
import { mapPreferences } from "vue-preferences";
export default {
  props: ["nightmode", "pool", "userId", "genesis"],
  components: {
    VueNumericInput,
    PropDelayChart: () => import("@/components/PropDelayChart"),
  },
  data: function () {
    return {
      blocks_raw: {},
      showPropDelay: false,
      target_epoch: this.genesis.epoch,
      exploreblocks: [],
      exploreorphans: [],
      alertnote: null,
      blockSearch: "",
      blockscount: 0,
      blockscountoverall: 0,
    };
  },
  methods: {
    explore: async function (item) {
      try {
        const { data } = await searchBlocksByHeight(this.target_epoch, item.block);
        const a = [];
        const orphans = [];
        // API returns { blockHeight: { poolId: { hash: blockData } } }
        for (const [heightKey, poolsAtHeight] of Object.entries(data || {})) {
          if (poolsAtHeight === null || typeof poolsAtHeight !== "object") continue;
          const height = parseInt(heightKey, 10);
          if (height < item.block - 5 || height > item.block + 5) continue;
          for (const poolId of Object.keys(poolsAtHeight)) {
            if (poolId === "classification") continue;
            const byHash = poolsAtHeight[poolId];
            if (byHash && typeof byHash === "object") {
              for (const blockData of Object.values(byHash)) {
                if (blockData && typeof blockData === "object") {
                  blockData.tkey = `${blockData.block}-${blockData.hash}-${blockData.leaderPoolId || ""}`;
                  if (blockData.chained) {
                    a.push(blockData);
                  } else {
                    orphans.push(blockData);
                  }
                }
              }
            }
          }
        }
        this.exploreblocks = a.slice(0, 10);
        this.exploreorphans = orphans;
      } catch (e) {
        console.error("Failed to explore blocks", e);
      }
      this.$nextTick(() => {
        this.$vuetify.goTo("#exploreblock", {
          duration: 0,
        });
      });
    },

    resetFilters: function () {
      this.poolsRetired = false;
      this.poolsSearch = "";
    },

    clearSearch: function () {
      this.poolsSearch = "";
    },
    customSort(items) {
      return items;
    },
  },
  filters: {},
  watch: {
    refetch_watch: {
      immediate: true,
      async handler() {
        this.exploreorphans = [];
        this.exploreblocks = [];
        if (typeof this.pool !== "undefined") {
          try {
            const { data } = await getPoolBlocks(this.pool.pool_id, this.target_epoch);
            this.blocks_raw = data || {};
          } catch (e) {
            console.error("Failed to fetch pool blocks", e);
            this.blocks_raw = {};
          }
        }
      },
    },
  },
  computed: {
    network: function () {
      return this.$store.getters.getNetwork;
    },

    refetch_watch: function () {
      return this.pool.pool_id + this.target_epoch;
    },
    blocks: function () {
      var a = [];
      if (typeof this.blocks_raw != "undefined" && this.blocks_raw != null) {
        for (const value of Object.values(this.blocks_raw)) {
          a.push(value);
        }
      }
      return a;
    },
    isSignedIn: function () {
      return this.$store.getters.getIsSignedIn;
    },
    recent_blocks: function () {
      return this.exploreorphans
        .concat(this.exploreblocks)
        .sort((a, b) => (a.block > b.block ? 1 : -1))
        .filter((v, i, a) => a.findIndex((t) => t.hash === v.hash) === i);
    },
    ...mapPreferences({
      blocksPage: {
        defaultValue: 1,
      },
      blocksItemsPerPage: {
        defaultValue: 30,
      },
      blocksSortBy: {
        defaultValue: ["time"],
      },
      blocksSortDesc: {
        defaultValue: [true],
      },
    }),
    exploretableheaders: function () {
      var h = [
        {
          text: this.$t("global.blockNumber"),
          align: "left",
          sortable: false,
          value: "block",
        },
        {
          text: this.$t("global.chained"),
          align: "left",
          sortable: false,
          value: "chained",
        },
      ];
      var h2 = [
        {
          text: this.$t("global.poolName"),
          align: "left",
          sortable: false,
          value: "leaderPoolName",
        },
        {
          text: this.$t("global.poolID"),
          align: "left",
          sortable: false,
          value: "leaderPoolId",
        },
        {
          text: this.$t("global.epoch"),
          align: "left",
          sortable: false,
          value: "epoch",
        },
        {
          text: this.$t("global.slot"),
          align: "left",
          sortable: false,
          value: "slot",
        },
        {
          text: this.$t("global.time"),
          align: "left",
          sortable: false,
          value: "time",
        },
        {
          text: this.$t("global.hash"),
          align: "left",
          sortable: false,
          value: "hash",
        },
      ];
      if (this.showPropDelay) {
        return h
          .concat([
            {
              text: this.$t("app.networkHealth.propagationDelaysFor"),
              align: "left",
              width: 300,
              sortable: false,
              value: "propdelay",
            },
          ])
          .concat(h2);
      }

      return h.concat(h2);
    },
    tableheaders: function () {
      var h = [
        {
          text: this.$t("global.block"),
          align: "left",
          sortable: true,
          value: "block",
        },
        {
          text: this.$t("global.competitive"),
          align: "center",
          sortable: true,
          value: "competitive",
        },
        {
          text: this.$t("global.epoch"),
          align: "left",
          sortable: true,
          value: "epoch",
        },
        {
          text: this.$t("global.slot"),
          align: "left",
          sortable: true,
          value: "slot",
        },
      ];
      var h2 = [
        {
          text: this.$t("global.time"),
          align: "left",
          sortable: true,
          value: "time",
        },
        {
          text: this.$t("global.hash"),
          align: "left",
          sortable: true,
          value: "hash",
        },
        {
          text: this.$t("global.size"),
          align: "left",
          sortable: true,
          value: "size",
        },
        {
          text: this.$t("global.txCount"),
          align: "left",
          sortable: true,
          value: "transactions",
        },
        {
          text: this.$t("global.explore"),
          align: "end",
          sortable: false,
          value: "explore",
        },
      ];
      if (this.showPropDelay) {
        return h
          .concat([
            {
              text: this.$t("app.networkHealth.propagationDelaysFor"),
              align: "left",
              width: 300,
              sortable: false,
              value: "propdelay",
            },
          ])
          .concat(h2);
      }

      return h.concat(h2);
    },
  },
};
</script>

<style>
@keyframes shadow-pulse {
  0% {
    box-shadow: 0 0 0 0px rgba(0, 255, 0, 0.6);
  }

  100% {
    box-shadow: 0 0 0 15px rgba(0, 255, 0, 0);
  }
}

.vue-numeric-input .numeric-input {
  color: rgba(255, 255, 255, 0.7) !important;
}
.vue-numeric-input .btn-decrement .btn-icon:before {
  background-color: rgba(255, 255, 255, 0.7) !important;
}
.vue-numeric-input .btn-increment .btn-icon:before {
  background-color: rgba(255, 255, 255, 0.7) !important;
}
.highlight-refresh {
  animation: shadow-pulse 1s infinite;
}
</style>
