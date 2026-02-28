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
        >{{ item.poolpubkey | ellipsiscrypto }}</span
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
          item.poolpubkey in heights &&
          heights[item.poolpubkey] != null &&
          heights[item.poolpubkey] > 0
        "
        :class="
          item.poolpubkey in heights && heights[item.poolpubkey] == 1
            ? 'genesisbar'
            : 'genesisbarred'
        "
        x-small
        dark
      >
        {{
          item.poolpubkey in heights && heights[item.poolpubkey] == 1
            ? genesis.senddata.majoritymax
            : item.poolpubkey in heights && heights[item.poolpubkey]
            ? heights[item.poolpubkey]
            : ""
        }}
      </v-chip>
    </template>
    <template #[`item.roi`]="{ item }">
      <span v-if="genesis.pool_actuals_calculated_epoch != genesis.epoch - 2">
        <v-progress-circular
          color="grey"
          :size="12"
          :width="2"
          indeterminate
        ></v-progress-circular>
      </span>
      <span v-else>{{
        item.poolpubkey in rewards
          ? rewards[item.poolpubkey]["epochRos"]
          : 0 | fpercent
      }}</span>
    </template>
    <template #[`item.roifcp1`]="{ item }">
      <span v-if="genesis.pool_forecast_calculated_epoch != genesis.epoch - 1">
        <v-progress-circular
          color="grey"
          :size="12"
          :width="2"
          indeterminate
        ></v-progress-circular>
      </span>
      <span v-else>{{
        item.poolpubkey in rewardsnp1
          ? rewardsnp1[item.poolpubkey]["epochRos"]
          : 0 | fpercent
      }}</span>
    </template>
    <template #[`item.grouproi`]="{ item }">
      <span v-if="genesis.pool_actuals_calculated_epoch != genesis.epoch - 2">
        <v-progress-circular
          color="grey"
          :size="12"
          :width="2"
          indeterminate
        ></v-progress-circular>
      </span>
      <span v-else>{{
        item.grouprewardstake | grouproi(item.group_epoch_rewards) | fpercent
      }}</span>
    </template>

    <template #[`item.epoch_rewards`]="{ item }">
      <span v-if="genesis.pool_actuals_calculated_epoch != genesis.epoch - 2">
        <v-progress-circular
          color="grey"
          :size="12"
          :width="2"
          indeterminate
        ></v-progress-circular>
      </span>
      <span v-else>{{
        item.poolpubkey in rewards
          ? rewards[item.poolpubkey]["epochRewards"]
          : 0 | toada | numFormat("0,0.0a")
      }}</span>
    </template>
    <template #[`item.group_epoch_rewards`]="{ item }">
      <span v-if="genesis.pool_actuals_calculated_epoch != genesis.epoch - 2">
        <v-progress-circular
          color="grey"
          :size="12"
          :width="2"
          indeterminate
        ></v-progress-circular>
      </span>
      <span v-else>{{
        item.group_epoch_rewards | toada | numFormat("0,0.0a")
      }}</span>
    </template>
    <template #[`item.epoch_tax`]="{ item }">
      <span v-if="genesis.pool_actuals_calculated_epoch != genesis.epoch - 2">
        <v-progress-circular
          color="grey"
          :size="12"
          :width="2"
          indeterminate
        ></v-progress-circular>
      </span>
      <span v-else>{{
        item.poolpubkey in rewards
          ? rewards[item.poolpubkey]["epochTax"]
          : 0 | toada | numFormat("0,0.0a")
      }}</span>
    </template>
    <template #[`item.group_epoch_tax`]="{ item }">
      <span v-if="genesis.pool_actuals_calculated_epoch != genesis.epoch - 2">
        <v-progress-circular
          color="grey"
          :size="12"
          :width="2"
          indeterminate
        ></v-progress-circular>
      </span>
      <span v-else>{{
        item.group_epoch_tax | toada | numFormat("0,0.0a")
      }}</span>
    </template>

    <template #[`item.rewardstake`]="{ item }">
      {{
        item.poolpubkey in rewardstake
          ? rewardstake[item.poolpubkey]
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
    <template #[`item.groupname`]="{ item }">
      <v-text-field
        class=""
        dense
        hide-details
        flat
        :value="item.groupname"
        @change="updatePoolField('groupname', item, $event)"
      ></v-text-field>
    </template>
    <template #[`item.poolcost`]="{ item }">
      <span v-if="item.poolcost != item.fpoolcost && !item.genesis_pool">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              class="ma-0 pa-0"
              v-on="on"
              v-bind="attrs"
              v-if="item.poolcost < item.fpoolcost"
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
            {{ item.fpoolcost | toada }}</span
          >
        </v-tooltip>
      </span>
      {{ item.poolcost | toada }}
    </template>
    <template #[`item.grouppoolpledge`]="{ item }">
      {{ item.poolpledge | toada | numFormat("0,0.0a") }}
    </template>
    <template #[`item.grouppoolpledgevalue`]="{ item }">
      {{ item.poolpledgevalue | toada | numFormat("0,0.0a") }}
    </template>
    <template #[`item.poolpledge`]="{ item }">
      <span class="text-no-wrap">
        <span v-if="item.poolpledge != item.fpoolpledge && !item.genesis_pool">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="ma-0 pa-0"
                v-on="on"
                v-bind="attrs"
                v-if="item.fpoolpledge > item.poolpledge"
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
              {{ item.fpoolpledge | toada | numFormat("0,0.000a") }}</span
            >
          </v-tooltip>
        </span>
        {{ item.poolpledge | toada | numFormat("0,0.0a") }}
        <v-tooltip v-if="item.poolpledgevalue >= item.poolpledge" bottom>
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
              item.poolpledgevalue | toada | numFormat("0,0.0a")
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
    <template #[`item.poolpledgevalue`]="{ item }">
      <span class="text-no-wrap">
        {{ item.poolpledgevalue | toada | numFormat("0,0.0a") }}
      </span>
    </template>
    
    <template #[`item.poolmargin`]="{ item }">
      <span class="text-no-wrap">
        <span v-if="item.poolmargin != item.fpoolmargin && !item.genesis_pool">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                class="ma-0 pa-0"
                v-on="on"
                v-bind="attrs"
                v-if="item.poolmargin < item.fpoolmargin"
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
              {{ (item.fpoolmargin * 100) | numFormat("0,0.000") }}%</span
            >
          </v-tooltip>
        </span>
        {{ (item.poolmargin * 100) | numFormat("0,0.000") }}%
      </span>
    </template>

    <template #[`item.grouppoolpubkey`]="{ item }">
      <span class="text-no-wrap">
        {{ item.poolpubkey | ellipsis(16) }}
        <v-btn text x-small icon v-clipboard="item.poolpubkey">
          <v-icon x-small>mdi-content-copy</v-icon>
        </v-btn>
      </span>
    </template>

    <template #[`item.poolpubkey`]="{ item }">
      <span class="text-no-wrap">
        {{ item.poolpubkey | ellipsiscrypto(16) }}
        <v-btn text x-small icon v-clipboard="item.poolpubkey">
          <v-icon x-small>mdi-content-copy</v-icon>
        </v-btn>
      </span>
    </template>

    <template #[`item.actions`]="{ item }">
      <span class="text-no-wrap">
        <v-tooltip v-if="mypools.includes(item.poolpubkey)" bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              icon
              small
              :to="{
                name: 'poolmanagement',
                params: { poolid: item.poolpubkey },
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
              :to="{ name: 'poolepochs', params: { poolid: item.poolpubkey } }"
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
        activestake[item.poolpubkey] | toada | numFormat("0,0.00a") | zeronull
      }}
    </template>
    <template #[`item.groupblockstake`]="{ item }">
      {{ item.groupblockstake | toada | numFormat("0,0.00a") | zeronull }}
    </template>
    <template #[`item.activestakepercent`]="{ item }">
      <span class="text-no-wrap">
        {{
          activestake[item.poolpubkey]
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
                  activestake[item.poolpubkey],
                  genesis.blockstake
                )
              "
            >
              <v-icon x-small>mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <span
            >{{
              activestake[item.poolpubkey]
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
        v-if="!item.genesis_pool && genesis.livedata2.total_epoch_blocks > 0"
      >
        {{
          ((item.epochBlocksEpoch == genesis.epoch ? item.epoch_blocks : 0) /
            genesis.livedata2.total_epoch_blocks)
            | numFormat("0.000%")
        }}
      </div>
    </template>

    <template #[`item.lifetimeroi`]="{ item }">
      <span v-if="genesis.pool_actuals_calculated_epoch != genesis.epoch - 2">
        <v-progress-circular
          color="grey"
          :size="12"
          :width="2"
          indeterminate
        ></v-progress-circular>
      </span>
      <span v-else>{{
        item.poolpubkey in rewards
          ? rewards[item.poolpubkey]["lifetimeRos"]
          : 0 | fpercent
      }}</span>
    </template>

    <template #[`item.sixros`]="{ item }">
      <span v-if="genesis.pool_actuals_calculated_epoch != genesis.epoch - 2">
        <v-progress-circular
          color="grey"
          :size="12"
          :width="2"
          indeterminate
        ></v-progress-circular>
      </span>
      <span v-else>{{ item.sixros | fpercent }}</span>
    </template>

    <template #[`item.twelveros`]="{ item }">
      <span v-if="genesis.pool_actuals_calculated_epoch != genesis.epoch - 2">
        <v-progress-circular
          color="grey"
          :size="12"
          :width="2"
          indeterminate
        ></v-progress-circular>
      </span>
      <span v-else>{{ item.twelveros | fpercent }}</span>
    </template>

    <template #[`item.lifetime_performance`]="{ item }">
      <span>{{ item.lifetime_performance | fpercent }}</span>
    </template>

    <template #[`item.favorite`]="{ item }">
      <span class="text-no-wrap">
        <favorite
          :size="18"
          :favorites="favorites"
          :me="item.poolpubkey"
          @fav-click="$emit('togglefavorite', item.poolpubkey)"
        ></favorite>
      </span>
    </template>
    <template #[`item.epoch_blocks`]="{ item }">
      <span class="text-no-wrap">
        <div
          v-if="
            (item.assigned_slots != null) & (item.assigned_slots != 0) &&
            item.assigned_slots ==
              (item.epochBlocksEpoch == genesis.epoch
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
        {{ item.epochBlocksEpoch == genesis.epoch ? item.epoch_blocks : 0 }}
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
