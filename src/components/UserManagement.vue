<template>
  <div class="pa-4">
    <!-- Search -->
    <v-card class="mb-4" elevation="3" dark>
      <v-card-title class="subtitle-1">Look Up User</v-card-title>
      <v-card-text>
        <v-text-field
          outlined
          dense
          hide-details="auto"
          label="Stake address (bech32: stake1u…) or user UUID"
          append-icon="mdi-magnify"
          v-model="query"
          :loading="searching"
          :error-messages="searchError"
          @click:append="lookup"
          @keyup.enter="lookup"
        />
      </v-card-text>
    </v-card>

    <!-- Results -->
    <template v-if="user">

      <!-- Identity card -->
      <v-card class="mb-4" elevation="3" dark>
        <v-card-title class="subtitle-1">
          Identity
          <v-spacer />
          <v-chip small :color="authorityColor(user.authority)">{{ user.authority }}</v-chip>
        </v-card-title>
        <v-card-text>
          <div class="text-caption text--secondary">User ID</div>
          <div class="text-body-2 mb-2 font-weight-medium" style="font-family:monospace">
            {{ user.user_id }}
            <v-btn x-small icon v-clipboard="user.user_id"><v-icon x-small>mdi-content-copy</v-icon></v-btn>
          </div>
          <div class="text-caption text--secondary">Created</div>
          <div class="text-body-2 mb-3">{{ user.created_at | date("MMMM Do yyyy, h:mm a") }}</div>

          <v-divider class="mb-3" />
          <div class="d-flex align-center">
            <span class="text-body-2 mr-3">Change authority:</span>
            <v-btn-toggle v-model="newAuthority" dense mandatory>
              <v-btn x-small value="user">user</v-btn>
              <v-btn x-small value="groupadmin">groupadmin</v-btn>
              <v-btn x-small value="administrator">administrator</v-btn>
            </v-btn-toggle>
            <v-btn
              x-small
              class="ml-3"
              color="warning"
              :disabled="newAuthority === user.authority || saving"
              @click="setAuthority"
            >Save</v-btn>
            <v-fade-transition>
              <span v-if="authoritySaved" class="ml-2 success--text text-caption">Saved!</span>
            </v-fade-transition>
          </div>
        </v-card-text>
      </v-card>

      <!-- Addresses -->
      <v-card class="mb-4" elevation="3" dark>
        <v-card-title class="subtitle-1">
          Stake Addresses
          <v-chip x-small class="ml-2">{{ user.addresses.length }}</v-chip>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-list dense dark>
            <v-list-item v-for="addr in user.addresses" :key="addr.stake_key">
              <v-list-item-content>
                <v-list-item-title class="text-caption" style="font-family:monospace">
                  {{ addr.stake_key }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span v-if="addr.verified" class="success--text">
                    <v-icon x-small color="success">mdi-check-circle</v-icon>
                    Verified {{ addr.verified_at | date("MMM Do yyyy") }}
                  </span>
                  <span v-else class="warning--text">
                    <v-icon x-small color="warning">mdi-clock-outline</v-icon>
                    Unverified
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  v-if="!addr.verified"
                  x-small
                  color="success"
                  :loading="verifying === addr.stake_key"
                  @click="verifyAddress(addr.stake_key)"
                >Verify</v-btn>
                <v-btn
                  v-if="!addr.verified"
                  x-small
                  color="error"
                  class="ml-1"
                  :loading="removing === addr.stake_key"
                  @click="removeAddress(addr.stake_key)"
                >Remove</v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!user.addresses.length">
              <v-list-item-content>
                <v-list-item-subtitle class="text--secondary">No addresses</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Pending Verifications -->
      <v-card class="mb-4" elevation="3" dark v-if="pendingVerifications.length">
        <v-card-title class="subtitle-1 warning--text">
          <v-icon color="warning" class="mr-2">mdi-clock-alert-outline</v-icon>
          Pending Verifications ({{ pendingVerifications.length }})
        </v-card-title>
        <v-card-text class="pa-0">
          <v-list dense dark>
            <v-list-item v-for="v in pendingVerifications" :key="v.stake_key">
              <v-list-item-content>
                <v-list-item-title class="text-caption" style="font-family:monospace">{{ v.stake_key }}</v-list-item-title>
                <v-list-item-subtitle>
                  Send <strong>{{ (v.payment_amount / 1000000).toFixed(6) }} ADA</strong>
                  to <span style="font-family:monospace">{{ v.payment_address | ellipsiscrypto(20) }}</span>
                  &nbsp;·&nbsp; Created {{ v.created_at | date("MMM Do yyyy, h:mm a") }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  x-small
                  color="success"
                  :loading="verifying === v.stake_key"
                  @click="verifyAddress(v.stake_key)"
                >Manual Verify</v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Password Reset Requests -->
      <v-card class="mb-4" elevation="3" dark v-if="user.password_resets && user.password_resets.length">
        <v-card-title class="subtitle-1">Recent Password Resets</v-card-title>
        <v-card-text class="pa-0">
          <v-list dense dark>
            <v-list-item v-for="r in user.password_resets" :key="r.stake_key + r.created_at">
              <v-list-item-content>
                <v-list-item-title class="text-caption" style="font-family:monospace">{{ r.stake_key }}</v-list-item-title>
                <v-list-item-subtitle>
                  Status: <strong :class="r.status === 'completed' ? 'success--text' : 'warning--text'">{{ r.status }}</strong>
                  &nbsp;·&nbsp; {{ r.created_at | date("MMM Do yyyy, h:mm a") }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Pools & API Keys -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card elevation="3" dark>
            <v-card-title class="subtitle-1">
              Claimed Pools
              <v-chip x-small class="ml-2">{{ user.pools.length }}</v-chip>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list dense dark>
                <v-list-item v-for="pid in user.pools" :key="pid">
                  <v-list-item-content>
                    <v-list-item-title class="text-caption" style="font-family:monospace">{{ pid }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item v-if="!user.pools.length">
                  <v-list-item-subtitle class="text--secondary">No pools</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card elevation="3" dark>
            <v-card-title class="subtitle-1">
              API Keys
              <v-chip x-small class="ml-2">{{ user.api_keys.length }}</v-chip>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list dense dark>
                <v-list-item v-for="key in user.api_keys" :key="key">
                  <v-list-item-content>
                    <v-list-item-title class="text-caption" style="font-family:monospace">{{ key }}</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn x-small icon v-clipboard="key"><v-icon x-small>mdi-content-copy</v-icon></v-btn>
                  </v-list-item-action>
                </v-list-item>
                <v-list-item v-if="!user.api_keys.length">
                  <v-list-item-subtitle class="text--secondary">No API keys</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

    </template>

    <!-- Snackbar feedback -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" top :timeout="3000">
      {{ snackbarMsg }}
      <template v-slot:action><v-btn text @click="snackbar = false">Close</v-btn></template>
    </v-snackbar>
  </div>
</template>

<script>
import api from "@/services/api";

export default {
  props: ["nightmode"],
  data() {
    return {
      query: "",
      searching: false,
      searchError: "",
      user: null,
      newAuthority: "user",
      saving: false,
      authoritySaved: false,
      verifying: null,
      removing: null,
      snackbar: false,
      snackbarMsg: "",
      snackbarColor: "success",
    };
  },
  computed: {
    pendingVerifications() {
      if (!this.user) return [];
      return (this.user.verifications || []).filter((v) => v.status === "pending");
    },
  },
  methods: {
    async lookup() {
      const q = (this.query || "").trim();
      if (!q) return;
      this.searching = true;
      this.searchError = "";
      this.user = null;
      try {
        const isUuid = /^[0-9a-f-]{36}$/i.test(q);
        const url = isUuid
          ? `/api/admin/user/${q}`
          : `/api/admin/user/lookup?stake_key=${encodeURIComponent(q)}`;
        const { data } = await api.get(url);
        this.user = data;
        this.newAuthority = data.authority;
      } catch (e) {
        this.searchError =
          e.response?.status === 404
            ? "No user found with that address or ID"
            : "Lookup failed: " + (e.response?.data?.detail || e.message);
      } finally {
        this.searching = false;
      }
    },

    async setAuthority() {
      this.saving = true;
      try {
        await api.put(`/api/admin/user/${this.user.user_id}/authority`, {
          authority: this.newAuthority,
        });
        this.user.authority = this.newAuthority;
        this.authoritySaved = true;
        setTimeout(() => (this.authoritySaved = false), 2500);
        this.notify("Authority updated", "success");
      } catch (e) {
        this.notify("Failed: " + (e.response?.data?.detail || e.message), "error");
      } finally {
        this.saving = false;
      }
    },

    async verifyAddress(stakeKey) {
      this.verifying = stakeKey;
      try {
        await api.post(`/api/admin/user/${this.user.user_id}/verify/${encodeURIComponent(stakeKey)}`);
        // Update local state
        const addr = this.user.addresses.find((a) => a.stake_key === stakeKey);
        if (addr) {
          addr.verified = true;
          addr.verified_at = Math.floor(Date.now() / 1000);
        }
        const ver = this.user.verifications.find((v) => v.stake_key === stakeKey);
        if (ver) ver.status = "verified";
        this.notify("Address verified", "success");
      } catch (e) {
        this.notify("Failed: " + (e.response?.data?.detail || e.message), "error");
      } finally {
        this.verifying = null;
      }
    },

    async removeAddress(stakeKey) {
      this.removing = stakeKey;
      try {
        await api.delete(
          `/api/admin/user/${this.user.user_id}/address/${encodeURIComponent(stakeKey)}`
        );
        this.user.addresses = this.user.addresses.filter((a) => a.stake_key !== stakeKey);
        this.notify("Address removed", "success");
      } catch (e) {
        this.notify("Failed: " + (e.response?.data?.detail || e.message), "error");
      } finally {
        this.removing = null;
      }
    },

    authorityColor(authority) {
      if (authority === "administrator") return "red darken-2";
      if (authority === "groupadmin") return "orange darken-2";
      return "grey darken-1";
    },

    notify(msg, color = "success") {
      this.snackbarMsg = msg;
      this.snackbarColor = color;
      this.snackbar = true;
    },
  },
};
</script>
