<template>
<div>
    <v-text-field :rules="[rules.required, rules.address]" class="pt-2" flat placeholder="addr1qyancz5tzq916qlz00xrwhv42ny0lscdfjxz2409e7qg9qqwhse7jpldnx5y0hg4j2wen85mfcc7aj3jfk26kfuhpm0stfnuex" outlined append-icon="mdi-magnify" @click:append="bech2cli" hide-details="auto" dense label="Address" :error-messages="bechErrors" v-model="bechAddress">

    </v-text-field>
    addressFound: {{cliAddress}}<br />
    <span v-if="unverifiedAccount">UNVERIFIED! </span>userIdFound: {{foundUserId}}<br />
    <span v-if="foundUserId!=null&&noPasswordHash">No Password Hash</span>
    <span v-if="foundUserIds.length>1">otherUserIdsFound: {{foundUserIds}}</span><br />

    <v-card class="mt-6 mx-auto mb-4" elevation="5"  v-if="foundUserId!=null&&!unverifiedAccount">
        <div class="pt_form_title">
            privMeta

        </div>
        <v-card-text dark v-if="foundPrivMetaErrors==''&&foundPrivMeta!=null">
            <p v-if="'authority' in foundPrivMeta">
                <strong>Authority:</strong> {{foundPrivMeta.authority}}
            </p>
            <p v-if="'myEmail' in foundPrivMeta">
                <strong>Email:</strong> {{foundPrivMeta.myEmail}}
            </p>


            <p >
                <strong>Subscriptions:</strong>
                <ul v-if="'mySubscriptions' in foundPrivMeta">
                    <li v-for="(subexpires,subtype) in foundPrivMeta.mySubscriptions" :key="subtype">
                        {{subtype}} {{subexpires}} <span v-if="subexpires>1">Expires: {{subexpires | date("MMMM Do yyyy")}}</span><span v-else-if="subexpires==0">Permanent Enabled</span><span v-else-if="subexpires==1">Permanent Disabled</span>
                        <v-btn class="mr-2 ml-5" x-small color="green" @click="subExpAdj(subtype,0)">Enable Always</v-btn> 
                        <v-btn class="mr-2" x-small color="green" @click="subExpAdj(subtype,1)">Disable</v-btn> 
                        <v-btn class="mr-2" x-small color="green" @click="subExpAdj(subtype,(Date.now()+7.884e+9))">Now +3 Months</v-btn> 
                        <v-btn class="mr-2" x-small color="green" @click="subExpAdj(subtype,(Date.now()+3.154e+10))">Now +1 Year</v-btn>
                    </li>
                </ul>
                <v-select  :items="subkeys" dense outlined flat hide-details label="Subscriptions" v-model="addSubscriptionValue" placeholder="Subscriptions">

                            <template v-slot:append-outer>
                                <v-btn @click="addSubscription">Add</v-btn>

                            </template>
                        </v-select>

            </p>
            <p v-if="'myAddresses' in foundPrivMeta">
                <strong>Addresses:</strong>
                <ul>
                    <li v-for="(addressdata,address) in foundPrivMeta.myAddresses" :key="address">
                        {{address}}
                    </li>
                </ul>
            </p>
            <p v-if="'myApiKeys' in foundPrivMeta">
                <strong>ApiKeys:</strong>
                <ul>
                    <li v-for="(apiKeyMetadata,apiKey) in foundPrivMeta.myApiKeys" :key="apiKey">
                        {{apiKey}}<Br />
                        For Pools:
                        <ul>
                            <li v-for="(junk,poolid) in apiKeyMetadata.poolids" :key="poolid">
                                {{poolid}}
                            </li>
                        </ul>

                    </li>
                </ul>
            </p>
            <p v-if="'myPools' in foundPrivMeta">
                <strong>Pools:</strong>
                <ul>
                    <li v-for="(junk,poolid) in foundPrivMeta.myPools" :key="poolid">
                        {{poolid}}
                    </li>
                </ul>
            </p>
            <p>
                <strong>Owned Translations:</strong>
                <ul>
                    <li v-for="(junk,translation) in foundPrivMeta.ownedTranslations" :key="translation">
                        {{translation}}
                    </li>
                    <li>

                        <v-select item-text="languagetext" item-value="locale" :items="langs" dense outlined flat hide-details label="Language" v-model="addTranslationValue" placeholder="Language">

                            <template v-slot:append-outer>
                                <v-btn @click="addTranslation">Add</v-btn>

                            </template>
                        </v-select>
                    </li>
                </ul>

            </p>
        </v-card-text>
        <v-card-text v-else>
            {{foundPrivMetaErrors}}
        </v-card-text>
    </v-card>

    <v-card class="mt-6 mx-auto mb-4" elevation="5" :dark="nightmode" v-if="foundUserId!=null">
        <div class="pt_form_title">
            Verification Statuses

        </div>
        <v-card-text v-if="foundPrivMetaErrors==''&&verificationStatuses!=null">

            <ul>
                <li v-for="(addrkeystatus,addrkey) in verificationStatuses" :key="addrkey">
                    {{addrkey}}
                    <ul>
                        <li> Created: {{addrkeystatus.createdDate | date("MMMM Do yyyy, h:mm:ss a")}}</li>
                        <li> Amount: {{addrkeystatus.paymentAmount}}</li>
                        <li> To Address: {{addrkeystatus.paymentToAddress}}</li>
                        <li> Status: {{addrkeystatus.status}}
                            <v-btn x-small v-if="addrkeystatus.status=='pending'" @click="manuallyVerify(foundUserId,addrkey)" color="success">Verify</v-btn>
                        </li>
                        <li> Verification Date: {{addrkeystatus.verificationDate | date("MMMM Do yyyy, h:mm:ss a")}}</li>
                        <li v-if="foundUserId!=null&&noPasswordHash"> Password Hash: {{addrkeystatus.passwordHash}}
                            <v-btn x-small v-if="addrkeystatus.passwordHash!=null" @click="installHash(foundUserId,addrkeystatus.passwordHash)" color="success">Install Hash</v-btn>
                            </li> 

                    </ul>
                </li>
            </ul>

        </v-card-text>
    </v-card>

</div>
</template>

<script>
const Buffer = require("buffer/").Buffer;
import { getUser, updateUserSettings } from "@/services/api";
let { bech32 } = require("bech32");
export default {
  props: ["nightmode"],
  computed: {
    noPasswordHash: function () {
      if (typeof this.auth != "undefined" && this.auth != null) {
        if (typeof this.auth.passwordHash == "undefined") {
          return true;
        }
      }
      return false;
    },
    langs: function () {
      var a = [];
      if (typeof this.langs_raw != "undefined" && this.langs_raw != null) {
        for (const value of Object.values(this.langs_raw)) {
          value.disabled = false;
          value.languagetext = value.locale + " : " + value.language;
          a.push(value);
        }
      }
      return a.sort((a, b) => (a.language < b.language ? -1 : 1));
    },
    langs_raw: function () {
      return this.$store.getters.getLanguages;
    },

    network: function () {
      return this.$store.getters.getNetwork;
    },
  },
  watch: {
    foundUserId: async function (newval) {
      if (newval != null) {
        try {
          const { data } = await getUser(newval);
          if (data) {
            this.foundPrivMeta = data.privMeta || {};
            this.verificationStatuses = data.verificationStatuses || {};
            this.auth = data.auth || {};
            this.foundPrivMetaErrors = "";
          }
        } catch (e) {
          console.error("Failed to fetch user data", e);
          this.foundPrivMeta = null;
          this.foundPrivMetaErrors = "Failed to fetch user data";
        }
      }
    },
  },
  methods: {
    installHash: async function (userid, passwordHash) {
      try {
        await updateUserSettings(userid, { auth: { passwordHash: passwordHash, createdAt: Date.now() } });
      } catch (e) {
        console.error("Failed to install hash", e);
      }
    },

    manuallyVerify: async function (userid, address) {
      console.log(userid, address);
      try {
        await updateUserSettings(userid, {
          manualVerify: {
            address: address,
            status: "verified",
            verificationDate: Date.now(),
          },
        });
      } catch (e) {
        console.error("Failed to manually verify", e);
      }
    },
    //subExpAdj(subtype,1)
    subExpAdj: async function (subtype, subval) {
      if (subtype != null && this.foundUserId != null) {
        try {
          await updateUserSettings(this.foundUserId, {
            privMeta: { mySubscriptions: { [subtype]: subval } },
          });
        } catch (e) {
          console.error("Failed to adjust subscription", e);
        }
      }
    },
    addSubscription: async function () {
      if (this.addSubscriptionValue != null && this.foundUserId != null) {
        try {
          await updateUserSettings(this.foundUserId, {
            privMeta: { mySubscriptions: { [this.addSubscriptionValue]: 1 } },
          });
        } catch (e) {
          console.error("Failed to add subscription", e);
        }
      }
    },
    addTranslation: async function () {
      if (this.addTranslationValue != null && this.foundUserId != null) {
        try {
          await updateUserSettings(this.foundUserId, {
            privMeta: { ownedTranslations: { [this.addTranslationValue]: true } },
          });
        } catch (e) {
          console.error("Failed to add translation", e);
        }
      }
    },
    queryaddress: async function (address) {
      if (address != null) {
        this.foundUserIds = [];
        try {
          const { queryAddress } = await import("@/services/api");
          const response = await queryAddress(address);
          if (response.data && response.data.userId) {
            this.foundUserId = response.data.userId;
            this.bechErrors = "";
            this.unverifiedAccount = response.data.unverified || false;
            if (this.unverifiedAccount) {
              this.foundUserIds.push(response.data.userId);
            }
          } else {
            this.foundUserId = null;
            this.unverifiedAccount = false;
            this.foundPrivMeta = null;
            this.foundPrivMetaErrors = "";
            this.bechErrors = "No account found with that address";
          }
        } catch (e) {
          this.foundUserId = null;
          this.unverifiedAccount = false;
          this.foundPrivMeta = null;
          this.foundPrivMetaErrors = "";
          this.bechErrors = "No account found with that address";
        }
      }
    },
    bech2cli: function () {
      if (this.bechAddress == null || this.bechAddress == "") {
        this.cliErrors = "Please enter a valid address";
        return;
      }
      try {
        console.log("trying");
        this.bechErrors = "";
        this.cliErrors = "";

        if (this.bechAddress && this.bechAddress.startsWith("addr")) {
          let output = bech32.decode(this.bechAddress, 256);
          this.cliAddress = Buffer.from(bech32.fromWords(output.words))
            .toString("hex")
            .slice(58, 128);
        } else if (this.bechAddress && this.bechAddress.startsWith("stake")) {
          let output = bech32.decode(this.bechAddress, 256);
          this.cliAddress = Buffer.from(bech32.fromWords(output.words))
            .toString("hex")
            .slice(2);
        } else {
          this.cliAddress = this.bechAddress;
        }

        this.queryaddress(this.cliAddress);
      } catch (e) {
        console.log("error");
        console.log(this.bechErrors);
        this.bechErrors = e.toString();
        this.cliAddress = "";
        this.foundUserId = null;
      }
    },
  },
  data() {
    return {
      auth: {},
      addSubscriptionValue: null,
      subkeys: ["feature_rewards_tracking", "feature_enhanced_spo"],
      addTranslationValue: null,
      verificationStatuses: {},
      rules: {
        required: (value) => !!value || this.$t("app.required"),
        address: (value) => {
          const pattern = /^addr[a-z0-9]{99}|stake[a-z0-9]{54}$/gim;
          return pattern.test(value) || this.$t("app.InvalidAddress"); //'Invalid Address.'
        },
      },
      unverifiedAccount: false,
      foundPrivMeta: {},
      foundPrivMetaErrors: "",
      foundUserId: null,
      foundUserIds: [],
      bechErrors: null,
      cliAddress: null,
      bechAddress:
        "stake1u98smhcptv87gtky8h4429g65sy0gglas52dljf7j5wnapq6d0m0a",
      addr2user: {},
      tab: "users",
    };
  },
};
</script>

<style scoped>
</style>
