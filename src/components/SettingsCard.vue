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
    <v-card
      class="mt-6"
      elevation="5"
      v-if="isSignedIn && userType == 'Operator'"
    >
      <div class="pt_form_title">
        {{ $t("app.poolManage.zapierIntegration") }}
      </div>
      <v-card-text>
        <p>
          Zapier allows you to connect various events to automated tasks.
          Generate an API key and then go to zapier.com and use the pooltool.io
          integration to start automating things! See detailed instructions and
          video here:
          <router-link text :to="{ name: 'using_zapier' }"
            >Using Zapier</router-link
          >
        </p>
        <p>
          You create an API key and then use Zapier to select from your claimed
          or favorite pools or addresses to trigger from
        </p>
        <v-btn v-if="zapierAPIKey == ''" @click="createZapierAPIKey"
          >Create Zapier API key</v-btn
        >
        <v-card v-else>
          <v-card-title>
            Zapier API Key: {{ zapierAPIKey }} <br />Zapier API Secret:
            {{ zapierapisecret }}</v-card-title
          >
          <v-card-text
            >Note: API Secret is only visible one time when you first create the
            key. You MUST store the secret in a safe place as it will not be
            visible again.
          </v-card-text>
          <v-card-actions
            ><v-spacer></v-spacer
            ><v-btn @click="deleteZapierAPIKey"
              >Delete Key</v-btn
            ></v-card-actions
          ></v-card
        >
      </v-card-text>
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
      zapierapisecret: "********************",
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
    zapierAPIKey: function () {
      if (typeof this.userDataPriv.myZapierApiKey != "undefined") {
        return this.userDataPriv.myZapierApiKey;
      } else {
        return "";
      }
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
    deleteZapierAPIKey() {
      var self = this;
      this.axios({
        method: "post",
        url: "https://api.pooltool.io/v1/zapierdeleteapikey",
        data: {
          user_id: this.userId,
          api_key: this.zapierAPIKey,
        },
        headers: {},
      }).then(function (response) {
        if (response.status == 200 && response.data.success) {
          self.zapierapisecret = "********************";
        }
      });
    },
    createZapierAPIKey() {
      var self = this;
      this.axios({
        method: "post",
        url: "https://api.pooltool.io/v1/zapiercreateapikey",
        data: {
          user_id: this.userId,
        },
        headers: {},
      }).then(function (response) {
        if (response.status == 200 && response.data.success) {
          self.zapierapisecret = response.data.apisecret;
        }
      });
    },
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




