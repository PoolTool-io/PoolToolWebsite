<template>
  <div>
    <v-card :dark="nightmode">
      <v-card-title class=""
        >{{ $t("app.poolPage.curves") }}<v-spacer />
        <v-switch
          dense
          inset
          hide-details
          v-model="minFee"
          :label="
            minFee
              ? $t('app.saturationcurve.use30ADAminfee')
              : $t('app.saturationcurve.usepoolminfee')
          "
          class="mx-2 py-0 my-0"
        ></v-switch
        ><v-spacer />
      </v-card-title>
      <v-card-text>
        <line-bar-chart
          class="mx-5 pb-10"
          :cdata="simulateRewards"
          :options="curveplotoptions"
        ></line-bar-chart>
      </v-card-text>
      {{ simulateRewards["datasets"]["vline"] }}
    </v-card>
  </div>
</template>

<script>
import numeral from "numeral";
export default {
  props: ["genesis", "pool", "nightmode"],
  components: {
    LineBarChart: () => import("@/components/LineBarChart"),
  },
  data() {
    return {
      minFee: false,
      transparency: 0.7,
      curveplotoptions: {
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
            mode: "index",
            intersect: true,
            callbacks: {
              label: function (context) {
                var label = context.dataset.label;
                if (label) {
                  label += ": ";
                }
                if (context.datasetIndex == 2) {
                  return null;
                }
                return label + numeral(context.raw).format("0.00%");
              },
            },
          },
        },

        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: {
            min: 0,

            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
            },
            display: true,
            title: {
              display: true,
              color: "#fff",
              text: this.$t("global.stake") + " (Millions)",
            },
          },

          yAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            min: 0,
            id: "ros",
            position: "left",
            ticks: {
              beginAtZero: true,
              color: "#fff",
              //max: 0.25,
              callback: function (value) {
                return numeral(value).format("0.00%");
              },
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("global.ros"),
            },
          },
          yAxes1: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              beginAtZero: true,
              color: "#fff",
              fontSize: 12,
            },
            min: 0,
            max: 1,
            type: "linear",
            display: false,
            position: "right",
            id: "y-axis-2",
          },
        },
        type: "bar",
      },
    };
  },
  computed: {
    simulateRewards: function () {
      var retdata = {
        labels: [],
        datasets: [],
      };
      var kvals = [750, 500];
      var kvallabel = ["K=750 (proposed by IOG)", "K=500(current)"];
      var hereline = [];
      var chartcolors = [
        "rgb(255,127,0," + this.transparency + ")",
        "rgb(31,120,180," + this.transparency + ")",
      ];
      var txfees = 120000e6;
      var total_expected_blocks = 432000 * 0.05; //* (this.genesis.livedata1.decentralisationParam)

      var total_epoch_blocks = total_expected_blocks;
      total_epoch_blocks = 21048;
      var rewardpot = parseInt(
        (this.genesis.livedata1.reserves *
          (total_epoch_blocks / total_expected_blocks) *
          this.genesis.livedata1.rho +
          txfees) *
          (1 - this.genesis.livedata1.tau)
      );
      var term1 = rewardpot;
      var total_supply = 45e15 - this.genesis.livedata1.reserves;
      for (var kindex in kvals) {
        retdata["datasets"][kindex] = {
          type: "line",
          label: kvallabel[kindex],
          borderColor: chartcolors[kindex],
          backgroundColor: chartcolors[kindex],
          borderWidth: 5,
          pointRadius: 2,
          clip: 0,
          fill: false,
          data: [],
          order: 2 - kindex,
          yAxisID: "yAxes",
          xAxisID: "xAxes",
        };
        var termz0 = 1 / kvals[kindex];
        var sprime = Math.min(this.pool.poolpledge / total_supply, termz0);
        for (var i = 0; i < 75; i = i + 0.5) {
          if (kvals[kindex] == 500) {
            retdata["labels"].push(i);
            if (
              this.pool.livestake > i * 1e12 &&
              this.pool.livestake <= (i + 0.5) * 1e12
            ) {
              hereline.push(1);
            } else {
              hereline.push(0);
            }
          }
          var sigmaprime = Math.min((i * 1e12) / total_supply, termz0);

          var expected_blocks =
            ((i * 1e12) / this.genesis.livedata2.total_blockstake) *
            total_expected_blocks;

          var pledgemultiplier = 1;

          var thisoptimalrewards =
            pledgemultiplier *
            ((((sigmaprime - (1 - sigmaprime / termz0) * sprime) / termz0) *
              sprime *
              this.genesis.livedata1.a0 +
              sigmaprime) *
              term1);

          var performance_adjusted_optimal_rewards = thisoptimalrewards;

          var pool_cost_to_use =
            this.minFee && kindex == 0 ? 30000000 : this.pool.poolcost;
          var adjusted_pool_cost_to_use =
            expected_blocks < 1
              ? pool_cost_to_use * expected_blocks
              : pool_cost_to_use;

          var afterfixedcostrewards = Math.max(
            0,
            performance_adjusted_optimal_rewards - adjusted_pool_cost_to_use
          );
          var pool_margin_fees = afterfixedcostrewards * this.pool.poolmargin;
          var aftervariablecostrewards =
            afterfixedcostrewards - pool_margin_fees;
          var calc_roi =
            i > 0 ? this.roi(aftervariablecostrewards / (i * 1e12)) : 0;

          retdata["datasets"][kindex]["data"].push(calc_roi);
        }
      }
      retdata["datasets"][2] = {
        type: "bar",
        legend: { hidden: true },
        yAxisID: "yAxes1",
        xAxisID: "xAxes",
        label: this.pool.ticker,
        backgroundColor: "rgb(255,0,0," + this.transparency + ")",
        borderColor: "rgb(255,0,0," + this.transparency + ")",
        data: hereline,
      };
      return retdata;
    },
  },
  methods: {
    roi: function (roi) {
      return Math.pow(roi + 1, 365 / 5) - 1;
    },
    roismallpool: function (roi, daysbetweeblocks) {
      return Math.pow(roi + 1, 365 / daysbetweeblocks) - 1;
    },
  },
};
</script>
