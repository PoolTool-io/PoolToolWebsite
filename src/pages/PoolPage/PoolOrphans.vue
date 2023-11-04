<template>
  <div>
    <v-card :dark="nightmode">
      <v-card-title class="my-0 py-0">
        {{ $t("global.orphans") }}
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
        :sort-by.sync="orphansSortBy"
        :sort-desc.sync="orphansSortDesc"
        dense
        :headers="this.tableheaders"
        :items="blocks"
        item-key="hash"
        class="elevation-1"
        :footer-props="{
          'items-per-page-options': [5, 10, 20, 30, 40, 50, 100],
        }"
      >
        <template #[`item.chained`]="{ item }">
          <v-icon color="success" v-if="item.chained">mdi-cube</v-icon>
          <v-icon color="error" v-else>mdi-cube-outline</v-icon>
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
                  small
                  class="mr-3"
                  :color="item.slotBattle ? 'purple' : 'blue'"
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
        <template #[`item.time`]="{ item }">
          {{ item.time | date("MMMM do yyyy, h:mm:ss a") }}
        </template>
        <template #[`item.propdelay`]="{ item }">
          <prop-delay-chart
            :nightmode="nightmode"
            :block="item.block"
            :hash="item.hash"
          />
        </template>
        <template #[`item.hash`]="{ item }">
          <span v-if="item.hash != null">
            {{ item.hash | ellipsiscrypto }}
            <v-btn text x-small icon v-clipboard="item.hash">
              <v-icon x-small>mdi-content-copy</v-icon>
            </v-btn>
          </span>
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
            <span>{{ $t("app.poolOrphans.exploreOrphan") }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
    <v-card :dark="nightmode" v-if="recent_blocks.length" class="mt-1">
      <v-card-title class="mt-0 py-0">
        {{ $t("app.poolOrphans.exploreOrphan") }}
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
import { db } from "@/firebase";
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
  filters: {
    formattitle: function (item) {
      if (item.pool_name == "") {
        item.pool_name = item.pool_md_name;
      }
      return item.pool_name;
    },
  },
  watch: {
    refetch_watch: {
      // call it upon creation too
      immediate: true,
      handler() {
        this.exploreorphans = [];
        this.exploreblocks = [];
        if (typeof this.pool !== "undefined") {
          this.$rtdbBind(
            "blocks_raw",
            db.ref(
              this.network +
                "/pool_deleted_blocks/" +
                this.pool.poolpubkey +
                "/" +
                this.target_epoch
            )
          ); //.startAt(this.blocksPage * this.blocksItemsPerPage).orderByChild(this.blocksSortBy[0]).limitToLast(this.blocksItemsPerPage)
        }
      },
    },
  },
  methods: {
    explore: function (item) {
      db.ref(this.network + "/blocks/" + this.target_epoch)
        .orderByKey()
        .startAt((item.block - 5).toString())
        .limitToFirst(10)
        .once("value", (snapshot) => {
          var a = [];
          for (const value of Object.values(snapshot.val())) {
            value["chained"] = true;

            a.push(value);
          }
          this.exploreblocks = a;
        });

      db.ref(this.network + "/deleted_blocks/" + this.target_epoch)
        .orderByKey()
        .startAt((parseInt(item.block) - 5).toString())
        .endAt((parseInt(item.block) + 5).toString())
        .once("value", (snapshot) => {
          var a = [];
          const orph = snapshot.val();
          if (orph != null) {
            for (const value of Object.values(orph)) {
              value["chained"] = false;
              a.push(value);
            }
          }
          this.exploreorphans = a;
        });
      this.$nextTick(() => {
        this.$vuetify.goTo("#exploreblock", { duration: 0 });
      });
    },
    refetch: function () {
      // this.$apollo.queries.blocks.refetch();
      // this.$apollo.queries.blockscount.refetch();
      // this.$apollo.queries.blockscountoverall.refetch();
    },

    clearSearch: function () {
      this.poolsSearch = "";
    },
    customSort(items) {
      return items;
    },
  },
  computed: {
    network: function () {
      return this.$store.getters.getNetwork;
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
    refetch_watch: function () {
      return this.pool.poolpubkey + this.target_epoch;
    },
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
          text: this.$t("global.slotNo"),
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
      orphansPage: {
        defaultValue: 1,
      },
      orphansItemsPerPage: {
        defaultValue: 30,
      },
      orphansSortBy: {
        defaultValue: ["time"],
      },
      orphansSortDesc: {
        defaultValue: [true],
      },
    }),

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
