<template>
  <div v-if="showAdministratorMenuItem">
    <v-tabs
      dark
      v-model="tab"
      background-color="transparent"
      color="basil"
      grow
    >
      <v-tab> Users </v-tab>
      <v-tab> Web Admin Messge </v-tab>
      <v-tab> App Admin Messge </v-tab>
      <v-tab> Manage Portfolios </v-tab>
      <v-tab> Manage Statistics </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab" dark style="background-color: #070f28">
      <v-tab-item>
        <UserManagement :nightmode="false" />
      </v-tab-item>
      <v-tab-item>
        <p>Set note on web front page</p>
        <v-text-field
          elevation="5"
          outlined
          :dark="nightmode"
          label="Alert Note Title"
          v-model="alertnotetitle"
        />
        <v-textarea
          elevation="5"
          outlined
          :dark="nightmode"
          label="Alert Note"
          v-model="alertnote"
        >
          <template v-slot:append-outer>
            <v-container class="ma-0 pa-0">
              <v-row class="ma-0 pa-0">
                <v-col cols="12" class="ma-0 pa-0">
                  <v-btn
                    icon
                    color="success"
                    @click="updateAdminMessage('web')"
                  >
                    <v-icon>mdi-check-bold</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row class="ma-0 pa-0">
                <v-col cols="12" class="ma-0 pa-0">
                  <v-btn icon color="error" @click="clearAdminMessage('web')">
                    <v-icon>mdi-cancel</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </template>
        </v-textarea>
      </v-tab-item>
      <v-tab-item>
        <p>Set note on pooltool app</p>
        <v-text-field
          elevation="5"
          outlined
          :dark="nightmode"
          label="Alert Note Title"
          v-model="alertnotetitle"
        />
        <v-textarea
          elevation="5"
          outlined
          :dark="nightmode"
          label="Alert Note"
          v-model="alertnote"
        >
          <template v-slot:append-outer>
            <v-container class="ma-0 pa-0">
              <v-row class="ma-0 pa-0">
                <v-col cols="12" class="ma-0 pa-0">
                  <v-btn icon color="success" @click="updateAdminMessage('')">
                    <v-icon>mdi-check-bold</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row class="ma-0 pa-0">
                <v-col cols="12" class="ma-0 pa-0">
                  <v-btn icon color="error" @click="clearAdminMessage('')">
                    <v-icon>mdi-cancel</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </template>
        </v-textarea>
      </v-tab-item>
      <v-tab-item>
        <v-data-table
          :dark="nightmode"
          show-expand
          single-expand
          :items-per-page="20"
          :headers="headers"
          :items="portfolios"
          item-key="id"
          class="elevation-1"
          dense
        >
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
              {{ item.description }}
            </td>
          </template>
          <template v-slot:[`item.disabled`]="{ item }">
            <v-checkbox
              class="pa-0 ma-0"
              hide-details
              v-model="item.disabled"
              v-bind:id="item.id"
              @change="setPortValue(item.id, 'disabled', $event)"
            />
          </template>
          <template v-slot:[`item.display`]="{ item }">
            <v-checkbox
              class="pa-0 ma-0"
              hide-details
              v-model="item.display"
              v-bind:id="item.id"
              @change="setPortValue(item.id, 'display', $event)"
            />
          </template>
          <template v-slot:[`item.pools`]="{ item }">
            {{ item.pools != null ? item.pools.length : 0 }}
          </template>
        </v-data-table>
      </v-tab-item>
      <v-tab-item>
        <v-text-field
          class="pa-1 ma-1"
          dense
          ref="newstatsitem"
          :rules="[rules.alphanumeric]"
          elevation="5"
          outlined
          :dark="nightmode"
          label="New Statistics Item Key"
          v-model="newstatsitemtitle"
        >
          <template v-slot:append-outer>
            <v-btn
              class="pa-1 ma-1"
              small
              @click="addStatsNewItem"
              color="success"
              >Add Item</v-btn
            >
          </template>
        </v-text-field>

        <hr />
        <v-expansion-panels v-model="panel" multiple>
          <v-card
            class="pa-2 ma-2"
            elevation="5"
            v-for="(stats_label, statskey) in stats_labels_raw"
            v-bind:key="statskey"
          >
            <v-expansion-panel>
              <v-expansion-panel-header
                >Key: <strong>{{ statskey }}</strong></v-expansion-panel-header
              >
              <v-expansion-panel-content>
                <v-text-field
                  class="pa-1 ma-1"
                  dense
                  elevation="5"
                  outlined
                  :dark="nightmode"
                  label="Item Pretty Name"
                  :value="stats_label.name"
                  @change="updateStatsItem(statskey, 'name', $event)"
                >
                  <template v-slot:append-outer>
                    <v-simple-checkbox
                      :ripple="false"
                      dense
                      :value="stats_label.disabled"
                      label="Disabled"
                    ></v-simple-checkbox>
                  </template>
                </v-text-field>
                <v-text-field
                  dense
                  elevation="5"
                  outlined
                  :dark="nightmode"
                  label="Description"
                  :value="stats_label.description"
                  @change="updateStatsItem(statskey, 'description', $event)"
                />
                <v-text-field
                  dense
                  elevation="5"
                  outlined
                  :dark="nightmode"
                  label="Item Group"
                  :value="stats_label.group"
                  @change="updateStatsItem(statskey, 'group', $event)"
                />
                <v-text-field
                  dense
                  elevation="5"
                  outlined
                  :dark="nightmode"
                  label="Item Axis"
                  :value="stats_label.axis"
                  @change="updateStatsItem(statskey, 'axis', $event)"
                />

                <v-text-field
                  dense
                  elevation="5"
                  outlined
                  :dark="nightmode"
                  label="Item divisor"
                  :value="stats_label.divisor"
                  @change="updateStatsItem(statskey, 'divisor', $event)"
                />

                <v-text-field
                  dense
                  elevation="5"
                  outlined
                  :dark="nightmode"
                  label="Item units"
                  :value="stats_label.units"
                  @change="updateStatsItem(statskey, 'units', $event)"
                />
                <v-row>
                  <v-col>
                    <v-text-field
                      dense
                      elevation="5"
                      outlined
                      :dark="nightmode"
                      label="ToolTip/valueDecimals"
                      :value="
                        typeof stats_label.tooltip != 'undefined'
                          ? stats_label.tooltip.valueDecimals
                          : null
                      "
                      @change="
                        updateStatsItem(
                          statskey,
                          'tooltip/valueDecimals',
                          $event
                        )
                      "
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      dense
                      elevation="5"
                      outlined
                      :dark="nightmode"
                      label="ToolTip/valuePrefix"
                      :value="
                        typeof stats_label.tooltip != 'undefined'
                          ? stats_label.tooltip.valuePrefix
                          : null
                      "
                      @change="
                        updateStatsItem(statskey, 'tooltip/valuePrefix', $event)
                      "
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      dense
                      elevation="5"
                      outlined
                      :dark="nightmode"
                      label="ToolTip/valueSuffix"
                      :value="
                        typeof stats_label.tooltip != 'undefined'
                          ? stats_label.tooltip.valueSuffix
                          : null
                      "
                      @change="
                        updateStatsItem(statskey, 'tooltip/valueSuffix', $event)
                      "
                    />
                  </v-col>
                </v-row>
                <v-btn @click="deleteStatsItem(statskey)" color="red"
                  >Delete</v-btn
                >
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-card>
        </v-expansion-panels>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import { db } from "@/firebase";
export default {
  components: {
    UserManagement: () => import("@/components/UserManagement"),
  },
  props: [],
  data() {
    return {
      nightmode: false,
      panel: [],
      rules: {
        alphanumeric: (value) => {
          const pattern = /^[a-zA-Z0-9_]+$/gim;
          return pattern.test(value) || "Invalid Key"; //'Invalid Address.'
        },
      },
      newstatsitemtitle: null,
      tab: "users",
      stats_labels_raw: {},
      portfolios_raw: {},
      headers: [
        {
          text: "Name",
          value: "name",
        },
        {
          text: "pools",
          value: "pools",
        },
        {
          text: "disabled",
          value: "disabled",
        },

        {
          text: "display",
          value: "display",
        },
      ],
      alertnotetitle: "",
      alertnote: "",
    };
  },
  created() {
    this.$emit("isLoaded", true);
    this.$rtdbBind("portfolios_raw", db.ref(this.network + "/portfolios"));
    this.$rtdbBind("stats_labels_raw", db.ref(this.network + "/stats_labels"));
  },
  computed: {
    // portfolios_raw: function () {
    //     var raw = this.$store.getters.portfolios

    //     return this.$store.getters.portfolios
    // },
    userData: function () {
      return this.$store.getters.getUserData;
    },

    showAdministratorMenuItem: function () {
      if (
        this.isSignedIn &&
        this.userData != null &&
        typeof this.userData.authority != "undefined"
      ) {
        if (this.userData.authority == "administrator") {
          return true;
        }
      }
      return false;
    },

    portfolios: function () {
      var a = [];
      if (
        typeof this.portfolios_raw != "undefined" &&
        this.portfolios_raw != null
      ) {
        for (const value of Object.values(this.portfolios_raw)) {
          if (value.id != null) {
            a.push(value);
          }
        }
      }
      return a;
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },
    isInactive: function () {
      return this.$store.getters.getIsInactive;
    },
    isSignedIn: function () {
      return this.$store.getters.getIsSignedIn;
    },
  },
  methods: {
    updateStatsItem: function (key, item, data) {
      console.log(data);
      var w = {};
      w[item] = data;

      db.ref(this.network + "/stats_labels")
        .child(key)
        .update(w); //
    },
    deleteStatsItem: function (item) {
      console.log(item);
      var w = {};
      w[item] = null;
      db.ref(this.network + "/stats_labels").update(w); //
    },
    addStatsNewItem: function () {
      //make sure new item adheres to requirements.  all alpha, no spaces or other punctuation.
      if (!this.$refs.newstatsitem.validate()) {
        return;
      }

      var w = {};
      w[this.newstatsitemtitle] = {
        name: "Item Name",
        description: "Description",
        disabled: true,
        axis: "default",
        divisor: 1,
        units: "ADA",
        group: "TBD",
      };
      db.ref(this.network + "/stats_labels").update(w); //
      this.newstatsitemtitle = null;
    },
    clearAdminMessage: function (target) {
      this.alertnote = "";
      this.alertnotetitle = "";
      var w = {
        message: "",
        title: "",
      };
      if (target == "web") {
        db.ref(this.network + "/admin_message/web").update(w); //
      } else {
        db.ref(this.network + "/admin_message").update(w); //
      }
    },
    updateAdminMessage: function (target) {
      var w = {
        message: this.alertnote,
        title: this.alertnotetitle,
      };
      if (target == "web") {
        db.ref(this.network + "/admin_message/web").update(w); //
      } else {
        db.ref(this.network + "/admin_message").update(w); //
      }
    },
    setPortValue: function (id, item, value) {
      console.log(id);
      console.log(item);
      console.log(value);
      if (!value) value = false;
      var setval = {};
      setval[item] = value;

      db.ref(this.network + "/portfolios")
        .child(id)
        .update(setval); //
    },
  },
};
</script>
