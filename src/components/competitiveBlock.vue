<template>
  <div class="grid-container">
    <div
      style="grid-column-start: 1; grid-column-end: 4"
      :class="
        height.competitive
          ? 'height40 align-center d-flex justify-center'
          : ' align-center d-flex justify-center'
      "
    >
      <div class="d-inline test-h5">
        <v-icon
          x-large
          class="yellow--text text--darken-1"
          v-if="
            height.competitive &&
            ((block.bvrfwinner && !height.usechained) ||
              (height.usechained &&
                (typeof block.chained == 'undefined' || block.chained)))
          "
          >{{ icons.mdiCrown }}</v-icon
        >

        <template v-if="block.leaderPoolTicker != ''">{{
          block.leaderPoolTicker
        }}</template
        ><template v-else>{{
          block.leaderPoolId | ellipsiscrypto(8)
        }}</template>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              icon
              small
              :to="{
                name: 'poolepochs',
                params: { poolid: block.leaderPoolId },
              }"
              color="primary"
            >
              <v-icon dense medium>mdi-arrow-right-bold-circle</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("app.pools.poolDetails") }}</span>
        </v-tooltip>
      </div>
    </div>
    <div></div>
    <div
      style="
        grid-row-start: 2;
        grid-row-end: 9;
        grid-column-start: 4;
        grid-column-end: 4;
      "
      class="text-center"
    >
      <mini-prop-delay-chart
        class="d-none d-sm-flex"
        v-if="!height.competitive && !height.forker"
        :hash="block.hash"
        :block="height.height"
        :histogram="JSON.parse(block.histogram)"
        :nightmode="nightmode"
      />
    </div>
    <div class="text-right">
      <span v-if="height.competitive">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on">
              <v-badge
                dark
                v-if="block.bvrfwinner"
                color="indigo darken-2 white--text"
                bottom
                inline
                left
                tile
                content="B"
              ></v-badge>
            </span>
          </template>
          <span>This block has the lower Block VRF Value</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on">
              <v-badge
                dark
                color="light-green lighten-2 secondary--text"
                v-if="block.vrfwinner"
                bottom
                inline
                left
                tile
                content="L"
              ></v-badge>
            </span>
          </template>
          <span>This block has the lower Leader VRF Value</span>
        </v-tooltip>
      </span>
      {{ $t("global.hash") }}
    </div>
    <div class="">:</div>
    <div class="text-left">
      <span class="text-no-wrap"
        >{{ block.hash | ellipsiscrypto(8) }}
        <v-btn text x-small icon v-clipboard="block.hash" class="pa-0 ma-0">
          <v-icon x-small class="pa-0 ma-0">mdi-content-copy</v-icon>
        </v-btn>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <a
              v-bind="attrs"
              v-on="on"
              :href="
                'https://s3-us-west-2.amazonaws.com/data.pooltool.io/blockdata/' +
                Math.floor(height.height / 1000) +
                '/C_' +
                block.hash +
                '.json'
              "
              target="_blank"
            >
              <v-icon small>mdi-file-document</v-icon>
            </a>
          </template>
          <span>Detailed JSON Data for this block</span>
        </v-tooltip>
      </span>
    </div>

    <div class="text-right">{{ $t("global.epoch") }}</div>
    <div class="">:</div>
    <div class="text-left">{{ block.epoch }}</div>

    <div class="text-right">
      {{ $t("global.epoch") }} {{ $t("global.slot") }}
    </div>
    <div class="">:</div>
    <div class="text-left">{{ block.epoch_slot }}</div>

    <div class="text-right">{{ $t("global.slot") }}</div>
    <div class="">:</div>
    <div class="text-left">{{ block.slot }}</div>

    <div class="text-right">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on">
            {{ $t("global.propogation") }}
          </div>
        </template>
        <span>{{ $t("app.recentblocks.propDescription") }}</span>
      </v-tooltip>
    </div>
    <div class="">:</div>
    <div class="text-left">
      {{ (block.median / 1000) | numFormat("0.00") }}s
    </div>

    <div class="text-right" v-if="block.protocol_major > 0">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on">
            {{ $t("global.protocol") }}
          </div>
        </template>
        <span>{{ $t("app.recentblocks.protoDescription") }}</span>
      </v-tooltip>
    </div>
    <div class="" v-if="block.protocol_major > 0">:</div>
    <div class="text-left" v-if="block.protocol_major > 0">
      v{{ block.protocol_major }}.{{ block.protocol_minor }}
    </div>

    <div class="text-right">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on">
            {{ $t("app.networkHealth.nodesReporting") }}
          </div>
        </template>
        <span>{{ $t("app.recentblocks.reportsDescription") }}</span>
      </v-tooltip>
    </div>
    <div class="">:</div>
    <div class="text-left">
      {{ block.reports | numFormat("0,0") }}
      <v-btn x-small icon @click="expandsubkey = !expandsubkey"
        ><v-icon x-small v-if="!expandsubkey">mdi-arrow-expand-down</v-icon>
        <v-icon x-small v-else>mdi-arrow-expand-up</v-icon>
      </v-btn>
    </div>

    <div class="text-right">{{ $t("global.parent") }}</div>
    <div class="">:</div>
    <div class="text-left">
      <span v-if="block.lastparent != null" class="text-no-wrap"
        >{{ block.lastparent | ellipsiscrypto(8) }}
        <v-btn text small icon v-clipboard="block.lastparent">
          <v-icon x-small>mdi-content-copy</v-icon>
        </v-btn>
      </span>
    </div>
    <div style="grid-column-start: 1; grid-column-end: 5" class="text-center">
      <v-simple-table v-if="expandsubkey" dense>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-center">
                <v-btn x-small icon @click="expandsubsubkey = !expandsubsubkey"
                  ><v-icon x-small v-if="!expandsubsubkey"
                    >mdi-arrow-expand-down</v-icon
                  ><v-icon x-small v-else>mdi-arrow-expand-up</v-icon></v-btn
                >Reporter Version
              </th>
              <th class="text-center">Qty</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in expandsubsubkey
                ? block.reporter_versions.subsubkeys
                : block.reporter_versions.subkeys"
              :key="item[0]"
            >
              <td class="text-center">{{ item[0] }}</td>
              <td class="text-center">{{ item[1] }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
    <div
      v-if="height.competitive || height.forker"
      style="grid-column-start: 1; grid-column-end: 5"
      class="text-center"
    >
      <mini-prop-delay-chart
        :hash="block.hash"
        :block="height.height"
        :histogram="JSON.parse(block.histogram)"
        :nightmode="nightmode"
      />
    </div>
  </div>
</template>
<script>
import { mdiCrown } from "@mdi/js";
export default {
  props: ["block", "height", "nightmode"],
  components: {
    miniPropDelayChart: () => import("@/components/miniPropDelayChart"),
  },
  data: function () {
    return {
      expandsubsubkey: false,
      expandsubkey: false,
      icons: {
        mdiCrown,
      },
    };
  },
};
</script>
<style scoped>
.height40 {
  height: 40px;
}
</style>