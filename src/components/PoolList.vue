<template>
  <v-data-table
    :sort-by.sync="poolsSortBy"
    :sort-desc.sync="poolsSortDesc"
    must-sort
    :loading="tableupdating"
    :custom-sort="customSort"
    :search="search"
    :dark="nightmode"
    :headers="tableheaders"
    :items="myPoolList"
    :items-per-page="20"
    class="elevation-1"
    dense
    :footer-props="{ 'items-per-page-options': [5, 10, 20, 30, 40, 50, 100] }"
  >
    <template #[`item.pool_name`]="{ item }">
      <v-tooltip v-if="item.imposter" bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon v-bind="attrs" v-on="on" color="red" dense>mdi-alert</v-icon>
        </template>
        <span>{{ $t("global.imposterPool") }}</span>
      </v-tooltip>

      <span
        class="text-no-wrap"
        v-if="item.pool_name == '' || item.pool_name == null"
        >{{ item.pool_id | ellipsiscrypto }}</span
      >
      <span
        class="font-weight-bold text-no-wrap"
        v-else
        v-html="$sanitize(item.pool_name)"
      ></span>
    </template>

    <template #[`item.height`]="{ item }">
      <v-chip
        v-if="
          item.pool_id in heights &&
          heights[item.pool_id] != null &&
          heights[item.pool_id] > 0
        "
        :class="
          item.pool_id in heights && heights[item.pool_id] == 1
            ? 'genesisbar'
            : 'genesisbarred'
        "
        x-small
        dark
      >
        {{
          item.pool_id in heights && heights[item.pool_id] == 1
            ? genesis.senddata.majoritymax
            : item.pool_id in heights && heights[item.pool_id]
            ? heights[item.pool_id]
            : ""
        }}
      </v-chip>
    </template>
    <template #[`item.roi`]="{ item }">
      <span>{{ item.epoch_ros | fpercent }}</span>
    </template>
    <template #[`item.roifcp1`]="{ item }">
      <span>{{ item.epoch_ros | fpercent }}</span>
    </template>
    <template #[`item.grouproi`]="{ item }">
      <span>{{
        item.grouprewardstake | grouproi(item.group_epoch_rewards) | fpercent
      }}</span>
    </template>

    <template #[`item.epoch_rewards`]="{ item }">
      <span>{{ item.epoch_rewards | toada | numFormat("0,0.0a") }}</span>
    </template>
    <template #[`item.group_epoch_rewards`]="{ item }">
      <span>{{ item.group_epoch_rewards | toada | numFormat("0,0.0a") }}</span>
    </template>
    <template #[`item.epoch_tax`]="{ item }">
      <span>{{ item.epoch_tax | toada | numFormat("0,0.0a") }}</span>
    </template>
    <template #[`item.group_epoch_tax`]="{ item }">
      <span>{{ item.group_epoch_tax | toada | numFormat("0,0.0a") }}</span>
    </template>

    <template #[`item.rewardstake`]="{ item }">
      {{
        item.pool_id in rewardstake
          ? rewardstake[item.pool_id]
          : 0 | toada | numFormat("0,0.0a")
      }}
    </template>
    <template #[`item.grouprewardstake`]="{ item }">
      {{ item.grouprewardstake | toada | numFormat("0,0.0a") }}
    </template>
    <template #[`item.groupticker`]="{ item }">
      <span class="text-no-wrap" v-if="item.ticker.size > 0">
        {{ [...item.ticker].join(",") | ellipsis(16) }}
        <v-btn text x-small icon v-clipboard="[...item.ticker].join(',')">
          <v-icon x-small>mdi-content-copy</v-icon>
        </v-btn>
      </span>
    </template>

    <template #[`item.ticker`]="{ item }">
      <span class="text-no-wrap"
        >{{ item.ticker }}
        <v-tooltip v-if="item.itn_verified" bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              small
              v-bind="attrs"
              v-on="on"
              class="green--text text--darken-1"
              >mdi-shield-check</v-icon
            >
          </template>
          <span>{{ $t("global.verifiedTicker") }}</span>
        </v-tooltip>
      </span>
    </template>
    <template #[`item.group_name`]="{ item }">
      <v-text-field
        class=""
        dense
        hide-details
        flat
        :value="item.group_name"
        @change="updatePoolField('group_name', item, $event)"
      ></v-text-field>
    </template>
    <template #[`item.cost`]="{ item }">
      <span v-if="item.cost != item.future_cost && !item.genesis">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              class="ma-0 pa-0"
              v-on="on"
              v-bind="attrs"
              v-if="item.cost < item.future_cost"
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
            {{ item.future_cost | toada }}</span
          >
        </v-tooltip>
      </span>
      {{ item.cost | toada }}
    </template>
    <template #[`item.grouppoolpledge`]="{ item }">
      {{ item.pledge | toada | numFormat("0,0.0a") }}
    </template>
    <template #[`item.grouppoolpledgevalue`]="{ item }">
      {{ item.pool_pledge_value | toada | numFormat("0,0.0a") }}
    </template>
    <template #[`item.pledge`]="{ item }">
      <span class="text-no-wrap">
        <span v-if="item.pledge != item.future_pledge && !item.genesis">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="ma-0 pa-0"
                v-on="on"
                v-bind="attrs"
                v-if="item.future_pledge > item.pledge"
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
              {{ (item.future_pledge != null ? item.future_pledge : 0) | toada | numFormat("0,0.000a") }}</span
            >
          </v-tooltip>
        </span>
        {{ item.pledge | toada | numFormat("0,0.0a") }}
        <v-tooltip v-if="item.pool_pledge_value >= item.pledge" bottom>
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
              item.pool_pledge_value | toada | numFormat("0,0.0a")
            }})</span
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
    </template>
    <template #[`item.pool_pledge_value`]="{ item }">
      <span class="text-no-wrap">
        {{ item.pool_pledge_value | toada | numFormat("0,0.0a") }}
      </span>
    </template>

    <template #[`item.margin`]="{ item }">
      <span class="text-no-wrap">
        <span v-if="item.margin != item.future_margin && !item.genesis">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="ma-0 pa-0"
                v-on="on"
                v-bind="attrs"
                v-if="item.margin < item.future_margin"
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
              {{ item.future_margin | numFormat("0,0.000") }}%</span
            >
          </v-tooltip>
        </span>
        {{ item.margin | numFormat("0,0.000") }}%
      </span>
    </template>

    <template #[`item.grouppoolpubkey`]="{ item }">
      <span class="text-no-wrap">
        {{ item.pool_id | ellipsis(16) }}
        <v-btn text x-small icon v-clipboard="item.pool_id">
          <v-icon x-small>mdi-content-copy</v-icon>
        </v-btn>
      </span>
    </template>

    <template #[`item.pool_id`]="{ item }">
      <span class="text-no-wrap">
        {{ item.pool_id | ellipsiscrypto(16) }}
        <v-btn text x-small icon v-clipboard="item.pool_id">
          <v-icon x-small>mdi-content-copy</v-icon>
        </v-btn>
      </span>
    </template>

    <template #[`item.actions`]="{ item }">
      <span class="text-no-wrap">
        <v-tooltip v-if="mypools.includes(item.pool_id)" bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              icon
              small
              :to="{
                name: 'poolmanagement',
                params: { poolid: item.pool_id },
              }"
              color="primary"
            >
              <v-icon dense medium>mdi-dots-horizontal-circle</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("app.pools.managePool") }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              icon
              small
              :to="{ name: 'poolepochs', params: { poolid: item.pool_id } }"
              color="primary"
            >
              <v-icon dense medium>mdi-arrow-right-bold-circle</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("app.pools.poolDetails") }}</span>
        </v-tooltip>
      </span>
    </template>

    <template #[`item.blockstake`]="{ item }">
      {{
        activestake[item.pool_id] | toada | numFormat("0,0.00a") | zeronull
      }}
    </template>
    <template #[`item.groupblockstake`]="{ item }">
      {{ item.groupblockstake | toada | numFormat("0,0.00a") | zeronull }}
    </template>
    <template #[`item.activestakepercent`]="{ item }">
      <span class="text-no-wrap">
        {{
          activestake[item.pool_id]
            | renderstakepercent(genesis.blockstake)
            | numFormat("0.000%")
        }}
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              text
              x-small
              icon
              v-bind="attrs"
              v-on="on"
              v-clipboard="
                $options.filters.renderstakepercent(
                  activestake[item.pool_id],
                  genesis.blockstake
                )
              "
            >
              <v-icon x-small>mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <span
            >{{
              activestake[item.pool_id]
                | renderstakepercent(genesis.blockstake)
            }}
            {{ $t("app.pools.clickToCopy") }}</span
          >
        </v-tooltip>
      </span>
    </template>
    <template #[`item.groupactivestakepercent`]="{ item }">
      <span class="text-no-wrap">
        {{
          item.groupblockstake
            | renderstakepercent(genesis.blockstake)
            | numFormat("0.000%")
        }}
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              text
              x-small
              icon
              v-bind="attrs"
              v-on="on"
              v-clipboard="
                $options.filters.renderstakepercent(
                  item.groupblockstake,
                  genesis.blockstake
                )
              "
            >
              <v-icon x-small>mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <span
            >{{
              item.groupblockstake | renderstakepercent(genesis.blockstake)
            }}
            {{ $t("app.pools.clickToCopy") }}</span
          >
        </v-tooltip>
      </span>
    </template>

    <template #[`item.epoch_blocks_percent`]="{ item }">
      <div
        v-if="!item.genesis && genesis.livedata2.total_epoch_blocks > 0"
      >
        {{
          ((item.epoch_blocks_epoch == genesis.epoch ? item.epoch_blocks : 0) /
            genesis.livedata2.total_epoch_blocks)
            | numFormat("0.000%")
        }}
      </div>
    </template>

    <template #[`item.lifetimeroi`]="{ item }">
      <span>{{ item.lifetime_ros | fpercent }}</span>
    </template>

    <template #[`item.one_month_ros`]="{ item }">
      <span>{{ item.one_month_ros | fpercent }}</span>
    </template>

    <template #[`item.two_month_ros`]="{ item }">
      <span>{{ item.two_month_ros | fpercent }}</span>
    </template>

    <template #[`item.lifetime_performance`]="{ item }">
      <span>{{ item.lifetime_performance | fpercent }}</span>
    </template>

    <template #[`item.favorite`]="{ item }">
      <span class="text-no-wrap">
        <favorite
          :size="18"
          :favorites="favorites"
          :me="item.pool_id"
          @fav-click="$emit('togglefavorite', item.pool_id)"
        ></favorite>
      </span>
    </template>
    <template #[`item.epoch_blocks`]="{ item }">
      <span class="text-no-wrap">
        <div
          v-if="
            (item.assigned_slots != null) & (item.assigned_slots != 0) &&
            item.assigned_slots ==
              (item.epoch_blocks_epoch == genesis.epoch
                ? item.epoch_blocks
                : 0) &&
            item.assigned_slots_epoch == genesis.epoch
          "
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <span v-on="on">
                <v-icon class="yellow--text text--darken-1">{{
                  icons.mdiStarFace
                }}</v-icon>
              </span>
            </template>
            <span>Perfect Epoch!</span>
          </v-tooltip>
        </div>
        {{ item.epoch_blocks_epoch == genesis.epoch ? item.epoch_blocks : 0 }}
        {{
          item.assigned_slots != null &&
          item.assigned_slots_epoch == genesis.epoch
            ? " / " + item.assigned_slots
            : null
        }}
      </span>
    </template>

    <template #[`item.life_blocks`]="{ item }">
      {{ item.life_blocks }}
    </template>
  </v-data-table>
</template>

<script>
import { mdiStarFace } from "@mdi/js";
import pooltable from "@/mixins/pooltable";
import { mapPreferences } from "vue-preferences";

export default {
  props: [
    "nightmode",
    "tableheaders",
    "myPoolList",
    "favorites",
    "tableupdating",
    "search",
  ],
  data() {
    return {
      icons: {
        mdiStarFace,
      },
    };
  },
  components: {
    Favorite: () => import("../components/FavoriteButton"),
  },
  mixins: [pooltable],
  methods: {},
  created() {
    if (this.poolsSortDesc == null) this.poolsSortDesc = [true];
    if (this.poolsSortBy == null) this.poolsSortBy = ["life_blocks"];
  },
  filters: {},
  computed: {
    ...mapPreferences({
      poolsSortBy: {
        defaultValue: ["life_blocks"],
      },
      poolsSortDesc: {
        defaultValue: [true],
      },
    }),
    mypools: function () {
      if (
        this.userData != null &&
        typeof this.userData.myPools != "undefined"
      ) {
        return Object.keys(this.userData.myPools);
      } else {
        return [];
      }
    },
    userData: function () {
      return this.$store.getters.getUserData;
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

.v-data-table .v-data-table__mobile-row {
  min-height: 0px;
}

.v-data-footer__pagination {
  margin: 0 2px 0 2px !important;
}

.v-data-footer__select .v-select {
  margin: 5px 0 5px 20px !important;
}
.v-data-footer {
  padding: 0px;
}
</style>
