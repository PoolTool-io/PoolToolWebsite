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
import { searchBlocksByHeight } from "@/services/api";
import { wsClient } from "@/services/ws";

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
      wsEpoch: null,
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
    search(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (
          typeof newVal !== "undefined" &&
          newVal !== "" &&
          this.$route.path !== "/realtime/" + newVal
        ) {
          this.$router.replace({ path: "/realtime/" + newVal });
        }
        if (newVal === "" && oldVal !== "") {
          this.subscribeBlocks();
        } else if (newVal !== "") {
          this.unsubscribeBlocks();
          this.fetchSearchBlocks();
        }
      }
    },
    currentEpoch(newEpoch, oldEpoch) {
      if (newEpoch && newEpoch !== oldEpoch && this.search === "") {
        this.subscribeBlocks();
      }
    },
  },
  created() {
    this.$store.dispatch("pollNow");
    if (this.search !== "") {
      this.fetchSearchBlocks();
    } else {
      this.subscribeBlocks();
    }
  },
  beforeDestroy() {
    this.unsubscribeBlocks();
  },
  methods: {
    clearSearch: function () {
      this.search = "";
    },
    subscribeBlocks() {
      const epoch = this.currentEpoch;
      if (!epoch) return;
      this.unsubscribeBlocks();
      this.wsEpoch = epoch;
      this.loading = true;
      wsClient.subscribe("blocks", { epoch }, (data, msgType) => {
        if (this.search !== "") return;
        if (msgType === "snapshot" && data && typeof data === "object" && data.block == null) {
          this.competitive = data;
          this.loading = false;
        } else if (data && typeof data === "object" && data.block != null) {
          this.mergeBlockUpdate(data);
        }
      });
    },
    unsubscribeBlocks() {
      if (this.wsEpoch) {
        wsClient.unsubscribe("blocks");
        this.wsEpoch = null;
      }
    },
    mergeBlockUpdate(blockdata) {
      const height = String(blockdata.block);
      const pid = (blockdata.pool_id || blockdata.leaderPoolId || "").trim();
      const hash = (blockdata.hash || "").trim();
      if (!height || !hash) return;

      var entry = {
        block: blockdata.block,
        slot: blockdata.slot,
        epoch: blockdata.epoch,
        epoch_slot: blockdata.epoch_slot,
        hash: hash,
        leaderPoolId: pid,
        leaderPoolTicker: blockdata.pool_ticker || blockdata.leaderPoolTicker || "",
        leaderPoolName: blockdata.pool_name || blockdata.leaderPoolName || "",
        pool_ticker: blockdata.pool_ticker || "",
        time: blockdata.time || blockdata.timestamp || 0,
        timestamp: blockdata.timestamp || 0,
        transactions: blockdata.transactions || 0,
        fees: blockdata.fees || 0,
        output: blockdata.output || 0,
        body_size: blockdata.body_size || 0,
        chained: blockdata.chained != null ? blockdata.chained : null,
        competitive: blockdata.competitive || false,
        forker: blockdata.forker || false,
        vrfmin: blockdata.vrfmin || null,
        vrfwinner: blockdata.vrfwinner || false,
        bvrfwinner: blockdata.bvrfwinner || false,
        histogram: blockdata.histogram || null,
        lastparent: blockdata.lastparent || null,
        reports: blockdata.reports || 0,
        reporter_versions: blockdata.reporter_versions || null,
        median: blockdata.median || 0,
        protocol_major: blockdata.protocol_major || 0,
        protocol_minor: blockdata.protocol_minor || 0,
        slotbattle: false,
      };

      var updated = Object.assign({}, this.competitive);
      if (!updated[height]) updated[height] = {};
      if (!updated[height][pid]) updated[height][pid] = {};
      updated[height][pid][hash] = entry;

      // Re-evaluate competitive status for this height
      var allBlocks = [];
      for (var k in updated[height]) {
        if (k === "classification" || typeof updated[height][k] !== "object" || updated[height][k] === null) continue;
        for (var bk in updated[height][k]) {
          var b = updated[height][k][bk];
          if (typeof b === "object" && b !== null) allBlocks.push(b);
        }
      }
      var isCompetitive = allBlocks.length > 1;
      var uniqueSlots = {};
      allBlocks.forEach(function (b) { uniqueSlots[b.slot] = true; });
      var isSlotBattle = Object.keys(uniqueSlots).length === 1 && isCompetitive;
      allBlocks.forEach(function (b) {
        b.competitive = isCompetitive;
        b.slotbattle = isSlotBattle;
      });
      if (isCompetitive) {
        updated[height].classification = isSlotBattle ? "purecompetitiveslot" : "purecompetitiveheight";
      }

      // Trim to 15 most recent heights
      var heightKeys = Object.keys(updated)
        .filter(function (k) { return /^\d+$/.test(k); })
        .sort(function (a, b) { return parseInt(b) - parseInt(a); });
      if (heightKeys.length > 15) {
        heightKeys.slice(15).forEach(function (k) { delete updated[k]; });
      }

      this.competitive = updated;
    },
    async fetchSearchBlocks() {
      if (!this.search || this.search === "") return;
      this.loading = true;
      try {
        var epoch = this.currentEpoch;
        if (!epoch) {
          this.loading = false;
          return;
        }
        var blockHeight = parseInt(this.search);
        if (isNaN(blockHeight)) {
          this.competitive = {};
          this.loading = false;
          return;
        }
        var resp = await searchBlocksByHeight(epoch, blockHeight);
        this.competitive = resp.data || {};
      } catch (e) {
        console.error("Failed to fetch blocks for search", e);
        this.competitive = {};
      }
      this.loading = false;
    },
  },
  computed: {
    now: function () {
      return this.$store.getters.getNow;
    },
    currentEpoch: function () {
      var g = this.$store.getters.getGenesis;
      return g ? g.epoch : 0;
    },
    shownodatafound: function () {
      return (
        this.search != "" && this.recent_blocks.length == 0 && !this.loading
      );
    },
    genesis: function () {
      return this.$store.getters.getGenesis;
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
      if (!this.recent_blocks || this.recent_blocks.length === 0) {
        return { blocktime: 0 };
      }
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
          if (!value || typeof value !== "object") continue;
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
          for (const [poolid, value2] of Object.entries(value)) {
            if (poolid == "classification") {
              continue;
            }
            if (!value2 || typeof value2 !== "object") continue;
            for (const value3 of Object.values(value2)) {
              if (value3 && typeof value3["chained"] !== "undefined") {
                h["usechained"] = true;
              }
            }
          }

          for (const [poolid, value2] of Object.entries(value)) {
            if (poolid == "classification") {
              continue;
            }
            if (!value2 || typeof value2 !== "object") continue;

            for (const [hash, value3] of Object.entries(value2)) {
              if (!value3 || typeof value3 !== "object") continue;
              var bl = { leaderPoolId: poolid };

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
              if (value3["reporter_versions"] != null && typeof value3["reporter_versions"] === "object") {
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
