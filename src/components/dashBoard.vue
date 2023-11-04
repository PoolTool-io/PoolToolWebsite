<template>
  <div>
    <v-row>
      <v-col class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <price-chart :ismobile="ismobile" :nightmode="nightmode" />
      </v-col>
      <v-col cols="12" class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <v-card class="mt-5" elevation="2" :dark="nightmode" height="100%">
          <div class="pt_form_title">
            {{
              displayedPortfolioPieDataSelector == "claimed"
                ? "Claimed Addresses"
                : "Favorite Addresses"
            }}
            Portfolio
          </div>

          <v-card-text>
            <pie-chart
              v-if="
                poolPortfolio != null &&
                poolPortfolio.labels.length &&
                poolPortfolio.datasets.length &&
                typeof poolPortfolio.datasets[0] != undefined &&
                typeof poolPortfolio.datasets[0].data != undefined &&
                poolPortfolio.datasets[0].data.length
              "
              :width="chartScale"
              :height="chartScale"
              class=""
              :chart-data="poolPortfolio"
              datakey="main"
              :options="portfoliopieoptions"
            />

            <div
              class="pie_options d-flex justify-center pb-2"
              v-if="isSignedIn && Object.keys(this.livedatafaves).length > 0"
            >
              <v-btn-toggle
                dark
                v-model="portfolioPieDataSelector"
                rounded
                mandatory
              >
                <v-btn value="claimed" x-small dark> Claimed </v-btn>
                <v-btn value="favorite" x-small dark> Favorites </v-btn>
              </v-btn-toggle>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <v-card class="mt-5" elevation="2" :dark="nightmode" height="100%">
          <div class="pt_form_title">
            {{
              displayedRosPieDataSelector == "claimed"
                ? "Claimed Addresses"
                : "Favorite Addresses"
            }}
            Rewards (Epoch {{ viewepoch }})
          </div>

          <v-card-text>
            <pie-chart
              v-if="
                rewardPortfolio != null &&
                rewardPortfolio.labels.length &&
                rewardPortfolio.datasets.length &&
                typeof rewardPortfolio.datasets[0] != undefined &&
                typeof rewardPortfolio.datasets[0].data != undefined &&
                rewardPortfolio.datasets[0].data.length
              "
              :width="chartScale"
              :height="chartScale"
              class=""
              :chart-data="rewardPortfolio"
              datakey="main"
              :options="portfoliopieoptions"
            />

            <div
              class="pie_options d-flex justify-center pb-2"
              v-if="isSignedIn && Object.keys(this.livedatafaves).length > 0"
            >
              <v-btn-toggle dark v-model="rosPieDataSelector" rounded mandatory>
                <v-btn value="claimed" x-small dark> Claimed </v-btn>
                <v-btn value="favorite" x-small dark> Favorites </v-btn>
              </v-btn-toggle>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="showZapierPost">
      <v-col cols="12" class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
        <zapier-post :nightmode="nightmode" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import numeral from "numeral";
import colors from "@/mixins/colors";
export default {
  props: ["nightmode", "ismobile", "livedatamy", "livedatafaves"],
  components: {
    PieChart: () => import("@/components/PieChart"),
    PriceChart: () => import("@/components/PriceChart"),
    zapierPost: () => import("@/components/zapierPost"),
    // PoolStatistics: () => import("@/components/dashboard/PoolStatistics.vue"),
    // TopTenStakeInflows: () =>
    //   import("@/components/dashboard/TopTenStakeInflows.vue"),
  },
  mixins: [colors],
  data() {
    return {
      tab: "addresses",
      chartScale: 300,
      portfolioPieDataSelector: "favorite",
      rosPieDataSelector: "favorite",
    };
  },

  computed: {
    displayedPortfolioPieDataSelector: function () {
      if (this.portfolioPieDataSelector == "claimed" && this.isSignedIn) {
        return "claimed";
      } else if (
        this.portfolioPieDataSelector == "favorite" ||
        !this.isSignedIn
      ) {
        if (
          this.livedatafaves != null &&
          Object.keys(this.livedatafaves).length
        ) {
          return "favorite";
        } else {
          if (this.isSignedIn) {
            return "claimed";
          } else {
            return "";
          }
        }
      } else {
        return "";
      }
    },
    displayedRosPieDataSelector: function () {
      if (this.rosPieDataSelector == "claimed" && this.isSignedIn) {
        return "claimed";
      } else if (this.rosPieDataSelector == "favorite" || !this.isSignedIn) {
        if (
          this.livedatafaves != null &&
          Object.keys(this.livedatafaves).length > 0
        ) {
          return "favorite";
        } else {
          if (this.isSignedIn) {
            return "claimed";
          } else {
            return "";
          }
        }
      } else {
        return "";
      }
    },
    isSignedIn: function () {
      return this.$store.getters.getIsSignedIn;
    },
    userType: function () {
      return this.$store.getters.getUserType;
    },
    userDataPriv: function () {
      return this.$store.getters.getUserDataPriv;
    },
    showZapierPost: function () {
      if (
        this.userType == "Operator" &&
        typeof this.userDataPriv.myZapierEnablePost != "undefined" &&
        this.userDataPriv.myZapierEnablePost &&
        typeof this.userDataPriv.myZapierApiKey != "undefined"
      ) {
        return true;
      } else {
        return false;
      }
    },
    viewepoch: function () {
      return this.$store.getters.getNewRewardsCompleteEpoch;
    },
    rewardsByPool: function () {
      if (this.displayedRosPieDataSelector == "favorite") {
        if (this.livedatafaves != null) {
          return Array.from(
            Object.values(this.livedatafaves)
              .map((x) => {
                return {
                  ticker:
                    x.delegatedToTicker == ""
                      ? x.delegatedTo
                      : x.delegatedToTicker,
                  value: x.stakeRewards + x.operatorRewards,
                };
              })
              .reduce(
                (m, { ticker, value }) =>
                  m.set(ticker, (m.get(ticker) || 0) + value),
                new Map()
              ),
            ([name, value]) => ({ name, value })
          );
        } else {
          return [];
        }
      } else {
        if (this.livedatamy != null) {
          return Array.from(
            Object.values(this.livedatamy)
              .map((x) => {
                return {
                  ticker:
                    x.delegatedToTicker == ""
                      ? x.delegatedTo
                      : x.delegatedToTicker,
                  value: x.stakeRewards + x.operatorRewards,
                };
              })
              .reduce(
                (m, { ticker, value }) =>
                  m.set(ticker, (m.get(ticker) || 0) + value),
                new Map()
              ),
            ([name, value]) => ({ name, value })
          );
        } else {
          return [];
        }
      }
    },
    portfolioByPool: function () {
      if (
        this.displayedPortfolioPieDataSelector == "favorite" ||
        !this.isSignedIn
      ) {
        if (this.livedatafaves != null) {
          return Array.from(
            Object.values(this.livedatafaves)
              .map((x) => {
                return {
                  ticker:
                    x.delegatedToTicker == ""
                      ? x.delegatedTo
                      : x.delegatedToTicker,
                  value: x.amount,
                };
              })
              .reduce(
                (m, { ticker, value }) =>
                  m.set(ticker, (m.get(ticker) || 0) + value),
                new Map()
              ),
            ([name, value]) => ({ name, value })
          );
        } else {
          return [];
        }
      } else {
        if (this.livedatamy != null) {
          return Array.from(
            Object.values(this.livedatamy)
              .map((x) => {
                return {
                  ticker:
                    x.delegatedToTicker == ""
                      ? x.delegatedTo
                      : x.delegatedToTicker,
                  value: x.amount,
                };
              })
              .reduce(
                (m, { ticker, value }) =>
                  m.set(ticker, (m.get(ticker) || 0) + value),
                new Map()
              ),
            ([name, value]) => ({ name, value })
          );
        } else {
          return [];
        }
      }
    },
    portfoliopieoptions: function () {
      return {
        animation: {
          duration: 0, // general animation time
        },
        segmentShowStroke: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                let sum = 0;

                let dataArr = context.dataset.data;
                dataArr.map((data) => {
                  if (data != null && !isNaN(data)) {
                    sum += data;
                  }
                });
                if (typeof context.label == "undefined") {
                  return "";
                }
                var shortLabel = context.label.substring(0, 5);
                if (context.label.length != shortLabel.length) {
                  shortLabel = shortLabel + "...";
                }
                let ttvalue = context.raw;
                ttvalue = " ₳" + numeral(context.raw / 1e6).format("0,0.0a");
                let percentage = ((context.raw * 100) / sum).toFixed(0) + "%";
                return shortLabel + "\n" + percentage + " (" + ttvalue + ")";
              },
            },
          },
          datalabels: {
            borderWidth: 1,
            borderColor: "grey",
            backgroundColor: "rgba(255, 255, 255, .8)",
            borderRadius: 5,
            padding: {
              bottom: 1,
              top: 4,
            },
            formatter: (value, ctx) => {
              let sum = 0;
              let dataArr = ctx.chart.data.datasets[0].data;
              dataArr.map((data) => {
                if (data != null && !isNaN(data)) {
                  sum += data;
                }
              });
              let percentage = ((value * 100) / sum).toFixed(0) + "%";
              if (typeof ctx.chart.data.labels[ctx.dataIndex] == "undefined") {
                return "";
              }
              var shortLabel = ctx.chart.data.labels[ctx.dataIndex].substring(
                0,
                5
              );
              if (
                ctx.chart.data.labels[ctx.dataIndex].length != shortLabel.length
              ) {
                shortLabel = shortLabel + "...";
              }
              let ttvalue = value;
              ttvalue = " ₳" + numeral(value / 1e6).format("0,0.0a");

              if ((value * 100) / sum > 10) {
                return percentage + " (" + ttvalue + ")\n" + shortLabel;
              }
              return null;
            },
          },
        },

        legend: {
          display: false,
          labels: {
            fontColor: "grey",
            fontSize: 12,
          },
        },
        aspectRatio: 1,
        responsive: true,
        maintainAspectRatio: true,
      };
    },
    rewardPortfolio: function () {
      var stakevals = [];
      var datalabels = [];
      this.rewardsByPool.forEach((value) => {
        stakevals.push(parseInt(value.value));

        datalabels.push(value.name);
      });

      return {
        mytitle: "",
        labels: datalabels,
        datasets: [
          {
            data: stakevals,
            backgroundColor: this.backgroundColors,
            borderColor: this.borderColors,
          },
        ],
      };
    },
    poolPortfolio: function () {
      var stakevals = [];
      var datalabels = [];
      this.portfolioByPool.forEach((value) => {
        stakevals.push(parseInt(value.value));

        datalabels.push(value.name);
      });

      return {
        mytitle: "",
        labels: datalabels,
        datasets: [
          {
            data: stakevals,
            backgroundColor: this.backgroundColors,
            borderColor: this.borderColors,
          },
        ],
      };
    },
  },
};
</script>