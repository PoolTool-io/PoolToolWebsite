<template>
  <div>
    <genesis-bar
      :showBlockIcons="showBlockIcons"
      :ispulseVisible="ispulseVisible"
      currency="ada"
      :ismobile="ismobile"
      :genesis="genesis"
      :mini="false"
      :nightmode="nightmode"
    ></genesis-bar>
    <v-row dense class="mb-1">
      <v-col class="">
        <track-rewards :nightmode="nightmode"></track-rewards>
      </v-col>
      <v-col class="">
        <drep-platform :nightmode="nightmode"></drep-platform>
      </v-col>
      <v-col class="">
        <pool-tool-bot :nightmode="nightmode"></pool-tool-bot>
      </v-col>
    </v-row>
    <v-tabs v-model="tab" show-arrows dark>
      <v-tab key="dashboard" v-if="isSignedIn"> Dashboard </v-tab>
      <v-tab key="pools"> Pools </v-tab>
      <v-tab key="addresses"> Addresses </v-tab>
      <v-tab key="profile"> Profile </v-tab>
    </v-tabs>

    <div class="">
      <v-tabs-items v-model="tab" dark style="background-color: #070f28">
        <v-tab-item key="dashboard" v-if="isSignedIn">
          <dashboard
            :nightmode="nightmode"
            :ismobile="ismobile"
            :livedatamy="livedatamy"
            :livedatafaves="livedatafaves"
          ></dashboard>
        </v-tab-item>
        <v-tab-item key="pools">
          <v-row dense class="mt-6">
            <v-col>
              <v-card elevation="2" outlined :dark="nightmode" height="100%">
                <div class="pt_form_title">
                  {{ $t("home.rosComparisonAllPools") }}
                  <span v-if="histogramEpoch != 0">
                    in epoch {{ histogramEpoch }}</span
                  >
                </div>
                <v-card-text class="mt-10 mt-sm-0">
                  <bar-chart
                    :width="ismobile ? null : chartScale"
                    :height="ismobile ? null : chartScale * 0.2"
                    :chart-data="rewardsHistogramData"
                    :chartOptions="roshistogramoptions"
                  ></bar-chart>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-card
            v-if="isSignedIn && myPoolList.length"
            class="mt-6 mx-auto mb-4"
            elevation="5"
            :dark="nightmode"
          >
            <div class="pt_form_title">
              {{ $t("app.profile.myPools") }}
            </div>
            <v-card-text>
              <pool-list
                :nightmode="true"
                :favorites="favorites"
                :myPoolList="myPoolList"
                :tableheaders="pooltableheaders"
                :genesis="genesis"
                @togglefavorite="togglefavorite"
              ></pool-list>
            </v-card-text>
          </v-card>

          <v-card class="mt-6 mx-auto mb-4" elevation="5" :dark="nightmode">
            <div class="pt_form_title">
              {{ $t("app.profile.favPools") }}
            </div>
            <v-card-text>
              <pool-list
                :nightmode="true"
                :favorites="favorites"
                @togglefavorite="togglefavorite"
                :myPoolList="favPoolList"
                :tableheaders="pooltableheaders"
                :genesis="genesis"
              ></pool-list>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item key="addresses" :dark="true">
          <div>
            <v-row dense class="mt-6">
              <v-col>
                <v-card elevation="2" outlined :dark="nightmode" height="100%">
                  <div class="pt_form_title">
                    {{ $t("home.rosComparisonAllStakeKeys") }}
                    <span v-if="histogramEpochkeys != 0">
                      in epoch {{ histogramEpochkeys }}</span
                    >
                  </div>
                  <v-card-text class="mt-10 mt-sm-0">
                    <bar-chart
                      :width="ismobile ? null : chartScale"
                      :height="ismobile ? null : chartScale * 0.2"
                      :chart-data="rewardsHistogramDatakeys"
                      :chartOptions="roshistogramoptionskeys"
                    ></bar-chart>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <addresses-card
              v-if="isSignedIn"
              :ismobile="ismobile"
              :nightmode="nightmode"
              :favAddr="false"
              :favoriteaddrs="favoriteaddrs"
              :livedata="livedatamy"
              :myAddresses="myAddresses"
              @togglefavorite="toggleAddressFavorite"
            />
            <addresses-card
              :nightmode="nightmode"
              :ismobile="ismobile"
              :favAddr="true"
              :favoriteaddrs="favoriteaddrs"
              :myAddresses="myAddresses"
              :livedata="livedatafaves"
              @togglefavorite="toggleAddressFavorite"
            />
          </div>
        </v-tab-item>
        <v-tab-item key="profile" :dark="true">
          <settings-card
            :ismobile="ismobile"
            :currency="currency"
            :nightmode="true"
            @loadLocaleMessages="loadLocaleMessages"
            @setCurrency="setCurrency"
          />
        </v-tab-item>
      </v-tabs-items>
    </div>
  </div>
</template>
<script>
import numeral from "numeral";
import { db } from "@/firebase";
import pooltable from "@/mixins/pooltable";
import poolfavorites from "@/mixins/poolfavorites";
import GenesisBar from "@/components/GenesisBar";
import { preference } from "vue-preferences";
import AddressesCard from "@/components/AddressesCard";
const favoriteaddr = preference("favoriteaddr", {
  defaultValue: [],
});
export default {
  props: [
    "ismobile",
    "currency",
    "showBlockIcons",
    "ispulseVisible",
    "nightmode",
  ],
  data() {
    return {
      tab: "addresses",
      chartScale: 300,
      rewardsHistogram: {},
      byclaimed: true, //false = byfave
      livedatafaves: {},
      livedatamy: {},
      rewardsHistogramkeys: {},
      favoriteaddrs: favoriteaddr.get(),
    };
  },
  mixins: [pooltable, poolfavorites],
  components: {
    AddressesCard,
    PoolList: () => import("@/components/PoolList"),
    SettingsCard: () => import("@/components/SettingsCard"),
    TrackRewards: () => import("@/components/TrackRewards"),
    PoolToolBot: () => import("@/components/PoolToolBot"),
    DrepPlatform: () => import("@/components/DrepPlatform"),
    BarChart: () => import("@/components/BarChart"),
    dashboard: () => import("@/components/dashBoard"),
    GenesisBar,
  },
  watch: {
    triggerFavoritesOrEpoch: {
      immediate: true,
      handler() {
        this.loadFavoriteAddressData();
      },
    },
    triggerAddressOrEpoch: {
      immediate: true,
      handler() {
        this.loadAllAddressData();
      },
    },

    allPoolList: {
      immediate: true,
      handler(newval) {
        if (newval.length) {
          newval.forEach((x) => {
            this.$store.dispatch("bindSinglePool", x);
          });
        }
      },
    },
  },

  created() {
    this.bindHistogramData();
    this.bindHistogramDatakeys();
  },
  mounted() {
    this.$emit("isLoaded", true);
  },
  methods: {
    loadFavoriteAddressData: function () {
      if (this.viewepoch != null) {
        this.livedatafaves = {};
        this.axios({
          method: "post",
          url: "https://api.pooltool.io/v1/pivotrewards",
          data: {
            stake_key: this.favoriteaddrs,
          },
          headers: {},
        });

        this.favoriteaddrs.forEach(function (address) {
          if (/[a-f0-9]{56}/gim.test(address)) {
            this.$set(this.livedatafaves, String(address), {
              nickname: "",
              stake_address: address,
              epoch: this.viewepoch,
            });
            const livereffav = "livedatafaves." + String(address);
            this.$rtdbBind(
              livereffav,
              db
                .ref(this.network + "/stake_hist")
                .child(address)
                .child(this.viewepoch),
              {
                serialize: (snapshot) => {
                  var aitem = snapshot.val();
                  if (aitem == null) {
                    aitem = {};
                  }
                  aitem["stake_address"] = address;
                  aitem["epoch"] = this.viewepoch;

                  return aitem;
                },
              }
            );
          }
        }, this);
      }
    },

    loadAllAddressData: function () {
      if (this.viewepoch != null) {
        this.livedatamy = {};
        if (Object.keys(this.myAddresses).length) {
          this.axios({
            method: "post",
            url: "https://api.pooltool.io/v1/pivotrewards",
            data: {
              stake_key: Object.keys(this.myAddresses),
            },
            headers: {},
          });
        }

        for (const address in this.myAddresses) {
          this.$set(this.livedatamy, String(address), {
            nickname: "",
            stake_address: address,
            epoch: this.viewepoch,
          });
          const liverefmy = "livedatamy." + String(address);
          this.$rtdbBind(
            liverefmy,
            db
              .ref(this.network + "/stake_hist")
              .child(address)
              .child(this.viewepoch),
            {
              serialize: (snapshot) => {
                var aitem = snapshot.val();
                if (aitem == null) {
                  aitem = {};
                }

                aitem["nickname"] = this.myAddresses[address].nickname;
                aitem["stake_address"] = address;
                aitem["epoch"] = this.viewepoch;
                return aitem;
              },
            }
          );
        }
      }
    },
    bindHistogramDatakeys: function () {
      this.$rtdbBind(
        "rewardsHistogramkeys",
        db.ref(this.network + "/staticCharts").child("rewardsHistogram")
      );
    },
    toggleAddressFavorite: function (addressid) {
      var indx = this.favoriteaddrs.indexOf(addressid);
      if (indx == -1) {
        this.favoriteaddrs.push(addressid);
      } else {
        this.favoriteaddrs.splice(indx, 1);
      }

      favoriteaddr.set(this.favoriteaddrs);
    },

    bindHistogramData: function () {
      this.$rtdbBind(
        "rewardsHistogram",
        db.ref(this.network + "/staticCharts").child("poolRewardsHistogram")
      );
    },
    setCurrency(currency) {
      this.$emit("setCurrency", currency);
    },

    loadLocaleMessages(data) {
      this.$emit("loadLocaleMessages", data);
    },
  },
  computed: {
    roshistogramoptionskeys: function () {
      return {
        plugins: {
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

                let percentage = ((context.raw * 100) / sum).toFixed(0) + "%";
                return percentage + " of Stake Keys";
              },
            },
          },
          datalabels: {
            display: false,
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
              callback: function (value) {
                return numeral(value).format("0,0.0a");
              },
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("app.totalAccounts"),
            },
          },

          xAxes: {
            min: 0,
            padding: 100,
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              beginAtZero: true,
              minRotation: 10,
              font: {
                size: this.ismobile ? 8 : 12,
              },
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("app.networkHealth.stakingros"),
            },
          },
        },
      };
    },
    userData: function () {
      return this.$store.getters.getUserData;
    },
    myAddresses: function () {
      return this.userData != null && this.userData.myAddresses != null
        ? this.userData.myAddresses
        : {};
    },
    viewepoch: function () {
      return this.$store.getters.getNewRewardsCompleteEpoch;
    },
    triggerFavoritesOrEpoch: function () {
      return JSON.stringify(this.favoriteaddrs) + String(this.viewepoch);
    },
    triggerAddressOrEpoch: function () {
      return (
        JSON.stringify(Object.keys(this.myAddresses)) + String(this.viewepoch)
      );
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },
    isSignedIn: function () {
      return this.$store.getters.getIsSignedIn;
    },
    histogramEpoch: function () {
      if (typeof this.rewardsHistogram.histogramdata != "undefined") {
        return this.rewardsHistogram.epoch;
      } else {
        return 0;
      }
    },
    rewardsHistogramDatakeys: function () {
      let labels = [];
      let data = [];
      if (typeof this.rewardsHistogramkeys.histogramdata != "undefined") {
        this.rewardsHistogramkeys.histogramdata.forEach((x, i) => {
          if (i == this.rewardsHistogramkeys.histogramdata.length - 1) {
            labels.push(String(x.min) + "% +");
          } else {
            labels.push(String(x.min) + "% - " + String(x.max) + "%");
          }

          data.push(x.freq);
        });
      }
      return {
        labels: labels,
        datasets: [
          {
            label: labels,
            data: data,
            borderColor: "rgba(160, 254, 106, 0.5)",
            backgroundColor: "rgba(160, 254, 106, 0.7)",

            borderWidth: 1,
          },
        ],
      };
    },

    roshistogramoptions: function () {
      return {
        plugins: {
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

                let percentage = ((context.raw * 100) / sum).toFixed(0) + "%";
                return percentage + " of Pools";
              },
            },
          },
          datalabels: {
            display: false,
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
              minRotation: 10,
              beginAtZero: true,
              callback: function (value) {
                return numeral(value).format("0,0.0a");
              },
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("app.totalPools"),
            },
          },

          xAxes: {
            min: 0,
            padding: 100,
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
              beginAtZero: true,

              font: {
                size: this.ismobile ? 8 : 12,
              },
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("app.networkHealth.Poolros"),
            },
          },
        },
      };
    },

    histogramEpochkeys: function () {
      if (typeof this.rewardsHistogramkeys.histogramdata != "undefined") {
        return this.rewardsHistogramkeys.epoch;
      } else {
        return 0;
      }
    },
    rewardsHistogramData: function () {
      let labels = [];
      let data = [];
      if (typeof this.rewardsHistogram.histogramdata != "undefined") {
        this.rewardsHistogram.histogramdata.forEach((x, i) => {
          if (i == this.rewardsHistogram.histogramdata.length - 1) {
            labels.push(String(x.min) + "% +");
          } else {
            labels.push(String(x.min) + "% - " + String(x.max) + "%");
          }

          data.push(x.freq);
        });
      }
      return {
        labels: labels,
        datasets: [
          {
            label: labels,
            data: data,
            borderColor: "rgba(160, 254, 106, 0.5)",
            backgroundColor: "rgba(160, 254, 106, 0.7)",

            borderWidth: 1,
          },
        ],
      };
    },
    allPoolList: function () {
      let pools = [];
      if (
        this.userData != null &&
        typeof this.userData.myPools != "undefined"
      ) {
        pools = Object.keys(this.userData.myPools);
      }

      return [...new Set([...pools, ...this.favorites])];
    },
    favPoolList: function () {
      return this.pools.filter((a) => this.favorites.includes(a.poolpubkey));
    },
    pooltableheaders: function () {
      var h = [];

      h.push({
        text: "",
        align: "center",
        sortable: true,
        value: "favorite",
      });

      h.push({
        text: this.$t("global.ticker"),
        align: "center",
        sortable: true,
        value: "ticker",
      });
      h.push({
        text: this.$t("global.poolName"),
        align: "left",
        sortable: true,
        value: "pool_name",
      });

      h.push({
        text:
          this.$t("global.epoch") +
          " " +
          (this.genesis.epoch - 2) +
          " " +
          this.$t("global.ros"),
        align: "center",
        value: "roi",
        divider: true,
        sortable: true,
        filterable: false,
      });
      h.push({
        text:
          this.$t("global.epoch") +
          " " +
          (this.genesis.epoch - 1) +
          " " +
          this.$t("global.ros"),
        align: "center",
        value: "roifcp1",
        divider: true,
        sortable: true,
        filterable: false,
      });

      h.push({
        value: "blockstake",
        sortable: true,
        align: "right",
        text: this.$t("global.activeStake"),
      });
      h.push({
        text: this.$t("global.height"),
        align: "center",
        value: "height",
        sortable: true,
        filterable: false,
        divider: true,
      });

      h.push({
        value: "epoch_blocks",
        sortable: true,
        align: "center",
        text: this.$t("global.epochBlocks"),
        divider: true,
      });

      h.push({
        value: "livestake",
        sortable: true,
        align: "right",
        text: this.$t("global.liveStake") + " (₳)",
        divider: true,
      });

      h.push({
        value: "life_blocks",
        sortable: true,
        align: "end",
        text: this.$t("global.lifetimeBlocks"),
      });
      h.push({
        text: this.$t("global.lifetimeROS"),
        align: "center",
        value: "lifetimeroi",
        filterable: true,
      });
      h.push({
        text: this.$t("global.twelveros"),
        align: "center",
        value: "twelveros",
        filterable: true,
      });
      h.push({
        text: this.$t("global.sixros"),
        align: "center",
        value: "sixros",
        filterable: true,
      });

      h.push({
        value: "actions",
        sortable: false,
        align: "end",
        text: this.$t("global.actions"),
      });

      return h;
    },

    pools: function () {
      return this.$store.getters.getPools;
    },
    myPoolList: function () {
      if (
        this.userData != null &&
        typeof this.userData.myPools != "undefined"
      ) {
        return (
          this.pools.filter((a) =>
            Object.keys(this.userData.myPools).includes(a.poolpubkey)
          ) || []
        );
      } else {
        return [];
      }
    },

    userId: function () {
      return this.$store.getters.getUserId;
    },
    genesis: function () {
      return this.$store.getters.getGenesis;
    },
  },
};
</script>
<style scoped>
.v-tabs-items {
  background: transparent;
}
</style>
