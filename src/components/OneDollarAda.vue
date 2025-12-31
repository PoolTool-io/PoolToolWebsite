<template>
  <div style="position: relative">
    <v-img
      v-if="expand"
      src="/onedollarada.jpg"
      alt="1DollarAda"
      class="mx-auto mb-2"
      max-width="100%"
    />
    <v-btn
      v-if="expand"
      icon
      class="close-button"
      @click="closeImage"
      style="position: absolute; top: 0px; right: 0px; z-index: 10"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  data: () => ({
    publicPath: process.env.BASE_URL,
  }),
  props: ["nightmode", "expand"],
  methods: {
    closeImage() {
      this.$emit("closeexpandonedollarada", false); // Assuming `expand` is passed as a prop with `.sync` binding.
    },
  },
};
</script>
