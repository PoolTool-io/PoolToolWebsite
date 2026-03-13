<template>
  <div>
    <v-card class="mt-6" elevation="5" dark>
      <div class="pt_form_title">{{ $t("app.settings") }}</div>
      <v-card-text class="mt-3 mb-0 pb-0">
        <v-select
          dense
          outlined
          class="pb-2"
          hide-details
          label="Currency"
          :value="currency"
          item-value="code"
          :items="currencies"
          item-text="name"
          @change="onCurrencyChange($event)"
        >
        </v-select>

        <local-selector-v
          @loadLocaleMessages="onLocaleChange"
          class="pb-2"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <span class="text-caption pr-3" v-if="userType != ''"
          >{{ userType }} Account</span
        >
      </v-card-actions>
    </v-card>
    
  </div>
</template>
<script>
import { updateUserSettings } from "@/services/api";
import currenciesjson from "@/json/currencies.json";
import LocalSelectorV from "@/components/LocalSelectorV.vue";

export default {
  name: "settings-card",
  props: ["ismobile", "currency"],

  components: { LocalSelectorV },
  data() {
    return {
      currencies: currenciesjson,
    };
  },
  computed: {
    userType: function () {
      return this.$store.getters.getUserType;
    },
    isSignedIn: function () {
      return this.$store.getters.getIsSignedIn;
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },
    userId: function () {
      return this.$store.getters.getUserId;
    },
  },
  methods: {
    onCurrencyChange(code) {
      this.$emit("setCurrency", code);
      if (this.isSignedIn && this.userId) {
        updateUserSettings(this.userId, { currency: code }).catch((e) =>
          console.error("Failed to sync currency to account", e)
        );
      }
    },
    onLocaleChange(locale) {
      this.$emit("loadLocaleMessages", locale);
      if (this.isSignedIn && this.userId) {
        updateUserSettings(this.userId, { locale }).catch((e) =>
          console.error("Failed to sync locale to account", e)
        );
      }
    },
  },
};
</script>




