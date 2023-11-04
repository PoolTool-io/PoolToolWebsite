<template>
  <div>
    <genesis-bar
      :showBlockIcons="showBlockIcons"
      :mini="true"
      :genesis="genesis"
      currency="ada"
      :nightmode="nightmode"
      :ispulseVisible="ispulseVisible"
      :ismobile="ismobile"
    ></genesis-bar>
    <v-row dense class="d-flex flex-wrap">
      <v-col cols="12" class="col-lg-2 col-md-3 col-sm-6 col-xs-12">
        <v-card elevation="2" outlined :dark="nightmode" height="100%">
          <v-card-title class="pt-1 text-caption">
            {{ $t("global.blocks") }}
            {{ $t("global.protocol") }}
            {{ $t("app.networkHealth.version") }}

            {{
              protocolPieDataSelector == "blocks1hr"
                ? "Last Hour"
                : protocolPieDataSelector == "blocks6hr"
                ? "Last 6 Hours"
                : protocolPieDataSelector == "blocks12hr"
                ? "Last 12 Hours"
                : protocolPieDataSelector == "blocks24hr"
                ? "Last Day"
                : "Epoch " + genesis.epoch
            }}
          </v-card-title>
          <v-card-subtitle></v-card-subtitle>
          <v-card-text>
            <pie-chart
              :width="chartScale"
              :height="chartScale"
              class=""
              :chart-data="protocolVersions"
              datakey="main"
              :options="protocolpieoptions"
            />
            <div class="pie_options d-flex justify-center pb-2">
              <v-btn-toggle
                dark
                v-model="protocolPieDataSelector"
                rounded
                mandatory
              >
                <v-hover v-slot="{ hover }">
                  <v-btn
                    :value="
                      protocolPieDataSelector == 'blocks1hr'
                        ? 'blocks1hr'
                        : protocolPieDataSelector == 'blocks6hr'
                        ? 'blocks6hr'
                        : protocolPieDataSelector == 'blocks12hr'
                        ? 'blocks12hr'
                        : protocolPieDataSelector == 'blocks24hr'
                        ? 'blocks24hr'
                        : 'blocks'
                    "
                    x-small
                    dark
                    >Blocks{{
                      protocolPieDataSelector == "blocks1hr"
                        ? "(1hr)"
                        : protocolPieDataSelector == "blocks6hr"
                        ? "(6hr)"
                        : protocolPieDataSelector == "blocks12hr"
                        ? "(12hr)"
                        : protocolPieDataSelector == "blocks24hr"
                        ? "(1d)"
                        : ""
                    }}
                    <div dark class="d-flex sub_toggle_pie_options">
                      <v-btn
                        value="blocks1hr"
                        x-small
                        dark
                        rounded
                        @click.stop="protocolPieDataSelector = 'blocks1hr'"
                        :class="{ hide_button: !hover }"
                      >
                        1 Hr
                      </v-btn>
                      <v-btn
                        value="blocks6hr"
                        x-small
                        dark
                        rounded
                        @click.stop="protocolPieDataSelector = 'blocks6hr'"
                        :class="{ hide_button: !hover }"
                      >
                        6 Hr
                      </v-btn>
                      <v-btn
                        value="blocks12hr"
                        x-small
                        dark
                        rounded
                        @click.stop="protocolPieDataSelector = 'blocks12hr'"
                        :class="{ hide_button: !hover }"
                      >
                        12 Hr
                      </v-btn>
                      <v-btn
                        value="blocks24hr"
                        x-small
                        dark
                        rounded
                        @click.stop="protocolPieDataSelector = 'blocks24hr'"
                        :class="{ hide_button: !hover }"
                      >
                        1 Day
                      </v-btn>
                      <v-btn
                        value="blocks"
                        x-small
                        dark
                        rounded
                        @click.stop="protocolPieDataSelector = 'blocks'"
                        :class="{ hide_button: !hover }"
                      >
                        Epoch
                      </v-btn>
                    </div>
                  </v-btn>
                </v-hover>
                <v-btn value="stake" x-small dark> Stake </v-btn>
                <v-btn value="qty" x-small dark> Pools </v-btn>
              </v-btn-toggle>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" class="col-lg-2 col-md-3 col-sm-6 col-xs-12">
        <v-card elevation="2" outlined :dark="nightmode" height="100%">
          <v-card-title class="pt-1 text-caption">
            {{ $t("app.poolWidget.onlineRelays") }}
            {{ $t("global.protocol") }}
            {{ $t("app.networkHealth.version") }}
          </v-card-title>
          <v-card-subtitle> </v-card-subtitle>
          <v-card-text>
            <pie-chart
              :width="chartScale"
              :height="chartScale"
              class=""
              :chart-data="relayProtocolVersions"
              datakey="main"
              :options="relayprotocolpieoptions"
            />

            <div class="pie_options d-flex justify-center pb-2">
              <v-btn-toggle
                dark
                v-model="relayProtocolPieDataSelector"
                rounded
                mandatory
              >
                <v-btn value="stake" x-small dark> Stake </v-btn>
                <v-btn value="qty" x-small dark> Qty </v-btn>
              </v-btn-toggle>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" class="col-lg-2 col-md-3 col-sm-6 col-xs-12">
        <v-card elevation="2" outlined :dark="nightmode" height="100%">
          <v-card-title class="pt-1 text-caption">
            {{ $t("app.networkHealth.nodesReporting") }}
            {{ $t("app.networkHealth.version") }}
          </v-card-title>
          <v-card-text>
            <pie-chart
              :width="chartScale"
              :height="chartScale"
              class=""
              :chart-data="latestversiongraph.main"
              datakey="main"
              :options="versionpieoptions"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" class="col-lg-2 col-md-3 col-sm-6 col-xs-12">
        <v-card elevation="2" outlined :dark="nightmode" height="100%">
          <v-card-title class="pt-1 text-caption">
            {{ $t("app.networkHealth.forksOf") }}
            {{ latestversiongraph.sub.mytitle }}
          </v-card-title>
          <v-card-subtitle> </v-card-subtitle>
          <v-card-text>
            <pie-chart
              :width="chartScale"
              :height="chartScale"
              class=""
              :chart-data="latestversiongraph.sub"
              datakey="main"
              :options="versionpieoptions"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" class="col-lg-4 col-md-6 col-sm-6 col-xs-12">
        <v-card
          elevation="2"
          outlined
          :dark="nightmode"
          height="100%"
          v-if="netsyncready"
        >
          <v-btn
            @click="showHelp('blockHeightAlignmentHelp')"
            small
            icon
            class="questionicon"
            ><v-icon class="primary--text" small>mdi-help</v-icon></v-btn
          >
          <v-card-title class="pt-1 text-caption">
            {{ $t("app.networkHealth.historicalBlockHeightAlignment") }}
          </v-card-title>
          <v-card-text>
            <scatter-chart
              :height="chartScale * 0.65"
              class=""
              :chart-data="syncd"
              :options="scatoptions"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <v-card
          elevation="2"
          outlined
          :dark="nightmode"
          height="100%"
          v-if="netsyncready"
        >
          <v-card-title class="pt-1 pb-1 text-caption">
            {{ $t("app.networkHealth.networkSynchronization") }} ({{
              (genesis.senddata.syncd / genesis.senddata.samples) | fpercent
            }})
          </v-card-title>
          <v-card-subtitle class="pt-1 text-caption">
            {{ genesis.senddata.syncd }} / {{ genesis.senddata.samples }}
            {{ $t("app.networkHealth.reportingInTheLastHour") }}
          </v-card-subtitle>

          <v-card-text>
            <line-chart
              :height="chartScale * 0.65"
              class=""
              :chartData="syncdplot"
              :chartOptions="syncdoptions"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <v-card elevation="2" outlined :dark="nightmode" height="100%">
          <v-card-title class="pt-1 text-caption">
            {{ $t("app.networkHealth.currentBlockHeightsReported") }}
          </v-card-title>

          <v-card-text>
            <bar-chart
              :width="chartScale"
              :height="chartScale * 0.65"
              class=""
              :chart-data="latesttipgraph.graph"
              :chartOptions="recentheightsoptions"
            ></bar-chart>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" class="col-lg-3 col-md-6 col-sm-6 col-xs-12">
        <v-card elevation="2" outlined :dark="nightmode" height="100%">
          <v-card-title class="pt-1 pb-1 text-caption">
            {{ $t("app.networkHealth.propagationDelaysFor") }}
            {{ propdelays.blockheight | numFormat("0,0") }}
          </v-card-title>
          <v-card-subtitle class="pt-1 text-caption">
            <span v-if="block_details.leaderPoolTicker != ''">
              {{ block_details.leaderPoolTicker }}
            </span>
            <span v-else>
              {{ block_details.leaderPoolName }}
            </span>
          </v-card-subtitle>
          <v-card-text>
            <bar-chart
              :width="chartScale"
              :height="chartScale * 0.6"
              class=""
              :chart-data="propdelays.graph"
              :chartOptions="propdelaysoptions"
            ></bar-chart>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" class="col-lg-3 col-md-12 col-sm-12 col-xs-12">
        <v-card elevation="2" outlined :dark="nightmode" height="100%">
          <v-card-title class="pt-1 pb-1 text-caption">
            {{ $t("app.networkHealth.propagationTimesFor") }}
            {{ propdelays.blockheight | numFormat("0,0") }}
          </v-card-title>
          <v-card-subtitle class="pt-1 text-caption">
            <span v-if="block_details.leaderPoolTicker != ''">
              {{ block_details.leaderPoolTicker }}
            </span>
            <span v-else>
              {{ block_details.leaderPoolName }}
            </span>
          </v-card-subtitle>

          <div
            v-if="proplist.length"
            style="height: 250px; overflow-y: auto"
            class="ml-1 d-flex flex-wrap align-content-start"
          >
            <div v-for="item in proplist" :key="item.name">
              <v-chip class="mr-1" x-small :color="getGreenToRed(item.d)">
                <span v-if="item.t != null">
                  <v-icon
                    color="yellow"
                    class="mr-1 my-0 ml-0 pa-0"
                    x-small
                    v-if="item.h"
                    right
                    >mdi-star</v-icon
                  >
                  {{ item.t }} ({{ item.d }}) </span
                ><span v-else>{{ item.p | ellipsis(16) }}</span>
              </v-chip>
            </div>
          </div>
          <div v-else class="text-center ma-5">
            {{ $t("app.networkHealth.noData") }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <decentralization-block
      v-if="true"
      :nightmode="nightmode"
      :ismobile="ismobile"
    />
    <h4>{{ $t("app.networkHealth.howDoWeCollectThisData") }}</h4>
    <p>{{ $t("app.networkHealth.asPartOfOurServiceToTheCommunity") }}.</p>

    <v-row>
      <v-col>
        <h4>{{ $t("app.networkHealth.sendUsYourBlockHeights") }}</h4>
        <a href="https://github.com/cardano-community/cncli" target="_blank"
          >CNCLI Tool</a
        >
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="700">
      <v-card dark class="modalform">
        <v-card-title class="text-h5">
          {{ $t("help." + helptitle) }}
        </v-card-title>

        <v-card-text>
          <p v-for="(item, index) in helpparagraphs" v-bind:key="index">
            {{ $t("help." + item) }}
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" text @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div v-if="false">
      {{ $t("help.blockHeightAlignmentHelp") }}
      {{ $t("help.blockHeightAlignmentHelp1") }}
      {{ $t("help.blockHeightAlignmentHelp2") }}
      {{ $t("help.blockHeightAlignmentHelp3") }}
      {{ $t("help.blockHeightAlignmentHelp4") }}
    </div>
  </div>
</template>

<script>
import numeral from "numeral";
import { preference } from "vue-preferences";
import pooltable from "@/mixins/pooltable";
import healthhelp from "@/mixins/healthhelp";
import colors from "@/mixins/colors";
const favoritepools = preference("fav_mainnet_pools", {
  defaultValue: [],
});
export default {
  props: ["nightmode", "ispulseVisible", "ismobile", "showBlockIcons"],
  mixins: [pooltable, healthhelp, colors],
  components: {
    GenesisBar: () => import("@/components/GenesisBar"),
    BarChart: () => import("@/components/BarChart"),
    ScatterChart: () => import("@/components/ScatterChart"),
    LineChart: () => import("@/components/LineChart"),
    PieChart: () => import("@/components/PieChart"),
    DecentralizationBlock: () => import("@/components/DecentralizationBlock"),
  },
  updated() {
    this.$emit("isLoaded", true);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  filters: {},

  data() {
    return {
      helptitle: "",
      helpparagraphs: [],
      dialog: false,
      tickers: {},
      tickerHash: "",
      protocolPieDataSelector: "blocks",
      relayProtocolPieDataSelector: "stake",

      relayProtocolMapping: {
        0: "Pre 1.34",
        7: "1.34 (v7)",
        8: "1.34 (v8)",
        9: "1.35 (v9)",
        10: "1.35 (v10)",
        11: "8.1+ (v11)",
        12: "8.2+ (v12)",
      },
      blockProtocolMapping: {
        "7_0": "1.35.3 (v7.0)",
        "7_2": "1.35.3 (v7.2)",
      },

      scatoptions: {
        animation: {
          duration: 0, // general animation time
        },
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          yAxes: {
            title: {
              display: true,
              color: "#fff",
              text: this.$t("app.networkHealth.deltaFromMajorityMax"),
            },
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              fontSize: 12,
            },
            scaleLabel: {
              display: true,
              labelString: this.$t("app.pools.synchronized"),
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
            // type: "time",
            time: {
              unit: "hour",
            },
          },
        },
        plugins: {
          datalabels: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
          legend: {
            display: true,

            labels: {
              font: {
                size: 8,
              },
              color: "#fff",
            },
          },
        },
      },

      senddata: {
        countplatform: {},
        countversion: {},
        currentepoch: 245,
        currentslot: 271083,
        distribution: {
          5292060: 5,
          5292061: 292,
        },
        histogram: "[[], []]",
        histogramhash:
          "5fdc8c0918e65ce8267ac39e0ecf71b32f7ab2ad244598a4fbff11daefea02f1",
        histogramheight: 5292060,
        majoritymax: 5292061,
        max: 5292061,
        min: 5292060,
        reportingstatus: {
          lasthash: 297,
          lasthashparent: 0,
          lasthashparentepoch: 0,
          lasthashparentepochslot: 0,
          platform: 297,
          version: 295,
        },
        lasthash: 297,
        lasthashparent: 0,
        lasthashparentepoch: 0,
        lasthashparentepochslot: 0,
        platform: 297,
        version: 295,
      },
      chartScale: 300,
      barcolor: "rgba(13, 72, 160, 0.75)", //'#0033AD'//
      block_details: {
        leaderPoolTicker: "",
        leaderPoolName: "",
      },
      recent_blocks: [],
      favorites: favoritepools.get(),
      proplist: [],

      versionplot: {},
      syncdplot: {},

      versionpieoptions: {
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
              label: function (context) {
                let sum = 0;

                let dataArr = context.dataset.data;

                dataArr.map((data) => {
                  if (data != null && !isNaN(data)) {
                    sum += data;
                  }
                });
                var shortLabel = context.label.substring(0, 10);
                if (context.label.length != shortLabel.length) {
                  shortLabel = shortLabel + "...";
                }
                let percentage = ((context.raw * 100) / sum).toFixed(0) + "%";
                return percentage + "\n" + shortLabel;
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

              var shortLabel = ctx.chart.data.labels[ctx.dataIndex].substring(
                0,
                10
              );
              if (
                ctx.chart.data.labels[ctx.dataIndex].length != shortLabel.length
              ) {
                shortLabel = shortLabel + "...";
              }

              if ((value * 100) / sum > 10) {
                return percentage + "\n" + shortLabel;
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
      },

      recentheightsoptions: {
        animation: {
          duration: 0, // general animation time
        },
        plugins: {
          watermark: {
            image: "https://pooltool.io/logo_blue_big.svg",
            x: "0%",
            y: "0%",
            opacity: 0.0,
            alignX: "left",
            alignY: "top",
            alignToChartArea: true,
            position: "back",
          },
          datalabels: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
          legend: {
            display: false,
          },
        },

        responsive: true,
        maintainAspectRatio: true,
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
              fontSize: 12,
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("app.networkHealth.nodesReporting"),
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
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("global.height"),
            },
          },
        },
      },
      propdelaysoptions: {
        animation: {
          duration: 0, // general animation time
        },
        plugins: {
          tooltip: {
            enabled: false,
          },
          datalabels: {
            display: false,
          },
          watermark: {
            image: "https://pooltool.io/logo_blue_big.svg",
            x: "0%",
            y: "0%",
            opacity: 0.0,
            alignX: "left",
            alignY: "top",
            alignToChartArea: true,
            position: "back",
          },
          legend: {
            display: false,
          },
        },

        responsive: true,
        maintainAspectRatio: true,
        scales: {
          yAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              fontSize: 12,
              beginAtZero: true,
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("app.networkHealth.nodesReporting"),
            },
          },

          xAxes: {
            min: 0,
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              beginAtZero: true,
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("app.networkHealth.msDelayFromSlotTime"),
            },
          },
        },
      },
      syncdoptions: {
        animation: {
          duration: 0, // general animation time
        },
        plugins: {
          watermark: {
            image: "https://pooltool.io/logo_blue_big.svg",
            x: "0%",
            y: "0%",
            opacity: 0.0,
            alignX: "left",
            alignY: "top",
            alignToChartArea: true,
            position: "back",
          },
          datalabels: {
            display: false,
          },
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (tooltipItem) {
                return (tooltipItem.raw * 100).toFixed(2) + "%";
              },
            },
          },
        },

        responsive: true,
        maintainAspectRatio: false,

        scales: {
          yAxes: {
            min: 0,
            max: 1,
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              fontSize: 12,
              callback: function (value) {
                return (value * 100).toFixed(0) + "%";
              },
            },

            title: {
              display: true,
              color: "#fff",
              text: this.$t("app.pools.synchronized"),
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
            // type: "time",
            time: {
              unit: "hour",
            },
          },
        },
      },

      syncd: {},
      timer: "",
    };
  },

  created() {
    this.fetchPeriodicData();
    this.timer = setInterval(this.fetchPeriodicData, 30000);
  },

  watch: {
    refetch_tickers_watch: {
      // call it upon creation too
      immediate: true,
      handler() {
        console.log("refetch tickers");
        var self = this;
        //reload the tickers file
        this.getJSON(
          "https://s3-us-west-2.amazonaws.com/data.pooltool.io/stats/tickers2.json?t=" +
            Date.now(),
          function (err, thisdata) {
            if (err == null) {
              self.tickers = thisdata.tickers;
              self.tickerHash = thisdata.hash;
            }
          }
        );
      },
    },
    genesis: {
      immediate: true,
      handler(olddata, newdata) {
        if (
          typeof newdata == "undefined" ||
          olddata.senddata.histogramheight != newdata.senddata.histogramheight
        ) {
          this.getproplist();
        }
      },
    },
  },

  methods: {
    showHelp: function (helptype) {
      this.dialog = true;
      this.helptitle = helptype;
      this.helpparagraphs = this.healthHelp[helptype];
      console.log(helptype);
    },
    processProtocolVersions: function () {
      var stakevals = [];
      var datalabels = [];
      let dataarray = [];
      for (let [key, value] of Object.entries(
        this.ecosystem.protocolVersions
      )) {
        if (key != "0_0") {
          if (typeof this.blockProtocolMapping[key] !== "undefined") {
            value["key"] = this.blockProtocolMapping[key];
          } else {
            value["key"] = "v" + key.replace("_", ".");
          }
          if (typeof value[this.protocolPieDataSelector] !== "undefined") {
            dataarray.push(value);
          }
        }
      }
      dataarray.sort(
        (x, y) =>
          parseInt(y[this.protocolPieDataSelector]) -
          parseInt(x[this.protocolPieDataSelector])
      );
      dataarray.forEach((value) => {
        stakevals.push(parseInt(value[this.protocolPieDataSelector]));

        datalabels.push(value.key);
      });
      return [datalabels, stakevals];
    },
    getGreenToRed: function (d) {
      d = Math.min(100, d / 10);
      var g = d < 50 ? 255 : Math.floor(255 - ((d * 2 - 100) * 255) / 100);
      var r = d > 50 ? 255 : Math.floor((d * 2 * 255) / 100);
      return "rgb(" + r + "," + g + ",0,0.5)";
    },

    async getproplist() {
      var self = this;
      if (typeof this.genesis !== "undefined") {
        this.getJSON(
          "https://s3-us-west-2.amazonaws.com/data.pooltool.io/stats/stats.json?t=" +
            Date.now(),
          function (err, thisdata) {
            self.senddata = thisdata;
            var block = Math.floor(self.senddata.histogramheight / 1000);
            var hash = self.senddata.histogramhash;
            self.getJSON(
              "https://s3-us-west-2.amazonaws.com/data.pooltool.io/blockdata/" +
                block +
                "/" +
                hash +
                ".json?t=" +
                Date.now(),
              function (err, thisdata) {
                if (err !== null) {
                  console.log("Something went wrong: " + err);
                } else {
                  if (
                    typeof self.block_details == "undefined" ||
                    self.block_details == null
                  ) {
                    self.block_details = {
                      leaderPoolTicker: "",
                      leaderPoolName: "",
                    };
                  }
                  if (typeof thisdata["ticker"] != "undefined") {
                    self.block_details = {
                      leaderPoolTicker: thisdata["ticker"],
                      leaderPoolName: thisdata["name"],
                    };
                  }
                  var t, h;
                  var tiparray = [];
                  for (const prop in thisdata.rawtips) {
                    if (
                      thisdata.rawtips[prop] > -3000 &&
                      thisdata.rawtips[prop] < 3000
                    ) {
                      if (typeof self.tickers[prop] != "undefined") {
                        t = self.tickers[prop]["ticker"];
                      } else {
                        t = prop;
                      }

                      if (self.favorites.includes(prop)) {
                        h = true;
                      } else {
                        h = false;
                      }
                      tiparray.push({
                        p: prop,
                        d: thisdata.rawtips[prop],
                        t: t,
                        h: h,
                      });
                    }
                  }
                  self.proplist = tiparray.sort((a, b) => {
                    return a.d < b.d ? -1 : 1;
                  });
                }
              }
            );
          }
        );
      } else {
        self.proplist = null;
      }
    },

    async fetchPeriodicData() {
      var self = this;

      this.getJSON(
        "https://s3-us-west-2.amazonaws.com/data.pooltool.io/stats/syncd.json?t=" +
          Date.now(),
        function (err, thisdata) {
          if (err !== null) {
            alert("Something went wrong: " + err);
          } else {
            var xys = [];
            var xys5 = [];
            var xys25 = [];
            var xys100 = [];
            var times = [];
            var syncds = [];
            var jv = [];
            var jvd = {};

            thisdata.map((thisitem) => {
              for (var key in thisitem.dist) {
                var qty = parseInt(thisitem.dist[key]);
                if (qty > 99) {
                  xys100.push({
                    x: thisitem.time * 1000,
                    y: parseInt(key),
                  });
                } else if (qty > 24) {
                  xys25.push({
                    x: thisitem.time * 1000,
                    y: parseInt(key),
                  });
                } else if (qty > 4) {
                  xys5.push({
                    x: thisitem.time * 1000,
                    y: parseInt(key),
                  });
                } else {
                  xys.push({
                    x: thisitem.time * 1000,
                    y: parseInt(key),
                  });
                }
              }
              syncds.push(thisitem.syncd / thisitem.samples);
              times.push(thisitem.time * 1000);
            });
            for (var versionitem in jvd) {
              jv.push({
                label: versionitem,
                data: jvd[versionitem],
                borderWidth: 0,
              });
            }
            self.versionplot = {
              labels: times,
              datasets: jv,
            };
            self.syncd = {
              datasets: [
                {
                  label: "100+ Nodes",
                  fill: false,
                  borderColor: "rgb(189,0,38,0.5)",
                  backgroundColor: "rgb(189,0,38,0.5)",
                  data: xys100,
                },
                {
                  label: "25 - 99 Nodes",
                  fill: false,
                  borderColor: "rgb(240,59,32,0.5)",
                  backgroundColor: "rgb(240,59,32,0.5)",

                  data: xys25,
                },
                {
                  label: "5 - 24 Nodes",
                  fill: false,
                  borderColor: "rgb(253,141,60,0.5)",
                  backgroundColor: "rgb(253,141,60,0.5)",
                  data: xys5,
                },
                {
                  label: "< 5 Nodes",
                  fill: false,
                  borderColor: "rgb(254,204,92,0.5)",
                  backgroundColor: "rgb(254,204,92,0.5)",
                  data: xys,
                },
              ],
            };
            self.syncdplot = {
              labels: times,
              datasets: [
                {
                  borderColor: "rgba(160, 254, 106, 1)",
                  gradientColor: "lightGreen2",
                  data: syncds,
                },
              ],
            };
          }
        }
      );
    },

    cancelAutoUpdate() {
      clearInterval(this.timer);
    },
  },

  computed: {
    relayprotocolpieoptions: function () {
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
                var shortLabel = context.label.substring(0, 20);
                if (context.label.length != shortLabel.length) {
                  shortLabel = shortLabel + "...";
                }
                let ttvalue = context.raw;
                if (this.relayProtocolPieDataSelector == "stake") {
                  ttvalue =
                    " ₳" +
                    numeral(parseInt(context.raw) / 1e6).format("0,0.0a");
                }
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

              var shortLabel = ctx.chart.data.labels[ctx.dataIndex].substring(
                0,
                20
              );
              if (
                ctx.chart.data.labels[ctx.dataIndex].length != shortLabel.length
              ) {
                shortLabel = shortLabel + "...";
              }
              let ttvalue = value;
              if (this.relayProtocolPieDataSelector == "stake") {
                ttvalue = " ₳" + numeral(value / 1e6).format("0,0.0a");
              }

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
    protocolpieoptions: function () {
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
                var shortLabel = context.label.substring(0, 20);
                if (context.label.length != shortLabel.length) {
                  shortLabel = shortLabel + "...";
                }
                let ttvalue = context.raw;
                if (this.protocolPieDataSelector == "stake") {
                  ttvalue = " ₳" + numeral(context.raw / 1e6).format("0,0.0a");
                }
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

              var shortLabel = ctx.chart.data.labels[ctx.dataIndex].substring(
                0,
                20
              );
              if (
                ctx.chart.data.labels[ctx.dataIndex].length != shortLabel.length
              ) {
                shortLabel = shortLabel + "...";
              }
              let ttvalue = value;
              if (this.protocolPieDataSelector == "stake") {
                ttvalue = " ₳" + numeral(value / 1e6).format("0,0.0a");
              }

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

    refetch_tickers_watch: function () {
      return this.ecosystem.tickerHash;
    },

    ecosystem: function () {
      return this.$store.getters.getEcosystem;
    },
    netsyncready: function () {
      return typeof this.syncdplot.datasets != "undefined";
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },

    poolindex: function () {
      var pi = {};
      this.pools.forEach(function (arrayItem) {
        pi[arrayItem.poolpubkey] = arrayItem.ticker;
      });
      return pi;
    },
    pools: function () {
      return this.$store.getters.getPools;
      //return this.$store.getters.getRawPools.map(a => this.convertPool(a))
    },

    community_blocks: function () {
      return this.pools.reduce(function (a, b) {
        return a + (!b["genesis_pool"] ? parseInt(b["epoch_blocks"]) : 0);
      }, 0);
    },
    genesis_blocks: function () {
      return this.pools.reduce(function (a, b) {
        return a + (b["genesis_pool"] ? parseInt(b["epoch_blocks"]) : 0);
      }, 0);
    },
    isInactive: function () {
      return this.$store.getters.getIsInactive;
    },
    transparency: function () {
      return 0.7;
    },
    genesis: function () {
      return this.$store.getters.getGenesis;
    },

    propdelays: function () {
      var histogram = [[0], [0]];
      var block = 0;
      if (
        typeof this.senddata !== "undefined" &&
        this.senddata.histogram != null
      ) {
        histogram = JSON.parse(this.senddata.histogram);
        block = this.senddata.histogramheight;
      }

      var data = {
        graph: {
          labels: histogram[1],
          datasets: [
            {
              gradientColor: "green",
              data: histogram[0],
            },
          ],
        },
        blockheight: block,
      };
      return data;
    },

    latestplatformvergraph: function () {
      var datavals = [];
      var datalabels = [];
      if (typeof this.senddata !== "undefined") {
        if (typeof this.senddata.countplatform !== "undefined") {
          var platforms = [];
          for (let [key, value] of Object.entries(
            this.senddata.countplatform
          )) {
            platforms.push({
              key,
              value,
            });
          }
          platforms.sort((a, b) => (a.value > b.value ? -1 : 1));
          var otherval = 0;
          platforms.forEach(function (elem, index) {
            if (elem.key != "sendmytip.sh") {
              if (index < 10) {
                datavals.push(elem.value);
                datalabels.push(elem.key);
              } else {
                otherval = otherval + elem.value;
              }
            }
          });
          datavals.push(otherval);
          datalabels.push("Other");
        }
      }
      return {
        labels: datalabels,
        datasets: [
          {
            data: datavals,
            backgroundColor: this.backgroundColors,
            borderColor: this.borderColors,
          },
        ],
      };
    },

    relayProtocolVersions: function () {
      var stakevals = [];
      var datalabels = [];
      let dataarray = [];
      for (let [key, value] of Object.entries(
        JSON.parse(this.ecosystem.protocolsRelays)
      )) {
        if (typeof this.relayProtocolMapping[key] !== "undefined") {
          value["key"] = this.relayProtocolMapping[key];
        } else {
          value["key"] = "Unknown";
        }

        dataarray.push(value);
      }

      dataarray.sort(
        (x, y) =>
          y[this.relayProtocolPieDataSelector] -
          x[this.relayProtocolPieDataSelector]
      );
      dataarray.forEach((value) => {
        stakevals.push(parseInt(value[this.relayProtocolPieDataSelector]));
        datalabels.push(value.key);
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
    protocolVersions: function () {
      const [datalabels, stakevals] = this.processProtocolVersions();

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
    latestversiongraph: function () {
      var datakeys = {};
      var subkeys = {};
      var datavals = [];
      var datalabels = [];
      var datalabelssubkey = [];
      var datavalssubkey = [];
      if (typeof this.senddata !== "undefined") {
        if (
          typeof this.senddata.countversion !== "undefined" &&
          this.senddata.countversion != null
        ) {
          //pre combine and sort into higher level categories

          var maxkey = null;
          var maxkeyval = 0;

          for (let [key, value] of Object.entries(this.senddata.countversion)) {
            var thiskey, subkey;
            var newkey = key.split(":");
            if (newkey.length > 1) {
              thiskey = newkey[0];
              newkey.shift();
              subkey = newkey.join(":");
            } else {
              thiskey = key;
              subkey = key;
            }
            if (typeof subkeys[thiskey] == "undefined") {
              subkeys[thiskey] = {};
            }
            if (typeof subkeys[thiskey][subkey] == "undefined") {
              subkeys[thiskey][subkey] = value;
            } else {
              subkeys[thiskey][subkey] += value;
            }

            if (typeof datakeys[thiskey] == "undefined") {
              datakeys[thiskey] = value;
            } else {
              datakeys[thiskey] += value;
            }

            if (maxkey == null || datakeys[thiskey] > maxkeyval) {
              maxkey = thiskey;
              maxkeyval = datakeys[thiskey];
            }
          }
          let tempdata = [];
          for (let [key, value] of Object.entries(datakeys)) {
            tempdata.push({ key: key, value: value });
          }
          tempdata.sort((x, y) => y.value - x.value);
          tempdata.forEach((x) => {
            datavals.push(x.value);
            datalabels.push(x.key);
          });
          tempdata = [];
          if (maxkey in subkeys) {
            for (let [key, value] of Object.entries(subkeys[maxkey])) {
              tempdata.push({ key: key, value: value });
            }
            tempdata.sort((x, y) => y.value - x.value);
            tempdata.forEach((x) => {
              datavalssubkey.push(x.value);
              datalabelssubkey.push(x.key);
            });
          }
        }
      }
      return {
        main: {
          mytitle: "",
          labels: datalabels,
          datasets: [
            {
              data: datavals,
              backgroundColor: this.backgroundColors,
              borderColor: this.borderColors,
            },
          ],
        },
        sub: {
          mytitle: maxkey,
          labels: datalabelssubkey,
          datasets: [
            {
              data: datavalssubkey,
              backgroundColor: this.backgroundColors,
              borderColor: this.borderColors,
            },
          ],
        },
      };
    },

    latesttipgraph: function () {
      if (typeof this.senddata !== "undefined") {
        var maxval = this.senddata.max;
        var minval = Math.max(this.senddata.min, maxval - 25);
        var heights = [];
        var totals = [];
        for (var i = minval; i <= maxval; i++) {
          heights.push(i);
          if (typeof this.senddata.distribution[i] === "undefined") {
            totals.push(0);
          } else {
            totals.push(this.senddata.distribution[i]);
          }
        }
      }
      var data = {
        graph: {
          labels: heights,
          datasets: [
            {
              gradientColor: "green",
              data: totals,
            },
          ],
        },
        max: maxval,
      };
      return data;
    },
  },
};
</script>
<style scoped>
.pie_options {
  width: 100%;
  bottom: 0px;
  left: 0px;
  font-weight: bold;
  position: absolute;
  margin: 0px;
}
.sub_toggle_pie_options {
  bottom: 18px;

  width: inherit;
  position: absolute;
  flex-direction: column;
}
.hide_button {
  display: none;
}
.questionicon {
  position: absolute;
  top: 5px;
  right: 5px;
}
</style>
