<template>
  <div>
    <genesis-bar
      :showBlockIcons="showBlockIcons"
      :ispulseVisible="ispulseVisible"
      currency="ada"
      :ismobile="ismobile"
      :genesis="genesis"
      :mini="true"
      :nightmode="nightmode"
    ></genesis-bar>
    <div class="d-flex">
      <div class="flex-grow-1">
        <v-card :dark="nightmode" class="mb-2">
          <v-card-title class="my-2 pt-0 pb-2">
            {{ $t("global.realtimeBlocks") }}
            <v-spacer></v-spacer>
            <v-text-field
              :append-icon="search ? 'mdi-close' : 'mdi-magnify'"
              type="number"
              v-model.number="search"
              :label="$t('global.searchblockheight')"
              @click:append="clearSearch"
              single-line
              hide-details
            >
            </v-text-field>
          </v-card-title>
        </v-card>
        <v-alert dark v-if="shownodatafound">
          {{ $t("app.noDataFound") }}
        </v-alert>

        <v-alert
          align="center"
          justify="center"
          v-for="height in recent_blocks"
          :key="height.height"
          :dark="nightmode"
          border="left"
          elevation="1"
          type="success"
          colored-border
          :color="
            height.competitive && height.forker
              ? 'red'
              : height.competitive && !height.forker
              ? 'deep-purple'
              : 'cyan'
          "
          class="pl-0 pb-3 pt-3 mb-0 mb-1"
          dense
        >
          <v-row class="pb-0 mb-0" dense align="center" justify="center">
            <div
              v-if="maxblocktime.blocktime == height.blocktime && search == ''"
              class="blocklagtop"
            >
              {{ (now - maxblocktime.blocktime) | date("mm'm':ss's'") }}
            </div>
            <div class="blocklag">
              {{ (height.lag * 1000) | date("mm'm':ss's'") }}
            </div>
            <v-col class="text-center pb-0 mb-0">
              <h4
                v-if="height.competitive && !height.forker && height.slotbattle"
              >
                {{ $t("app.realtime.slotBattle") }}
              </h4>
              <h4
                v-if="
                  height.competitive && !height.forker && !height.slotbattle
                "
              >
                {{ $t("app.realtime.heightBattle") }}
              </h4>
              <h4 v-if="!height.competitive && height.forker">
                {{ $t("app.realtime.adversarialFork") }}
              </h4>
            </v-col>
          </v-row>
          <template v-slot:prepend>
            <div class="rotate">
              {{ height.height }} &nbsp;<router-link
                style="text-decoration: none; color: inherit"
                text
                :to="{
                  name: 'recentBlocksHeight',
                  params: {
                    height: height.height,
                  },
                }"
              >
                <v-icon small>mdi-open-in-new</v-icon></router-link
              >
            </div>
          </template>
          <div
            class="d-flex justify-center align-start flex-sm-row flex-xs-column"
          >
            <template v-for="(block, index) in height.blocks">
              <div class="text-center pb-0 mb-0" :key="block.hash">
                <competitive-block
                  :height="height"
                  :block="block"
                  :nightmode="nightmode"
                />
              </div>
              <div
                class="flex-grow-0"
                :key="block.index"
                v-if="
                  height.blocks.length > 1 && index < height.blocks.length - 1
                "
              >
                <h4 class="grey--text px-5">VS</h4>
              </div>
            </template>
          </div>
        </v-alert>

        <v-row>
          <v-col> </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script>
//import numeral from "numeral";

import { db } from "@/firebase";
export default {
  components: {
    GenesisBar: () => import("../components/GenesisBar"),
    competitiveBlock: () => import("@/components/competitiveBlock"),
  },
  props: [
    "nightmode",
    "currency",
    "ismobile",
    "ispulseVisible",
    "showBlockIcons",
  ],
  updated() {
    this.$emit("isLoaded", true);
  },
  data: function () {
    return {
      loading: false,
      height: this.$route.params.height,
      search:
        typeof this.$route.params.height !== "undefined"
          ? this.$route.params.height
          : "",
      competitive: {},
    };
  },
  watch: {
    $route(to) {
      if (typeof to.params.height !== "undefined") {
        this.search = to.params.height;
      } else {
        this.search = "";
      }
    },
    refetch_watch: {
      // call it upon creation too
      immediate: true,
      handler() {
        if (
          typeof this.search !== "undefined" &&
          this.search != "" &&
          this.$route.path != "/realtime/" + this.search
        ) {
          this.$router.replace({ path: "/realtime/" + this.search });
        }

        if (this.search == "") {
          this.loading = true;
          this.$rtdbBind(
            "competitive",
            db
              .ref(this.network + "/competitive")
              .orderByKey()
              .limitToLast(21),
            { reset: true }
          ).then(() => {
            this.loading = false;
          });
        } else {
          //this.$rtdbUnbind("competitive");
          this.loading = true;
          if (
            parseInt(this.search) >= 10000000 &&
            parseInt(this.search) <= 10000005
          ) {
            this.$rtdbBind(
              "competitive",
              db
                .ref(this.network + "/competitive")
                .orderByKey()
                .startAt((9999999).toString())
                .endAt((parseInt(this.search) + 1).toString()),
              { reset: true }
            ).then(() => {
              this.loading = false;
            });
          } else {
            this.$rtdbBind(
              "competitive",
              db
                .ref(this.network + "/competitive")
                .orderByKey()
                .startAt((parseInt(this.search) - 5).toString())
                .endAt((parseInt(this.search) + 1).toString()),
              { reset: true }
            ).then(() => {
              this.loading = false;
            });
          }
        }
      },
    },
  },
  created() {
    this.$store.dispatch("pollNow");
  },
  methods: {
    clearSearch: function () {
      this.search = "";
    },
  },
  computed: {
    now: function () {
      return this.$store.getters.getNow;
    },
    shownodatafound: function () {
      return (
        this.search != "" && this.recent_blocks.length == 0 && !this.loading
      );
    },
    genesis: function () {
      return this.$store.getters.getGenesis;
    },
    refetch_watch: function () {
      return this.search + this.network;
    },
    colorcompetition() {
      return (item) => {
        if (
          typeof item !== "undefined" &&
          item != null &&
          typeof item.classification !== "undefined" &&
          item.classification != null &&
          item.classification == "purecompetitiveslot"
        ) {
          return "deep-purple";
        } else {
          return "cyan";
        }
      };
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },
    maxblocktime: function () {
      return this.recent_blocks.reduce((max, curren) =>
        max.blocktime > curren.blocktime ? max : curren
      );
    },
    recent_blocks: function () {
      var a = [];
      var lastblocktime = null;
      var indx = 0;
      if (typeof this.competitive != "undefined" && this.competitive != null) {
        for (const [key, value] of Object.entries(this.competitive)) {
          indx++;
          var h = {
            height: key,
            blocks: [],
            competitive: false,
            forker: false,
            slotbattle: false,
            usechained: false,
            lag: null,
            blocktime: null,
          };
          var slots = [];
          //   if(Object.keys(value).length>1) {
          for (const [poolid, value2] of Object.entries(value)) {
            if (poolid == "classification") {
              continue;
            }
            for (const value3 of Object.values(value2)) {
              if (typeof value3["chained"] !== "undefined") {
                h["usechained"] = true;
              }
            }
          }

          for (const [poolid, value2] of Object.entries(value)) {
            if (poolid == "classification") {
              continue;
            }
            //check if any blocks are marked as chained which should overrule vrfmin crowns

            for (const [hash, value3] of Object.entries(value2)) {
              var bl = { leaderPoolId: poolid };
              //competitive.  now check if its a competitive slot or height.

              bl["hash"] = hash;
              bl["epoch"] = value3["epoch"];
              bl["usechained"] = h["usechained"];
              bl["chained"] = value3["chained"];
              bl["histogram"] = value3["histogram"];
              bl["lastparent"] = value3["lastparent"];
              bl["leaderPoolName"] = value3["leaderPoolName"];
              bl["leaderPoolTicker"] = value3["leaderPoolTicker"];
              bl["vrfmin"] = value3["vrfmin"];
              bl["time"] = value3["time"];
              bl["slot"] = value3["slot"];
              bl["epoch_slot"] = (parseInt(value3["slot"]) + 259200) % 432000;
              if (slots.indexOf(value3["slot"]) === -1) {
                slots.push(value3["slot"]);
              }
              bl["reports"] = value3["reports"];

              bl["vrfwinner"] = value3["vrfwinner"];
              bl["bvrfwinner"] = value3["bvrfwinner"];
              if (Object.hasOwn(value3, "reporter_versions")) {
                const regex = new RegExp(/^[\d]+\.[\d]+\.[\d]+:[a-f0-9]{5}$/);
                var subkeys = {};
                var subsubkeys = {};
                for (let [key, value] of Object.entries(
                  value3["reporter_versions"]
                )) {
                  key = key.replace(/,/gi, ".");
                  if (regex.test(key)) {
                    var subsubkey = key.split(":")[0];
                    var presubkey = subsubkey.split(".");
                    var subkey = presubkey[0] + "." + presubkey[1];

                    if (typeof subkeys[subkey] == "undefined") {
                      subkeys[subkey] = value;
                    } else {
                      subkeys[subkey] += value;
                    }
                    if (typeof subsubkeys[subsubkey] == "undefined") {
                      subsubkeys[subsubkey] = value;
                    } else {
                      subsubkeys[subsubkey] += value;
                    }
                  }
                }
                bl["reporter_versions"] = {
                  subkeys: Object.entries(subkeys).sort(),
                  subsubkeys: Object.entries(subsubkeys).sort(),
                };
              } else {
                bl["reporter_versions"] = null;
              }
              bl["protocol_major"] = value3["protocol_major"];
              bl["protocol_minor"] = value3["protocol_minor"];
              bl["median"] = value3["median"];
              bl["competitive"] = value3["competitive"];
              h["competitive"] = h["competitive"] || value3["competitive"];
              h["forker"] = h["forker"] || value3["forker"];
              bl["forker"] = value3["forker"];
              if (lastblocktime != null) {
                if (
                  !h["competitive"] ||
                  (h["competitive"] &&
                    ((bl["bvrfwinner"] && !h["usechained"]) ||
                      (h["usechained"] &&
                        (typeof bl["chained"] == "undefined" ||
                          bl["chained"]))))
                ) {
                  h["lag"] = (parseInt(value3["time"]) - lastblocktime) / 1000;
                  lastblocktime = parseInt(value3["time"]);
                  h["blocktime"] = lastblocktime;
                }
              } else {
                lastblocktime = parseInt(value3["time"]);
                h["blocktime"] = lastblocktime;
              }
              h.blocks.push(bl);
            }
          }

          h.slotbattle = slots.length == 1;

          //   }
          if (indx > 1) {
            a.push(h);
          }
        }
      }

      return a.sort((a, b) => (a.height > b.height ? -1 : 1));
    },
  },
};
</script>

<style>
.blocklag {
  bottom: -16px;
  z-index: 100;
  font-weight: bold;
  position: absolute;
  margin: 0px;
  padding: 2px 10px 0px 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(248, 248, 248, 0.9);
  background-color: #131b33;
}
.blocklagtop {
  top: -16px;
  z-index: 100;
  font-weight: bold;
  position: absolute;
  margin: 0px;
  padding: 2px 10px 0px 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(248, 248, 248, 0.9);
  background-color: #131b33;
}

.rotate {
  /* Safari */
  -webkit-transform: rotate(-90deg);

  /* Firefox */
  -moz-transform: rotate(-90deg);

  /* IE */
  -ms-transform: rotate(-90deg);

  /* Opera */
  -o-transform: rotate(-90deg);

  float: left;
}
.subtable > div > table > tbody > tr > td:not(:last-child),
.subtable > div > table > thead > tr > th:not(:last-child) {
  padding-right: 0px;

  margin-right: 0px;
}
.subtable > div > table > tbody > tr > td:not(:first-child),
.subtable > div > table > thead > tr > th:not(:first-child) {
  padding-left: 0px;

  margin-left: 0px;
}

.grid-container {
  display: grid;
  grid-template-columns: auto 10px auto auto;
  grid-gap: 0px;

  padding: 0px;
}

@media (max-width: 600px) {
  .flex-xs-column {
    flex-direction: column !important;
  }
}
</style>
