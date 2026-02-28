<template>
  <div>
    <v-card :dark="nightmode">
      <v-card-title class="">
        {{ $t("global.epoch") }} {{ $t("app.poolPageHistory.history") }}
      </v-card-title>

      <line-bar-chart
        class="ma-5 pb-10"
        :cdata="poolhistory"
        :options="poolhistoryoptions"
      ></line-bar-chart>
      <v-slider
        thumb-label="always"
        :label="this.$t('app.poolPageHistory.epochs')"
        thumb-color="primary secondary--text"
        v-model="nepochs"
        class="align-center ma-5"
        :max="maxepochs"
        :min="1"
        step="1"
        ticks="always"
        tick-size="4"
        hide-details
      >
        <template v-slot:thumb-label="props">
          {{ props.value + 1 }}
        </template>
      </v-slider>
      <v-data-table
        must-sort
        :sort-by.sync="poolepochsSortBy"
        :sort-desc.sync="poolepochsSortDesc"
        :page.sync="poolepochsPage"
        dense
        :dark="nightmode"
        :headers="epochstatsheaders"
        :items="merged_history"
        :items-per-page.sync="poolepochsPerPage"
        class="elevation-1"
        :footer-props="{
          'items-per-page-options': [5, 10, 50, 100],
        }"
      >
        <template #[`footer.prepend`]>
          <download-csv
            class="mx-2"
            :data="merged_history"
            :name="'poolRewards' + pool.poolpubkey + '.csv'"
          >
            <v-btn
              style="margin-top: 2px"
              block
              color="primary secondary--text"
              >{{ $t("app.addressDetail.downloadData") }}</v-btn
            >
          </download-csv></template
        >
        <template #[`item.epoch_blocks`]="{ item }">
          {{ item.epoch_blocks
          }}<span v-if="item.epoch_slots != null">/{{ item.epoch_slots }}</span>

          <span
            v-if="
              (item.epoch_slots != null) & (item.epoch_slots != 0) &&
              item.epoch_slots == item.epoch_blocks
            "
          >
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <span v-on="on">
                  <v-icon class="yellow--text text--darken-1 mb-1">{{
                    icons.mdiStarFace
                  }}</v-icon>
                </span>
              </template>
              <span>Perfect Epoch!</span>
            </v-tooltip>
          </span>
        </template>
        <template #[`item.blockstake`]="{ item }">
          {{ item.blockstake | toada | numFormat("0,0.0a") | zeronull }}
        </template>

        <template #[`item.epoch_rewards`]="{ item }">
          <span v-if="genesis.epoch - 1 == item.epoch">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span
                  v-bind="attrs"
                  v-on="on"
                  class="font-italic text--secondary"
                >
                  {{
                    item.epoch_rewards | toada | numFormat("0,0.0a") | zeronull
                  }}
                </span>
              </template>
              <span>{{ $t("global.forecasted") }}</span>
            </v-tooltip>
          </span>
          <span v-else>
            {{ item.epoch_rewards | toada | numFormat("0,0.0a") | zeronull }}
          </span>
        </template>
        <template #[`item.epoch_tax`]="{ item }">
          <span v-if="genesis.epoch - 1 == item.epoch">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span
                  v-bind="attrs"
                  v-on="on"
                  class="font-italic text--secondary"
                >
                  {{ item.epoch_tax | toada | numFormat("0,0.0a") | zeronull }}
                </span>
              </template>
              <span>{{ $t("global.forecasted") }}</span>
            </v-tooltip>
          </span>
          <span v-else>
            {{ item.epoch_tax | toada | numFormat("0,0.0a") | zeronull }}
          </span>
        </template>

        <template #[`item.blockspercent`]="{ item }">
          {{
            typeof overallepochstats == "undefined" ||
            typeof overallepochstats[item.epoch] == "undefined" ||
            overallepochstats[item.epoch]["blocks"] == 0
              ? null
              : (item.blocks / overallepochstats[item.epoch]["blocks"])
                | numFormat("0.000%")
          }}
        </template>

        <template #[`item.blockstakepercent`]="{ item }">
          {{
            typeof overallepochstats == "undefined" ||
            typeof overallepochstats[item.epoch] == "undefined" ||
            overallepochstats[item.epoch]["blockstake"] == 0
              ? null
              : (item.blockstake / overallepochstats[item.epoch]["blockstake"])
                | numFormat("0.000%")
          }}
        </template>
        <template #[`item.ros`]="{ item }">
          <span v-if="genesis.epoch - 1 == item.epoch">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span
                  v-bind="attrs"
                  v-on="on"
                  class="font-italic text--secondary"
                >
                  {{ item.ros | fpercent }}
                </span>
              </template>
              <span>{{ $t("global.forecasted") }}</span>
            </v-tooltip>
          </span>
          <span v-else-if="genesis.epoch != item.epoch">
            {{ item.ros | fpercent }}
          </span>
          <span v-else> </span>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { db } from "@/firebase";
import { mapPreferences } from "vue-preferences";
import { mdiStarFace } from "@mdi/js";
import numeral from "numeral";
export default {
  components: {
    LineBarChart: () => import("@/components/LineBarChart"),
  },

  props: ["nightmode", "pool", "userId", "genesis"],
  methods: {},
  data() {
    return {
      icons: {
        mdiStarFace,
      },
      slots_history: {},
      block_history: {},
      delegator_reward_history: {},
      pool_fee_history: {},
      ros_history: {},
      stake_history: {},
      poolepochsPage: 1,
      nepochs: 3,
      pool_epoch_data: [],
      pool_graph_data: [],
      epochstatsheaders: [
        {
          text: this.$t("global.epoch"),
          align: "center",
          sortable: true,
          value: "epoch",
        },
        {
          text: this.$t("global.blocks"),
          align: "center",
          sortable: true,
          value: "epoch_blocks",
        },

        {
          text: this.$t("global.stake"),
          align: "right",
          sortable: true,
          value: "blockstake",
        },

        {
          text: this.$t("app.poolPageHistory.delegatorRewards"),
          align: "right",
          sortable: true,
          value: "epoch_rewards",
        },
        {
          text: this.$t("global.epochPoolFees"),
          align: "right",
          sortable: true,
          value: "epoch_tax",
        },
        {
          text: this.$t("global.ros") + " %",
          align: "right",
          sortable: true,
          value: "ros",
        },
      ],
      poolhistoryoptions: {
        animation: {
          duration: 0,
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#fff",
            },
          },
          datalabels: {
            display: false,
          },
          tooltip: {
            enabled: true,
            mode: "index",
            intersect: true,
            callbacks: {
              label: function (context) {
                var label = context.dataset.label;
                if (label) {
                  label += ": ";
                }
                if (context.datasetIndex == 0) {
                  label += numeral(context.raw / 1000000).format("0,0.0a");
                  return label;
                } else {
                  return label + numeral(context.raw).format("0.0%");
                }
              },
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("global.epoch"),
            },
          },
          y: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            min: 0,
            type: "linear",
            position: "right",
            ticks: {
              color: "#fff",
              callback: function (value) {
                return numeral(value / 1000000).format("0,0.0a");
              },
            },
            title: {
              color: "#fff",
              display: true,
              text: this.$t("global.stake"),
            },
          },
          y1: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            type: "linear",
            min: 0,
            max: 0.25,
            ticks: {
              color: "#fff",
              callback: function (value) {
                return numeral(value).format("0%"); // * 100 //numeral(value * 100) //.format("0,0.0a")
              },
            },
            position: "left",
            title: {
              color: "#fff",
              display: true,
              text: this.$t("global.ros"),
            },
          },
        },

        type: "bar",
        options: {
          responsive: true,
          title: {
            display: true,
            text: "Chart.js Combo Bar Line Chart",
          },
          tooltips: {
            mode: "index",
            intersect: true,
          },
        },
      },
    };
  },
  filters: {},
  computed: {
    network: function () {
      return this.$store.getters.getNetwork;
    },

    merged_history: function () {
      var a = [];
      if (
        this.block_history != null &&
        this.stake_history != null &&
        this.delegator_reward_history != null &&
        this.pool_fee_history != null &&
        this.ros_history != null
      ) {
        for (const [key, value] of Object.entries(this.block_history)) {
          var entry = {
            epoch: key,
            epoch_blocks: value,
            epoch_slots:
              typeof this.slots_history[key] == "undefined"
                ? null
                : this.slots_history[key].slots,
            blockstake:
              this.stake_history[key] == null ? 0 : this.stake_history[key],
            epoch_rewards:
              this.delegator_reward_history[key] == null
                ? 0
                : this.delegator_reward_history[key],
            epoch_tax:
              this.pool_fee_history[key] == null
                ? 0
                : this.pool_fee_history[key],
            ros:
              this.ros_history[key] == null ? 0 : this.ros_history[key] / 100,
          };
          a.push(entry);
        }
      }

      return a.sort((a, b) => (parseInt(a.epoch) > parseInt(b.epoch) ? 1 : -1));
    },
    maxepochs: function () {
      if (typeof this.genesis.epoch == "undefined") {
        return 10;
      }
      var total = this.genesis.epoch - (this.network == "Mainnet" ? 213 : 114);
      return Math.min(total, 29);
    },
    ...mapPreferences({
      poolepochsPerPage: {
        defaultValue: 5,
      },
      poolepochsSortBy: {
        defaultValue: ["epoch"],
      },
      poolepochsSortDesc: {
        defaultValue: [false],
      },
    }),
    poolhistory: function () {
      var last30 = this.merged_history.slice(-30);
      var labels = last30.map((a) => a.epoch);
      var stakehistory = {
        type: "line",
        label: this.$t("global.stake"),
        borderColor: "#1f78b4",

        borderWidth: 2,
        fill: true,
        data: last30.map((a) => a.blockstake),
        order: 3,
        yAxisID: "y",
      };
      var roihistory = {
        type: "bar",
        label: this.$t("global.ros"),
        borderColor: "rgba(251,154,153,0.9)",
        backgroundColor: "rgba(251,154,153,0.9)",
        borderWidth: 2,
        clip: 0,
        data: last30.map((a) => a.ros),
        order: 2,

        yAxisID: "y1",
      };
      var roitrend = {
        type: "line",
        label:
          String(this.nepochs + 1) +
          " " +
          this.$t("app.poolPageHistory.epochTrend"),
        borderColor: "#33a02c",
        borderWidth: 2,
        pointRadius: 0,
        clip: 0,
        data: [],
        order: 1,
        fill: false,
        yAxisID: "y1",
      };
      var trendline = [];
      for (const epochdata of this.merged_history.slice(-30).filter(
        (a) => a.epoch < this.genesis.epoch
      )) {
        trendline.push(epochdata.ros);
        if (trendline.length > this.nepochs + 1) {
          trendline.shift();
        }
        if (trendline.length == this.nepochs + 1) {
          roitrend["data"].push(
            trendline.reduce((a, b) => a + b, 0) / trendline.length
          );
        } else {
          roitrend["data"].push(null);
        }
      }

      return {
        labels: labels,
        datasets: [stakehistory, roihistory, roitrend], //, roihistory, roitrend],
      };
    },
  },
  watch: {
    pool: {
      // call it upon creation too
      immediate: true,
      handler(pool) {
        this.$rtdbBind(
          "block_history",
          db.ref(this.network + "/pool_stats/" + pool.poolpubkey + "/blocks")
        );
        this.$rtdbBind(
          "slots_history",
          db.ref(
            this.network + "/pool_stats/" + pool.poolpubkey + "/assigned_slots"
          )
        );
        this.$rtdbBind(
          "delegator_reward_history",
          db.ref(
            this.network +
              "/pool_stats/" +
              pool.poolpubkey +
              "/delegators_rewards"
          )
        );
        this.$rtdbBind(
          "pool_fee_history",
          db.ref(this.network + "/pool_stats/" + pool.poolpubkey + "/pool_fees")
        );
        this.$rtdbBind(
          "ros_history",
          db.ref(this.network + "/pool_stats/" + pool.poolpubkey + "/ros")
        );
        this.$rtdbBind(
          "stake_history",
          db.ref(this.network + "/pool_stats/" + pool.poolpubkey + "/stake")
        );
      },
    },
  },
  created() {
    if (this.poolepochsPerPage == null) this.poolepochsPerPage = 5;
    if (this.poolepochsSortBy == null) this.poolepochsSortBy = ["epoch"];
    if (this.poolepochsSortDesc == null) this.poolepochsSortDesc = [false];
  },
};
</script>

<style scoped>
</style>
