<template>
  <div v-if="isSignedIn && poolIsMine">
    <v-row>
      <v-col cols="12" xs="12" sm="6" md="6">
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

      <v-col cols="12" xs="12" sm="6" md="6">
        <v-card class="mt-6" elevation="5" :dark="nightmode">
          <div class="pt_form_title">
            {{ $t("app.profile.apiKey") }}
          </div>
          <v-card-text>
            {{ $t("app.profile.apiKey") }}:
            <ul>
              <li v-for="(apikey, id) in userData.myApiKeys" :key="id">
                {{ id }}
              </li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col></v-row
    >
    <v-card class="mt-6" elevation="5" :dark="nightmode">
      <div class="pt_form_title">
        {{ $t("app.poolManage.communications") }}
      </div>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="12" md="12" lg="12" class="float-right">
            <p>
              {{ $t("app.poolManage.postANoteToYourPage") }}
              <b>{{ poolstats.ptbs }}</b>
              <a href="https://web.telegram.org/#/im?p=@PoolToolBot"
                >@PoolToolBot</a
              >
              {{ $t("app.poolManage.followers") }}
            </p>
            <v-row>
              <v-col>
                <v-textarea
                  ref="poolnote"
                  outlined
                  auto-grow
                  persistent-hint
                  :hint="
                    $t('app.poolManage.useThisToPutANote') +
                    '.  ' +
                    $t('app.poolManage.youMayUseItForAnything') +
                    '.  ' +
                    $t('app.poolManage.1024CharactersMax') +
                    '.  ' +
                    $t('app.poolManage.acceptableHTMLTagsAre') +
                    ': <a>,<b>,<br>,<i>,<ul>,<li>,<ol>,<p>'
                  "
                  counter
                  :label="$t('app.poolManage.publicNote')"
                  :rules="[
                    (v) =>
                      (typeof v != 'undefined' && v.length <= 1024) ||
                      'Max 1024 characters',
                  ]"
                  :value="poolstats.public_note"
                  v-model="tempnote"
                >
                  <template v-slot:append-outer>
                    <v-container class="ma-0 pa-0">
                      <v-row class="ma-0 pa-0">
                        <v-col cols="12" class="ma-0 pa-0">
                          <v-btn
                            icon
                            color="success"
                            @click="updatePoolField('public_note', tempnote)"
                          >
                            <v-icon>mdi-check-bold</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row class="ma-0 pa-0">
                        <v-col cols="12" class="ma-0 pa-0">
                          <v-btn
                            icon
                            color="error"
                            @click="updatePoolField('public_note', '')"
                          >
                            <v-icon>mdi-cancel</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-container>
                  </template>
                </v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-textarea
                  disabled
                  outlined
                  auto-grow
                  persistent-hint
                  :hint="
                    'TEMPORARILY DISABLED FEATURE. ' +
                    $t('app.poolManage.useThisToSendAMessage') +
                    '.  ' +
                    $t('app.poolManage.youMayUseItForAnything') +
                    '.  ' +
                    $t('app.poolManage.1024CharactersMax') +
                    '.  ' +
                    $t('app.poolManage.noHTML')
                  "
                  counter
                  :label="$t('app.poolManage.telegramAnnouncement')"
                  :rules="[(v) => v.length <= 1024 || 'Max 1024 characters']"
                  v-model="localnote"
                >
                  <template v-slot:append-outer>
                    <v-container class="ma-0 pa-0">
                      <v-row class="ma-0 pa-0">
                        <v-col cols="12" class="ma-0 pa-0">
                          <v-btn
                            disabled
                            icon
                            color="success"
                            @click="sendTelegramMessage(localnote)"
                          >
                            <v-icon>mdi-send</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-container>
                  </template>
                </v-textarea>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card
      v-if="isSignedIn && poolIsMine && false"
      class="mt-6"
      elevation="5"
      :dark="nightmode"
    >
      <div class="pt_form_title">
        {{ $t("app.poolManage.metadataGenerator") }}
      </div>
      <v-card-text>
        <p>
          {{ $t("app.poolManage.yourPoolMetadataUrl") }}.
          {{ $t("app.poolManage.youProvideTheURLPlusAHash") }}.
          {{ $t("app.poolManage.youCanEitherHavePooltool") }}.
        </p>
        <p>
          Metadata Length:
          <span :class="metadatalength > 512 ? 'red--text' : ''">{{
            metadatalength
          }}</span>
        </p>
        <v-row>
          <v-col cols="12" sm="12" md="4" lg="4" class="pt-0">
            <v-text-field
              dense
              hide-details
              :label="$t('global.poolName')"
              :placeholder="$t('app.poolManage.giveItAProperName')"
              outlined
              v-model="metadata.name"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="12" md="4" lg="4" class="pt-0">
            <v-text-field
              dense
              hide-details
              :label="$t('app.poolManage.poolTicker')"
              :rules="[validateTicker]"
              counter="5"
              :placeholder="$t('app.poolManage.5CharactersMaximum')"
              outlined
              v-model="metadata.ticker"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="12" md="4" lg="4" class="pt-0">
            <v-text-field
              dense
              hide-details
              :label="$t('app.poolManage.poolHomepage')"
              :rules="[validateUrl]"
              placeholder="https://mycoolpool.com"
              outlined
              v-model="metadata.homepage"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="12" md="12" lg="12" class="pt-0">
            <v-text-field
              dense
              :label="$t('app.poolManage.poolDescription')"
              counter="255"
              :rules="[validateDescription]"
              :placeholder="$t('app.poolManage.thisPoolWillRockYourWorld')"
              outlined
              v-model="metadata.description"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="12" md="12" lg="12" class="pt-0">
            Optional ITN Ticker Metadata validation
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="12" md="6" lg="6" class="pt-0">
            <v-text-field
              dense
              hide-details
              :label="$t('app.poolManage.itnOwnerPublicKey')"
              :rules="[validateItnPk]"
              placeholder="ed25519_pk1...."
              outlined
              v-model="metadata.itn_owner"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="12" md="6" lg="6" class="pt-0">
            <v-text-field
              dense
              hide-details
              :label="$t('app.poolManage.mainnetPoolIdWitness')"
              placeholder="ed25519_sig1...."
              outlined
              v-model="metadata.witness"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="12" md="12" lg="12" class="pt-0">
            <v-btn
              :disabled="!metadatavalid"
              color="primary"
              block
              @click="generateMetadata"
              >Generate</v-btn
            >
          </v-col>
        </v-row>
        <v-simple-table dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">URL</th>
                <th class="text-left">Hash</th>
                <th class="text-left"></th>
                <th class="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in saved_metadata" :key="item.id">
                <td>
                  <a
                    :href="
                      'https://s3-us-west-2.amazonaws.com/data.pooltool.io/md/' +
                      item.id
                    "
                    >https://s3-us-west-2.amazonaws.com/data.pooltool.io/md/{{
                      item.id
                    }}</a
                  >
                  <v-btn
                    text
                    small
                    icon
                    v-clipboard="
                      'https://s3-us-west-2.amazonaws.com/data.pooltool.io/md/' +
                      item.id
                    "
                  >
                    <v-icon small>mdi-content-copy</v-icon>
                  </v-btn>
                </td>
                <td>
                  {{ item.hash }}
                  <v-btn text small icon v-clipboard="item.hash">
                    <v-icon small>mdi-content-copy</v-icon>
                  </v-btn>
                </td>
                <td>
                  <v-expansion-panels flat>
                    <v-expansion-panel>
                      <v-expansion-panel-header
                        >Metadata</v-expansion-panel-header
                      >
                      <v-expansion-panel-content>
                        <vue-json-pretty :path="'res'" :data="item.metadata">
                        </vue-json-pretty>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </td>
                <td>
                  <v-btn @click="deleteItem(item.id)" icon>
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
    </v-card>
  </div>
  <div v-else-if="!isSignedIn">
    <v-alert class="mt-2" type="info"
      >You need to be signed in to manage pools</v-alert
    >
  </div>
  <div v-else>
    <v-alert class="mt-2" type="info"
      >To claim this pool you need to claim the reward address</v-alert
    >
  </div>
</template>

<script>
//import VueJsonPretty from 'vue-json-pretty'
import { db } from "@/firebase";

export default {
  mixins: [],
  components: {},

  created() {},
  props: ["nightmode", "poolstats", "pool", "userId", "poolIsMine", "userData"],
  data() {
    return {
      ready_pools: {},
      messages: {},
      messageForm: "",
      localnote: "",
      tempnote: this.poolstats.public_note,
      saved_metadata: [],
      metadata: {
        name: "",
        ticker: "",
        description: "",
        homepage: "",
        itn_owner: "",
        witness: "",
      },
      dialog: false,
      isFormValid: false,
      isPFormValid: false,
      newName: null,
      newHost: null,
      newPort: null,
      newPName: null,
      newPHost: null,
      newPPort: null,
      rnodes: [],
      pnodes: [],
      user_data: {},
    };
  },

  watch: {
    publicnote: {
      handler(newval) {
        if (typeof newval != "undefined") {
          this.tempnote = newval;
        } else {
          this.tempnote = "";
        }
      },
    },
  },

  methods: {
    deleteItem: function (metadata_id) {
      console.log(metadata_id);
      // const mstring = "mutation MyMutation($id: uuid!) { update_pt_metadata_by_pk(pk_columns: {id: $id}, _set: {deleted: true} ) { id }}"

      // this.$apollo.mutate({
      //     mutation: gql `${mstring}`,
      //     variables: {
      //         "id": metadata_id
      //     }
      // })
    },
    generateMetadata: function () {
      if (this.metadatavalid) {
        // const mstring = "mutation CreateMetadataFile($genesis_id: Int = 10, $metadata: jsonb , $owner_id: uuid , $pool_id: String ) { CreateMetadataFile(genesis_id: $genesis_id, metadata: $metadata, owner_id: $owner_id, pool_id: $pool_id) { hash id  } }"
        // this.$apollo.mutate({
        //     mutation: gql `${mstring}`,
        //     variables: {
        //         "genesis_id": "18",
        //         "metadata": this.metadata,
        //         "owner_id": this.userId,
        //         "pool_id": this.pool.poolpubkey
        //     }
        // })
      }
      //create metadata from values
    },
    updateNodeField: function (field, id, newValue) {
      var variables = {
        id,
      };
      if (field == "deleted") {
        // const mstring = "mutation DeleteNode($id: uuid!) {delete_nodes_by_pk(id: $id) {id}}"
        // this.$apollo.mutate({
        //     mutation: gql `${mstring}`,
        //     variables
        // })
      } else {
        variables[field] = newValue;
        const typelist = {
          friendly_name: {
            type: "$friendly_name: String",
            set: "friendly_name: $friendly_name",
            ret: "friendly_name",
          },
          host: {
            type: "$host: String",
            set: "host: $host",
            ret: "",
          },
          port: {
            type: "$port: Int",
            set: "port: $port",
            ret: "",
          },
        };
        var types = [];
        var sets = [];
        var returns = [];
        Object.keys(variables).forEach(function (key) {
          if (typeof typelist[key] !== "undefined") {
            types.push(typelist[key].type);
            sets.push(typelist[key].set);
            returns.push(typelist[key].ret);
          }
        });

        // const mstring = "mutation NodeUpdate($id: uuid!," + types.join() + ") {update_nodes_by_pk(pk_columns: {id: $id},_set: {" + sets.join() + "}) {id, " + returns.join() + "}}"

        // this.$apollo.mutate({
        //     mutation: gql `${mstring}`,
        //     variables
        // })
      }
    },
    addRelayNode: function () {
      if (this.createNodeValid) {
        this.newName = this.newName.trim();
        this.newHost = this.newHost.trim();
        this.newPort = this.newPort.trim();
        // this.$apollo.mutate({
        //     mutation: require('../../graphql/AddNode.gql'),
        //     variables: {
        //         relay: true,
        //         friendly_name: this.newName,
        //         host: this.newHost,
        //         port: this.newPort,
        //         genesis_id: "18",
        //         poolid: this.pool.poolpubkey,
        //     },
        // }).then(() => {
        //     this.newHost = null
        //     this.newPort = null
        //     this.newName = null
        // })
      }
    },
    sendTelegramMessage: function (note) {
      console.log(note);
      // const mstring = "mutation sendTelegramMessage($owner_id: uuid! , $pool_id: String!, $message: String! ) { sendTelegramMessage(owner_id: $owner_id, pool_id: $pool_id, message: $message) { success  } }"
      // this.$apollo.mutate({
      //     mutation: gql `${mstring}`,
      //     variables: {
      //         "message": note,
      //         "owner_id": this.userId,
      //         "pool_id": this.pool.poolpubkey
      //     }
      // })
    },
    addPoolNode: function () {
      if (this.createPNodeValid) {
        this.newPName = this.newPName.trim();
        this.newPHost = this.newPHost.trim();
        this.newPPort = this.newPPort.trim();
        // this.$apollo.mutate({
        //     mutation: require('../../graphql/AddNode.gql'),
        //     variables: {
        //         relay: false,
        //         friendly_name: this.newPName,
        //         host: this.newPHost,
        //         port: this.newPPort,
        //         genesis_id: "18",
        //         poolid: this.pool.poolpubkey,
        //     },
        // }).then(() => {
        //     this.newPHost = null
        //     this.newPPort = null
        //     this.newPName = null
        // })
      }
    },

    validateDescription: function (value) {
      if (value != null && value != "") {
        value = value.toString().trim();
      }
      return (
        value === null ||
        value === "" ||
        /^.{0,255}$/i.test(value) ||
        "Invalid Description"
      );
    },
    validateItnPk: function (value) {
      if (value != null && value != "") {
        value = value.toString().trim();
      }
      return (
        value === null ||
        value === "" ||
        /^ed25519[e]{0,1}_pk1[0-9a-z]*$/i.test(value) ||
        "Invalid Private Key"
      );
    },
    validatePort: function (value) {
      if (value != null && value != "") {
        value = value.toString().trim();
      }
      return (
        value === null ||
        value === "" ||
        /^[0-9]+$/i.test(value) ||
        "Invalid Port"
      );
    },
    validateTicker: function (value) {
      if (value != null && value != "") {
        value = value.trim();
      }
      return (
        value === null ||
        value === "" ||
        /^[a-zA-Z0-9]{3,5}$/i.test(value) ||
        "Invalid Ticker"
      );
    },
    validateName: function (value) {
      if (value != null && value != "") {
        value = value.trim();
      }
      return (
        value === null ||
        value === "" ||
        /^[a-zA-Z0-9\s_#-]+$/i.test(value) ||
        "Invalid Name"
      );
    },
    validateHost: function (value) {
      if (value != null && value != "") {
        value = value.trim();
      }
      return (
        value === null ||
        value === "" ||
        /^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,15}$|^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gim.test(
          value
        ) ||
        "Invalid Host"
      );
    },
    validateUrl: function (value) {
      if (value != null && value != "") {
        value = value.trim();
      }
      return (
        value === null ||
        value === "" ||
        /^(?:(?:(?:https?):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
          value
        ) ||
        "Invalid URL"
      );
    },
    updatePoolField(field, newvalue) {
      var w = {};
      if (field == "public_note" && newvalue == "") {
        this.tempnote = "";
      }
      w[field] = newvalue;
      db.ref(this.network + "/pool_stats/" + this.pool.poolpubkey).update(w); //
    },
  },

  computed: {
    poolpubkey: function () {
      return this.pool.poolpubkey;
    },
    publicnote: function () {
      return this.poolstats.public_note;
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
    poolmetadata: function () {
      try {
        return {
          url: this.pool.poolmd.url,
          hash: this.pool.poolmd.hash,
        };
      } catch (e) {
        return {
          url: "",
          hash: "",
        };
      }
    },
    metadatalength: function () {
      var mdl =
        this.metadata.homepage.length +
        this.metadata.ticker.length +
        this.metadata.description.length +
        this.metadata.name.length;
      if (this.metadata.itn_owner.length && this.metadata.witness.length) {
        mdl = mdl + 80;
      }
      return mdl + 61; //general overhead is 64 characters
    },
    metadatavalid: function () {
      return (
        this.validateDescription(this.metadata.description) == true &&
        this.validateItnPk(this.metadata.itn_owner) == true &&
        this.validateUrl(this.metadata.homepage) == true &&
        this.validateTicker(this.metadata.ticker) == true &&
        this.metadata.ticker != "" &&
        this.metadatalength <= 512
      );
    },
  },
};
</script>

<style scoped>
.pt_action_button {
  top: -13px;
  right: 10px;
  font-weight: bold;
  position: absolute;
  margin: 0px;
  padding: 0px 10px;
  border-radius: 4px;
}
</style>
