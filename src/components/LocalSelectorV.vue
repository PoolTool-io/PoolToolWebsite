<template>
  <v-select
    dense
    hide-details
    outlined
    @change="loadLocaleMessages"
    v-model="$i18n.locale"
    :items="langs"
    item-text="language"
    item-value="locale"
    class="v-list-item__title"
  >
    <template v-slot:item="{ item }">
      <span class="px-2">{{ item.language }}</span>
    </template>
  </v-select>
</template>

<script>
export default {
  props: ["counterdifference"],
  name: "locale-changer",
  methods: {
    loadLocaleMessages: function (newval) {
      this.$emit("loadLocaleMessages", newval);
    },
  },
  computed: {
    langs_raw: function () {
      return this.$store.getters.getLanguages;
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },

    missingTranslationCount: function () {
      if (
        this.userData != null &&
        typeof this.userData.ownedTranslations != "undefined"
      ) {
        if (
          Object.keys(this.userData.ownedTranslations).length &&
          this.isSignedIn
        ) {
          if (
            Object.keys(this.userData.ownedTranslations).includes(
              this.$i18n.locale
            )
          ) {
            return this.counterdifference;
          }
        }
      }
      return 0;
    },
    myTranslations: function () {
      if (
        this.userData != null &&
        typeof this.userData.ownedTranslations != "undefined"
      ) {
        if (
          Object.keys(this.userData.ownedTranslations).length &&
          this.isSignedIn
        ) {
          return Object.keys(this.userData.ownedTranslations);
        }
      }
      return [];
    },
    userData: function () {
      return this.$store.getters.getUserData;
    },
    ismobile: function () {
      return this.windowWidth <= 768 ? true : false;
    },
    isSignedIn: function () {
      return this.$store.getters.getIsSignedIn;
    },
    langs: function () {
      var a = [];
      if (typeof this.langs_raw != "undefined" && this.langs_raw != null) {
        for (const value of Object.values(this.langs_raw)) {
          a.push(value);
        }
      }
      return a
        .filter((a) => !a.disabled || this.myTranslations.includes(a.locale))
        .sort((a, b) => (a.language < b.language ? -1 : 1));
    },
  },
  mounted() {
    window.addEventListener("resize", () => {
      this.windowWidth = window.innerWidth;
    });
  },
  data() {
    return {
      windowWidth: window.innerWidth,
    };
  },
};
</script>

<style scoped>
</style>
