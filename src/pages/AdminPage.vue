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
      <v-tab> Verifications </v-tab>
      <v-tab> Web Admin Message </v-tab>
      <v-tab> App Admin Message </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab" dark style="background-color: #070f28">
      <v-tab-item>
        <UserManagement :nightmode="false" />
      </v-tab-item>
      <v-tab-item>
        <VerificationsPanel />
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
    </v-tabs-items>
  </div>
</template>

<script>
import api from "@/services/api";
export default {
  components: {
    UserManagement: () => import("@/components/UserManagement"),
    VerificationsPanel: () => import("@/components/VerificationsPanel"),
  },
  props: [],
  data() {
    return {
      nightmode: false,
      tab: "users",
      alertnotetitle: "",
      alertnote: "",
    };
  },
  async created() {
    this.$emit("isLoaded", true);
  },
  computed: {
    userData: function () {
      return this.$store.getters.getUserData;
    },
    showAdministratorMenuItem: function () {
      return (
        this.isSignedIn &&
        this.userData != null &&
        this.userData.authority === "administrator"
      );
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
    clearAdminMessage: async function (target) {
      this.alertnote = "";
      this.alertnotetitle = "";
      try {
        const path = target === "web" ? "/api/admin_message/web" : "/api/admin_message";
        await api.put(path, { message: "", title: "" });
      } catch (e) {
        console.error("Failed to clear admin message", e);
      }
    },
    updateAdminMessage: async function (target) {
      try {
        const path = target === "web" ? "/api/admin_message/web" : "/api/admin_message";
        await api.put(path, { message: this.alertnote, title: this.alertnotetitle });
      } catch (e) {
        console.error("Failed to update admin message", e);
      }
    },
  },
};
</script>
