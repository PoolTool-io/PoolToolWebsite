<template>
  <div>
    <v-card elevation="12" :dark="nightmode" class="pa-2">
      <v-row dense>
        <v-col class="col-md-12 offset-md-0 col-lg-10 offset-lg-1">
          <h1 class="text-center text-uppercase">
            {{ $t("app.mobile.poolToolMobile") }}
          </h1>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
export default {
  components: {},
  mounted() {
    this.$emit("isLoaded", true);
  },
  props: ["nightmode", "ismobile", "ispulseVisible", "currency", "genesis"],
};
</script>
<style scoped>
.list-unstyled {
  padding-left: 0;
  list-style: none;
}
</style>