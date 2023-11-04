<template>
  <div v-if="pool != null">
    <v-card :dark="nightmode">
      <v-card-title class="">
        {{ $t("app.poolPage.metrics") }}
      </v-card-title>
      <v-row>
        <v-col
          v-if="graph_producer_meta.loaded && network == 'Mainnet'"
          cols="12"
          xs="12"
          sm="12"
          md="3"
          lg="3"
          class=""
        >
          <h2 class="text-center pt-5">
            {{ $t("global.all") }}
            {{ $t("app.poolMetrics.propagationDelays") }}
            {{ $t("app.poolMetrics.producer") }}
          </h2>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <h4 v-bind="attrs" v-on="on" class="text-center">
                {{ $t("app.poolMetrics.average") }}:
                {{ parseInt(graph_producer_meta.avg) }} ms
              </h4>
            </template>
            <p class="mx-2">
              {{ $t("app.poolMetrics.thisIsHowFastYourBlocks") }}.
              {{ graph_producer_meta.unique_pools }} Pools Reported,
              {{ graph_producer_meta.datapoints | numFormat("0,0.") }}
              Datapoints
            </p>
          </v-tooltip>

          <bar-chart
            class="ma-2"
            :chartData="graph_producer"
            :chartOptions="propdelaysoptions"
          ></bar-chart>
        </v-col>
        <v-col
          v-if="graph_receiver_meta.loaded && network == 'Mainnet'"
          cols="12"
          xs="12"
          sm="12"
          md="3"
          lg="3"
        >
          <h2 class="text-center pt-5">
            {{ $t("global.all") }}
            {{ $t("app.poolMetrics.propagationDelays") }}
            {{ $t("app.poolMetrics.receiver") }}
          </h2>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <h4 v-bind="attrs" v-on="on" class="text-center">
                {{ $t("app.poolMetrics.average") }}:
                {{ parseInt(graph_receiver_meta.avg) }} ms
              </h4>
            </template>
            <p class="mx-2">
              {{ $t("app.poolMetrics.thisIsHowFastYourPool") }}.
              {{ graph_receiver_meta.unique_pools }} Pools Reported,
              {{ graph_receiver_meta.datapoints | numFormat("0,0.") }}
              Datapoints
            </p>
          </v-tooltip>

          <bar-chart
            class="ma-2"
            :chartData="graph_receiver"
            :chartOptions="propdelayrxsoptions"
          ></bar-chart>
        </v-col>
        <v-col
          cols="12"
          xs="12"
          sm="12"
          :md="network == 'Mainnet' ? 6 : 12"
          :lg="network == 'Mainnet' ? 6 : 12"
        >
          <h2 class="text-center pt-5">
            <span v-if="pool.ticker != ''">{{ pool.ticker }}: </span
            >{{ $t("global.epoch") }} {{ genesis.epoch }}
            {{ $t("app.poolMetrics.expectedBlocks") }}
          </h2>
          <bar-chart
            class="ma-2"
            :chartData="graph_expected"
            :chartOptions="probabilityoptions"
          ></bar-chart>
        </v-col>
      </v-row>
      <div class="text-caption pa-2">
        NOTE: Reports greater than 5 seconds after slot time or less than 5
        seconds before slot time are aggregated together at the 5 second mark.
      </div>
    </v-card>
  </div>
</template>

<script>
var pmf = require("@stdlib/stats-base-dists-binomial-pmf");
export default {
  props: ["nightmode", "pool", "userId", "genesis"],
  components: {
    BarChart: () => import("@/components/BarChart"),
  },
  data() {
    return {
      pdata: {},
      graph_producer: {},
      graph_receiver: {},
      graph_producer_meta: {
        avg: 0,
        unique_pools: 0,
        datapoints: 0,
        loaded: false,
      },
      graph_receiver_meta: {
        avg: 0,
        unique_pools: 0,
        datapoints: 0,
        loaded: false,
      },
      propdelaysoptions: {
        plugins: {
          datalabels: {
            display: false,
          },
          legend: {
            display: false,
          },
        },

        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
            },
            ticks: {
              color: "#fff",
              beginAtZero: true,
            },
            title: {
              color: "#fff",
              display: true,
              text: this.$t("app.networkHealth.nodesReporting"),
            },
          },

          xAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
            },
            ticks: {
              color: "#fff",
              beginAtZero: true,
              callback: function (value) {
                return this.getLabelForValue(value);
              },
            },
            title: {
              color: "#fff",
              display: true,
              text: this.$t("app.poolMetrics.msDelayFromSlotTime"),
            },
          },
        },
      },
      propdelayrxsoptions: {
        plugins: {
          datalabels: {
            display: false,
          },
          legend: {
            display: false,
          },
        },

        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
            },
            ticks: {
              color: "#fff",
              beginAtZero: true,
            },
            title: {
              color: "#fff",
              display: true,
              text: this.$t("app.poolMetrics.blocksReceived"),
            },
          },

          xAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
            },
            ticks: {
              color: "#fff",
              beginAtZero: true,
              callback: function (value) {
                return this.getLabelForValue(value);
              },
            },
            title: {
              color: "#fff",
              display: true,
              text: this.$t("app.poolMetrics.msDelayFromSlotTime"),
            },
          },
        },
      },
      probabilityoptions: {
        aspectRatio: 2,
        plugins: {
          datalabels: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context) {
                var retval = "";
                // if (
                //   data.datasets[tooltipItem.datasetIndex].data[
                //     tooltipItem.index
                //   ].k > 0
                // ) {
                retval =
                  retval +
                  "\n" +
                  (
                    100 * context.dataset.data[context.dataIndex].cumprob
                  ).toFixed(2) +
                  "% " +
                  this.$t("app.poolMetrics.chanceOf") +
                  " " +
                  context.label +
                  " " +
                  this.$t("app.poolMetrics.orMoreBlocks");
                //}
                return retval;
              }.bind(this),
              title: function (context) {
                return (
                  (100 * parseFloat(context[0].formattedValue)).toFixed(0) +
                  "% " +
                  this.$t("app.poolMetrics.chanceOf") +
                  " " +
                  context[0].label +
                  " " +
                  this.$t("global.blocks")
                );
              }.bind(this),
            },
          },
          legend: {
            display: true,
            labels: {
              color: "#fff",
            },
          },
        },

        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
            },
            ticks: {
              color: "#fff",
              display: true,
              beginAtZero: true,
              callback: function (value) {
                return (100 * value).toFixed(0) + "%";
              },
            },
            title: {
              color: "#fff",
              display: true,
              text: this.$t("app.poolMetrics.chance"),
            },
          },

          x: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
            },
            ticks: {
              color: "#fff",
              beginAtZero: true,
              callback: function (value) {
                return this.getLabelForValue(value);
              },
            },
            title: {
              color: "#fff",
              display: true,
              text: this.$t("app.poolMetrics.blocksInEpoch"),
            },
          },
        },
      },
    };
  },
  computed: {
    network: function () {
      return this.$store.getters.getNetwork;
    },
    poolpubkey: function () {
      return this.pool.poolpubkey;
    },
    graph_expected: function () {
      var p = this.pool.blockstake / this.genesis.livedata2.total_blockstake;

      var n = parseInt(
        (this.genesis.epochLength - this.genesis.slot_in_epoch) *
          this.genesis.activeSlotCoeff
      );

      var nstart = parseInt(
        this.genesis.epochLength * this.genesis.activeSlotCoeff
      );

      var dvalues = [],
        svalues = [],
        labels = [];
      var probstart = 0,
        prob = 0;
      var cumprobstart = 0;
      var cumprob = 0;
      var epoch_blocks =
        this.pool.epochBlocksEpoch == this.genesis.epoch
          ? this.pool.epoch_blocks
          : 0;

      for (var k = 500; k >= 0; k--) {
        if (k - epoch_blocks >= 0) {
          prob = pmf(k - epoch_blocks, n, p);
        } else {
          prob = 0;
        }

        probstart = pmf(k, nstart, p);

        if (isFinite(prob) && !isNaN(prob)) {
          cumprob += prob;
        }
        if (isFinite(probstart) && !isNaN(probstart)) {
          cumprobstart += probstart;
        }

        if (
          (isFinite(prob) && !isNaN(prob) && prob > 0.01) ||
          (isFinite(probstart) && !isNaN(probstart) && probstart > 0.01)
        ) {
          labels.push(k);
          dvalues.push({
            y: prob,
            x: k, //Math.max(0, k - epoch_blocks) + epoch_blocks,

            cumprob: cumprob,
          });
          svalues.push({ y: probstart, x: k, cumprob: cumprobstart });
        }
      }
      return {
        labels: labels.reverse(),
        datasets: [
          {
            backgroundColor: "rgb(54, 162, 235,0.5)",
            pointBackgroundColor: "white",
            borderWidth: 1,
            label: this.$t("app.poolMetrics.realtimeAdjusted"),
            pointBorderColor: "rgb(54, 162, 235,0.5)",
            data: dvalues.reverse(),
            yAxisID: "y",
            xAxisID: "x",
          },
          {
            backgroundColor: "rgb(255, 99, 132,0.3)",
            pointBackgroundColor: "white",
            borderWidth: 1,
            label: this.$t("app.poolMetrics.expected"),
            pointBorderColor: "rgb(255, 99, 132,0.3)",
            data: svalues.reverse(),
            yAxisID: "y",
            xAxisID: "x",
          },
        ],
      };
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    cancelAutoUpdate() {
      clearInterval(this.timer);
    },
    async fetchPeriodicData() {
      if (this.network == "Mainnet") {
        var self = this;

        this.getJSON(
          "https://s3-us-west-2.amazonaws.com/data.pooltool.io/stats/pools/" +
            this.pool.poolpubkey +
            "/by_producer.json?t=" +
            Date.now(),
          function (err, thisdata) {
            if (err !== null) {
              console.log("Something went wrong: " + err);
            } else {
              self.graph_producer_meta = {
                loaded: true,
                avg: thisdata["avg"],
                unique_pools: thisdata["unique_pools"],
                datapoints: thisdata["datapoints"],
              };
              self.graph_producer = {
                labels: thisdata["hist"][1],
                datasets: [
                  {
                    gradientColor: "green",
                    data: thisdata["hist"][0],
                  },
                ],
              };
            }
          }
        );

        this.getJSON(
          "https://s3-us-west-2.amazonaws.com/data.pooltool.io/stats/pools/" +
            this.pool.poolpubkey +
            "/by_receiver.json?t=" +
            Date.now(),
          function (err, thisdata) {
            if (err !== null) {
              console.log("Something went wrong: " + err);
            } else {
              self.graph_receiver_meta = {
                loaded: true,
                avg: thisdata["avg"],
                unique_pools: thisdata["unique_pools"],
                datapoints: thisdata["datapoints"],
              };
              self.graph_receiver = {
                labels: thisdata["hist"][1],
                datasets: [
                  {
                    gradientColor: "green",
                    data: thisdata["hist"][0],
                  },
                ],
              };
            }
          }
        );
      }
    },
  },
  watch: {
    poolpubkey: {
      // call it upon creation too
      immediate: true,
      handler(v) {
        if (v != null) {
          this.fetchPeriodicData();
        }
      },
    },
  },
  created() {
    this.timer = setInterval(this.fetchPeriodicData, 3000000);
  },
};
</script>
