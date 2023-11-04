<template>
  <v-card
    class="px-3 py-2 d-flex flex-column justify-center"
    :color="nightmode ? 'rgba(13, 72, 160, 0.20)' : barcolor"
    :outlined="nightmode"
    :raised="!nightmode"
    dark
    height="100%"
  >
    <div class="d-flex flex-no-wrap justify-space-between">
      <div class="genesis-bar">
        <div v-if="!progress" class="genesis-bar__left">
          <div class="genesis-bar__item">
            <span v-if="leftTitle1" class="genesis-bar__title-1"
              >{{ leftTitle1 }}
              <span
                v-if="leftTitle1Error"
                class="genesis-bar__title-1"
                style="color: red; font-size: 0.8rem"
                >{{ leftTitle1Error }}</span
              >
            </span>
            <span v-if="leftTitle2" class="genesis-bar__title-2">{{
              leftTitle2
            }}</span>
          </div>
        </div>
        <div v-if="!progress" class="genesis-bar__right">
          <div class="genesis-bar__item">
            <span v-if="rightTitle1" class="genesis-bar__title-1"
              >{{ rightTitle1 }}
            </span>
            <span v-if="rightTitle2" class="genesis-bar__title-2"
              >({{ rightTitle2 }})</span
            >
            <v-tooltip v-if="tooltip" bottom>
              <template v-slot:activator="{ on }">
                <v-chip small v-on="on" class="genesisbar">
                  <v-avatar left>
                    <v-icon small>mdi-antenna</v-icon>
                  </v-avatar>
                  {{ tooltip }}
                </v-chip>
              </template>
              <span>{{ tooltipTitle }}</span>
            </v-tooltip>
          </div>
        </div>
        <div v-if="progress" class="genesis-bar__progress">
          <div class="genesis-bar__title-1">{{ $t("global.slot") }}</div>
          <v-progress-linear :value="progressValue" height="29">
            <template v-slot="{}">
              {{ progress }}
            </template>
          </v-progress-linear>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "genesis-bar-item",
  props: [
    "leftTitle1",
    "leftTitle1Error",
    "leftTitle2",
    "rightTitle1",
    "rightTitle2",
    "nightmode",
    "tooltip",
    "tooltipTitle",
    "progress",
    "progressValue",
  ],
  data() {
    return {
      barcolor: "rgba(13, 72, 160, 0.75)", //'#0033AD'//
    };
  },
  computed: {},
};
</script>
