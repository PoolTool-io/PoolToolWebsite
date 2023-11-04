<template>
  <div>
    <v-card class="mt-6 mx-auto mb-4" elevation="5" :dark="nightmode">
      <div class="pt_form_title">
        <span v-if="!favAddr"> {{ $t("app.profile.myAddresses") }}</span
        ><span v-else> {{ $t("app.profile.favAddresses") }}</span>
      </div>
      <v-card-text>
        <v-data-table
          sort-by="stake_address"
          dense
          :headers="addressheaders_nickname"
          :items="liveaddresslistarray"
          :items-per-page="10"
          class="elevation-1"
        >
          <template #[`body.append`]="">
            <tr class="totalsrow">
              <td
                v-if="!ismobile"
                :colspan="favAddr ? 3 : 4"
                class="text-center"
              >
                Totals:
              </td>
              <td v-if="!ismobile" class="text-center">
                {{
                  totals.totalStake | toada | numFormat("0,0.00a") | zeronull
                }}
              </td>
              <td v-if="!ismobile"></td>
              <td v-if="!ismobile" class="text-center">
                {{
                  totals.totalOperatorRewards
                    | toada
                    | numFormat("0,0.00a")
                    | zeronull
                }}
              </td>
              <td v-if="!ismobile" class="text-center">
                {{
                  totals.totalStakeRewards
                    | toada
                    | numFormat("0,0.00a")
                    | zeronull
                }}
              </td>
              <td v-if="!ismobile" class="text-center">
                {{
                  (totals.totalStakeRewards + totals.totalOperatorRewards)
                    | toada
                    | numFormat("0,0.00a")
                    | zeronull
                }}
              </td>
              <td v-if="!ismobile" class="text-center">
                {{
                  totals.totalStake | roi(totals.totalStakeRewards) | fpercent
                }}
              </td>
              <td v-if="!ismobile"></td>
              <td v-if="ismobile">
                Total Stake:
                {{ totals.totalStake | toada | numFormat("0,0.00a") | zeronull
                }}<br />
                Total Operator Rewards:
                {{
                  totals.totalOperatorRewards
                    | toada
                    | numFormat("0,0.00a")
                    | zeronull
                }}<br />
                Total Stake Rewards:
                {{
                  totals.totalStakeRewards
                    | toada
                    | numFormat("0,0.00a")
                    | zeronull
                }}<br />
                Total Rewards:
                {{
                  (totals.totalStakeRewards + totals.totalOperatorRewards)
                    | toada
                    | numFormat("0,0.00a")
                    | zeronull
                }}
                <br />Overall ROS:
                {{
                  totals.totalStake | roi(totals.totalStakeRewards) | fpercent
                }}
              </td>
            </tr>
          </template>
          <template #[`item.nickname`]="{ item }">
            <v-edit-dialog dark v-if="item != null">
              {{
                typeof myAddresses[item.stake_address] != "undefined" &&
                typeof myAddresses[item.stake_address].nickname != "undefined"
                  ? myAddresses[item.stake_address].nickname
                  : ""
              }}
              <template v-slot:input>
                <v-text-field
                  v-if="item != null"
                  :value="
                    typeof myAddresses[item.stake_address] != 'undefined' &&
                    typeof myAddresses[item.stake_address].nickname !=
                      'undefined'
                      ? myAddresses[item.stake_address].nickname
                      : ''
                  "
                  :rules="[max50chars]"
                  label="Edit"
                  single-line
                  counter
                  @change="savedata(item.stake_address, $event)"
                ></v-text-field>
              </template>
            </v-edit-dialog>
          </template>

          <template #[`item.favorite`]="{ item }">
            <v-btn
              icon
              @click="$emit('togglefavorite', item.stake_address)"
              v-if="typeof item != 'undefined' && item != null"
            >
              <v-icon
                small
                :color="
                  item.stake_address != '' &&
                  favoriteaddrs.length &&
                  favoriteaddrs.indexOf(item.stake_address) != -1
                    ? 'red'
                    : ''
                "
                >mdi-heart</v-icon
              >
            </v-btn>
          </template>
          <template #[`item.stake_address`]="{ item }">
            <span
              class="text-no-wrap"
              v-if="typeof item != 'undefined' && item != null"
              >{{ item.stake_address | ellipsiscrypto(8) }}
              <v-btn text small icon v-clipboard="item.stake_address">
                <v-icon small>mdi-content-copy</v-icon>
              </v-btn></span
            >
          </template>

          <template #[`item.amount`]="{ item }">
            <span v-if="typeof item != 'undefined' && item != null">
              {{ item.amount | toada | numFormat("0,0.00a") | zeronull }}
            </span>
          </template>

          <template #[`item.currentDelegation`]="{ item }">
            <span v-if="typeof item != 'undefined' && item != null">
              {{ item.delegatedToTicker }}
            </span>
          </template>

          <template #[`item.stakeRewards`]="{ item }">
            <span
              v-if="typeof item != 'undefined' && item != null"
              :class="
                item.rewardsSentTo != item.stake_address ? 'text--disabled' : ''
              "
            >
              {{ item.stakeRewards | toada | numFormat("0,0.00a") | zeronull }}
            </span>
          </template>

          <template #[`item.totalRewards`]="{ item }">
            <span
              v-if="typeof item != 'undefined' && item != null"
              :class="
                item.rewardsSentTo != item.stake_address ? 'text--disabled' : ''
              "
            >
              {{
                (item.stakeRewards + item.operatorRewards)
                  | toada
                  | numFormat("0,0.00a")
                  | zeronull
              }}
            </span>
          </template>
          <template #[`item.stakeROS`]="{ item }">
            <span v-if="typeof item != 'undefined' && item != null">
              <v-tooltip
                bottom
                v-if="
                  item.rewardAddrDetails != null &&
                  Object.keys(item.rewardAddrDetails).length > 1
                "
              >
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on"
                    >{{
                      item.amount | roi(item.stakeRewards) | fpercent
                    }}
                    *</span
                  >
                </template>
                <span>{{
                  $t("global.includesRewardsFromOtherStakeKeys")
                }}</span>
              </v-tooltip>

              <span v-else>
                {{ item.amount | roi(item.stakeRewards) | fpercent }}
              </span>
            </span>
          </template>

          <template #[`item.operatorRewards`]="{ item }">
            <span
              v-if="typeof item != 'undefined' && item != null"
              :class="
                item.rewardsSentTo != item.stake_address ? 'text--disabled' : ''
              "
            >
              {{
                item.operatorRewards | toada | numFormat("0,0.00a") | zeronull
              }}
            </span>
          </template>

          <template #[`item.lifetime_roi`]="{ item }">
            <span v-if="typeof item != 'undefined' && item != null">
              {{ item | lifetimeroi | fpercent }}
            </span>
          </template>
          <template #[`item.actions`]="{ item }">
            <v-tooltip bottom v-if="typeof item != 'undefined' && item != null">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  icon
                  small
                  :to="{
                    name: 'address',
                    params: { address: item.stake_address },
                  }"
                  color="primary"
                >
                  <v-icon dense medium>mdi-arrow-right-bold-circle</v-icon>
                </v-btn>
              </template>
              <span>{{ $t("global.addressDetails") }}</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import { db } from "@/firebase";
export default {
  name: "address-card",
  props: [
    "nightmode",
    "favAddr",
    "favoriteaddrs",
    "livedata",
    "myAddresses",
    "ismobile",
  ],
  components: {},
  filters: {
    roi: function (stake, reward) {
      if (stake == 0 || stake == null || isNaN(stake)) return 0;
      if (reward == 0 || reward == null || isNaN(stake)) return 0;
      return Math.pow(reward / stake + 1, 365 / 5) - 1;
    },
  },
  data() {
    return {
      max50chars: (v) =>
        (typeof v != "undefined" && v.length <= 50) || "Input too long!",

      liveaddresslist: {},
      favaddresslist: [],
    };
  },

  unmounted: function () {},
  methods: {
    savedata(stake_address, val) {
      db.ref(this.network + "/users/privMeta")
        .child(this.userId)
        .child("myAddresses")
        .child(stake_address)
        .update({
          nickname: val,
        });
    },
  },
  computed: {
    liveaddresslistarray: function () {
      return Object.values(this.livedata);
    },
    ecosystem: function () {
      return this.$store.getters.getEcosystem;
    },
    userId: function () {
      return this.$store.getters.getUserId;
    },

    totals: function () {
      if (this.liveaddresslistarray.length) {
        const initialValue = {
          totalOperatorRewards: 0,
          totalStakeRewards: 0,
          totalStake: 0,
        };
        return this.liveaddresslistarray.reduce((totals, curren) => {
          if (curren != null) {
            if (
              typeof curren.operatorRewards !== "undefined" &&
              curren.rewardsSentTo == curren.stake_address
            ) {
              totals.totalOperatorRewards += curren.operatorRewards;
            }
            if (
              typeof curren.stakeRewards !== "undefined" &&
              curren.rewardsSentTo == curren.stake_address
            ) {
              totals.totalStakeRewards += curren.stakeRewards;
            }
            if (typeof curren.amount !== "undefined") {
              totals.totalStake += curren.amount;
            }
          }
          return totals;
        }, initialValue);
      } else {
        return { totalOperatorRewards: 0, totalStakeRewards: 0, totalStake: 0 };
      }
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },

    addressheaders_nickname: function () {
      var h = [];
      if (!this.favAddr) {
        h.push({
          text: "Nickname",
          align: "left",
          sortable: false,
          value: "nickname",
        });
      }
      h.push({
        text: "",
        align: "center",
        sortable: false,
        value: "favorite",
      });

      h.push({
        text: "Stake Address",
        align: "left",
        sortable: false,
        value: "stake_address",
      });
      h.push({
        text: "Epoch",
        align: "left",
        sortable: false,
        value: "epoch",
      });
      h.push({
        text: "Amount",
        align: "center",
        sortable: false,
        value: "amount",
      });
      h.push({
        text: "Current Delegation",
        align: "center",
        sortable: false,
        value: "delegatedToTicker",
      });
      h.push({
        text: "Operator Rewards",
        align: "center",
        sortable: false,
        value: "operatorRewards",
      });
      h.push({
        text: "Stake Rewards",
        align: "center",
        sortable: false,
        value: "stakeRewards",
      });
      h.push({
        text: "Total Rewards",
        align: "center",
        sortable: false,
        value: "totalRewards",
      });
      h.push({
        text: "Stake ROS",
        align: "center",
        sortable: false,
        value: "stakeROS",
      });

      h.push({
        text: "Actions",
        align: "right",
        sortable: false,
        value: "actions",
      });
      return h;
    },
  },
};
</script>
<style scoped>
.totalsrow {
  background: rgb(213, 201, 249, 0.5);
}
</style>