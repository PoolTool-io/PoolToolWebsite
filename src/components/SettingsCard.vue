<template>
  <div>
    <v-card class="mt-6" elevation="5" dark>
      <div class="pt_form_title">{{ $t("app.settings") }}</div>
      <v-card-text class="mt-3 mb-0 pb-0">
        <v-text-field
          v-if="isSignedIn"
          :label="$t('app.profile.nickName')"
          :value="myNickname"
          @change="updatePubMeta('nickName', $event)"
          hide-details
          dense
          outlined
          clearable
          class="pb-2"
        ></v-text-field>

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
          @change="$emit('setCurrency', $event)"
        >
        </v-select>

        <local-selector-v
          @loadLocaleMessages="loadLocaleMessages"
          class="pb-2"
        />
        <v-text-field
          v-if="isSignedIn"
          :label="$t('app.profile.email')"
          :value="myEmail"
          @change="updatePrivMeta('myEmail', $event)"
          hint="Add your patreon email address here so we can link your patreon donations with your account.  Once we see your email address in there we will enable your ad free experience within a few days"
          dense
          outlined
          clearable
        ></v-text-field>
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
import { db } from "@/firebase";
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
    userDataPub: function () {
      return this.$store.getters.getUserDataPub;
    },
    userDataPriv: function () {
      return this.$store.getters.getUserDataPriv;
    },
    myEmail: function () {
      return this.userDataPriv != null && this.userDataPriv.myEmail != null
        ? this.userDataPriv.myEmail
        : "";
    },
    myNickname: function () {
      return this.userDataPub != null && this.userDataPub.nickName != null
        ? this.userDataPub.nickName
        : "";
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },
    userId: function () {
      return this.$store.getters.getUserId;
    },
  },
  methods: {
    loadLocaleMessages(data) {
      this.$emit("loadLocaleMessages", data);
    },
    updatePubMeta(item, val) {
      var w = {};
      w[item] = val;
      db.ref(this.network + "/users/pubMeta")
        .child(this.userId)
        .update(w);
    },
    updatePrivMeta(item, val) {
      var w = {};
      w[item] = val;
      db.ref(this.network + "/users/privMeta")
        .child(this.userId)
        .update(w);
    },
  },
};
</script>




