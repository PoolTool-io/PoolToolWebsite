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

    <v-card class="mx-auto mb-5" :dark="nightmode">
      <v-btn
        fab
        :small="ismobile"
        @click="togglefavorite($route.params.address)"
        top
        right
        absolute
        style="top: 10px"
      >
        <v-icon
          :color="
            $route.params.address != '' &&
            favorites.length &&
            favorites.indexOf($route.params.address) != -1
              ? 'red'
              : ''
          "
          >mdi-heart</v-icon
        >
      </v-btn>

      <v-list two-line subheader class="mb-0 pb-0">
        <v-list-item class="mb-0 pb-0">
          <v-list-item-content class="pl-0 pr-2 ml-0 py-1 mb-0">
            <v-row dense>
              <v-col cols="12" class="col-xs-12 col-sm-3 col-lg-3 pb-0 mb-0">
                <ranking-icon
                  :ttleft="false"
                  :ttright="true"
                  :ttbottom="false"
                  :svgonly="false"
                  :classin="ismobile ? 'pt-2' : ''"
                  :height="ismobile ? 45 : 65"
                  v-if="curvalue.amount != null"
                  :adavalue="curvalue.amount"
                />
              </v-col>
              <v-col cols="12" class="col-xs-12 col-sm-8 col-lg-8 pt-1 mt-1">
                <span
                  :class="[ismobile ? 'subtitle' : 'h4', 'font-weight-bold']"
                  ><span class="hidden-md-and-up">{{
                    $route.params.address | ellipsiscrypto(16)
                  }}</span
                  ><span class="hidden-sm-and-down"
                    >{{ $t("app.addressDetail.address") }}:
                    {{ $route.params.address }}</span
                  >
                  <v-btn
                    text
                    small
                    icon
                    v-clipboard="this.$route.params.address"
                  >
                    <v-icon small>mdi-content-copy</v-icon>
                  </v-btn> </span
                ><br />
                <span
                  :class="[ismobile ? 'subtitle' : 'h4', 'font-weight-bold']"
                  ><span class="hidden-md-and-up">{{
                    cli2bech($route.params.address) | ellipsiscrypto(16)
                  }}</span
                  ><span class="hidden-sm-and-down"
                    >Bech32: {{ cli2bech($route.params.address) }}</span
                  >
                  <v-btn
                    text
                    small
                    icon
                    v-clipboard="cli2bech($route.params.address)"
                  >
                    <v-icon small>mdi-content-copy</v-icon>
                  </v-btn>
                </span>
                <span v-if="enableLogins">
                  <claim-address
                    v-if="!myAddresses.includes(this.$route.params.address)"
                    @claimAddress="claimAddress"
                    :address="cli2bech($route.params.address)"
                  />
                  <span v-else class="text-caption">
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
                </span>
                <br />
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-card-text class="mt-0 pt-0 pb-0 mb-0">
        <v-row align="center" justify="space-between">
          <v-col cols="auto" class="text-center">
            <span class="text-h6"
              >{{
                totals["lifeOperatorRewards"]
                  | tosmallada
                  | numFormat("0,0.000a")
                  | zeronull
              }}
              ₳</span
            >
            <div class="d-block text-no-wrap">
              {{ $t("app.addressDetail.operatorRewards") }}
            </div>
          </v-col>

          <v-col cols="auto" class="text-center">
            <span class="text-h6"
              >{{
                totals["lifeStakeRewards"]
                  | tosmallada
                  | numFormat("0,0.000a")
                  | zeronull
              }}
              ₳</span
            >
            <div class="d-block text-no-wrap">
              {{ $t("app.addressDetail.stakingRewards") }}
            </div>
          </v-col>
          <v-col cols="auto" class="text-center">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on" class="text-h6"
                  >{{
                    (totals["lifeStakeRewards"] + totals["lifeOperatorRewards"])
                      | tosmallada
                      | numFormat("0,0.000a")
                      | zeronull
                  }}
                  ₳</span
                >
              </template>
              <span
                >{{
                  (totals["lifeStakeRewards"] + totals["lifeOperatorRewards"])
                    | tosmallada
                    | numFormat("0,0.0000000")
                    | zeronull
                }}
                ₳</span
              >
            </v-tooltip>

            <div class="d-block text-no-wrap">
              {{ $t("global.lifetimeRewards") }}
            </div>
          </v-col>
          <v-col cols="auto" class="text-center" v-if="!totals['multi_addr']">
            <span class="text-h6">{{
              totals["lifeAmount"] | roi(totals["lifeStakeRewards"]) | fpercent
            }}</span>
            <div class="d-block text-no-wrap">
              {{ $t("global.lifetimeROS") }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card :dark="nightmode">
      <v-card-title class="my-0 py-0">
        {{ $t("app.addressDetail.addressDetail") }}
        <v-spacer></v-spacer>
      </v-card-title>
      <line-bar-chart
        class="mx-2 my-0"
        :cdata="addresshistory"
        :options="addresshistoryoptions"
      ></line-bar-chart>
      <v-row cols="12" dense class="pt-10">
        <v-col cols="12" class="col-xs-12 col-sm-12 col-md-8 ma-0 pb-0">
          <v-slider
            thumb-label="always"
            :label="this.$t('app.poolPageHistory.epochs')"
            thumb-color="primary  secondary--text"
            v-model="nepochs"
            class="align-center ma-2"
            :max="maxepochs"
            :min="1"
            step="1"
            ticks="always"
            tick-size="4"
            hide-details
          >
            <template v-slot:thumb-label="props">
              {{ props.value + 1 }}
            </template>
          </v-slider>
        </v-col>
        <v-col cols="12" class="col-xs-12 col-sm-12 col-md-4 ma-0 py-0">
          <v-switch
            dense
            v-model="includeOperatorRewards"
            :label="$t('app.addressDetail.includeOperatorRewards')"
            class="ma-2"
          ></v-switch>
        </v-col>
      </v-row>

      <v-data-table
        :dark="nightmode"
        must-sort
        sort-by="epoch"
        sort-desc
        dense
        :headers="this.tableheaders"
        :items="ahist"
        item-key="id"
        class="elevation-1"
        :footer-props="{
          'items-per-page-options': [5, 10, 20, 30, 40, 50, 100],
        }"
      >
        <template #[`footer.prepend`]
          ><span class="mx-2" v-if="addNote"
            ><sup>*</sup> Undelegated addresses may also be unregistered and
            thus will not receive any rewards. Confirm your address is
            registered.</span
          ></template
        >
        <template #[`header.rewardaddr_details`]>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
                <v-switch
                  dense
                  hide-details
                  v-model="view_details"
                  :label="$t('app.addressDetail.details')"
                  class="mt-0 pa-0 mx-0 mb-0"
                  style="font-size: 0.75rem"
                >
                  <template v-slot:label>
                    {{ view_details ? $t("app.addressDetail.details") : "" }}
                  </template>
                </v-switch>
              </div>
            </template>
            <span>{{ $t("app.addressDetail.details") }}</span>
          </v-tooltip>
        </template>

        <template #[`item.delegatedTo`]="{ item }">
          <span class="text-no-wrap">
            {{ item.delegatedToTicker }}
            <v-tooltip v-if="item.delegatedTo.trim() != 'None'" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  icon
                  small
                  :to="{
                    name: 'pooldelegators',
                    params: { poolid: item.delegatedTo },
                  }"
                  color="primary"
                >
                  <v-icon dense medium>mdi-arrow-right-bold-circle</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("app.pools.poolDetails") }}</span>
            </v-tooltip>
            <span v-else>Not Delegated<sup>*</sup></span>
          </span>
        </template>

        <template #[`item.ros`]="{ item }">
          <span v-if="item.rewardDate != null">
            {{ item.amount | roi(item.stakeRewards) | fpercent }}
          </span>
        </template>
        <template #[`item.rewardDate`]="{ item }">
          <span v-if="item.rewardDate != null">
            <span class="hidden-lg-and-up" style="text-transform: lowercase">
              {{ (item.rewardDate * 1000) | date("P p") }}
            </span>
            <span class="hidden-md-and-down">
              {{ (item.rewardDate * 1000) | date("MMMM do yyyy, h:mm:ss a") }}
            </span>
          </span>
          <span v-else class="text--disabled">
            <span class="hidden-lg-and-up" style="text-transform: lowercase">
              {{
                add("2017-09-23T21:44:51Z", {
                  days: (parseInt(item.epoch) + 2) * 5,
                }) | date("P p")
              }}
            </span>
            <span class="hidden-md-and-down">
              {{
                add("2017-09-23T21:44:51Z", {
                  days: (parseInt(item.epoch) + 2) * 5,
                }) | date("MMMM do yyyy, h:mm:ss a")
              }}
            </span>
          </span>
        </template>
        <template #[`item.cur_total_rewards`]="{ item }">
          <span v-if="item.rewardDate != null">
            {{ valueincur(item) | numFormat("0,0.000") }}
          </span>
        </template>
        <template #[`item.cur_rate`]="{ item }">
          <span v-if="item.rewardDate != null">
            {{ cur_rate(item) | numFormat("0,0.00[0000]") }}
          </span>
        </template>
        <template #[`item.amount`]="{ item }">
          {{ item.amount | toada | numFormat("0,0.000a") | zeronull }}
        </template>

        <template #[`item.stakeRewards`]="{ item }">
          <span
            :class="
              item.rewardsSentTo != $route.params.address
                ? 'text--disabled'
                : ''
            "
            v-if="!item.forecast"
          >
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on">{{
                  item.stakeRewards
                    | tosmallada
                    | numFormat("0,0.000a")
                    | zeronull
                }}</span>
              </template>
              <span>{{
                item.stakeRewards
                  | tosmallada
                  | numFormat("0,0.000[000]")
                  | zeronull
              }}</span>
            </v-tooltip>

            <v-tooltip
              v-if="
                item.stakeRewards > 0 &&
                item.rewardsSentTo != $route.params.address
              "
              bottom
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  icon
                  small
                  :to="{
                    name: 'address',
                    params: { address: item.rewardsSentTo },
                  }"
                  color="primary"
                >
                  <v-icon dense medium>mdi-arrow-right-bold-circle</v-icon>
                </v-btn>
              </template>
              <span>{{
                $t("app.addressDetail.rewardsSentToSeparateAddress")
              }}</span>
            </v-tooltip>
            <span v-else class="pr-8"> </span>
          </span>
          <span v-else>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span
                  v-bind="attrs"
                  v-on="on"
                  class="font-italic text--secondary"
                >
                  {{
                    item.stakeRewards
                      | tosmallada
                      | numFormat("0,0.000a")
                      | zeronull
                  }}
                </span>
              </template>
              <span>{{ $t("global.forecasted") }}</span>
            </v-tooltip>
            <span class="pr-8"> </span>
          </span>
        </template>
        <template #[`item.rewardaddr_details`]="{ item }">
          <v-simple-table v-if="view_details && item.addr_history.length" dense>
            <template v-slot:default>
              <thead>
                <tr>
                  <th>{{ $t("app.addressDetail.fromAddress") }}</th>
                  <th>{{ $t("app.addressDetail.poolId") }}</th>
                  <th>{{ $t("global.stake") }} (₳)</th>
                  <th>{{ $t("app.addressDetail.stakeRewards") }} (₳)</th>
                  <th>{{ $t("app.addressDetail.operatorRewards") }} (₳)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="thisitem in item.addr_history"
                  :key="thisitem.fromaddr"
                >
                  <td class="text-no-wrap">
                    {{ thisitem.fromaddr | ellipsiscrypto(8) }}

                    <v-btn text small icon v-clipboard="thisitem.fromaddr">
                      <v-icon small>mdi-content-copy</v-icon>
                    </v-btn>
                    <v-tooltip
                      v-if="thisitem.fromaddr != $route.params.address"
                      bottom
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs"
                          v-on="on"
                          icon
                          small
                          :to="{
                            name: 'address',
                            params: { address: thisitem.fromaddr },
                          }"
                          color="primary"
                        >
                          <v-icon dense medium
                            >mdi-arrow-right-bold-circle</v-icon
                          >
                        </v-btn>
                      </template>
                      <span>{{ $t("global.addressDetails") }}</span>
                    </v-tooltip>
                  </td>
                  <td class="text-no-wrap">
                    <span v-if="thisitem.pool.trim() != 'None'"
                      >{{ thisitem.pool | ellipsiscrypto(8) }}
                      <v-btn text small icon v-clipboard="thisitem.pool">
                        <v-icon small>mdi-content-copy</v-icon>
                      </v-btn>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs"
                            v-on="on"
                            icon
                            small
                            :to="{
                              name: 'pooldelegators',
                              params: { poolid: thisitem.pool },
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
                    </span>
                  </td>
                  <td>
                    {{
                      thisitem.amount | toada | numFormat("0,0.000a") | zeronull
                    }}
                  </td>
                  <td>
                    {{
                      thisitem.stakeRewards
                        | tosmallada
                        | numFormat("0,0.000a")
                        | zeronull
                    }}
                  </td>
                  <td>
                    {{
                      thisitem.operatorRewards
                        | tosmallada
                        | numFormat("0,0.000a")
                        | zeronull
                    }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>

        <template #[`item.operatorRewards`]="{ item }">
          <span
            :class="
              item.rewardsSentTo != $route.params.address
                ? 'text--disabled'
                : ''
            "
            v-if="!item.forecast"
          >
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on">{{
                  item.operatorRewards
                    | tosmallada
                    | numFormat("0,0.000a")
                    | zeronull
                }}</span>
              </template>
              <span>{{
                item.operatorRewards
                  | tosmallada
                  | numFormat("0,0.000[000]")
                  | zeronull
              }}</span>
            </v-tooltip>
          </span>
          <v-tooltip v-else bottom>
            <template v-slot:activator="{ on, attrs }">
              <span
                v-bind="attrs"
                v-on="on"
                class="font-italic text--secondary"
              >
                {{
                  item.operatorRewards
                    | tosmallada
                    | numFormat("0,0.000a")
                    | zeronull
                }}
              </span>
            </template>
            <span>{{ $t("global.forecasted") }}</span>
          </v-tooltip>
        </template>
        <template #[`item.total_rewards`]="{ item }">
          <span v-if="!item.forecast">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on">{{
                  (item.operatorRewards + item.stakeRewards)
                    | tosmallada
                    | numFormat("0,0.000a")
                    | zeronull
                }}</span>
              </template>
              <span>{{
                (item.operatorRewards + item.stakeRewards)
                  | tosmallada
                  | numFormat("0,0.000[000]")
                  | zeronull
              }}</span>
            </v-tooltip>
          </span>
          <v-tooltip v-else bottom>
            <template v-slot:activator="{ on, attrs }">
              <span
                v-bind="attrs"
                v-on="on"
                class="font-italic text--secondary"
              >
                {{
                  (item.operatorRewards + item.stakeRewards)
                    | tosmallada
                    | numFormat("0,0.000a")
                    | zeronull
                }}
              </span>
            </template>
            <span>{{ $t("global.forecasted") }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
    <v-card class="mt-6 mx-auto mb-4" elevation="5" :dark="nightmode">
      <div class="pt_form_title">
        {{ $t("app.addressDetail.exportTools") }}
      </div>
      <v-card-text>
        <p>
          {{ $t("app.addressDetail.disclaimer") }}
        </p>
        <v-row class="d-flex">
          <v-col cols="12" sm="2" class="py-0 px-0 pr-1 pb-2">
            <v-select
              item-text="formatName"
              item-value="format"
              :items="downloadFormats"
              dense
              outlined
              flat
              hide-details
              v-model="downloadFormat"
              :label="$t('app.addressDetail.downloadFormat')"
              :placeholder="$t('app.addressDetail.downloadFormat')"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="2" class="py-0 px-0 pr-1 pb-2">
            <v-select
              item-text="name"
              item-value="code"
              :items="currencies"
              dense
              outlined
              flat
              hide-details
              v-model="downloadCurrency"
              :label="$t('app.addressDetail.referenceCurrency')"
              :placeholder="$t('app.addressDetail.referenceCurrency')"
            ></v-select>
          </v-col>

          <v-col cols="12" sm="2" class="py-0 px-0 pr-1 pb-2 position-relative">
            <v-menu
              ref="dateRangeMenu"
              v-model="dateRangeMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  class="date-range-input"
                  item-text="DateRange"
                  v-model="downloadDateRange"
                  label="Date Range"
                  prepend-icon="mdi-calendar"
                  v-bind="attrs"
                  v-on="on"
                >
                </v-text-field>
              </template>
              <v-date-picker v-model="downloadDateRange" no-title range dark>
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="dateRangeMenu = false">
                  Cancel
                </v-btn>
                <v-btn
                  text
                  color="primary"
                  @click="$refs.dateRangeMenu.save(downloadDateRange)"
                >
                  OK
                </v-btn>
              </v-date-picker>
            </v-menu>
            <span
              v-show="downloadDateRange.length"
              class="clear-date-icon"
              @click="downloadDateRange = []"
              >x</span
            >
          </v-col>

          <v-col cols="12" sm="2" class="py-0 px-0 pr-1 pb-2">
            <v-select
              item-text="Epoch Options"
              item-value="epochFilterOptions"
              :items="epochFilterOptions"
              v-model="selectedEpochFilterOpt"
              @change="
                downloadFromEpoch = '';
                downloadToEpoch = '';
              "
              dense
              outlined
              flat
              hide-details
              label="Epoch"
            ></v-select>
          </v-col>

          <template v-if="selectedEpochFilterOpt != 'All'">
            <v-col cols="12" sm="1" class="py-0 px-0 pr-1 pb-2">
              <v-autocomplete
                item-text="From Epoch"
                item-value="fromEpochValue"
                :items="epochValuesFrom"
                v-model="downloadFromEpoch"
                dense
                outlined
                flat
                hide-details
                label="From"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" sm="1" class="py-0 px-0 pr-1 pb-2">
              <v-autocomplete
                item-text="To Epoch"
                item-value="toEpochValue"
                :items="epochValuesTo"
                v-model="downloadToEpoch"
                dense
                outlined
                flat
                hide-details
                label="To"
              ></v-autocomplete>
            </v-col>
          </template>

          <div class="py-0 px-0 pr-1 pb-2 justify-end flex-grow-1">
            <download-csv
              :labels="labels"
              :data="createDownloadJson"
              :name="
                'rewards_' +
                $route.params.address +
                '_' +
                downloadCurrency +
                '_' +
                downloadFormat +
                (typeof downloadDateRange[0] != 'undefined'
                  ? '_' + downloadDateRange[0]
                  : '') +
                (typeof downloadDateRange[1] != 'undefined'
                  ? '_' + downloadDateRange[1]
                  : '') +
                (this.downloadFromEpoch != ''
                  ? '_' + this.downloadFromEpoch
                  : '') +
                (this.downloadToEpoch != '' ? '_' + this.downloadToEpoch : '') +
                '.csv'
              "
            >
              <v-btn
                @click="onCsvDownload"
                style="margin-top: 2px"
                block
                color="primary secondary--text"
                >{{ $t("app.addressDetail.downloadData") }}</v-btn
              >
            </download-csv>
          </div>
        </v-row>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="showAlert" :timeout="2000" color="red">
      {{ message }}

      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="showAlert = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import add from "date-fns/add";
import parseISO from "date-fns/parseISO";
import format from "date-fns/format";
const Buffer = require("buffer/").Buffer;
import { db } from "@/firebase";

// import QrcodeVue from "qrcode.vue";
import numeral from "numeral";
let { bech32 } = require("bech32");
import { mapPreferences } from "vue-preferences";
import currenciesjson from "@/json/currencies.json";
import { preference } from "vue-preferences";
import RankingIcon from "@/components/RankingIcon";
const favoriteaddrs = preference("favoriteaddr", {
  defaultValue: [],
});
export default {
  props: [
    "currency",
    "nightmode",
    "enableLogins",
    "showBlockIcons",
    "ispulseVisible",
    "ismobile",
  ],
  components: {
    GenesisBar: () => import("@/components/GenesisBar"),
    LineBarChart: () => import("@/components/LineBarChart"),
    ClaimAddress: () => import("@/components/ClaimAddress"),
    RankingIcon,
  },
  updated() {
    this.$emit("isLoaded", true);
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.returnlink = from;
    });
  },
  filters: {
    roi: function (stake, reward) {
      if (stake == 0 || stake == null) return 0;
      if (reward == 0 || reward == null) return 0;
      if (stake < reward) return 0;
      return Math.pow(reward / stake + 1, 365 / 5) - 1;
    },
  },
  methods: {
    add: function (d, delta) {
      return add(new Date(parseISO(d)), delta);
    },
    claimAddress: function (address) {
      this.$emit("claimAddress", address);
    },
    buildEpochData: function (rawEntry, thisepoch) {
      var value = {
        epoch: thisepoch,
        amount: rawEntry.amount,
        delegatedTo:
          rawEntry.delegatedTo != null ? rawEntry.delegatedTo : "None",
        delegatedToTicker: rawEntry.delegatedToTicker,
        forecast: rawEntry.forecast != null ? rawEntry.forecast : false,
        operatorRewards: rawEntry.operatorRewards,
        stakeRewards: rawEntry.stakeRewards,
        rewardsSentTo: rawEntry.rewardsSentTo,
        lifeAmount: rawEntry.lifeAmount,
        lifeOperatorRewards: rawEntry.lifeOperatorRewards,
        lifeStakeRewards: rawEntry.lifeStakeRewards,
      };
      if (value["delegatedTo"].trim() == "None") {
        this.addNote = true;
      }
      if (typeof this.epoch_exchange_rates[thisepoch] != "undefined") {
        value["rewardDate"] =
          this.epoch_exchange_rates[thisepoch]["rewardDate"];
        value["adaPrices"] = this.epoch_exchange_rates[thisepoch]["adaPrices"];
        value["adaPrices"]["ada"] = 1;
      } else {
        value["rewardDate"] = null;
        value["adaPrices"] = null;
      }
      value["addr_history"] = [];
      if (rawEntry.rewardAddrDetails != null) {
        for (const [key, avalue] of Object.entries(
          rawEntry.rewardAddrDetails
        )) {
          avalue["fromaddr"] = key.substring(0, 56);
          value["addr_history"].push(avalue);
        }
      }
      return value;
    },

    cli2bech: function (cli) {
      try {
        return bech32.encode(
          "stake",
          bech32.toWords(Buffer.from("e1" + cli, "hex")),
          256
        );
      } catch (e) {
        console.log(e);
        return "";
      }
    },
    togglefavorite: function (addressid) {
      var indx = this.favorites.indexOf(addressid);
      if (indx == -1) {
        this.favorites.push(addressid);
      } else {
        this.favorites.splice(indx, 1);
      }
      favoriteaddrs.set(this.favorites);
    },
    cur_rate: function (item) {
      if (
        typeof item.adaPrices != undefined &&
        item.adaPrices != null &&
        typeof item.adaPrices[this.currency] != "undefined"
      ) {
        return item.adaPrices[this.currency];
      }
      return 1;
    },
    valueincur: function (item) {
      if (
        typeof item.adaPrices != undefined &&
        item.adaPrices != null &&
        typeof item.adaPrices[this.currency] != "undefined"
      ) {
        var v =
          (item.adaPrices[this.currency] *
            (item.operatorRewards + item.stakeRewards)) /
          1e6;
        if (v < 1e-6) {
          v = 0;
        }
        return v;
      } else {
        v = (item.operatorRewards + item.stakeRewards) / 1e6;
        if (v < 1e-6) {
          v = 0;
        }
        return v;
      }
    },
    customSort(items) {
      return items;
    },
    onCsvDownload() {
      if (this.isEpochRangeInvalid) {
        this.message = "Epoch Range Is Invalid";
        this.showAlert = true;
      } else if (this.isDateRangeInvalid) {
        this.message = "Date Range Is Invalid";
        this.showAlert = true;
      } else if (!this.createDownloadJson?.length) {
        this.message = "No Data To Export";
        this.showAlert = true;
      }
    },
  },
  mounted() {},
  created() {
    this.$rtdbBind(
      "epoch_exchange_rates",
      db.ref(this.network + "/epoch_exchange_rates")
    ).then(() => {
      this.binding_rates_finished = true;
    });
    if (this.favoriteaddr == null) this.favoriteaddr = [];
  },
  data: function () {
    return {
      addNote: false,
      stake_hist: {},
      binding_rates_finished: false,
      epoch_exchange_rates: {},
      ahist_other: [],
      ahist_raw: {},
      ahist_wait: {},
      ahist_active: {},
      ahist_done: {},
      ahist_reward: {},
      labels: {
        curb: "Cur.",
        curs: "Cur. ",
        curf: "Cur.  ",
      },
      downloadFormat: "cointracking",
      downloadCurrency: "usd",
      epochFilterOptions: ["All", "Select Range"],
      selectedEpochFilterOpt: "All",
      downloadFromEpoch: "",
      downloadToEpoch: "",
      dateRangeMenu: false,
      downloadDateRange: [],
      downloadFormats: [
        {
          format: "cointracking",
          formatName: "CoinTracking.info (CSV)",
        },
        {
          format: "cointracking_stakingonly",
          formatName: "CoinTracking.info (CSV) Staking Only",
        },
        {
          format: "cointracking_operatoronly",
          formatName: "CoinTracking.info (CSV) Pool Operator Only",
        },
        {
          format: "cointracking_io",
          formatName: "Cointracker.io (CSV)",
        },
        {
          format: "koinly",
          formatName: "Koinly.io (CSV)",
        },
        {
          format: "crypto_tax_calculator",
          formatName: "CryptoTaxCalculator (CSV)",
        },
        {
          format: "taxbit",
          formatName: "TaxBit (CSV)",
        },
        {
          format: "raw",
          formatName: "Generic(CSV)",
        },
      ],
      includeOperatorRewards: false,
      nepochs: 3,
      favorites: favoriteaddrs.get(),
      view_details: false,
      currencies: currenciesjson,
      returnlink: {},
      ahistcount: 100,
      message: "",
      showAlert: false,
    };
  },
  computed: {
    currencysymbol: function () {
      return this.currencies.find((a) => a.code == this.currency)[
        "symbol_native"
      ];
    },
    currencyName: function () {
      return this.currencies.find((a) => a.code == this.currency)[
        "name_plural"
      ];
    },
    epochValues() {
      return this.ahist.map((a) => a.epoch).reverse();
    },
    epochValuesFrom() {
      return this.ahist
        .map((a) => a.epoch)
        .reverse()
        .filter(
          (a) =>
            a < this.downloadToEpoch ||
            this.downloadToEpoch == "" ||
            this.downloadFromEpoch == a
        );
    },
    epochValuesTo() {
      return this.ahist
        .map((a) => a.epoch)
        .reverse()
        .filter(
          (a) =>
            a > this.downloadFromEpoch ||
            this.downloadFromEpoch == "" ||
            this.downloadToEpoch == a
        );
    },
    isEpochRangeInvalid() {
      return (
        this.selectedEpochFilterOpt == "Select Range" &&
        ((this.downloadFromEpoch &&
          this.downloadToEpoch &&
          +this.downloadFromEpoch > +this.downloadToEpoch) ||
          !this.downloadFromEpoch ||
          !this.downloadToEpoch)
      );
    },
    isDateRangeInvalid() {
      return (
        this.downloadDateRange &&
        ((this.downloadDateRange[0] &&
          this.downloadDateRange[1] &&
          this.downloadDateRange[0] > this.downloadDateRange[1]) ||
          this.downloadDateRange.length == 1)
      );
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
    network: function () {
      return this.$store.getters.getNetwork;
    },

    createDownloadJson: function () {
      if (this.isEpochRangeInvalid || this.isDateRangeInvalid) {
        return [];
      }

      var jsondat = this.ahist
        .filter((a) => {
          const formatedRewardDate = format(a.rewardDate * 1000, "yyyy-MM-dd");
          let isBetweenDateRange = true;
          let isBetweenEpochRange = true;

          // check if date range is selected
          if (this.downloadDateRange.length)
            isBetweenDateRange =
              formatedRewardDate >= this.downloadDateRange[0] &&
              formatedRewardDate <= this.downloadDateRange[1];

          // check if epoch range is selected
          if (
            this.selectedEpochFilterOpt != "ALL" &&
            this.downloadFromEpoch &&
            this.downloadToEpoch &&
            this.downloadFromEpoch <= this.downloadToEpoch
          )
            isBetweenEpochRange =
              +a.epoch >= this.downloadFromEpoch &&
              +a.epoch <= this.downloadToEpoch;

          return (
            a.rewardDate != null &&
            !a.forecast &&
            isBetweenDateRange &&
            isBetweenEpochRange
          );
        })
        .map(function (a) {
          var b = {};
          switch (this.downloadFormat) {
            case "koinly":
              b["Koinly Date"] =
                new Date(a["rewardDate"] * 1000).toISOString().substr(0, 10) +
                " " +
                new Date(a["rewardDate"] * 1000).toISOString().substr(11, 8) +
                " UTC";
              b["Amount"] = (a["operatorRewards"] + a["stakeRewards"]) / 1e6;
              b["Currency"] = "ADA";
              b["Label"] = "mining";
              b["TxHash"] = "";
              b["Description"] =
                "Epoch: " +
                a["epoch"] +
                " Stake Rewards: " +
                a["stakeRewards"] / 1e6 +
                (a["operatorRewards"] > 0
                  ? " Operator Rewards: " + a["operatorRewards"] / 1e6
                  : "") +
                " from: " +
                a["delegatedToTicker"];
              break;
            case "cointracking":
              b["Type"] = "Staking";
              b["Buy"] = (a["operatorRewards"] + a["stakeRewards"]) / 1e6;
              b["curb"] = "ADA";
              b["Sell"] = "";
              b["curs"] = "";
              b["Fee"] = "";
              b["curf"] = "";
              b["Exchange"] = "Cardano Protocol";
              b["Group"] = "";
              b["Comment"] =
                "Epoch: " +
                a["epoch"] +
                " Stake Rewards: " +
                a["stakeRewards"] / 1e6 +
                (a["operatorRewards"] > 0
                  ? " Operator Rewards: " + a["operatorRewards"] / 1e6
                  : "") +
                " from: " +
                a["delegatedToTicker"];
              b["Date"] = format(a["rewardDate"] * 1000, "yyyy-MM-dd HH:mm:ss");
              break;
            case "cointracking_stakingonly":
              b["Type"] = "Staking";
              b["Buy"] = a["stakeRewards"] / 1e6;
              b["curb"] = "ADA";
              b["Sell"] = "";
              b["curs"] = "";
              b["Fee"] = "";
              b["curf"] = "";
              b["Exchange"] = "Cardano Protocol";
              b["Group"] = "";
              b["Comment"] =
                "Epoch: " +
                a["epoch"] +
                " Stake Rewards: " +
                a["stakeRewards"] / 1e6 +
                " from: " +
                a["delegatedToTicker"];
              b["Date"] = format(a["rewardDate"] * 1000, "yyyy-MM-dd HH:mm:ss");
              break;
            case "cointracking_operatoronly":
              b["Type"] = "Mining";
              b["Buy"] = a["operatorRewards"] / 1e6;
              b["curb"] = "ADA";
              b["Sell"] = "";
              b["curs"] = "";
              b["Fee"] = "";
              b["curf"] = "";
              b["Exchange"] = "Cardano Protocol";
              b["Group"] = "";
              b["Comment"] = a["rewardDate"] * 1000;
              "Epoch: " +
                a["epoch"] +
                " Operator Rewards: " +
                a["operatorRewards"] / 1e6 +
                " from: " +
                a["delegatedToTicker"];
              b["Date"] = format(a["rewardDate"] * 1000, "yyyy-MM-dd HH:mm:ss");
              break;
            case "cointracking_io":
              b["Date"] = format(a["rewardDate"] * 1000, "yyyy-MM-dd HH:mm:ss");
              b["Received Quantity"] =
                (a["operatorRewards"] + a["stakeRewards"]) / 1e6;
              b["Received Currency"] = "ADA";
              b["Sent Quantity"] = 0;
              b["Sent Currency"] = "";
              b["Fee Amount"] = 0;
              b["Fee Currency"] = "";
              b["Tag"] = "";
              break;
            case "taxbit":
              b["Date and Time"] = new Date(
                a["rewardDate"] * 1000
              ).toISOString();
              b["Transaction Type"] = "Income";
              b["Sent Quantity"] = null;
              b["Sent Currency"] = null;
              b["Sending Source"] = "Cardano Protocol";
              b["Received Quantity"] =
                (a["operatorRewards"] + a["stakeRewards"]) / 1e6;
              b["Received Currency"] = "ADA";
              b["Receiving Destination"] = "Wallet";
              b["Fee"] = 0;
              b["Fee Currency"] = null;
              b["Exchange Transaction ID"] = null;
              b["Blockchain Transaction Hash"] = null;

              break;
            case "crypto_tax_calculator":
            default:
              b["date"] = new Date(a["rewardDate"] * 1000).toISOString();
              b["epoch"] = a["epoch"];
              b["stake"] = a["amount"] / 1e6;
              b["pool"] = a["delegatedToTicker"];
              b["operator_rewards"] = a["operatorRewards"] / 1e6;
              b["stake_rewards"] = a["stakeRewards"] / 1e6;
              b["total_rewards"] =
                (a["operatorRewards"] + a["stakeRewards"]) / 1e6;
              b["rate"] = a.adaPrices[this.downloadCurrency];
              b["currency"] = this.downloadCurrency;
              b["operator_rewards_value"] =
                (a.adaPrices[this.downloadCurrency] * a["operatorRewards"]) /
                1e6;
              b["stake_rewards_value"] =
                (a.adaPrices[this.downloadCurrency] * a["stakeRewards"]) / 1e6;
              b["value"] =
                a.adaPrices[this.downloadCurrency] * b["total_rewards"];
          }

          return b;
        }, this);

      return jsondat ? jsondat : null;
    },
    addresshistoryoptions: function () {
      return {
        animation: {
          duration: 0,
        },
        transitions: {
          active: {
            animation: {
              duration: 0,
            },
          },
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
            mode: "index",
            intersect: true,
            callbacks: {
              label: function (context) {
                var label = context.dataset.label;
                if (label) {
                  label += ": ";
                }
                if (context.datasetIndex == 0) {
                  label += numeral(context.raw / 1000000).format("0,0.0a");
                  return label;
                } else {
                  return label + numeral(context.raw).format("0.0%");
                }
              },
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            ticks: {
              color: "#fff",
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("global.epoch"),
            },
          },
          yAxes: {
            grid: {
              borderColor: "#fff",
              drawBorder: true,
              tickColor: "#fff",
            },
            gridLines: {
              drawOnChartArea: false,
            },

            position: "right",
            ticks: {
              min: 0,
              color: "#fff",
              callback: function (value) {
                return numeral(value / 1000000).format("0,0.0a");
              },
            },
            title: {
              display: true,
              color: "#fff",
              text: this.$t("global.stake"),
            },
          },
          yAxes1: {
            id: "ros",
            position: "left",
            ticks: {
              min: 0,
              color: "#fff",

              callback: function (value) {
                return numeral(value).format("0%");
              },
            },
            title: {
              color: "#fff",
              display: true,
              text: this.$t("global.ros"),
            },
          },
        },

        type: "bar",
      };
    },

    genesis: function () {
      return this.$store.getters.getGenesis;
    },
    maxepochs: function () {
      if (typeof this.genesis.epoch == "undefined") {
        return 10;
      }
      return Math.min(this.genesis.epoch - 213, 29);
    },
    addresshistory: function () {
      var last30 = this.ahist.slice(-30);
      var labels = last30.map((a) => a.epoch);
      var stakehistory = {
        type: "line",
        label: this.$t("global.stake"),
        borderColor: "#1f78b4",

        borderWidth: 2,
        fill: true,
        data: last30.map((a) => a.amount),
        order: 3,
        yAxisID: "yAxes",
      };
      var roihistory = {
        type: "bar",
        label: this.$t("global.ros"),
        borderColor: "rgba(251,154,153,0.9)",
        backgroundColor: "rgba(251,154,153,0.9)",
        borderWidth: 2,
        clip: 0,
        data: last30.map((a) =>
          a.amount > 0
            ? Math.pow(
                (this.includeOperatorRewards
                  ? a.stakeRewards + a.operatorRewards
                  : a.stakeRewards) /
                  a.amount +
                  1,
                365 / 5
              ) - 1
            : 0
        ),
        order: 2,

        yAxisID: "yAxes1",
      };
      var roitrend = {
        type: "line",
        label:
          String(this.nepochs + 1) +
          " " +
          this.$t("app.poolPageHistory.epochTrend"),
        borderColor: "#33a02c",
        borderWidth: 2,
        pointRadius: 0,
        clip: 0,
        data: [],
        order: 1,
        fill: false,
        yAxisID: "yAxes1",
      };
      var trendline = [null];
      for (const epochdata of this.ahist.slice(-30)) {
        if (
          epochdata.rewardDate != null ||
          this.genesis.epoch - 1 == epochdata.epoch
        ) {
          trendline.push(
            epochdata.amount > 0
              ? Math.pow(
                  (this.includeOperatorRewards
                    ? epochdata.stakeRewards + epochdata.operatorRewards
                    : epochdata.stakeRewards) /
                    epochdata.amount +
                    1,
                  365 / 5
                ) - 1
              : 0
          );
          if (trendline.length > this.nepochs + 1) {
            trendline.shift();
          }
          if (trendline.length == this.nepochs + 1) {
            roitrend["data"].push(
              trendline.reduce((a, b) => a + b, 0) / trendline.length
            );
          } else {
            roitrend["data"].push(null);
          }
        }
      }

      return {
        labels: labels,
        datasets: [stakehistory, roihistory, roitrend],
      };
    },
    tableheaders: function () {
      var tableheaders = [
        {
          text: this.$t("global.epoch"),
          align: "center",
          value: "epoch",
          divider: false,
          sortable: true,
          filterable: false,
          class: "text-no-wrap",
        },
        {
          text: this.$t("app.addressDetail.rewardDate"),
          align: "center",
          value: "rewardDate",
          divider: false,
          sortable: true,
          filterable: false,
          class: "text-no-wrap",
        },
        {
          text: this.$t("global.pool"),
          align: "center",
          value: "delegatedTo",
          divider: false,
          sortable: true,
          filterable: false,
          class: "text-no-wrap",
        },
        {
          text: this.$t("global.activeStake") + " (₳)",
          align: "right",
          value: "amount",
          divider: false,
          sortable: true,
          filterable: false,
          class: "text-no-wrap",
        },
        {
          text: this.$t("app.addressDetail.stakeRewards") + " (₳)",
          align: "right",
          value: "stakeRewards",
          divider: false,
          sortable: true,
          filterable: false,
          class: "text-no-wrap",
        },

        {
          text: this.$t("app.addressDetail.operatorRewards") + " (₳)",
          align: "right",
          value: "operatorRewards",
          divider: false,
          sortable: true,
          filterable: false,
          class: "text-no-wrap",
        },

        {
          text: this.$t("app.addressDetail.totalRewards") + " (₳)",
          align: "right",
          value: "total_rewards",
          divider: false,
          sortable: true,
          filterable: false,
          class: "text-no-wrap",
        },
        {
          text: this.$t("app.addressDetail.rate"),
          align: "right",
          value: "cur_rate",
          divider: false,
          sortable: false,
          filterable: false,
          class: "text-no-wrap",
        },
        {
          text: this.currencyName + " (" + this.currencysymbol + ")",
          align: "right",
          value: "cur_total_rewards",
          divider: false,
          sortable: false,
          filterable: false,
          class: "text-no-wrap",
        },
      ];
      // if (!this.totals["multi_addr"]) {
      tableheaders.push({
        text: this.$t("global.ros"),
        align: "right",
        value: "ros",
        divider: false,
        sortable: false,
        filterable: false,
      });
      // } else {
      tableheaders.push({
        text: this.$t("app.addressDetail.details"),
        align: "center",
        value: "rewardaddr_details",
        divider: false,
        sortable: false,
        filterable: false,
      });
      // }

      return tableheaders;
    },

    curvalue: function () {
      if (this.ahist != null && this.ahist.length) {
        return this.ahist
          .filter((item) => item.forecast == true)
          .reduce(
            (max, curren) => (max.epoch > curren.epoch ? max : curren),
            0
          );
      } else {
        return { amount: 0, epoch: 0 };
      }
    },
    totals: function () {
      if (this.ahist != null && this.ahist.length) {
        return this.ahist
          .filter((item) => item.forecast == false)
          .reduce(
            (max, curren) => (max.epoch > curren.epoch ? max : curren),
            0
          );
      } else {
        return { lifeAmount: 0, lifeOperatorRewards: 0, lifeStakeRewards: 0 };
      }
    },
    breadcrumbs: function () {
      return [
        {
          text: "Home",
          disabled: false,
          to: "/",
        },
        {
          text: this.$route.params.address,
          disabled: true,
          to: "/" + this.$route.params.address,
        },
      ];
    },
    ...mapPreferences({
      favoriteaddr: {
        defaultValue: [],
      },
      ahistPage: {
        defaultValue: 1,
      },
      ahistItemsPerPage: {
        defaultValue: 30,
      },
      ahistSortBy: {
        defaultValue: ["epoch"],
      },
      ahistSortDesc: {
        defaultValue: [false],
      },
    }),
    refetch_watch() {
      return (
        String(this.$route.params.address) +
        String(this.genesis.epoch) +
        String(this.genesis.new_rewards_complete_epoch) +
        String(this.binding_rates_finished)
      );
    },
    ahist: function () {
      var a = [];
      for (let i in this.stake_hist) {
        a.push(this.buildEpochData(this.stake_hist[i], i));
      }
      return a;
    },
  },

  watch: {
    refetch_watch: {
      immediate: true,
      handler() {
        if (
          this.binding_rates_finished &&
          typeof this.$route.params.address !== "undefined" &&
          this.genesis.epoch !== "undefined" &&
          /[a-f0-9]{56}/gim.test(this.$route.params.address)
        ) {
          this.axios({
            method: "post",
            url: "https://api.pooltool.io/v1/pivotrewards",
            data: {
              stake_key: this.$route.params.address,
            },
            headers: {},
          });
          this.$rtdbBind(
            "stake_hist",
            db
              .ref(this.network + "/stake_hist/" + this.$route.params.address)
              .orderByKey()
            // .limitToLast(20)
          );
        }
      },
    },
  },
};
</script>

<style>
.v-select__selections input {
  width: 0;
}
</style>

<style scoped>
.date-range-input {
  padding-top: 0;
}

.position-relative {
  position: relative;
}

.clear-date-icon {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  font-size: 18px;
  padding: 0;
  cursor: pointer;
}
</style>