<template>
  <div>
    <v-card :dark="nightmode">
      <v-card-title class="">
        {{ $t("app.poolPage.awards") }}
      </v-card-title>
      <div dense class="d-flex justify-start flex-wrap">
        <div v-for="item in awards" :key="item.id" class="mt-1 ml-1 mr-1">
          <div v-if="showaward(item)" class="">
            <v-col cols="12" class="pb-0">
              <v-img
                :class="
                  item.type == 'MAINBLOCKS'
                    ? item.award == 'LIFETIME_BLOCKS_1K'
                      ? 'ml-5'
                      : 'ml-3'
                    : ''
                "
                :src="'/' + item.award + '.png'"
                contain
                width="256"
                class=""
              ></v-img>
            </v-col>
            <v-col cols="12" class="pt-0">
              <div class="text-subtitle-1 text-center">{{ pool.ticker }}</div>

              <div
                v-if="item.type == 'REWARDS' || item.type == 'TAXES'"
                class="text-body-1 text-center"
              >
                {{ item.value | toada | numFormat("0,0.0a") | zeronull }} ADA
              </div>
              <div v-if="item.type == 'BLOCKS'" class="text-body-1 text-center">
                {{ item.value | numFormat("0,0.0a") | zeronull }} Blocks
              </div>
              <div
                v-if="item.type == 'TOPEPOCH'"
                class="text-body-1 text-center"
              >
                {{ item.value }} Blocks
              </div>
              <div
                v-if="item.type == 'MAINBLOCKS' || item.type == 'TOPEPOCH'"
                class="text-body-1 text-center"
                v-html="item.text"
              ></div>
              <div
                v-if="item.type == 'MAINBLOCKS'"
                class="text-body-1 text-center"
              >
                {{ item.hash | ellipsiscrypto }}
                <v-btn text x-small icon v-clipboard="item.hash">
                  <v-icon x-small>mdi-content-copy</v-icon>
                </v-btn>
              </div>
              <div
                v-if="item.type == 'MAINBLOCKS'"
                class="text-body-1 text-center"
              >
                {{
                  formatInTimeZone(
                    new Date(item.value * 1000),
                    "UTC",
                    "MMMM do yyyy, h:mm:ss a z"
                  )
                }}
              </div>
            </v-col>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import { formatInTimeZone } from "date-fns-tz";
import { db } from "@/firebase";
export default {
  props: ["nightmode", "pool", "userId", "genesis"],
  data: function () {
    return {
      awards_itn_raw: {},
      awards_raw: {},
    };
  },
  computed: {
    network: function () {
      return this.$store.getters.getNetwork;
    },

    isInactive: function () {
      return this.$store.getters.getIsInactive;
    },
    awards_itn: function () {
      var a = [];
      if (
        typeof this.awards_itn_raw != "undefined" &&
        this.awards_itn_raw != null
      ) {
        for (const [key, value] of Object.entries(this.awards_itn_raw)) {
          value["id"] = key;
          value["network"] = "ITN";
          a.push(value);
        }
      }
      return a;
    },
    awards_cardano: function () {
      var a = [];
      if (typeof this.awards_raw != "undefined" && this.awards_raw != null) {
        for (const [key, value] of Object.entries(this.awards_raw)) {
          value["id"] = key;
          value["network"] = "Cardano";
          a.push(value);
        }
      }
      return a;
    },

    refetch_watch: function () {
      return this.pool.poolpubkey;
    },
    awards: function () {
      return this.awards_itn
        .concat(this.awards_cardano)
        .sort((a, b) => (a.id > b.id ? -1 : 1));
    },
  },
  watch: {
    refetch_watch: {
      // call it upon creation too
      immediate: true,
      handler() {
        if (typeof this.pool !== "undefined") {
          this.$rtdbBind(
            "awards_itn_raw",
            db.ref(this.network + "/awards/itn/" + this.pool.ticker)
          );
          this.$rtdbBind(
            "awards_raw",
            db.ref(this.network + "/awards/cardano/" + this.pool.poolpubkey)
          );
        }
      },
    },
  },

  methods: {
    formatInTimeZone: function (d, tz, f) {
      return formatInTimeZone(d, tz, f);
    },
    showaward(item) {
      if (typeof this.pool !== "undefined") {
        return (
          (this.pool.itn_verified && item.network == "ITN") ||
          item.network == "Cardano"
        );
      }
      return false;
    },
  },
  // apollo: {

  //     awards: {
  //         query: require('../../graphql/GetPoolAwards.gql'),
  //         variables() {
  //             return {
  //                 "ticker": this.pool.ticker,
  //                 "poolid": this.pool.poolpubkey
  //             }
  //         },
  //         pollInterval: 60000,
  //         update: function (data) {
  //             return data.awards
  //         },
  //         skip() {
  //             return this.isInactive
  //         }

  //     },

  // }
};
</script>
