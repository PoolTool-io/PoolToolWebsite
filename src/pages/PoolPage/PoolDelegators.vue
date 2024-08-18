<template>
  <div>
    <v-card :dark="nightmode">
      <v-card-title class="">
        {{ $t("global.delegators") }}
        <v-spacer></v-spacer>
      </v-card-title>
      <div class="d-flex justify-space-around align-start flex-wrap pb-2">
        <template v-for="(total, key) in delegator_totals">
          <div v-bind:key="key" class="text-center">
            <span>{{ total["qty"] }}</span
            ><br />
            <span
              >₳
              {{ total["amt"] | toada | numFormat("0,0.0a") | zeronull }}</span
            >
            <ranking-icon
              :ttleft="false"
              :ttright="true"
              :ttbottom="false"
              classin=""
              :svgonly="false"
              height="65"
              :adavalue="key * 1e6"
              :rendernotooltip="true"
              @passClick="passClick"
            />
          </div>
        </template>
      </div>

      <v-data-table
        :dark="nightmode"
        dense
        sort-by="v"
        sort-desc
        :headers="this.tableheaders"
        :items="filtered_delegators"
        item-key="id"
        class="elevation-1"
      >
        <template #[`header.ahdollar`]="{ header }">
          <span class="proCellClass">
            {{ header.text }}*
            <div class="prolabel">PRO</div></span
          >
        </template>
        <template #[`header.ll`]="{ header }">
          <span class="proCellClass">
            {{ header.text }}
            <div class="prolabel">PRO</div></span
          >
        </template>
        <template
          v-if="filter_rangemin != null && filter_rangemax != null"
          v-slot:top
        >
          <div class="d-flex justify-space-between align-center">
            <div class="d-flex justify-center align-center">
              <ranking-icon
                :ttleft="true"
                :ttright="false"
                :ttbottom="false"
                classin="mt-0 mr-2 mr-2"
                :svgonly="true"
                height="65"
                v-if="filter_rangemax != null"
                :adavalue="filter_rangemax"
              />
              <span>{{ filter_text }} {{ $t("global.delegators") }}</span>
            </div>
            <v-btn x-small @click="cancelFilter" class="primary secondary--text"
              >app.addressDetail.removeFilter</v-btn
            >
          </div>
        </template>

        <template #[`item.k`]="{ item }">
          <span class="d-flex align-center justify-start">
            <span class="d-flex align-center">
              <span class="hidden-sm-and-down">{{
                item.k | ellipsiscrypto(32)
              }}</span>
              <span class="hidden-md-and-up">{{
                item.k | ellipsiscrypto(8)
              }}</span>
              <v-btn
                text
                small
                icon
                v-clipboard="
                  typeof item.k != 'undefined' && (item.k != null ? item.k : 0)
                "
              >
                <v-icon small>mdi-content-copy</v-icon>
              </v-btn>
            </span>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  icon
                  small
                  :to="{
                    name: 'address',
                    params: { address: item.k },
                  }"
                  color="primary"
                >
                  <v-icon dense medium>mdi-arrow-right-bold-circle</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("global.addressDetails") }}</span>
            </v-tooltip>
          </span>
        </template>
        <template #[`item.ahdollar`]="{ item }">
          {{ item.ahdollar.join(", ") }}
        </template>
        <template #[`item.ll`]="{ item }">
          <delegator-loyalty
            :dlpackage="item.dl"
            :stake_key="item.k"
            :pool_id="pool.poolpubkey"
          />
        </template>

        <template #[`item.v`]="{ item }">
          <span class="d-flex align-center">
            <ranking-icon
              :ttleft="true"
              :ttright="false"
              :ttbottom="false"
              classin="mt-0 mr-2 mr-2"
              :svgonly="true"
              height="35"
              v-if="item.v != null"
              :adavalue="item.v"
            />
            ₳ {{ item.v | toada | numFormat("0,0.0a") | zeronull }}

            <v-btn
              class=""
              text
              small
              icon
              v-clipboard="
                typeof item.total_value != 'undefined' &&
                item.total_value != null
                  ? item.total_value
                  : 0
              "
            >
              <v-icon small>mdi-content-copy</v-icon>
            </v-btn>
          </span>
        </template>
        <template #[`item.actions`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                small
                :to="{ name: 'address', params: { address: item.k } }"
                color="primary"
              >
                <v-icon dense medium>mdi-arrow-right-bold-circle</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("global.addressDetails") }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
    <v-row class="pt-3">
      <v-col class="col-lg-6 col-md-12 col-sm-12">
        <v-card :dark="nightmode">
          <v-card-title>
            <span class="proCellClass"
              >Incoming Stake (last 3 epochs)
              <div class="prolabel text-caption">PRO</div></span
            >
            <v-spacer></v-spacer>₳
            {{ stake_gained_from_sum | toada | numFormat("0,0.0a") | zeronull }}
          </v-card-title>

          <v-data-table
            :items="stake_gained_from"
            :dark="nightmode"
            dense
            sort-by="epoch"
            :sort-desc="true"
            :headers="this.headers"
            item-key="stake_key"
            class="elevation-1"
          >
            <template #[`item.stake_key`]="{ item }">
              <span class="d-flex align-center justify-space-between">
                <span class="d-flex align-center">
                  <span class="hidden-sm-and-down">{{
                    item.stake_key | ellipsiscrypto(32)
                  }}</span>
                  <span class="hidden-md-and-up">{{
                    item.stake_key | ellipsiscrypto(8)
                  }}</span>
                  <v-btn
                    text
                    small
                    icon
                    v-clipboard="
                      typeof item.stake_key != 'undefined' &&
                      (item.stake_key != null ? item.stake_key : 0)
                    "
                  >
                    <v-icon small>mdi-content-copy</v-icon>
                  </v-btn>
                </span>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      icon
                      small
                      :to="{
                        name: 'address',
                        params: { address: item.stake_key },
                      }"
                      color="primary"
                    >
                      <v-icon dense medium>mdi-arrow-right-bold-circle</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t("global.addressDetails") }}</span>
                </v-tooltip>
              </span>
            </template>
            <template #[`item.stake`]="{ item }">
              <span class="d-flex align-center">
                <ranking-icon
                  :ttleft="true"
                  :ttright="false"
                  :ttbottom="false"
                  classin="mt-0 mr-2 mr-2"
                  :svgonly="true"
                  height="35"
                  v-if="item.stake != null"
                  :adavalue="item.stake"
                />
                ₳ {{ item.stake | toada | numFormat("0,0.0a") | zeronull }}
              </span>
            </template>
            <template #[`item.pool_ticker`]="{ item }">
              <span
                class="d-flex align-center text-no-wrap justify-space-between"
              >
                <span class="">
                  {{ item.pool_ticker }}
                </span>
                <span>
                  <v-tooltip v-if="item.pool_id.trim() != 'None'" bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        icon
                        small
                        :to="{
                          name: 'pooldelegators',
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
                  <span v-else>Not Delegated</span>
                </span>
              </span>
            </template>
          </v-data-table>
        </v-card> </v-col
      ><v-col class="col-lg-6 col-md-12 col-sm-12">
        <v-card :dark="nightmode">
          <v-card-title>
            <span class="proCellClass"
              >Outgoing Stake (last 3 epochs)
              <div class="prolabel text-caption">PRO</div></span
            >
            <v-spacer></v-spacer>₳
            {{
              stake_lost_to_sum | toada | numFormat("0,0.0a") | zeronull
            }}</v-card-title
          >
          <v-data-table
            :items="stake_lost_to"
            :dark="nightmode"
            dense
            sort-by="epoch"
            :sort-desc="true"
            :headers="this.headers"
            item-key="stake_key"
            class="elevation-1"
          >
            <template #[`item.stake_key`]="{ item }">
              <span class="d-flex align-center justify-space-between">
                <span class="d-flex align-center">
                  <span class="hidden-sm-and-down">{{
                    item.stake_key | ellipsiscrypto(32)
                  }}</span>
                  <span class="hidden-md-and-up">{{
                    item.stake_key | ellipsiscrypto(8)
                  }}</span>
                  <v-btn
                    text
                    small
                    icon
                    v-clipboard="
                      typeof item.stake_key != 'undefined' &&
                      (item.stake_key != null ? item.stake_key : 0)
                    "
                  >
                    <v-icon small>mdi-content-copy</v-icon>
                  </v-btn>
                </span>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      icon
                      small
                      :to="{
                        name: 'address',
                        params: { address: item.stake_key },
                      }"
                      color="primary"
                    >
                      <v-icon dense medium>mdi-arrow-right-bold-circle</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t("global.addressDetails") }}</span>
                </v-tooltip>
              </span>
            </template>
            <template #[`item.stake`]="{ item }">
              <span class="d-flex align-center">
                <ranking-icon
                  :ttleft="true"
                  :ttright="false"
                  :ttbottom="false"
                  classin="mt-0 mr-2 mr-2"
                  :svgonly="true"
                  height="35"
                  v-if="item.stake != null"
                  :adavalue="item.stake"
                />
                ₳ {{ item.stake | toada | numFormat("0,0.0a") | zeronull }}
              </span>
            </template>
            <template #[`item.pool_ticker`]="{ item }">
              <span
                class="d-flex align-center text-no-wrap justify-space-between"
              >
                <span class="">
                  {{ item.pool_ticker }}
                </span>
                <span>
                  <v-tooltip v-if="item.pool_id.trim() != 'None'" bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        icon
                        small
                        :to="{
                          name: 'pooldelegators',
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
                  <span v-else>Not Delegated</span>
                </span>
              </span>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import RankingIcon from "@/components/RankingIcon";
import DelegatorLoyalty from "@/components/DelegatorLoyalty";
import colors from "@/mixins/colors";
export default {
  props: ["nightmode", "pool", "owners", "userId", "poolstats"],
  mixins: [colors],
  created() {},

  components: {
    RankingIcon,
    DelegatorLoyalty,
  },
  watch: {
    unreactive_epoch: {
      immediate: true,
      handler(newval, oldval) {
        if (newval != oldval) {
          this.unreactive_epoch2 = newval;
        } else {
          this.unreactive_epoch2 = oldval;
        }
      },
    },
    refetch_watch_stake_movement: {
      immediate: true,
      handler() {
        if (
          typeof this.pool.poolpubkey != "undefined" &&
          typeof this.unreactive_epoch2 != "undefined"
        ) {
          var self = this;
          //reload the delegators json
          this.getJSON(
            "https://s3-us-west-2.amazonaws.com/data.pooltool.io/" +
              "stats/loyalty/" +
              String(this.unreactive_epoch2 + 1) +
              "/threeepoch_stake_gained_from/" +
              String(this.pool.poolpubkey) +
              ".json?t=" +
              Date.now(),
            function (err, thisdata) {
              if (err == null) {
                self.stake_gained_from_sum = thisdata.reduce(
                  (accumulator, object) => {
                    return accumulator + parseInt(object.stake);
                  },
                  0
                );
                self.stake_gained_from = thisdata;
              }
            }
          );
          this.getJSON(
            "https://s3-us-west-2.amazonaws.com/data.pooltool.io/" +
              "stats/loyalty/" +
              String(this.unreactive_epoch2 + 1) +
              "/threeepoch_stake_lost_to/" +
              String(this.pool.poolpubkey) +
              ".json?t=" +
              Date.now(),
            function (err, thisdata) {
              if (err == null) {
                self.stake_lost_to_sum = thisdata.reduce(
                  (accumulator, object) => {
                    return accumulator + parseInt(object.stake);
                  },
                  0
                );
                self.stake_lost_to = thisdata;
              }
            }
          );
        }
      },
    },
    refetch_watch: {
      // call it upon creation too
      immediate: true,
      handler() {
        if (
          typeof this.pool.poolpubkey != "undefined" &&
          typeof this.unreactive_epoch2 != "undefined"
        ) {
          var self = this;
          //reload the delegators json
          this.getJSON(
            "https://s3-us-west-2.amazonaws.com/data.pooltool.io/" +
              "live_delegators_by_pool/" +
              this.pool.poolpubkey +
              ".json?t=" +
              Date.now(),
            function (err, thisdata) {
              if (err == null) {
                self.delegators = thisdata.delegators;

                self.delegatorHash = thisdata.delegatorHash;
              }
            }
          );
        }
      },
    },
  },

  data() {
    return {
      filter_rangemin: null,
      filter_rangemax: null,
      filter_text: null,
      headers: [
        {
          text: this.$t("app.addressDetail.address"),
          align: "left",
          sortable: true,
          divider: true,
          value: "stake_key",
        },

        {
          value: "stake",
          sortable: true,
          divider: true,
          align: "center",
          text: this.$t("global.stake"),
        },

        {
          text: this.$t("global.epoch"),

          align: "center",
          value: "epoch",
          divider: true,
          sortable: true,
          filterable: false,
        },
        {
          text: this.$t("global.ticker"),
          align: "center",
          sortable: true,
          divider: false,
          value: "pool_ticker",
        },
      ],
      ismobile: false,

      chartScale: 300,
      stake_gained_from: [],
      stake_gained_from_sum: 0,
      stake_lost_to: [],
      stake_lost_to_sum: 0,
      tableheaders: [
        {
          text: this.$t("app.addressDetail.address"),
          align: "left",
          sortable: true,
          value: "k",
        },
        {
          value: "v",
          sortable: true,
          align: "left",
          text: this.$t("global.totalValue"),
        },
        {
          value: "ll",
          sortable: true,
          align: "center",
          text: this.$t("global.loyalty"),
        },
      ],
      delegators: [],
      delegatorsHash: null,
    };
  },
  methods: {
    cancelFilter: function () {
      this.filter_rangemin = null;
      this.filter_rangemax = null;
      this.filter_text = null;
    },
    passClick: function (data) {
      this.filter_rangemin = data.rangemin;
      this.filter_rangemax = data.rangemax;
      this.filter_text = data.text;
    },
  },
  computed: {
    unreactive_epoch: function () {
      return this.genesis.epoch;
    },
    filtered_delegators: function () {
      var returndelegators = [];
      if (this.filter_rangemin != null && this.filter_rangemax != null) {
        returndelegators = this.delegators.filter((x) => {
          return x.v >= this.filter_rangemin && x.v < this.filter_rangemax;
        });
      } else {
        returndelegators = this.delegators;
      }
      returndelegators.map((thisdata) => {
        if (thisdata.ah != null && thisdata.ah.length) {
          thisdata.ahdollar = thisdata.ah.map((x) => {
            return "$" + String(x);
          });
        } else {
          thisdata.ahdollar = [];
        }
        if (
          thisdata.dl != null &&
          typeof thisdata.dl.max_epoch != "undefined"
        ) {
          if (
            parseInt(this.unreactive_epoch2) - 2 ==
            parseInt(thisdata.dl.max_epoch)
          ) {
            var epoch_adder =
              parseInt(this.unreactive_epoch2) -
              2 -
              parseInt(thisdata.dl.max_epoch);

            thisdata.dl.epochs_staked =
              parseInt(thisdata.dl.epochs_staked) + epoch_adder;
            if (thisdata.dl.current_pool == this.pool.poolpubkey) {
              thisdata.dl.pool_ids_staked[thisdata.dl.current_pool].epochs =
                parseInt(
                  thisdata.dl.pool_ids_staked[thisdata.dl.current_pool].epochs
                ) + epoch_adder;
            }
          }
          if (
            typeof thisdata.dl.pool_ids_staked[this.pool.poolpubkey] !=
            "undefined"
          ) {
            thisdata.dl.pool_ids_staked[this.pool.poolpubkey].lifetime_loyalty =
              parseInt(
                thisdata.dl.pool_ids_staked[this.pool.poolpubkey].epochs
              ) / thisdata.dl.epochs_staked;
            thisdata.ll =
              thisdata.dl.pool_ids_staked[
                this.pool.poolpubkey
              ].lifetime_loyalty;
          } else {
            thisdata.ll = null;
          }
          return thisdata;
        } else {
          return thisdata;
        }
      });
      return returndelegators;
    },
    genesis: function () {
      return this.$store.getters.getGenesis;
    },
    delegator_totals: function () {
      var thresholds = [
        100, 1000, 5000, 10000, 50000, 100000, 250000, 500000, 1e6, 5e6,
      ];
      if (this.delegators.length) {
        return this.delegators.reduce(
          (previousValue, currentValue) => {
            if (currentValue.v > 5e6 * 1e6) {
              if (typeof previousValue[5e6 + 1] == "undefined") {
                previousValue[5e6 + 1] = {};
                previousValue[5e6 + 1]["qty"] = 1;
                previousValue[5e6 + 1]["amt"] = currentValue.v;
              } else {
                previousValue[5e6 + 1]["qty"]++;
                previousValue[5e6 + 1]["amt"] += currentValue.v;
              }
            } else {
              thresholds.every((element) => {
                if (currentValue.v <= element * 1e6) {
                  if (typeof previousValue[element] == "undefined") {
                    previousValue[element] = {};
                    previousValue[element]["qty"] = 1;
                    previousValue[element]["amt"] = currentValue.v;
                  } else {
                    previousValue[element]["qty"]++;
                    previousValue[element]["amt"] += currentValue.v;
                  }
                  return false;
                } else {
                  return true;
                }
              });
            }

            return previousValue;
          },
          { 100: { qty: 0, amt: 0 } }
        );
      } else {
        return {};
      }
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },
    refetch_watch_stake_movement: function () {
      if (
        typeof this.pool.poolpubkey != "undefined" &&
        typeof this.unreactive_epoch2 != "undefined"
      ) {
        return this.pool.poolpubkey.concat(String(this.unreactive_epoch2));
      } else {
        return "";
      }
    },
    refetch_watch: function () {
      if (
        typeof this.pool.poolpubkey != "undefined" &&
        typeof this.poolstats.delegatorHash != "undefined"
      ) {
        return this.pool.poolpubkey.concat(this.poolstats.delegatorHash);
      } else {
        return "";
      }
    },
  },
};
</script>

<style scoped>
.prolabel {
  -webkit-transform: rotate(-33deg);

  /* Firefox */
  -moz-transform: rotate(-33deg);

  /* IE */
  -ms-transform: rotate(-33deg);

  /* Opera */
  -o-transform: rotate(-33deg);
  position: absolute;
  top: -5px;
  left: -20px;
  color: #ccc;
  text-shadow: 0 0 7px #aaa, 0 0 10px #aaa, 0 0 21px #aaa, 0 0 42px #0fa,
    0 0 82px #0fa, 0 0 92px #0fa, 0 0 102px #0fa, 0 0 151px #0fa;
}
</style>
<style>
.proCellClass {
  position: relative;
}
</style>
