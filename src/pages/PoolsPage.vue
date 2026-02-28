<template>
  <div>
    <genesis-bar
      :showBlockIcons="showBlockIcons"
      :ismobile="ismobile"
      :ispulseVisible="ispulseVisible"
      currency="ada"
      :genesis="genesis"
      :nightmode="nightmode"
      :mini="true"
      @isLoaded="genesisloaded"
    ></genesis-bar>

    <v-card dark>
      <v-card-title class="my-0 py-0">
        {{ $t("app.pools.cardanoPools") }}
        <v-spacer></v-spacer>
        <div>
          <v-row class="pa-0 ma-0">
            <v-text-field
              class="mt-0 pt-0"
              v-model="search"
              :append-icon="search ? 'mdi-close' : 'mdi-magnify'"
              :label="$t('global.search')"
              hide-details
              single-line
              @click:append="clearSearch"
            >
              <template v-slot:append-outer>
                <v-btn
                  text
                  icon
                  class="pb-0 mb-0"
                  @click="expandFilter = !expandFilter"
                >
                  <v-icon :color="filterIconColor">mdi-tune</v-icon>
                </v-btn>
                <v-dialog v-model="columnsetdialog" width="500">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn text icon class="pb-0 mb-0" v-bind="attrs" v-on="on">
                      <v-icon>mdi-table</v-icon>
                    </v-btn>
                  </template>
                  <v-card class="v-card-dialog" :dark="nightmode">
                    <v-card-title class="py-1 my-1">{{
                      $t("app.pools.chooseDisplayedColumnData")
                    }}</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text
                      class="py-1 my-1"
                      style="height: 300px; overflow: auto"
                    >
                      <v-checkbox
                        hide-details
                        class="py-0 my-0 px-0 mx-0"
                        v-for="item in tableheaders.listheaders"
                        v-bind:key="item.value"
                        v-model="viewcolumns"
                        :label="item.text"
                        :value="item.value"
                      ></v-checkbox>
                    </v-card-text>
                    <v-divider></v-divider>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="blue darken-1"
                        text
                        @click="columnsetdialog = false"
                      >
                        {{ $t("global.close") }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </template>
            </v-text-field>
          </v-row>
          <v-radio-group
            dense
            :column="false"
            class="pa-0 ma-0"
            hide-details
            v-model="searchtype"
            :mandatory="true"
          >
            <v-row class="pa-0 ma-0 d-flex flex-row justify-space-between">
              {{ $t("global.search") }}:
              <v-radio
                :color="nightmode ? 'blue darken-2' : 'blue lighten-1'"
                :label="this.$t('app.pools.all')"
                value="all"
              ></v-radio>
              <v-radio
                :color="nightmode ? 'blue darken-2' : 'blue lighten-1'"
                :label="this.$t('app.pools.tickerOnly')"
                value="ticker"
              ></v-radio>
            </v-row>
          </v-radio-group>
        </div>
      </v-card-title>
      <v-container v-if="expandFilter" fluid class="pt-2 pb-2">
        <v-card class="mx-auto mb-2" outlined raised>
          <v-card-text class="my-0 py-0">
            <v-row justify="space-around">
              <v-switch
                dense
                inset
                v-model="filterprefs.solo"
                :label="$t('app.pools.soloOnly')"
                class="mx-2"
              ></v-switch>
              <v-switch
                dense
                inset
                v-model="filterprefs.syncd"
                :label="$t('app.pools.synchronized')"
                class="mx-2"
              ></v-switch>

              <v-switch
                dense
                inset
                v-model="filterprefs.poolsRetired"
                :label="$t('app.pools.retired')"
                class="mx-2"
              ></v-switch>
              <v-switch
                dense
                inset
                v-model="filterprefs.poolsFavorite"
                :label="$t('app.pools.favorite')"
                class="mx-2"
              ></v-switch>
              <v-switch
                dense
                inset
                v-model="filterprefs.itnVerified"
                :label="$t('app.pools.itnVerifiedTicker')"
                class="mx-2"
              ></v-switch>
              <v-switch
                dense
                inset
                v-model="filterprefs.stakegtzero"
                :label="$t('app.pools.nonZeroStake')"
                class="mx-2"
              ></v-switch>
              <v-switch
                dense
                inset
                v-model="filterprefs.unsaturated"
                :label="$t('app.pools.notSaturated')"
                class="mx-2"
              ></v-switch>
            </v-row>
            <v-row>
              <v-col cols="12" xs="12" sm="12" md="6" lg="6" class="pt-0 mt-0">
                <h4 class="hidden-md-and-up text-center">
                  {{ $t("global.blocks") }}
                </h4>
                <v-slider
                  thumb-color="primary secondary--text"
                  v-model="filterprefs.lifetimeblocks"
                  :tick-labels="ticksLabels"
                  class="align-center pt-sm-0 pt-6"
                  :max="4"
                  step="1"
                  ticks="always"
                  tick-size="4"
                >
                  <template v-slot:label="">
                    <span class="hidden-sm-and-down">{{
                      $t("global.blocks")
                    }}</span>
                  </template>
                </v-slider>
              </v-col>
              <v-col cols="12" xs="12" sm="12" md="6" lg="6" class="pt-0 mt-0">
                <h4 class="hidden-md-and-up mb-2 text-center">
                  {{ $t("global.stake") }}
                </h4>
                <v-range-slider
                  thumb-color="primary secondary--text"
                  v-model="filterprefs.stakerange"
                  :max="(genesis.livedata2.max_livestake + 10e12) / 1e12"
                  min="0"
                  hide-details
                  thumb-label="always"
                  class="align-center pt-6"
                >
                  <template v-slot:thumb-label="props">
                    {{ props.value }}m
                  </template>
                  <template v-slot:label="">
                    <span class="hidden-sm-and-down">{{
                      $t("global.stake")
                    }}</span>
                  </template>
                </v-range-slider>
              </v-col>

              <v-col cols="12" xs="12" sm="12" md="6" lg="4" class="pt-0 mt-0">
                <h4 class="hidden-md-and-up mb-2 text-center">
                  {{ $t("global.epochFee") + " (₳)" }}
                </h4>
                <v-range-slider
                  thumb-color="primary secondary--text"
                  v-model="filterprefs.epochFeeRange"
                  :max="9"
                  :min="0"
                  hide-details
                  thumb-label="always"
                  class="align-center pt-6"
                >
                  <template v-slot:thumb-label="props">
                    {{ epochFeeValues[props.value] | numFormat("0,0.[0]a")
                    }}{{ props.value == 9 ? "+" : "" }}
                  </template>
                  <template v-slot:label="">
                    <span class="hidden-sm-and-down">{{
                      $t("global.epochFee") + " (₳)"
                    }}</span>
                  </template>
                </v-range-slider>
              </v-col>
              <v-col cols="12" xs="12" sm="12" md="6" lg="4" class="pt-0 mt-0">
                <h4 class="hidden-md-and-up mb-2 text-center">
                  {{ $t("global.declaredPledge") + " (₳)" }}
                </h4>
                <v-range-slider
                  thumb-color="primary secondary--text"
                  v-model="filterprefs.pledgeRange"
                  :max="12"
                  :min="0"
                  hide-details
                  thumb-label="always"
                  class="align-center pt-6"
                >
                  <template v-slot:thumb-label="props">
                    {{ pledgeValues[props.value] | numFormat("0,0.[0]a")
                    }}{{ props.value == 12 ? "+" : "" }}
                  </template>
                  <template v-slot:label="">
                    <span class="hidden-sm-and-down">{{
                      $t("global.declaredPledge") + " (₳)"
                    }}</span>
                  </template>
                </v-range-slider>
              </v-col>
              <v-col cols="12" xs="12" sm="12" md="12" lg="4" class="pt-0 mt-0">
                <h4 class="hidden-md-and-up mb-2 text-center">
                  {{ $t("global.variableFee") + " (%)" }}
                </h4>
                <v-range-slider
                  thumb-color="primary secondary--text"
                  v-model="filterprefs.marginrange"
                  :tick-labels="feeLabels"
                  max="30"
                  min="0"
                  hide-details
                  thumb-label="always"
                  class="align-center pt-6"
                >
                  <template v-slot:thumb-label="props">
                    {{ (feeValues[props.value] * 100) | numFormat("0.[0]") }}
                  </template>
                  <template v-slot:label="">
                    <span class="hidden-sm-and-down">{{
                      $t("global.variableFee") + " (%)"
                    }}</span>
                  </template>
                </v-range-slider>
              </v-col>
            </v-row>
          </v-card-text>
          <div class="d-flex pt-2">
            <div class="pl-2 text-center mr-auto align-self-center">
              {{ this.hiddenItems }} {{ $t("app.pools.poolsHidden") }}
            </div>
            <div class="d-flex flex-wrap justify-end">
              <v-btn :color="unappliedfilters" text @click="applyfilters">{{
                $t("app.pools.apply")
              }}</v-btn>
              <v-btn text @click="savefilters">{{
                $t("app.pools.save")
              }}</v-btn>
              <v-btn text @click="resetFilters">{{
                $t("app.pools.reset")
              }}</v-btn>
              <v-btn text @click="expandFilter = !expandFilter">{{
                $t("global.close")
              }}</v-btn>
            </div>
          </div>
        </v-card>
      </v-container>
      <pool-list
        :nightmode="nightmode"
        :favorites="favorites"
        @togglefavorite="togglefavorite"
        :myPoolList="poolsfiltered"
        :tableheaders="tableheaders.tableheaders"
        :genesis="genesis"
        :tableupdating="tableupdating"
      ></pool-list>
    </v-card>
  </div>
</template>
<script>
import poolfavorites from "@/mixins/poolfavorites";
import pooltable from "@/mixins/pooltable";
import { preference } from "vue-preferences";
import { mapPreferences } from "vue-preferences";

const favoritepools = preference("fav_mainnet_pools", {
  defaultValue: [],
});

const savedfilters = preference("savedfilters", {
  defaultValue: {
    lifetimeblocks: 0,
    stakegtzero: false,
    stakerange: [0, 500],
    marginrange: [0, 30],
    epochFeeRange: [0, 9],
    pledgeRange: [0, 12],
    syncd: false,
    solo: false,
    unsaturated: false,
    poolsRetired: false,
    itnVerified: false,
    poolsFavorite: false,
  },
});

export default {
  props: [
    "ismobile",
    "currency",
    "userId",
    "nightmode",
    "ispulseVisible",
    "showBlockIcons",
  ],
  mixins: [pooltable, poolfavorites],
  components: {
    GenesisBar: () => import("../components/GenesisBar"),
    PoolList: () => import("../components/PoolList"),
  },
  data: function () {
    return {
      tableupdating: false,
      columnsetdialog: false,
      searchtype: "all",
      searchtickers: true,
      searchnames: true,
      searchpoolids: true,
      genesisLoaded: false,
      poolsLoaded: false,
      showGrouper: true,
      filterprefs: {
        lifetimeblocks: 0,
        stakegtzero: false,
        stakerange: [0, 500],
        marginrange: [0, 30],
        epochFeeRange: [0, 9],
        pledgeRange: [0, 12],
        syncd: false,
        solo: false,
        unsaturated: false,
        poolsRetired: false,
        itnVerified: false,
        poolsFavorite: false,
      },

      appliedfilters: {
        lifetimeblocks: 0,
        stakegtzero: false,
        stakerange: [0, 500],
        marginrange: [0, 30],
        epochFeeRange: [0, 9],
        pledgeRange: [0, 12],
        syncd: false,
        solo: false,
        unsaturated: false,
        poolsRetired: false,
        itnVerified: false,
        poolsFavorite: false,
      },
      feeLabels: [
        "0",
        null,
        "1",
        null,
        "2",
        null,
        "3",
        null,
        "4",
        null,
        "5",
        null,
        "6",
        null,
        "7",
        null,
        "8",
        null,
        "9",
        null,
        "10",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "100",
      ],
      feeValues: [
        0, 0.005, 0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.045, 0.05,
        0.055, 0.06, 0.065, 0.07, 0.075, 0.08, 0.085, 0.09, 0.095, 0.1, 0.15,
        0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
      ],
      // pledgeValues: [
      //   0, 100000, 250000, 500000, 750000, 1e6, 2.5e6, 5e6, 10e6, 10e6,
      // ],
      pledgeValues: [
        0, 10000, 25000, 50000, 75000, 100000, 250000, 500000, 750000, 1e6,
        2.5e6, 5e6, 10e6,
      ],
      epochFeeValues: [0, 250, 500, 750, 1000, 2500, 5000, 10000, 50000, 50000],
      ticksLabels: ["0+", "1+", "10+", "100+", "1k+"],
      favorites: favoritepools.get(),

      expandFilter: false,
    };
  },
  computed: {
    poolsRetired: function () {
      return this.appliedfilters.poolsRetired;
    },
    heights: function () {
      return this.$store.getters.heights;
    },
    userData: function () {
      return this.$store.getters.getUserData;
    },
    isSignedIn: function () {
      return this.$store.getters.getIsSignedIn;
    },
    poolCountsByGroup: function () {
      var poolcounts = {};
      this.pools.forEach((item) => {
        if (!item.pool_retired && !item.genesis_pool) {
          if (item.groupname != null && item.groupname != "") {
            if (typeof poolcounts[item.groupname] == "undefined") {
              poolcounts[item.groupname] = 1;
            } else {
              poolcounts[item.groupname] += 1;
            }
          }
        }
      });
      return poolcounts;
    },
    poolsfiltered: function () {
      /* eslint-disable no-unused-vars */
      return this.pools.filter((item) => {
        if (
          item["poolpledge"] / 1e6 <
            this.pledgeValues[this.appliedfilters.pledgeRange[0]] ||
          (this.appliedfilters.pledgeRange[1] != 12 &&
            item["poolpledge"] / 1e6 >
              this.pledgeValues[this.appliedfilters.pledgeRange[1]])
        ) {
          return false;
        }
        if (
          item["poolcost"] / 1e6 <
            this.epochFeeValues[this.appliedfilters.epochFeeRange[0]] ||
          (this.appliedfilters.epochFeeRange[1] != 9 &&
            item["poolcost"] / 1e6 >
              this.epochFeeValues[this.appliedfilters.epochFeeRange[1]])
        ) {
          return false;
        }

        if (
          parseFloat(item["poolmargin"]) <
            this.feeValues[this.appliedfilters.marginrange[0]] ||
          parseFloat(item["poolmargin"]) >
            this.feeValues[this.appliedfilters.marginrange[1]]
        ) {
          return false;
        }
        if (
          item["live_stake"] / 1e12 < this.appliedfilters.stakerange[0] ||
          item["live_stake"] / 1e12 > this.appliedfilters.stakerange[1]
        ) {
          return false;
        }
        if (this.appliedfilters.solo) {
          if (item["groupname"] != null && item["groupname"] != "") {
            //additional check to see how many pools they have
            if (
              typeof this.poolCountsByGroup[item["groupname"]] != "undefined" &&
              this.poolCountsByGroup[item["groupname"]] > 1
            ) {
              return false;
            }
          }
        }
        if (this.appliedfilters.syncd) {
          if (
            !(
              item["poolpubkey"] in this.heights &&
              this.heights[item["poolpubkey"]] == 1
            )
          ) {
            return false;
          }
        }
        if (this.appliedfilters.unsaturated) {
          if (item["live_stake"] > this.saturationpoint) {
            return false;
          }
        }
        if (this.appliedfilters.poolsFavorite) {
          if (this.favorites.indexOf(item["poolpubkey"]) == -1) {
            return false;
          }
        }
        if (this.appliedfilters.stakegtzero) {
          if (item["live_stake"] < 1000000) {
            return false;
          }
        }
        if (this.appliedfilters.itnVerified == true) {
          if (item["itn_verified"] == false || item["itn_verified"] == null) {
            return false;
          }
        }

        if (this.appliedfilters.poolsRetired == false) {
          if (item["pool_retired"] == true) {
            return false;
          }
        } else {
          if (item["pool_retired"] == false) {
            return false;
          }
        }
        if (this.appliedfilters.lifetimeblocks > 0) {
          var inc = [0, 1, 10, 100, 1000];
          if (item["life_blocks"] < inc[this.appliedfilters.lifetimeblocks]) {
            return false;
          }
        }
        if (this.search != null && this.search != "") {
          var search = this.search.toLocaleUpperCase();
          if (this.searchtype == "all") {
            if (
              (typeof item["pool_name"] === "string" &&
                item["pool_name"]
                  .toString()
                  .toLocaleUpperCase()
                  .indexOf(search) !== -1) ||
              (typeof item["ticker"] === "string" &&
                item["ticker"]
                  .toString()
                  .toLocaleUpperCase()
                  .indexOf(search) !== -1) ||
              (typeof item["pool_md_name"] === "string" &&
                item["pool_md_name"]
                  .toString()
                  .toLocaleUpperCase()
                  .indexOf(search) !== -1) ||
              (typeof item["poolpubkey"] === "string" &&
                item["poolpubkey"]
                  .toString()
                  .toLocaleUpperCase()
                  .indexOf(search) !== -1)
            ) {
              return true;
            } else {
              return false;
            }
          } else {
            if (
              typeof item["ticker"] === "string" &&
              item["ticker"].toString().toLocaleUpperCase() == search
            ) {
              return true;
            } else {
              return false;
            }
          }
        }
        return true;
      });
    },
    rawpoolcount: function () {
      return this.pools_raw.length;
    },
    poolscount: function () {
      return this.poolsfiltered.length;
    },
    pools: function () {
      return this.$store.getters.getPools;
    },
    isInactive: function () {
      return this.$store.getters.getIsInactive;
    },
    unappliedfilters: function () {
      var a =
        this.filterprefs.poolsFavorite != this.appliedfilters.poolsFavorite ||
        this.filterprefs.unsaturated != this.appliedfilters.unsaturated ||
        this.filterprefs.itnVerified != this.appliedfilters.itnVerified ||
        this.filterprefs.stakegtzero != this.appliedfilters.stakegtzero ||
        this.filterprefs.lifetimeblocks != this.appliedfilters.lifetimeblocks ||
        this.filterprefs.syncd != this.appliedfilters.syncd ||
        this.filterprefs.solo != this.appliedfilters.solo ||
        this.appliedfilters.marginrange[0] != this.filterprefs.marginrange[0] ||
        this.appliedfilters.marginrange[1] != this.filterprefs.marginrange[1] ||
        this.appliedfilters.epochFeeRange[0] !=
          this.filterprefs.epochFeeRange[0] ||
        this.appliedfilters.epochFeeRange[1] !=
          this.filterprefs.epochFeeRange[1] ||
        this.appliedfilters.pledgeRange[0] != this.filterprefs.pledgeRange[0] ||
        this.appliedfilters.pledgeRange[1] != this.filterprefs.pledgeRange[1] ||
        this.appliedfilters.stakerange[0] != this.filterprefs.stakerange[0] ||
        this.appliedfilters.stakerange[1] != this.filterprefs.stakerange[1]
          ? "success"
          : "";
      return a;
    },
    hiddenItems: function () {
      return this.pools_count_overall - this.poolscount;
    },
    filterIconColor: function () {
      return this.appliedfilters.stakerange[0] != 0 ||
        //this.appliedfilters.stakerange[1] != 500 ||
        this.appliedfilters.lifetimeblocks != 0 ||
        this.appliedfilters.unsaturated != false ||
        this.appliedfilters.syncd != false ||
        this.appliedfilters.solo != false ||
        this.appliedfilters.itnVerified != false ||
        this.appliedfilters.poolsFavorite != false ||
        this.appliedfilters.poolsRetired != false ||
        this.search != "" ||
        this.appliedfilters.stakegtzero != false
        ? "green"
        : "default";
    },
    pools_count_overall: function () {
      return this.pools.length;
    },
    ...mapPreferences({
      poolsPage: {
        defaultValue: 1,
      },
      poolsItemsPerPage: {
        defaultValue: 30,
      },

      search: {
        defaultValue: "",
      },
      viewcolumns: {
        defaultValue: [
          "favorite",
          "ticker",
          "poolcost",
          "poolmargin",
          "poolpledge",
          "epoch_blocks",
          "height",
          "life_blocks",
          "twelveros",
        ],
      },
    }),

    genesis: function () {
      return this.$store.getters.getGenesis;
    },
    tableheaders: function () {
      var h = [];
      var hl = [];

      if (
        this.isSignedIn &&
        this.showGrouper &&
        this.userData != null &&
        (this.userData.authority == "administrator" ||
          this.userData.authority == "groupadmin")
      ) {
        h.push({
          text: "GROUP",
          align: "center",
          value: "groupname",
          divider: true,
          sortable: true,
          filterable: false,
        });
        hl.push({
          text: "GROUP",
          value: "groupname",
        });
      }

      if (this.viewcolumns.includes("favorite")) {
          h.push({
            text: "",
            align: "center",
            sortable: true,
            value: "favorite",
          });
        }

        hl.push({
          text: "Favorites",
          value: "favorite",
        });
      if (this.viewcolumns.includes("ticker")) {
          h.push({
            text: this.$t("global.ticker"),
            align: "center",
            sortable: true,
            value: "ticker",
            filterable: false,
          });
        }
        hl.push({
          text: this.$t("global.ticker"),
          value: "ticker",
        });

        if (this.viewcolumns.includes("pool_name")) {
          h.push({
            text: this.$t("global.poolName"),
            align: "left",
            sortable: true,
            value: "pool_name",
          });
        }
        hl.push({
          text: this.$t("global.poolName"),
          value: "pool_name",
        });

        if (this.viewcolumns.includes("poolpubkey")) {
          h.push({
            value: "poolpubkey",
            sortable: true,
            align: "start",
            text: this.$t("global.poolID"),
            divider: true,
          });
        }
        hl.push({
          text: this.$t("global.poolID"),
          value: "poolpubkey",
        });

        if (this.viewcolumns.includes("poolcost")) {
          h.push({
            value: "poolcost",
            sortable: true,
            align: "end",
            text: this.$t("global.epochFee") + " (₳)",
          });
        }
        hl.push({
          text: this.$t("global.epochFee"),
          value: "poolcost",
        });

        if (this.viewcolumns.includes("poolmargin")) {
          h.push({
            value: "poolmargin",
            sortable: true,
            align: "end",
            text: this.$t("global.variableFee"),
          });
        }
        hl.push({
          text: this.$t("global.variableFee"),
          value: "poolmargin",
        });

        if (this.viewcolumns.includes("poolpledge")) {
          h.push({
            value: "poolpledge",
            sortable: true,
            align: "end",
            divider: true,
            text: this.$t("global.declaredPledge") + " (₳)",
          });
        }
        hl.push({
          text: this.$t("global.declaredPledge"),
          value: "poolpledge",
        });
      if (this.viewcolumns.includes("roi")) {
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
        }
        hl.push({
          text:
            this.$t("global.epoch") +
            " " +
            (this.genesis.epoch - 2) +
            " " +
            this.$t("global.ros"),
          value: "roi",
        });

        if (this.viewcolumns.includes("roifcp1")) {
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
        }
        hl.push({
          text:
            this.$t("global.epoch") +
            " " +
            (this.genesis.epoch - 1) +
            " " +
            this.$t("global.ros"),
          value: "roifcp1",
        });
      if (this.viewcolumns.includes("epoch_tax")) {
        h.push({
          text: this.$t("global.epochPoolFees"),
          align: "center",
          value: "epoch_tax",
          divider: true,
          sortable: false,
          filterable: false,
        });
      }
      hl.push({
        text: this.$t("global.epochPoolFees"),
        value: "epoch_tax",
      });

      if (this.viewcolumns.includes("blockstake")) {
        h.push({
          value: "blockstake",
          sortable: true,
          align: "right",
          text: this.$t("global.activeStake"),
        });
      }
      hl.push({
        text: this.$t("global.activeStake"),
        value: "blockstake",
      });

      if (this.viewcolumns.includes("activestakepercent")) {
        h.push({
          text: this.$t("global.activeStake") + " %",
          align: "center",
          sortable: true,
          value: "activestakepercent",
          filterable: false,
        });
      }
      hl.push({
        text: this.$t("global.activeStake") + " %",
        value: "activestakepercent",
      });

      if (this.viewcolumns.includes("epoch_blocks_percent")) {
        h.push({
          text: this.$t("global.epochBlocks") + " %",
          sortable: true,
          align: "center",
          value: "epoch_blocks_percent",
          filterable: false,
        });
      }
      hl.push({
        text: this.$t("global.epochBlocks") + " %",
        value: "epoch_blocks_percent",
      });

      if (this.viewcolumns.includes("epoch_blocks")) {
        h.push({
          value: "epoch_blocks",
          sortable: true,
          align: "center",
          text: this.$t("global.epochBlocks"),
          divider: true,
        });
      }
      hl.push({
        text: this.$t("global.epochBlocks"),
        value: "epoch_blocks",
      });

      if (this.viewcolumns.includes("height")) {
        h.push({
          text: this.$t("global.height"),
          align: "center",
          value: "height",
          sortable: true,
          filterable: false,
          divider: true,
        });
      }
      hl.push({
        text: this.$t("global.height"),
        value: "height",
      });
      // h.push({ text: 'Lifetime Rewards (₳)', align: 'right', value: 'lifetimerewards', filterable: false, })

      if (this.viewcolumns.includes("sixros")) {
          h.push({
            text: this.$t("global.sixros"),
            align: "center",
            value: "sixros",
            filterable: true,
          });
        }
        hl.push({
          text: this.$t("global.sixros"),
          value: "sixros",
        });
        if (this.viewcolumns.includes("twelveros")) {
          h.push({
            text: this.$t("global.twelveros"),
            align: "center",
            value: "twelveros",
            filterable: true,
          });
        }
        hl.push({
          text: this.$t("global.twelveros"),
          value: "twelveros",
        });
        if (this.viewcolumns.includes("lifetimeroi")) {
          h.push({
            text: this.$t("global.lifetimeROS"),
            align: "center",
            value: "lifetimeroi",
            filterable: true,
          });
        }
        hl.push({
          text: this.$t("global.lifetimeROS"),
          value: "lifetimeroi",
        });
        if (this.viewcolumns.includes("lifetime_performance")) {
          h.push({
            text: this.$t("global.lifetime_performance"),
            align: "center",
            value: "lifetime_performance",
            filterable: true,
          });
        }
        hl.push({
          text: this.$t("global.lifetime_performance"),
          value: "lifetime_performance",
        });
      // h.push({ text: 'Lifetime Blocks %', align: 'center', value: 'blocks2epochspercent', filterable: false })
      if (this.viewcolumns.includes("life_blocks")) {
        h.push({
          value: "life_blocks",
          sortable: true,
          align: "end",
          text: this.$t("global.lifetimeBlocks"),
        });
      }
      hl.push({
        text: this.$t("global.lifetimeBlocks"),
        value: "life_blocks",
      });
      h.push({
        value: "actions",
        sortable: false,
        align: "end",
        text: this.$t("global.actions"),
      });
      return {
        tableheaders: h,
        listheaders: hl,
      };
    },
  },
  watch: {
    poolsRetired: function (oldval, newval) {
      console.log("watching poolsRetired", oldval, newval);
      this.$store.dispatch("bindPoolsRetired");
    },
    search: function () {
      this.poolsPage = 1;
    },
  },
  mounted() {
    this.poolsLoaded = true;
    this.$emit("isLoaded", true);
  },
  created() {
    this.$store.dispatch("bindPools");
    this.initializedata();

    if (this.viewcolumns == null)
      this.viewcolumns = [
        "favorite",
        "ticker",
        "poolcost",
        "poolmargin",
        "poolpledge",
        "epoch_blocks",
        "height",
        "life_blocks",
        "twelveros",
      ];
  },
  methods: {
    async initializedata() {
      const savedf = savedfilters.get();
      if (Object.keys(savedf).length === 0) {
        this.filterprefs.stakerange = [0, 500];
        this.appliedfilters.stakerange = [0, 500];
        this.filterprefs.marginrange = [0, 30];
        this.appliedfilters.marginrange = [0, 30];
        this.filterprefs.epochFeeRange = [0, 9];
        this.appliedfilters.epochFeeRange = [0, 9];
        this.filterprefs.pledgeRange = [0, 12];
        this.appliedfilters.pledgeRange = [0, 12];
      } else {
        if (typeof savedf.epochFeeRange == "undefined") {
          savedf["epochFeeRange"] = [0, 9];
        }
        if (typeof savedf.pledgeRange == "undefined") {
          savedf["pledgeRange"] = [0, 12];
        }

        if (typeof savedf.marginrange == "undefined") {
          savedf["marginrange"] = [0, 30];
        }
        if (typeof savedf.stakerange == "undefined") {
          savedf["stakerange"] = [0, 500];
        }

        this.filterprefs = JSON.parse(JSON.stringify(savedf));
        this.appliedfilters = JSON.parse(JSON.stringify(savedf));
      }
    },

    applyfilters: function () {
      this.appliedfilters = JSON.parse(JSON.stringify(this.filterprefs));
    },
    savefilters: function () {
      this.appliedfilters = JSON.parse(JSON.stringify(this.filterprefs));
      savedfilters.set(this.appliedfilters);
    },
    filterOnlyCapsText(value, search, item) {
      return true;
    },

    resetFilters: function () {
      this.filterprefs = {
        lifetimeblocks: 0,
        stakegtzero: false,
        stakerange: [0, 500],
        marginrange: [0, 30],
        epochFeeRange: [0, 9],
        pledgeRange: [0, 12],
        syncd: false,
        solo: false,
        unsaturated: false,
        poolsRetired: false,
        itnVerified: false,
        poolsFavorite: false,
      };
      this.appliedfilters = {
        lifetimeblocks: 0,
        stakegtzero: true,
        stakerange: [0, 500],
        marginrange: [0, 30],
        epochFeeRange: [0, 9],
        pledgeRange: [0, 12],
        syncd: false,
        solo: false,
        unsaturated: false,
        poolsRetired: false,
        itnVerified: false,
        poolsFavorite: false,
      };
    },

    clearSearch: function () {
      this.search = "";
    },
    setSearch: function (searchFor) {
      this.resetFilters();
      this.search = searchFor;
    },
    genesisloaded: function () {
      this.genesisLoaded = true;
      if (this.genesisLoaded && this.poolsLoaded) {
        this.$emit("isLoaded", true);
      }
    },
  },
};
</script>
<style>
.saturated {
  color: red;
}

.saturatedwarning {
  color: orange;
}

.v-input__append-outer {
  margin-bottom: 0px !important;
  margin-top: 0px !important;
}

.v-data-table .v-data-table__mobile-row {
  min-height: 0px;
}

.v-data-footer__pagination {
  margin: 0 10px 0 10px !important;
}

.v-data-footer__select .v-select {
  margin: 13px 0 13px 20px !important;
}
</style>
