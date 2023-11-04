<template>
  <span>
    <v-btn
      x-small
      color="primary  secondary--text"
      @click="claimModal = true"
      >{{ $t("app.claimAddress") }}</v-btn
    >
    <v-dialog v-model="claimModal" max-width="460">
      <v-card dark>
        <v-toolbar color="#00aeec" dark flat>
          <img
            src="https://pooltool.io/logo_white.svg"
            class="pr-3"
            contain
            height="40"
          />
          <v-toolbar-title>Cardano PoolTool</v-toolbar-title>
        </v-toolbar>

        <v-card-text v-if="isSignedIn" class="pt-2">
          <h2 class="">{{ $t("app.claimAddress") }}</h2>

          <v-row align="center">
            <v-col>
              {{ $t("app.toClaimYouMust") }}
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-btn
                @click="emitClaimAddress"
                block
                class="primary secondary--text"
                >{{ $t("app.claimAddress") }}</v-btn
              >
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text v-else class="">
          <h2 class="">{{ $t("app.claimAddress") }}</h2>

          <v-row align="center">
            <v-col>
              {{ $t("app.toClaimYouMust") }}
              <v-alert border="top" type="warning" elevation="2">{{
                $t("app.ifYouAlreadyClaimed")
              }}</v-alert>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-btn
                @click="emitClaimAddress"
                block
                color="primary  secondary--text"
                >{{ $t("global.createAccount") }}</v-btn
              >
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
export default {
  props: ["address"],
  data() {
    return {
      claimModal: false,
      authform: "signin",
      authLoading: false,
    };
  },
  methods: {
    emitClaimAddress: function () {
      this.claimModal = false;
      this.$emit("claimAddress", this.address);
    },
  },
  computed: {
    isSignedIn: function () {
      return this.$store.getters.getIsSignedIn;
    },
  },
};
</script>
<style scoped>
.v-card {
  background: rgba(19, 27, 51, 1) !important;
}
</style>
