<template>
  <div>
    <v-card class="mx-auto mb-2 rounded-0" :dark="nightmode">
      <v-btn
        fab
        :small="ismobile"
        :x-large="!ismobile"
        @click="togglefavorite(pool.pool_id)"
        top
        right
        absolute
        style="top: 10px"
      >
        <v-icon
          :color="
            pool.pool_id != '' &&
            favorites.length &&
            favorites.indexOf(pool.pool_id) != -1
              ? 'red'
              : ''
          "
          >mdi-heart</v-icon
        >
      </v-btn>
      <v-list two-line subheader :class="[pooladdstripes ? 'striped' : '']">
        <v-list-item>
          <v-list-item-content class="px-2">
            <v-list-item-title>
              <h1 v-if="poolstatus != ''" class="text-center">
                {{ poolstatus }}
              </h1>
              <h1 v-if="this.pool.imposter" class="text-center">
                <v-icon x-large color="red" dense>mdi-alert</v-icon>
                {{ $t("global.imposterPool") }}
              </h1>

              <span
                :class="[
                  ismobile ? 'text-h6' : 'display-3',
                  'font-weight-bold',
                ]"
                v-if="this.pool.pool_name != 'TBD'"
                v-html="$sanitize(this.pool.pool_name)"
              ></span>

              <br /><span :class="[ismobile ? 'display' : 'text-h4']"
                >{{ this.pool.ticker }}
                <v-tooltip v-if="this.pool.itn_verified" bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      medium
                      v-bind="attrs"
                      v-on="on"
                      class="green--text text--darken-1"
                      >mdi-shield-check</v-icon
                    >
                  </template>
                  <span>{{ $t("global.verifiedTicker") }}</span>
                </v-tooltip>
              </span>
            </v-list-item-title>

            <p class="py-3">
              {{ poolstats.description }}
            </p>

            <div
              class="d-sm-flex text-subtitle-2"
              v-if="poolstats.homePage != null"
            >
              <div class="text-no-wrap flex-shrink-1">Website:</div>
              <div
                class="d-flex text-no-wrap flex-column flex-sm-row flex-md-row flex-grow-1 pl-2"
              >
                <div>
                  <a target="_blank" :href="poolstats.homePage">{{
                    poolstats.homePage
                  }}</a>
                </div>
              </div>
            </div>

            <div
              class="d-sm-flex text-subtitle-2"
              v-if="pool.pool_id != null"
            >
              <div class="text-no-wrap flex-shrink-1">Pool ID:</div>
              <div
                class="d-flex text-no-wrap flex-column flex-sm-row flex-md-row flex-grow-1 pl-2"
              >
                <div>
                  <span class="hidden-md-and-up">{{
                    pool.pool_id | ellipsiscrypto(16)
                  }}</span
                  ><span class="hidden-sm-and-down">{{ pool.pool_id }}</span>
                  <v-btn text x-small icon v-clipboard="pool.pool_id">
                    <v-icon x-small>mdi-content-copy</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <div
              class="d-sm-flex text-subtitle-2"
              v-if="reward_address != null"
            >
              <div class="text-no-wrap flex-shrink-1">
                {{ $t("app.poolWidget.rewardAccount") }}:
              </div>
              <div
                class="d-flex text-no-wrap flex-column flex-sm-row flex-md-row flex-grow-1 pl-2"
              >
                <div>
                  {{ reward_address | ellipsiscrypto(16) }}
                  <v-btn text x-small icon v-clipboard="reward_address">
                    <v-icon x-small>mdi-content-copy</v-icon>
                  </v-btn>
                  <span
                    v-if="myAddresses.includes(reward_address)"
                    class="text-caption"
                  >
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <span v-on="on">
                          <v-icon small class="green--text"
                            >mdi-check-bold</v-icon
                          >
                        </span>
                      </template>
                      <span>You have claimed this address</span>
                    </v-tooltip>
                  </span>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        icon
                        x-small
                        :to="{
                          name: 'address',
                          params: { address: reward_address },
                        }"
                        color="primary"
                      >
                        <v-icon>mdi-arrow-right-bold-circle</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t("global.addressDetails") }}</span>
                  </v-tooltip>
                </div>
              </div>
            </div>
            <div class="d-sm-flex text-subtitle-2" v-if="owners != null">
              <div class="text-no-wrap flex-shrink-1">
                {{ $t("app.poolWidget.ownerAccounts") }}:
              </div>
              <div
                class="d-flex text-no-wrap flex-column flex-sm-row flex-md-row flex-grow-1"
              >
                <div v-for="owner in owners" v-bind:key="owner" class="pl-2">
                  {{ owner | ellipsiscrypto(16) }}
                  <v-btn text x-small icon v-clipboard="owner">
                    <v-icon x-small>mdi-content-copy</v-icon>
                  </v-btn>
                  <span v-if="myAddresses.includes(owner)" class="text-caption">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <span v-on="on">
                          <v-icon small class="green--text"
                            >mdi-check-bold</v-icon
                          >
                        </span>
                      </template>
                      <span>You have claimed this address</span>
                    </v-tooltip>
                  </span>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        icon
                        x-small
                        :to="{ name: 'address', params: { address: owner } }"
                        color="primary"
                      >
                        <v-icon>mdi-arrow-right-bold-circle</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t("global.addressDetails") }}</span>
                  </v-tooltip>
                </div>
              </div>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-card-text class="mt-2 pt-0 pb-0 mb-0">
        <v-row class="my-0 py-0">
          <v-col cols="12" class="my-0 py-0">
            <v-alert
              class="my-0"
              v-if="
                poolstats.public_note != '' && poolstats.public_note != null
              "
              border="top"
              colored-border
              type="info"
              elevation="5"
              style="overflow-wrap: anywhere"
            >
              <span
                v-html="$sanitize(poolstats.public_note, noteDefaultOptions)"
              >
              </span>
            </v-alert>
          </v-col>
        </v-row>
        <v-row align="end" justify="space-around" class="mt-0 d-flex">
          <v-col v-if="!pool.genesis" cols="auto" class="text-center">
            <span class="text-h6"
              >{{ pool.blockstake | toada | numFormat("0,0.0a") }} ₳</span
            >

            <div class="d-block text-no-wrap">
              {{ $t("global.activeStake") }}
            </div>
          </v-col>
          <v-col
            justify="end"
            v-if="pool.height != null && pool.height > 0"
            cols="auto"
            class="text-center"
          >
            <v-chip
              v-if="pool.height != null && pool.height > 0"
              :class="pool.height == 1 ? 'genesisbar' : 'genesisbarred'"
              small
              dark
            >
              {{
                pool.height == 1
                  ? currentGenesis.senddata.majoritymax
                  : pool.height
              }}
            </v-chip>

            <div class="d-block text-no-wrap mt-1">
              {{ $t("global.height") }}
            </div>
          </v-col>

          <v-col cols="auto" class="text-center">
            <span class="text-h6">
              <span class="text-no-wrap">
                <span
                  v-if="
                    pool.assigned_slots != null &&
                    pool.assigned_slots != 0 &&
                    pool.assigned_slots ==
                      (pool.epoch_blocks_epoch == currentGenesis.epoch
                        ? pool.epoch_blocks
                        : 0) &&
                    pool.assigned_slots_epoch == currentGenesis.epoch
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
                {{
                  pool.epoch_blocks_epoch == currentGenesis.epoch
                    ? pool.epoch_blocks
                    : 0
                }}
                <template
                  v-if="
                    pool.assigned_slots != null && pool.assigned_slots > 0
                  "
                >
                  <v-tooltip
                    v-if="
                      pool.assigned_slots_epoch != currentGenesis.epoch
                    "
                    top
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <span v-bind="attrs" v-on="on" class="text-no-wrap">
                        / {{ pool.assigned_slots
                        }}<span class="grey--text text--darken-1">*</span>
                      </span>
                    </template>
                    <span>{{
                      $t("app.poolPage.assignedSlotsStaleHint", {
                        schedule: pool.assigned_slots_epoch,
                        current: currentGenesis.epoch,
                      })
                    }}</span>
                  </v-tooltip>
                  <span v-else class="text-no-wrap">
                    / {{ pool.assigned_slots }}
                  </span>
                </template>
              </span>
            </span>
            <div class="d-block text-no-wrap">
              {{ $t("global.epochBlocks") }}
            </div>
          </v-col>
          <v-col
            v-if="
              pool.lifetime_per_blocks != null && pool.lifetime_per_slots != 0
            "
            cols="auto"
            class="text-center"
          >
            <span class="text-h6">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    {{
                      (pool.lifetime_per_blocks / pool.lifetime_per_slots)
                        | fpercent
                    }}
                  </span>
                </template>

                <span
                  >{{ pool.lifetime_per_blocks }} /
                  {{ pool.lifetime_per_slots }}</span
                >
              </v-tooltip>
            </span>
            <div class="d-block text-no-wrap">Assigned Performance</div>
          </v-col>
          <v-col cols="auto" class="text-center">
            <span class="text-h6">{{ this.pool.life_blocks }}</span>
            <div class="d-block text-no-wrap">
              {{ $t("global.lifetimeBlocks") }}
            </div>
          </v-col>

          <v-col cols="auto" class="text-center">
            <span class="text-h6">{{
              this.pool.lifetime_ros | fpercent
            }}</span>
            <div class="d-block text-no-wrap">
              {{ $t("global.lifetimeROS") }}
            </div>
          </v-col>
          <v-col
            v-if="!pool.genesis && poolstats.firstEpoch != 0"
            cols="auto"
            class="text-center"
          >
            <span class="text-h6">{{
              this.poolstats.firstEpoch == null
                ? "TBD"
                : this.poolstats.firstEpoch
            }}</span>
            <div class="d-block text-no-wrap">
              {{ $t("app.poolWidget.firstEpoch") }}
            </div>
          </v-col>

          <v-col v-if="!pool.genesis" cols="auto" class="text-center">
            <span class="text-h6">
              <span v-if="pool.cost != pool.future_cost">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      class="ma-0 pa-0"
                      v-on="on"
                      v-bind="attrs"
                      v-if="pool.cost < pool.future_cost"
                      color="red"
                      >mdi-arrow-up-bold</v-icon
                    >
                    <v-icon
                      class="ma-0 pa-0"
                      v-on="on"
                      v-bind="attrs"
                      v-else
                      color="success"
                      >mdi-arrow-down-bold</v-icon
                    >
                  </template>
                  <span
                    >{{ $t("app.pools.epochFeeChangingTo") }}
                    {{ pool.future_cost | toada }}</span
                  >
                </v-tooltip>
              </span>

              {{ this.pool.cost | toada }} ₳</span
            >
            <div class="d-block text-no-wrap">{{ $t("global.epochFee") }}</div>
          </v-col>

          <v-col v-if="!pool.genesis" cols="auto" class="text-center">
            <span class="text-h6">
              <span v-if="pool.margin != pool.future_margin">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      class="ma-0 pa-0"
                      v-on="on"
                      v-bind="attrs"
                      v-if="pool.margin < pool.future_margin"
                      color="red"
                      >mdi-arrow-up-bold</v-icon
                    >
                    <v-icon
                      class="ma-0 pa-0"
                      v-on="on"
                      v-bind="attrs"
                      v-else
                      color="success"
                      >mdi-arrow-down-bold</v-icon
                    >
                  </template>
                  <span
                    >{{ $t("app.pools.variableFeeChangingTo") }}
                    {{ (pool.future_margin / 100) | fpercent }}</span
                  >
                </v-tooltip>
              </span>
              {{ (this.pool.margin / 100) | fpercent }}</span
            >
            <div class="d-block text-no-wrap">
              {{ $t("global.variableFee") }}
            </div>
          </v-col>
          <v-col v-if="!pool.genesis" cols="auto" class="text-center">
            <span class="text-h6">
              <span class="text-no-wrap">
                <span v-if="pool.pledge != pool.future_pledge">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        class="ma-0 pa-0"
                        v-on="on"
                        v-bind="attrs"
                        v-if="pool.future_pledge > pool.pledge"
                        color="success"
                        >mdi-arrow-up-bold</v-icon
                      >
                      <v-icon
                        class="ma-0 pa-0"
                        v-on="on"
                        v-bind="attrs"
                        v-else
                        color="red"
                        >mdi-arrow-down-bold</v-icon
                      >
                    </template>
                    <span
                      >{{ $t("app.pools.pledgeChangingTo") }}
                      {{ (pool.future_pledge != null ? pool.future_pledge : 0) | toada | numFormat("0,0.0a") }}</span
                    >
                    ₳
                  </v-tooltip>
                </span>
                {{ pool.pledge | toada | numFormat("0,0.0a") }} ₳
                <v-tooltip
                  v-if="pool.pool_pledge_value >= pool.pledge"
                  bottom
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      small
                      v-bind="attrs"
                      v-on="on"
                      class="green--text text--darken-1"
                      >mdi-check</v-icon
                    >
                  </template>
                  <span
                    >{{ $t("global.declaredPoolPledgeMet") }} ({{
                      pool.pool_pledge_value | toada | numFormat("0,0.0a")
                    }}) ₳</span
                  >
                </v-tooltip>
                <v-tooltip v-else bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      small
                      v-bind="attrs"
                      v-on="on"
                      class="red--text text--darken-1"
                      >mdi-close</v-icon
                    >
                  </template>
                  <span>{{ $t("global.declaredPoolPledgeNOTMet") }}</span>
                </v-tooltip>
              </span>
            </span>
            <div class="d-block text-no-wrap">
              {{ $t("app.poolWidget.pledge") }}
            </div>
          </v-col>

          <v-col v-if="!pool.genesis" cols="auto" class="text-center">
            <span class="text-h6"
              >{{
                this.pool.lifetime_rewards | toada | numFormat("0,0.0a")
              }}
              ₳</span
            >
            <div class="d-block text-no-wrap">
              {{ $t("global.lifetimeRewards") }}
            </div>
          </v-col>
          <v-col v-if="!pool.genesis" cols="auto" class="text-center">
            <span class="text-h6"
              >{{ this.pool.lifetime_tax | toada | numFormat("0,0.0a") }} ₳</span
            >
            <div class="d-block text-no-wrap">
              {{ $t("app.poolWidget.lifetimeFees") }}
            </div>
          </v-col>
          <v-col v-if="!pool.genesis" cols="auto" class="text-center">
            <span class="text-h6"
              >{{
                this.pool.lifetime_stake | toada | numFormat("0,0.0a")
              }}
              ₳</span
            >
            <div class="d-block text-no-wrap">
              {{ $t("app.poolWidget.lifetimeStake") }}
            </div>
          </v-col>

          <v-col v-if="!pool.genesis" cols="auto" class="text-center">
            <span
              class="text-h6"
              v-if="this.pool.online_relays + this.pool.offline_relays > 0"
              >{{
                (this.pool.online_relays /
                  (this.pool.online_relays + this.pool.offline_relays))
                  | fpercent
              }}</span
            >
            <span class="text-caption">
              ({{ this.pool.online_relays }}/{{
                this.pool.online_relays + this.pool.offline_relays
              }})</span
            >
            <div class="d-block text-no-wrap">
              {{ $t("app.poolWidget.onlineRelays") }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import poolstatusjson from "../json/poolstatus.json";
import { mdiStarFace } from "@mdi/js";
import { preference } from "vue-preferences";
import { addFavorite, removeFavorite } from "@/services/api";
const favoritepools = preference("fav_mainnet_pools", {
  defaultValue: [],
});
export default {
  props: [
    "reward_address",
    "poolstats",
    "owners",
    "thisheight",
    "nightmode",
    "currentGenesis",
    "pool",
  ],

  data() {
    return {
      poolstatusdata: poolstatusjson,
      noteDefaultOptions: {
        allowedTags: ["a", "b", "br", "i", "ul", "li", "ol", "p", "img"],
        allowedAttributes: {
          a: ["href"],
          img: ["width", "height", "src"],
        },
      },
      icons: {
        mdiStarFace,
      },
      favorites: favoritepools.get(),
      windowWidth: window.innerWidth,
      gopts: {
        angle: 0.2, // The span of the gauge arc
        lineWidth: 0.2, // The line thickness
        radiusScale: 1, // Relative radius
        pointer: {
          length: 0.6, // // Relative to gauge radius
          strokeWidth: 0.035, // The thickness
          color: "#000000", // Fill color
        },
        limitMax: false, // If false, max value increases automatically if value > maxValue
        limitMin: false, // If true, the min value of the gauge will be fixed
        colorStart: "#6FADCF", // Colors
        colorStop: "#8FC0DA", // just experiment with them
        strokeColor: "#E0E0E0", // to see which ones work best for you
        generateGradient: true,
        highDpiSupport: true, // High resolution support
      },
      wide: true,
    };
  },
  mounted() {
    window.addEventListener("resize", () => {
      this.windowWidth = window.innerWidth;
    });
  },

  computed: {
    ecosystem: function () {
      return this.$store.getters.getEcosystem;
    },
    saturationpoint: function () {
      return this.ecosystem.saturation != null ? this.ecosystem.saturation : 0;
    },
    userData: function () {
      return this.$store.getters.getUserData;
    },
    myAddresses: function () {
      if (
        this.userData != null &&
        typeof this.userData.myAddresses != "undefined"
      ) {
        return Object.keys(this.userData.myAddresses);
      } else {
        return [];
      }
    },
    poolstatus: function () {
      if (
        typeof this.pool.attributes !== "undefined" &&
        this.pool.attributes !== null &&
        typeof this.pool.attributes.poolstatus !== "undefined" &&
        this.pool.attributes.poolstatus != "act"
      ) {
        var el = this.poolstatusdata.find(
          (element) => element["Code"] == this.pool.attributes.poolstatus
        );
        return el["Name"];
      } else {
        return "";
      }
    },
    pooladdstripes: function () {
      if (
        typeof this.pool.attributes !== "undefined" &&
        this.pool.attributes !== null &&
        typeof this.pool.attributes.poolstatus !== "undefined"
      ) {
        switch (this.pool.attributes.poolstatus) {
          case "ret":
          case "dnu":
          case "exp":
            return true;
          default:
            return false;
        }
      } else {
        return false;
      }
    },

    ismobile: function () {
      return this.windowWidth <= 768 ? true : false;
    },
  },
  methods: {
    togglefavorite: function (poolid) {
      var indx = this.favorites.indexOf(poolid);
      if (indx == -1) {
        this.favorites.push(poolid);
      } else {
        this.favorites.splice(indx, 1);
      }
      favoritepools.set(this.favorites);

      const userId = this.$store && this.$store.state.userId;
      if (userId) {
        (indx == -1 ? addFavorite(userId, poolid) : removeFavorite(userId, poolid))
          .catch(e => console.warn('Failed to sync pool favorite', e));
      }
    },

    paintred: function (stake) {
      return stake > this.saturationpoint ? "text-h6 saturated" : "text-h6";
    },
  },
};
</script>

<style>
.saturated {
  color: red;
}

.striped {
  background-image: linear-gradient(
    45deg,
    #ffffaa 25%,
    #aaaaaa 25%,
    #aaaaaa 50%,
    #ffffaa 50%,
    #ffffaa 75%,
    #aaaaaa 75%,
    #aaaaaa 100%
  ) !important;
  background-size: 56.57px 56.57px !important;
}

.saturatedwarning {
  color: orange;
}
</style>
