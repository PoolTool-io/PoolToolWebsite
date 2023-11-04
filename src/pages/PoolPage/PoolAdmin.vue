<template>
  <div v-if="isAdmin">
    <v-row>
      <v-col cols="12" xs="12" sm="6" md="6">
        <v-card class="mt-6" elevation="5" :dark="nightmode">
          <div class="pt_form_title">
            {{ $t("app.poolManage.Admin") }}
          </div>
          <v-card-text>
            <v-switch
              dense
              :value="pool.imposter"
              label="Imposter"
              class="ma-2"
              @change="updatePoolField('xx', $event)"
            ></v-switch>

            <v-switch
              dense
              :value="delegatorUpdateValue"
              label="Mark for Delegator Update"
              class="ma-2"
              @change="updatedelegatorUpdate($event)"
            ></v-switch>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card class="mt-6" elevation="5" :dark="nightmode">
          <div class="pt_form_title">
            {{ $t("app.poolManage.currentMetadata") }}
          </div>
          <v-card-text>
            <v-list-item-subtitle v-if="poolstats.mdLastCheck != null"
              >Metadata last checked:
              {{
                (poolstats.mdLastCheck * 1000) | date("MMMM do yyyy, h:mm:ss a")
              }}</v-list-item-subtitle
            >
            <v-list-item-subtitle v-if="poolstats.metadataUrl != null"
              >URL: {{ poolstats.metadataUrl }}
              <v-btn text x-small icon v-clipboard="poolstats.metadataUrl">
                <v-icon x-small>mdi-content-copy</v-icon>
              </v-btn>
            </v-list-item-subtitle>
            <v-list-item-subtitle v-if="poolstats.metadataHash != null"
              >Hash: {{ poolstats.metadataHash }}
              <v-btn text x-small icon v-clipboard="poolstats.metadataHash">
                <v-icon x-small>mdi-content-copy</v-icon>
              </v-btn>
            </v-list-item-subtitle>

            <v-list-item-subtitle v-if="poolstats.poolMDerrorString != ''"
              >Last Metadata error:
              {{ poolstats.poolMDerrorString }}</v-list-item-subtitle
            >
            <v-list-item-subtitle
              >Metadata Pool Description:
              {{ poolstats.description }}</v-list-item-subtitle
            >
            <v-list-item-subtitle
              >Metadata Pool HomePage:
              {{ poolstats.homePage }}</v-list-item-subtitle
            >
            <v-list-item-subtitle
              >Metadata Pool Name: {{ pool.pool_name }}</v-list-item-subtitle
            >
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { db } from "@/firebase";

export default {
  mixins: [],
  components: {},

  created() {},
  props: ["nightmode", "poolstats", "pool", "userId", "poolIsMine", "userData"],
  data() {
    return {
      delegatorUpdate: {},
    };
  },

  watch: {
    poolnetwork: {
      immediate: true,
      handler() {
        console.log(this.poolnetwork);
        if (this.poolnetwork != "") {
          console.log("binding");
          this.$rtdbBind(
            "delegatorUpdate",
            db
              .ref(this.network + "/admin_settings/delegator_update/")
              .child(this.pool.poolpubkey)
          );
          console.log(this.delegatorUpdate);
        }
      },
    },
  },

  methods: {
    updatedelegatorUpdate: function (event) {
      if (event) {
        db.ref(this.network + "/admin_settings/delegator_update").update({
          [this.pool.poolpubkey]: true,
        });
      } else {
        db.ref(this.network + "/admin_settings/delegator_update")
          .child(this.pool.poolpubkey)
          .remove();
      }
    },
    updatePoolField(field, newvalue) {
      var w = {};

      w[field] = newvalue;
      console.log(this.network + "/stake_pools/" + this.pool.poolpubkey);
      console.log(w);
      db.ref(this.network + "/stake_pools/" + this.pool.poolpubkey).update(w); //
    },
  },

  computed: {
    delegatorUpdateValue: function () {
      return typeof this.delegatorUpdate != "undefined" &&
        this.delegatorUpdate[".value"] != null
        ? true
        : false;
    },
    poolnetwork: function () {
      if (
        typeof this.network != "undefined" &&
        typeof this.pool != "undefined" &&
        typeof this.pool.poolpubkey != "undefined"
      ) {
        return this.network.concat(this.pool.poolpubkey);
      } else {
        return "";
      }
    },
    isAdmin: function () {
      return (
        this.userData != null &&
        typeof this.userData.authority != "undefined" &&
        this.userData.authority == "administrator"
      );
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },
  },
};
</script>

<style scoped>
</style>
