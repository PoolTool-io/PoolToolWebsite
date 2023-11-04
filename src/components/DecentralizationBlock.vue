<template>
  <v-row dense>
    <v-col cols="12" class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
      <v-row class="d-flex" dense
        ><v-col class="col-lg-12">
          <v-card elevation="2" outlined :dark="nightmode" height="100%">
            <v-card-title class="pt-1 pb-1 text-caption">
              {{ $t("app.networkHealth.battles") }}
            </v-card-title>
            <v-card-subtitle class="pt-1 text-caption">
              {{ $t("app.networkHealth.battlesOverLast6Hours") }}
            </v-card-subtitle>
            <v-card-text>
              <line-chart
                :height="chartScale * 0.6"
                class=""
                :chartData="battledataplot"
                :chartOptions="battledataoptions"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col class="col-lg-12">
          <v-card elevation="2" outlined :dark="nightmode" height="100%">
            <v-card-title class="pt-1 pb-1 text-caption">
              {{ $t("app.networkHealth.battleTrends") }}
            </v-card-title>

            <v-card-text>
              <bar-chart
                :height="chartScale * 0.6"
                class=""
                :chartData="trendingbattledataplot"
                :chartOptions="trendingbattledataoptions"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="2" outlined :dark="nightmode" height="100%">
            <v-card-title class="pt-1 pb-1 text-caption">
              {{ $t("app.networkHealth.forkers") }}
            </v-card-title>
            <v-card-subtitle class="pt-1 text-caption">
              {{ $t("app.networkHealth.forkersLast10Days") }}
            </v-card-subtitle>
            <v-card-text>
              <v-data-table
                sort-by="block_no"
                sort-desc
                dense
                no-data-text="No Forkers Recently!"
                :headers="forkertable_headers"
                :items="forkerdata"
                :items-per-page="10"
                class="elevation-1"
              >
                <template #[`item.block_no`]="{ item }">
                  <div class="d-flex justify-space-between">
                    <div>
                      {{ item.block_no }}
                    </div>
                    <div>
                      <router-link
                        style="text-decoration: none; color: inherit"
                        text
                        :to="{
                          name: 'recentBlocksHeight',
                          params: {
                            height: item.block_no,
                          },
                        }"
                      >
                        <v-chip style="cursor: pointer" small color="red"
                          ><v-icon left>mdi-silverware-fork</v-icon> FORKER
                          <v-icon right small
                            >mdi-arrow-right-bold-circle</v-icon
                          >
                        </v-chip></router-link
                      >
                    </div>
                  </div>
                </template>
                <template #[`item.pool_ticker`]="{ item }">
                  <div class="d-flex justify-space-between">
                    <div>
                      <span
                        class="text-no-wrap"
                        v-if="
                          item.pool_ticker == '' || item.pool_ticker == null
                        "
                        >{{ item.pool_id | ellipsiscrypto }}</span
                      >
                      <span v-else>{{ item.pool_ticker }}</span>
                    </div>
                    <div>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs"
                            v-on="on"
                            icon
                            small
                            :to="{
                              name: 'poolepochs',
                              params: { poolid: item.pool_id },
                            }"
                            color="primary"
                          >
                            <v-icon dense medium
                              >mdi-arrow-right-bold-circle</v-icon
                            >
                          </v-btn>
                        </template>
                        <span>{{ $t("app.pools.poolDetails") }}</span>
                      </v-tooltip>
                    </div>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
    <v-col class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
      <v-card elevation="2" outlined :dark="nightmode" height="100%">
        <v-card-title class="pt-1 text-caption">
          {{ $t("app.networkHealth.relayDataCenters") }}
        </v-card-title>
        <v-card-subtitle> </v-card-subtitle>
        <v-card-text>
          <bar-chart
            :width="chartScale"
            :height="chartScale * (ismobile ? 2 : 0.6)"
            class=""
            :chart-data="datacentersRelays"
            :chartOptions="datacenterbaroptions"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import numeral from "numeral";
import colors from "@/mixins/colors";
export default {
  props: ["nightmode", "ismobile"],
  components: {
    BarChart: () => import("@/components/BarChart"),
    LineChart: () => import("@/components/LineChart"),
  },
  mixins: [colors],
  data() {
    return {
      forkertable_headers: [
        {
          text: "Epoch",
          align: "left",
          sortable: true,
          value: "epoch",
        },
        {
          text: "Pool",
          align: "left",
          sortable: true,
          value: "pool_ticker",
        },
        {
          text: "Block",
          align: "left",
          sortable: true,
          value: "block_no",
        },
      ],
      historicalbattlestats: {},

      battledataplot: {
        labels: [],
        datasets: [
          {
            fill: false,
            label: "",
            data: [],
            borderColor: [],
            backgroundColor: [],
            pointRadius: 0,
          },
        ],
      },
      trendingbattledataplot: {
        labels: [],
        epochlabels: [],
        datasets: [
          {
            fill: false,
            label: "",
            data: [],
            borderColor: [],
            backgroundColor: [],
            pointRadius: 0,
          },
        ],
      },
      chartScale: 300,

      battledataoptions: {
        animation: {
          duration: 0, // general animation time
        },
        plugins: {
          datalabels: {
            display: false,
          },
          legend: {
            display: true,
            labels: {
              color: "#fff",
            },
          },
          tooltip: {
            enabled: true,
            intersect: false,
          },
        },

        responsive: true,
        maintainAspectRatio: false,

        scales: {
          yAxes: {
            position: "right",
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              fontSize: 12,
            },

            title: {
              display: true,
              color: "#fff",
              text: this.$t("Blocks"),
            },
          },

          xAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              fontSize: 12,
            },
            type: "time",
            time: {
              unit: "hour",
            },
          },
        },
      },
    };
  },
  watch: {
    refresh_trendingbattledata_watch: {
      // call it upon creation too
      immediate: true,
      handler() {
        this.fetchTrendingBattleData();
      },
    },
  },
  created() {
    this.fetchPeriodicData();
    this.timer = setInterval(this.fetchPeriodicData, 30000);
  },
  computed: {
    isInactive: function () {
      return this.$store.state.idleVue.isIdle;
    },
    trendingbattledataoptions: function () {
      return {
        animation: {
          duration: 0, // general animation time
        },
        plugins: {
          datalabels: {
            display: false,
          },
          legend: {
            display: true,
            labels: {
              color: "#fff",
            },
          },
          tooltip: {
            enabled: true,
            intersect: false,
          },
        },

        responsive: true,
        maintainAspectRatio: false,

        scales: {
          yAxes: {
            position: "right",
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              fontSize: 12,
            },

            title: {
              display: true,
              color: "#fff",
              text: this.$t("Count"),
            },
          },
          yAxes2: {
            position: "left",
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              fontSize: 12,
            },

            title: {
              display: true,
              color: "#fff",
              text: this.$t("kB"),
            },
          },

          xAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              fontSize: 12,
            },
          },
        },
      };
    },
    refresh_trendingbattledata_watch: function () {
      return this.ecosystem.trendingbattles;
    },
    datacenterbaroptions: function () {
      return {
        indexAxis: "y",
        animation: {
          duration: 0, // general animation time
        },
        scales: {
          yAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              beginAtZero: true,
              color: "#fff",
              font: {
                size: 12,
              },
            },
            title: {
              display: true,
              color: "#fff",
            },
          },

          xAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              fontSize: 12,
              beginAtZero: true,
              callback: function (value) {
                return " ₳" + numeral(value / 1e6).format("0,0.0a");
              },
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("global.stake"),
            },
          },
        },

        segmentShowStroke: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            intersect: false,
            enabled: true,
            callbacks: {
              label: function (context) {
                let sum = 0;
                let dataArr = context.dataset.data;

                dataArr.map((data) => {
                  sum += data;
                });

                let qtyArr = context.dataset.qtyvals;

                let percentage = ((context.raw * 100) / sum).toFixed(0) + "%";
                return (
                  percentage +
                  " ₳" +
                  numeral(context.raw / 1e6).format("0,0.0a") +
                  " (" +
                  qtyArr[context.dataIndex] +
                  " Total Relays"
                );
              },
            },
          },
          datalabels: {
            borderWidth: 1,
            display: false,
            clamp: true,
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
                sum += data;
              });
              let percentage = ((value * 100) / sum).toFixed(0) + "%";

              var shortLabel = ctx.chart.data.labels[ctx.dataIndex].substring(
                0,
                20
              );
              if (
                ctx.chart.data.labels[ctx.dataIndex].length != shortLabel.length
              ) {
                shortLabel = shortLabel + "...";
              }

              if ((value * 100) / sum > 3) {
                return (
                  percentage +
                  " ₳" +
                  numeral(value / 1e6).format("0,0.0a") +
                  "\n" +
                  shortLabel
                );
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

        responsive: true,
        maintainAspectRatio: true,
      };
    },

    ecosystem: function () {
      return this.$store.getters.getEcosystem;
    },
    datacentersRelays: function () {
      var stakevals = [];
      var qtyvals = [];
      var datalabels = [];
      let dataarray = [];
      let otherkeys = [];
      let otherqty = 0;
      let otherstake = 0;
      let i = 0;
      for (let [key, value] of Object.entries(
        JSON.parse(this.ecosystem.datacentersRelays)
      )) {
        value["key"] = key;

        dataarray.push(value);
      }
      dataarray.sort((x, y) => y.stake - x.stake);
      dataarray.forEach((value) => {
        if (i < 16) {
          stakevals.push(parseInt(value.stake));
          qtyvals.push(parseInt(value.qty));
          datalabels.push(value.key);
        } else {
          otherkeys.push(value.key);
          otherqty += parseInt(value.qty);
          otherstake += parseInt(value.stake);
        }
        i++;
      });
      stakevals.push(otherstake);
      qtyvals.push(otherqty);
      datalabels.push("Other");
      return {
        mytitle: "",
        labels: datalabels,
        axis: "y",
        datasets: [
          {
            data: stakevals,
            qtyvals,
            backgroundColor: this.backgroundColors,
            borderColor: this.borderColors,
          },
        ],
      };
    },
    forkerdata: function () {
      let fd = [];
      if (this.ecosystem.recentForkers != null) {
        for (let value of Object.values(this.ecosystem.recentForkers)) {
          fd.push(value);
        }
      }
      return fd;
    },
    battlestats: function () {
      let datasets = [];

      let labels = [];
      let i = 0;
      for (let [key, value] of Object.entries(this.historicalbattlestats)) {
        let thisline = [];
        if (value != null) {
          value.map((a) => {
            thisline.push({ y: parseInt(a.i), x: parseInt(a.slot) });
            labels.push(parseInt(a.slot));
          });

          datasets.push({
            label: "Epoch" + key,
            borderColor: this.borderColors[i],
            backgroundColor: this.backgroundColors[i],
            data: thisline,
          });
          i++;
        }
      }
      return {
        labels: labels.sort(),
        datasets,
      };
    },
  },
  methods: {
    fetchTrendingBattleData() {
      var self = this;
      this.getJSON(
        "https://s3-us-west-2.amazonaws.com/data.pooltool.io/stats/trendingbattles.json?t=" +
          Date.now(),
        function (err, thisdata) {
          let battledata_battles = [];
          let battledata_forkers = [];
          let battledata_slotb = [];
          let battledata_heightb = [];
          let battledata_prop_delay = [];
          let battledata_epochs = [];
          let battledata_avg_size = [];
          let battledata_avg_tx = [];
          thisdata.trendingbattles.map((thisitem) => {
            battledata_epochs.push(thisitem.epoch);

            battledata_battles.push(thisitem.battles);
            battledata_forkers.push(thisitem.forkerblocks);
            battledata_slotb.push(thisitem.slotbattleblocks);
            battledata_heightb.push(thisitem.heightbattleblocks);
            battledata_prop_delay.push(thisitem.prop_delay);
            battledata_avg_size.push(thisitem.avg_size);
            battledata_avg_tx.push(thisitem.avg_tx);
          });
          self.trendingbattledataplot = {
            labels: battledata_epochs,
            datasets: [
              {
                fill: false,
                label: "Battles",
                data: battledata_battles,
                borderColor: self.borderColors[0],
                backgroundColor: self.borderColors[0],
                pointRadius: 0,
              },
              {
                fill: false,
                label: "Forkers",
                data: battledata_forkers,
                borderColor: self.borderColors[1],
                backgroundColor: self.borderColors[1],
                pointRadius: 0,
              },
              {
                fill: false,
                label: "Slot Battles",
                data: battledata_slotb,
                borderColor: self.borderColors[2],
                backgroundColor: self.borderColors[2],
                pointRadius: 0,
              },
              {
                fill: false,
                label: "Height Battles",
                data: battledata_heightb,
                borderColor: self.borderColors[3],
                backgroundColor: self.borderColors[3],
                pointRadius: 0,
              },
              {
                fill: false,
                label: "Prop Delay(ms)",
                data: battledata_prop_delay,
                borderColor: self.borderColors[4],
                backgroundColor: self.borderColors[4],
                pointRadius: 0,
              },
              {
                yAxisID: "yAxes2",
                fill: false,
                label: "Avg Block Size",
                data: battledata_avg_size,
                borderColor: self.borderColors[5],
                backgroundColor: self.borderColors[5],
                pointRadius: 0,
              },
              {
                fill: false,
                label: "Avg Tx Count",
                data: battledata_avg_tx,
                borderColor: self.borderColors[6],
                backgroundColor: self.borderColors[6],
                pointRadius: 0,
              },
            ],
          };
        }
      );
    },
    async fetchPeriodicData() {
      var self = this;
      if (!this.isInactive) {
        this.getJSON(
          "https://s3-us-west-2.amazonaws.com/data.pooltool.io/stats/battledata.json?t=" +
            Date.now(),
          function (err, thisdata) {
            let battledata_battles = [];
            let battledata_forkers = [];
            let battledata_slotb = [];
            let battledata_heightb = [];
            let times = [];

            thisdata.map((thisitem) => {
              battledata_battles.push(thisitem.recentBattles);
              battledata_forkers.push(thisitem.recentForkers);
              battledata_slotb.push(thisitem.recentSlotBattles);
              battledata_heightb.push(thisitem.recentHeightBattles);
              times.push(thisitem.time * 1000);
            });
            self.battledataplot = {
              labels: times,

              datasets: [
                {
                  fill: false,
                  label: "Total/6HRs",
                  data: battledata_battles,
                  borderColor: self.borderColors[0],
                  backgroundColor: self.borderColors[0],
                  pointRadius: 0,
                },
                {
                  fill: false,
                  label: "Forker/6HRs",
                  data: battledata_forkers,
                  borderColor: self.borderColors[1],
                  backgroundColor: self.borderColors[1],
                  pointRadius: 0,
                },
                {
                  fill: false,
                  label: "Slot Battles/6HRs",
                  data: battledata_slotb,
                  borderColor: self.borderColors[2],
                  backgroundColor: self.borderColors[2],
                  pointRadius: 0,
                },
                {
                  fill: false,
                  label: "Height Battles/6HRs",
                  data: battledata_heightb,
                  borderColor: self.borderColors[3],
                  backgroundColor: self.borderColors[3],
                  pointRadius: 0,
                },
              ],
            };
          }
        );
      }
    },
  },
};
</script>