<template>
  <div class="pa-4">
    <v-btn icon small class="mb-3" @click="load" :loading="loading" title="Refresh">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>

    <!-- Pending Verifications -->
    <v-card class="mb-4" elevation="3" dark>
      <v-card-title class="subtitle-1">
        <v-icon color="warning" class="mr-2">mdi-clock-alert-outline</v-icon>
        Pending Verifications
        <v-chip x-small class="ml-2" color="warning">{{ data.pending_verifications.length }}</v-chip>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-list dense dark v-if="data.pending_verifications.length">
          <v-list-item v-for="v in data.pending_verifications" :key="v.id">
            <v-list-item-content>
              <v-list-item-title class="text-caption" style="font-family:monospace">
                {{ v.stake_key | ellipsiscrypto(30) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                Send <strong class="warning--text">{{ (v.payment_amount / 1000000).toFixed(6) }} ADA</strong>
                to <span style="font-family:monospace" class="text-caption">{{ v.payment_address | ellipsiscrypto(22) }}</span>
                &nbsp;·&nbsp; Requested {{ v.created_at | date("MMM Do, h:mm a") }}
                &nbsp;·&nbsp; user: <span style="font-family:monospace">{{ v.user_id | ellipsiscrypto(12) }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                x-small
                color="success"
                :loading="verifying === v.id"
                @click="manualVerify(v)"
              >Manual Verify</v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <v-card-text v-else class="text--secondary text-caption">No pending verifications</v-card-text>
      </v-card-text>
    </v-card>

    <!-- Pending Password Resets -->
    <v-card class="mb-4" elevation="3" dark>
      <v-card-title class="subtitle-1">
        <v-icon color="orange" class="mr-2">mdi-lock-reset</v-icon>
        Pending Password Resets
        <v-chip x-small class="ml-2" color="orange">{{ data.pending_resets.length }}</v-chip>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-list dense dark v-if="data.pending_resets.length">
          <v-list-item v-for="r in data.pending_resets" :key="r.id">
            <v-list-item-content>
              <v-list-item-title class="text-caption" style="font-family:monospace">
                {{ r.stake_key | ellipsiscrypto(30) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                Send <strong class="orange--text">{{ (r.payment_amount / 1000000).toFixed(6) }} ADA</strong>
                to <span style="font-family:monospace" class="text-caption">{{ r.payment_address | ellipsiscrypto(22) }}</span>
                &nbsp;·&nbsp; Requested {{ r.created_at | date("MMM Do, h:mm a") }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-text v-else class="text--secondary text-caption">No pending password resets</v-card-text>
      </v-card-text>
    </v-card>

    <!-- Recent Payments to Watch Addresses (last 30 days) -->
    <v-card class="mb-4" elevation="3" dark>
      <v-card-title class="subtitle-1">
        <v-icon color="blue lighten-2" class="mr-2">mdi-currency-usd</v-icon>
        Recent Payments to Watch Addresses
        <span class="text-caption text--secondary ml-2">(last 30 days)</span>
        <v-chip x-small class="ml-2">{{ data.recent_payments.length }}</v-chip>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-data-table
          :headers="paymentHeaders"
          :items="data.recent_payments"
          :items-per-page="20"
          dense
          dark
          class="elevation-0"
          style="background:transparent"
        >
          <template #[`item.amount`]="{ item }">
            {{ (item.amount / 1000000).toFixed(6) }} ADA
          </template>
          <template #[`item.to_address`]="{ item }">
            <span style="font-family:monospace" class="text-caption">{{ item.to_address | ellipsiscrypto(20) }}</span>
          </template>
          <template #[`item.from_stake_keys`]="{ item }">
            <span v-if="item.from_stake_keys && item.from_stake_keys.length" style="font-family:monospace" class="text-caption">
              {{ item.from_stake_keys[0] | ellipsiscrypto(20) }}
            </span>
            <span v-else class="text--secondary">—</span>
          </template>
          <template #[`item.processed`]="{ item }">
            <v-chip x-small :color="item.processed ? 'success' : (item.matched_type ? 'blue' : 'grey darken-1')">
              {{ item.processed ? 'matched' : (item.matched_type || 'unmatched') }}
            </v-chip>
          </template>
          <template #[`item.created_at`]="{ item }">
            <span class="text-caption">{{ item.created_at | date("MMM Do, HH:mm") }}</span>
          </template>
          <template #[`item.tx_hash`]="{ item }">
            <span v-if="item.tx_hash" style="font-family:monospace" class="text-caption">{{ item.tx_hash.substring(0, 12) }}...</span>
            <span v-else class="text--secondary">—</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Recently Completed Verifications -->
    <v-card class="mb-4" elevation="3" dark>
      <v-card-title class="subtitle-1">
        <v-icon color="success" class="mr-2">mdi-check-circle-outline</v-icon>
        Recently Verified
        <span class="text-caption text--secondary ml-2">(last 30 days)</span>
        <v-chip x-small class="ml-2" color="success">{{ data.recent_verified.length }}</v-chip>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-list dense dark v-if="data.recent_verified.length">
          <v-list-item v-for="v in data.recent_verified" :key="v.id">
            <v-list-item-content>
              <v-list-item-title class="text-caption" style="font-family:monospace">
                {{ v.stake_key | ellipsiscrypto(36) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-icon x-small color="success">mdi-check-circle</v-icon>
                Verified {{ v.verified_at | date("MMM Do, h:mm a") }}
                &nbsp;·&nbsp; Sent {{ (v.payment_amount / 1000000).toFixed(6) }} ADA
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-card-text v-else class="text--secondary text-caption">No verifications completed in last 30 days</v-card-text>
      </v-card-text>
    </v-card>

    <!-- Recently Completed Password Resets -->
    <v-card class="mb-4" elevation="3" dark v-if="data.recent_resets.length">
      <v-card-title class="subtitle-1">
        <v-icon color="green" class="mr-2">mdi-lock-check-outline</v-icon>
        Recently Completed Password Resets
        <v-chip x-small class="ml-2" color="success">{{ data.recent_resets.length }}</v-chip>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-list dense dark>
          <v-list-item v-for="r in data.recent_resets" :key="r.id">
            <v-list-item-content>
              <v-list-item-title class="text-caption" style="font-family:monospace">{{ r.stake_key | ellipsiscrypto(36) }}</v-list-item-title>
              <v-list-item-subtitle>
                Completed {{ r.completed_at | date("MMM Do, h:mm a") }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar" :color="snackbarColor" top :timeout="3000">
      {{ snackbarMsg }}
      <template v-slot:action><v-btn text @click="snackbar = false">Close</v-btn></template>
    </v-snackbar>
  </div>
</template>

<script>
import api from "@/services/api";

export default {
  data() {
    return {
      loading: false,
      verifying: null,
      data: {
        pending_verifications: [],
        recent_verified: [],
        pending_resets: [],
        recent_resets: [],
        recent_payments: [],
      },
      paymentHeaders: [
        { text: "Date", value: "created_at", width: "120" },
        { text: "Amount", value: "amount", width: "140" },
        { text: "To Address", value: "to_address" },
        { text: "From Stake Key", value: "from_stake_keys" },
        { text: "Tx Hash", value: "tx_hash" },
        { text: "Status", value: "processed", width: "100" },
      ],
      snackbar: false,
      snackbarMsg: "",
      snackbarColor: "success",
    };
  },
  async created() {
    await this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      try {
        const { data } = await api.get("/api/admin/verifications");
        this.data = data;
      } catch (e) {
        this.notify("Failed to load verifications: " + (e.response?.data?.detail || e.message), "error");
      } finally {
        this.loading = false;
      }
    },

    async manualVerify(v) {
      this.verifying = v.id;
      try {
        await api.post(`/api/admin/verifications/${v.id}/verify`);
        this.data.pending_verifications = this.data.pending_verifications.filter(
          (x) => x.id !== v.id
        );
        this.notify(`Verified: ${v.stake_key.substring(0, 20)}...`, "success");
        await this.load();
      } catch (e) {
        this.notify("Failed: " + (e.response?.data?.detail || e.message), "error");
      } finally {
        this.verifying = null;
      }
    },

    notify(msg, color = "success") {
      this.snackbarMsg = msg;
      this.snackbarColor = color;
      this.snackbar = true;
    },
  },
};
</script>
