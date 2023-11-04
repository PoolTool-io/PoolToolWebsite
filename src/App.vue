<template>
  <v-app class="theme--dark">
    <div v-if="!isLoading">
      <v-app-bar class="hidden-sm-and-up mobile-menu" app clipped-left dark>
        <v-app-bar-nav-icon
          class="hidden-sm-and-up"
          @click.stop="drawer = !drawer"
        ></v-app-bar-nav-icon>

        <v-spacer />
        <v-btn
          icon
          @click="
            pulseitem = 'NewsFeed';
            pulseVisible = true;
          "
        >
          <v-icon>mdi-newspaper</v-icon>
        </v-btn>
        <v-btn
          icon
          @click="
            pulseitem = 'PoolFeed';
            pulseVisible = true;
          "
        >
          <v-icon>mdi-view-list</v-icon>
        </v-btn>
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        v-if="!chillin"
        fixed
        clipped
        dark
        mobile-breakpoint="600"
        app
        expand-on-hover
      >
        <v-list>
          <v-list-item class="px-2 item-logo" to="/" link>
            <v-list-item-avatar>
              <img class="logoimg" :src="`${publicPath}logo_blue.svg`" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                <span class="hidden-sm-and-down">Cardano </span>

                PoolTool
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-list>
          <v-list-item to="/" router exact>
            <v-list-item-action>
              <v-icon>mdi-home</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ $t("app.home") }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/pools" router exact>
            <v-list-item-action>
              <v-icon>mdi-compass</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{
                $t("app.poolexplorer")
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/realtime" router exact>
            <v-list-item-action>
              <v-icon>mdi-cube</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title
                >{{ $t("global.recentBlocks") }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-if="false" link to="/analysis">
            <v-list-item-action>
              <v-icon>mdi-finance</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t("app.analysis") }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-if="false" link to="/analytics">
            <v-list-item-action>
              <v-icon>mdi-finance</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t("app.analytics") }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            v-if="network == 'Mainnet'"
            to="/networkhealth"
            router
            exact
          >
            <v-list-item-action>
              <v-icon>mdi-doctor</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title
                >{{ $t("app.networkHealth.networkHealth") }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item to="/about">
            <v-list-item-action>
              <v-icon>mdi-bank</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $t("app.about.about") }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider v-if="showAdministratorMenuItem"></v-divider>
          <v-list-item
            v-if="showAdministratorMenuItem"
            to="/admin"
            router
            exact
          >
            <v-list-item-action>
              <v-icon>mdi-cogs</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Admin</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            v-if="showTranslationMenuItem"
            to="/translation"
            router
            exact
          >
            <v-list-item-action>
              <v-icon>mdi-cogs</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Translations</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-divider></v-divider>
          <v-list-item v-if="!isSignedIn" @click="login">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ $t("app.signIn") }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-if="isSignedIn" @click="addressSignOut">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ $t("app.signOut") }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-navigation-drawer
        v-if="!chillin && pulseitem == null"
        fixed
        right
        clipped
        dark
        mobile-breakpoint="600"
        app
        mini-variant
      >
        <v-list>
          <v-list-item
            @click="
              pulseitem = 'NewsFeed';
              pulseVisible = true;
            "
          >
            <v-tooltip left>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <v-icon>mdi-newspaper</v-icon>
                </div>
              </template>
              <span>News Feed</span>
            </v-tooltip>
          </v-list-item>
          <v-list-item
            @click="
              pulseitem = 'PoolFeed';
              pulseVisible = true;
            "
          >
            <v-tooltip left>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <v-icon>mdi-view-list</v-icon>
                </div>
              </template>
              <span>Pool Feed</span>
            </v-tooltip>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main
        class="pt-0"
        v-bind:class="{
          '-pulse-visible': this.pulseVisible,
        }"
      >
        <v-container v-if="!chillin" fluid class="pt-3 pl-3 pr-3" height="100%">
          <v-snackbar
            top
            right
            dense
            :value="updateExists"
            :timeout="-1"
            color="primary secondary--text"
          >
            An update is available
            <template v-slot:action="{ attrs }">
              <v-btn v-bind="attrs" text @click="refreshApp" color="red">
                Update
              </v-btn>
            </template>
          </v-snackbar>

          <v-alert
            :class="{
              pulseBlockVisible:
                showBlockIcons && enableBlocks && !pulseVisible && !ismobile,
              'mb-1': !showBlockIcons && enableBlocks,
            }"
            dense
            v-if="
              admin_message != null &&
              admin_message.title != '' &&
              admin_message.message != ''
            "
            color="success"
          >
            <h3 v-if="admin_message.title != ''" class="text-h5">
              {{ admin_message.title }}
            </h3>
            {{ admin_message.message }}
          </v-alert>

          <router-view
            :showBlockIcons="showBlockIcons && enableBlocks"
            :ismobile="ismobile"
            :ispulseVisible="pulseVisible"
            :nightmode="true"
            :enableLogins="enableLogins"
            @claimAddress="claimAddress"
            @isLoaded="Loaded"
            :currency="currency"
            :userId="this.userId"
            @reloadTranslations="reloadTranslations"
            @loadLocaleMessages="loadTranslations"
            @setCurrency="setCurrency"
          ></router-view>
        </v-container>
        <v-container fluid v-else>
          <v-parallax
            dark
            src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"
          >
            <v-row align="center" justify="center">
              <v-col class="text-center" cols="12">
                <h1 class="text-h4 font-weight-thin mb-4">pooltool.io</h1>
                <h4 class="subheading">
                  We're working on stuff. We will be back before ya know it.
                </h4>
              </v-col>
            </v-row>
          </v-parallax>
        </v-container>

        <pulse-block
          :showBlockIcons="showBlockIcons && enableBlocks"
          :ismobile="ismobile"
          :pulseitem="pulseitem"
          v-bind:class="{ '-pulse-visible': this.pulseVisible }"
          @pulseVisible="setPulseVisible"
        />
      </v-main>

      <v-dialog v-model="displayAdsModal" max-width="460">
        <v-card dark class="modalform">
          <v-toolbar color="#00aeec" dark flat>
            <img
              id=""
              src="https://pooltool.io/logo_white.svg"
              class="pr-3"
              contain
              height="40"
            />
            <v-toolbar-title>Cardano PoolTool Ads</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon dark @click="displayAdsModal = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text class="pt-4 my-0">
            <p>
              We introduced some unobtrusive ads. This decision was not easy for
              us, but we have bills to pay.
            </p>

            <p>
              Verified stakers the PoolTool pools

              <router-link
                class="white--text"
                text
                :to="{
                  name: 'poolepochs',
                  params: {
                    poolid:
                      '95c4956f7a137f7fe9c72f2e831e6038744b6307d00143b2447e6443',
                  },
                }"
                >LOVE - StakeLove Pool</router-link
              >
              or
              <router-link
                class="white--text"
                text
                :to="{
                  name: 'poolepochs',
                  params: {
                    poolid:
                      '02d8d38081492f1c5163f3084efad8d51827e47c5c16351153e3def8',
                  },
                }"
                >PT001 - PoolTool Pool</router-link
              >
              with at least 100 ADA staked will always have an ad free
              experience.
            </p>

            <p>
              If you are an individual patreon with a commitment of at least $5
              per month add your Patreon email address to your profile so we can
              give you an ad free experience as well.
            </p>

            <p>
              For Pool Operators if you contribute at least $50 per month your
              pool will also be ad free for delegators with at least 100 ADA
              staked.
            </p>
            <p>
              Patreon Pools are: <Br />
              <router-link
                class="white--text"
                text
                :to="{
                  name: 'poolepochs',
                  params: {
                    poolid:
                      'fcbfb4a3c18f890de7a51f68603b18e654f8b432abdda17c53a0d586',
                  },
                }"
                >AAA - AAA Pool</router-link
              ><Br />
              <router-link
                class="white--text"
                text
                :to="{
                  name: 'poolepochs',
                  params: {
                    poolid:
                      '00000036d515e12e18cd3c88c74f09a67984c2c279a5296aa96efe89',
                  },
                }"
                >ATADA - ATADA Stakepool in Austria</router-link
              >
            </p>
            <p>
              We plan to introduce other avenues for an ad free experience in
              the future.
            </p>
            <p class="text-right">Sincerly, Mike and Umed</p>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialog" persistent max-width="460">
        <v-card dark class="modalform">
          <v-toolbar color="#00aeec" dark flat>
            <img
              id=""
              src="https://pooltool.io/logo_white.svg"
              class="pr-3"
              contain
              height="40"
            />
            <v-toolbar-title>Cardano PoolTool </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon dark @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text v-if="loginalertmessage != null" class="pt-4 my-0">
            <v-alert
              border="top"
              colored-border
              :type="loginalertcolor"
              elevation="2"
            >
              {{ loginalertmessage }}
            </v-alert>
          </v-card-text>
          <v-card-text v-if="authform == 'sendada'" class="">
            <p v-if="verificationtoaddress != ''" class="text-center">
              {{ $t("app.toVerify") }}: <br /><b>{{ verificationamount }}</b>
              ADA
              <v-btn text small icon v-clipboard="verificationamount">
                <v-icon small>mdi-content-copy</v-icon>
              </v-btn>
              <br />
              {{ $t("app.toAddress") }}:<br />
              <b
                >{{ this.verificationtoaddress | ellipsiscrypto(24) }}
                <v-btn text small icon v-clipboard="this.verificationtoaddress">
                  <v-icon small>mdi-content-copy</v-icon>
                </v-btn>
              </b>
              <br /><br />
              {{ $t("app.toVerify1Hr") }}
            </p>
            <v-alert
              v-if="verifymessage != null"
              border="top"
              colored-border
              :type="verifymessagecolor"
              elevation="2"
            >
              {{ verifymessage }}
            </v-alert>

            <v-btn
              v-if="showloginbutton && !isSignedIn"
              @click="authform = 'signin'"
              block
              color="primary secondary--text"
              >{{ $t("app.signIn") }}
            </v-btn>
            <v-btn
              v-if="showclosebutton && isSignedIn"
              @click="dialog = false"
              block
              color="primary secondary--text"
              >{{ $t("app.close") }}
            </v-btn>
          </v-card-text>

          <v-card-text v-if="authform == 'alreadyverified'" class="">
            <p class="text-center" v-if="isSignedIn">
              {{ $t("app.alreadyVerified") }}
            </p>
            <p class="text-center" v-if="!isSignedIn">
              {{ $t("app.alreadyVerifiedLogin") }}
            </p>
            <v-btn
              v-if="showloginbutton && !isSignedIn"
              @click="authform = 'signin'"
              block
              color="primary secondary--text"
              >{{ $t("app.signIn") }}
            </v-btn>
          </v-card-text>

          <v-card-text v-if="authform == 'signin'" class="">
            <h2 class="">{{ $t("app.signIn") }}</h2>
            <form>
              <v-row>
                <v-col class="pt-4 col-12" v-if="this.myUserId == null">
                  <v-text-field
                    autocomplete="username"
                    ref="addresssignin"
                    validate-on-blur
                    :rules="[rules.required, rules.address]"
                    v-model="address"
                    dense
                    outlined
                    flat
                    :label="$t('app.profile.stakeaddress')"
                    :placeholder="$t('app.profile.stakeaddress')"
                  ></v-text-field>
                </v-col>
                <v-col class="py-0 col-12">
                  <v-text-field
                    ref="addresspasssignin"
                    :rules="[rules.required, rules.password]"
                    messages="Forgot your password?"
                    @click:append="show1 = !show1"
                    :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show1 ? 'text' : 'password'"
                    v-model="password"
                    autocomplete="current-password"
                    dense
                    outlined
                    flat
                    :label="$t('global.password')"
                    :placeholder="$t('global.password')"
                  >
                    <template v-slot:message="{}">
                      {{ $t("global.forgotYourPassword") }}
                      <a @click="authform = 'addressreset'"
                        >{{ $t("app.resetPassword") }}
                      </a>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
            </form>
            <v-row align="center">
              <v-col>
                {{ $t("app.noAccount") }} {{ $t("app.ifNoAccount") }}
                <a @click="authform = 'createnewaddressaccount'"
                  >{{ $t("app.createNewAccountHere") }}
                </a>
              </v-col>
              <v-col>
                <v-btn
                  :disabled="
                    !(
                      (this.myUserId != null || address != null) &&
                      password != null &&
                      (myUserId != null ||
                        ($refs.addresssignin && $refs.addresssignin.valid)) &&
                      $refs.addresspasssignin &&
                      $refs.addresspasssignin.valid
                    )
                  "
                  :loading="authLoading"
                  @click="addressSignIn"
                  block
                  color="primary secondary--text"
                  >{{ $t("app.signIn") }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-text v-if="authform == 'createnewaddressaccount'" class="">
            <h2 class="">{{ $t("global.createAccount") }}</h2>
            {{ $t("app.toCreateAnAccount") }}<br /><br />{{
              $t("app.ifClaimingPool")
            }}
            <v-row>
              <v-col class="pt-4 col-12" v-if="this.myUserId == null">
                <v-text-field
                  ref="addresscreate"
                  validate-on-blur
                  :rules="[rules.required, rules.address]"
                  v-model="address"
                  dense
                  outlined
                  flat
                  :label="$t('app.profile.stakeaddress')"
                  :placeholder="$t('app.profile.stakeaddress')"
                ></v-text-field>
              </v-col>
              <v-col class="py-0 col-12">
                <v-text-field
                  ref="passcreate"
                  messages=""
                  :rules="[rules.required, rules.password]"
                  @click:append="show1 = !show1"
                  :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show1 ? 'text' : 'password'"
                  v-model="password"
                  dense
                  outlined
                  flat
                  :label="$t('global.password')"
                  :placeholder="$t('global.password')"
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col>
                {{ $t("app.alreadyHaveAccount") }}
                <a @click="authform = 'signin'">{{ $t("app.signIn") }}</a>
              </v-col>
              <v-col>
                <v-btn
                  :disabled="
                    !(
                      $refs.addresscreate &&
                      $refs.addresscreate.valid &&
                      $refs.passcreate &&
                      $refs.passcreate.valid
                    )
                  "
                  :loading="authLoading"
                  @click="signUp"
                  block
                  color="primary secondary--text"
                  >Create Account
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text class="pt-2" v-if="authform == 'addnewaddressaccount'">
            <h2>{{ $t("global.addAddressToAccount") }}</h2>
            <div class="py-2">{{ $t("app.toCreateAnAccount") }}</div>
            <v-row>
              <v-col class="pt-4 col-12" v-if="this.myUserId == null">
                <v-text-field
                  ref="addressclaim"
                  validate-on-blur
                  :rules="[rules.required, rules.address]"
                  v-model="address"
                  dense
                  outlined
                  flat
                  :label="$t('app.profile.stakeaddress')"
                  :placeholder="$t('app.profile.stakeaddress')"
                ></v-text-field>
              </v-col>
              <v-col class="py-0 col-12">
                <v-text-field
                  ref="passenter"
                  messages=""
                  :rules="[rules.required, rules.password]"
                  @click:append="show1 = !show1"
                  :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show1 ? 'text' : 'password'"
                  v-model="password"
                  dense
                  outlined
                  flat
                  :label="$t('global.password')"
                  :placeholder="$t('global.password')"
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col>
                <v-btn
                  :disabled="
                    !(
                      $refs.addressclaim &&
                      $refs.addressclaim.valid &&
                      $refs.passenter &&
                      $refs.passenter.valid
                    )
                  "
                  :loading="authLoading"
                  @click="signUp"
                  block
                  color="primary secondary--text"
                  >Claim Address
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text v-if="authform == 'closedialog'" class="">
            <v-row align="center">
              <v-col></v-col>
              <v-col>
                <v-btn
                  :loading="authLoading"
                  block
                  color="primary secondary--text"
                  @click="dialog = false"
                  >{{ $t("global.close") }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-text v-if="authform == 'addressreset'" class="">
            <h2 class="">{{ $t("app.resetPassword") }}</h2>

            {{ $t("app.resetPasswordDetails") }}
            <v-row>
              <v-col class="pt-4 col-12" v-if="this.myUserId == null">
                <v-text-field
                  ref="addresstoreset"
                  validate-on-blur
                  :rules="[rules.required, rules.address]"
                  v-model="address"
                  dense
                  outlined
                  flat
                  :label="$t('app.profile.stakeaddress')"
                  :placeholder="$t('app.profile.stakeaddress')"
                ></v-text-field>
              </v-col>
              <v-col class="py-0 col-12">
                <v-text-field
                  ref="passtoreset"
                  messages=""
                  :rules="[rules.required, rules.password]"
                  @click:append="show1 = !show1"
                  :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show1 ? 'text' : 'password'"
                  v-model="password"
                  dense
                  outlined
                  flat
                  :label="$t('global.newpassword')"
                  :placeholder="$t('global.newpassword')"
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col>
                {{ $t("app.rememberyourpassword") }}?
                <a @click="authform = 'signin'">{{ $t("app.signIn") }}</a>
              </v-col>
              <v-col>
                <v-btn
                  :disabled="
                    !(
                      $refs.addresstoreset &&
                      $refs.addresstoreset.valid &&
                      $refs.passtoreset &&
                      $refs.passtoreset.valid
                    )
                  "
                  :loading="authLoading"
                  @click="resetPassword"
                  block
                  color="primary secondary--text"
                  >{{ $t("app.resetPassword") }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isInactive" max-width="290"></v-dialog>
      <v-dialog persistent v-model="reloadPoolTool" width="500">
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            {{ $t("app.pleaseReloadPoolToolio") }}
          </v-card-title>

          <v-card-text>
            {{ $t("app.reloadPooltoolPrompt") }}
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary secondary--text"
              text
              @click="reloadPoolToolNow"
            >
              {{ $t("app.reloadButton") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-app>
</template>

<script>
import numeral from "numeral";
import { v4 as uuidv4 } from "uuid";
import { db, messaging } from "./firebase";
import { mdiThemeLightDark } from "@mdi/js";
import "firebase/compat/messaging";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

import { preference } from "vue-preferences";
import { mapPreferences } from "vue-preferences";
import update from "@/mixins/update";

import PulseBlock from "./components/PulseBlock/PulseBlock";

import {
  setDocumentDirectionPerLocale,
  setDocumentLang,
} from "@/util/i18n/document";

const application_version = preference("application_version", {
  defaultValue: 1,
});
const savedfilters = preference("savedfilters", {
  defaultValue: {
    lifetimeblocks: 0,
    stakegtzero: false,
    stakerange: [0, 500],
    marginrange: [0, 30],
    epochFeeRange: [0, 9],
    pledgeRange: [0, 12],
    syncd: false,
    solo: false,
    unsaturated: false,
    poolsRetired: false,
    itnVerified: false,
    poolsFavorite: false,
  },
});
const myUserId = preference("myUserId", {
  defaultValue: null,
});

export default {
  name: "App",
  mixins: [update],
  async beforeCreate() {
    var self = this;
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        self.onAuthenticated(user);
        // User is signed in.
      } else {
        self.onUnAuthenticated();
        // No user is signed in.
      }
    });
  },
  created: function () {
    if (this.currency == null) this.currency = "usd";
    if (this.locale == null) this.locale = "en";
    this.$store.dispatch("bindGenesis").then(() => {});

    setInterval(
      function () {
        var self = this;
        if (this.checkresetstatus && this.address != null) {
          this.axios({
            method: "get",
            url:
              "https://api.pooltool.io/v1/auth/forgotpassword/" + this.address,
            headers: {
              "x-api-key": "26969ceb-d2d0-46df-9813-852ed4bde2fe",
            },
          }).then(function (response) {
            self.processCheckResetStatus(response.data);
          });
        }

        if (
          this.checkverifystatus == true &&
          this.verifyuserid != null &&
          this.address != null
        ) {
          const params = new URLSearchParams({
            userId: this.verifyuserid,
          });

          this.axios({
            method: "get",
            url: "https://api.pooltool.io/v1/verification/" + this.address,
            params,
            headers: {
              "x-api-key": "26969ceb-d2d0-46df-9813-852ed4bde2fe",
            },
          }).then(function (response) {
            self.processCheckVerifyStatus(response.data);
          });
        }
      }.bind(this),
      10000
    );
    if ("Notification" in window && "serviceWorker" in navigator) {
      this.notificationsSupported = true;
    } else {
      this.notificationsSupported = false;
    }
  },
  watch: {
    chillin: {
      handler(newdata, olddata) {
        if (!newdata && olddata) {
          //we are transitioning from chillin to not chillin.  prompt for reload
          this.reloadPoolTool = true;
          this.dialog = false;
          db.goOffline();
        }
        if (newdata && !olddata) {
          this.isLoading = false;

          this.isLoaded = true;
        }
      },
    },
    isInactive: {
      handler(newdata) {
        if (newdata) {
          console.log("inactive");

          db.goOffline();
        } else {
          console.log("active");
          db.goOnline();
        }
      },
    },
    genesis: {
      immediate: true,
      handler(newdata, olddata) {
        var self = this;
        if (
          typeof newdata != "undefined" &&
          typeof newdata.epoch != "undefined" &&
          newdata.epoch != null &&
          newdata.epoch > 100 &&
          typeof olddata != "undefined" &&
          (olddata.epoch == null || olddata.epoch != newdata.epoch)
        ) {
          this.getJSON(
            "https://s3-us-west-2.amazonaws.com/data.pooltool.io/" +
              this.network +
              "/stake_pool_columns/" +
              newdata.epoch +
              "/stake.json?t=" +
              Date.now(),
            function (err, thisdata) {
              if (err == null) {
                self.$store.commit("activestake", thisdata);
              }
            }
          );
          this.getJSON(
            "https://s3-us-west-2.amazonaws.com/data.pooltool.io/" +
              this.network +
              "/stake_pool_columns/" +
              (newdata.epoch - 2) +
              "/stake.json?t=" +
              Date.now(),
            function (err, thisdata) {
              if (err == null) {
                self.$store.commit("rewardstake", thisdata);
              }
            }
          );
          this.getJSON(
            "https://s3-us-west-2.amazonaws.com/data.pooltool.io/" +
              this.network +
              "/stake_pool_columns/" +
              (newdata.epoch - 2) +
              "/rewards.json?t=" +
              Date.now(),
            function (err, thisdata) {
              if (err == null) {
                self.$store.commit("rewards", thisdata);
              }
            }
          );
        }
        if (
          typeof newdata != "undefined" &&
          typeof olddata != "undefined" &&
          newdata.pool_forecast_calculated_epoch !=
            olddata.pool_forecast_calculated_epoch &&
          newdata.pool_forecast_calculated_epoch > 100
        ) {
          this.getJSON(
            "https://s3-us-west-2.amazonaws.com/data.pooltool.io/" +
              this.network +
              "/stake_pool_columns/" +
              newdata.pool_forecast_calculated_epoch +
              "/rewards.json?t=" +
              Date.now(),
            function (err, thisdata) {
              if (err == null) {
                self.$store.commit("rewardsnp1", thisdata);
              }
            }
          );
        }
        if (
          typeof newdata != "undefined" &&
          typeof olddata != "undefined" &&
          newdata.pool_actuals_calculated_epoch !=
            olddata.pool_actuals_calculated_epoch &&
          newdata.pool_actuals_calculated_epoch > 100
        ) {
          this.getJSON(
            "https://s3-us-west-2.amazonaws.com/data.pooltool.io/" +
              this.network +
              "/stake_pool_columns/" +
              newdata.pool_actuals_calculated_epoch +
              "/rewards.json?t=" +
              Date.now(),
            function (err, thisdata) {
              if (err == null) {
                self.$store.commit("rewards", thisdata);
              }
            }
          );
        }
        if (
          this.network == "Mainnet" &&
          typeof newdata != "undefined" &&
          typeof olddata != "undefined" &&
          newdata.portfolios != olddata.portfolios
        ) {
          this.getJSON(
            "https://s3-us-west-2.amazonaws.com/data.pooltool.io/" +
              this.network +
              "/portfolios.json?t=" +
              Date.now(),
            function (err, thisdata) {
              if (err == null) {
                self.$store.commit("portfolios", thisdata);
                self.$store.commit("portfolios_loaded", true);
              }
            }
          );
        }
      },
    },
  },

  mounted() {
    this.loadTranslations(this.locale);
    this.enableNotifications();
    window.addEventListener("resize", () => {
      this.windowWidth = window.innerWidth;
    });
    window.addEventListener("scroll", this.onScroll);
    this.executeMigrations();
  },

  computed: {
    admin_message: function () {
      return this.$store.getters.admin_message;
    },
    ismobile: function () {
      return this.windowWidth <= 768 ? true : false;
    },
    requestPermission: {
      get: function () {
        return localStorage.getItem("notificationPref") === null;
      },
      set: function (value) {
        localStorage.setItem("notificationPref", value);
      },
    },

    userId: function () {
      return this.$store.getters.getUserId;
    },
    chillin: function () {
      return false;
      //return this.admin_message.chillin
    },

    genesis: function () {
      return this.$store.getters.getGenesis;
    },
    network: function () {
      return this.$store.getters.getNetwork;
    },
    showDelegatorHome: function () {
      if (
        this.isSignedIn &&
        this.userData != null &&
        typeof this.userData.authority != "undefined"
      ) {
        console.log(this.userData.authority);
        if (this.userData.authority == "delegator") {
          return true;
        }
      }
      return false;
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

    showTranslationMenuItem: function () {
      if (
        this.isSignedIn &&
        this.userData != null &&
        typeof this.userData.ownedTranslations != "undefined"
      ) {
        if (
          Object.keys(this.userData.ownedTranslations).length &&
          this.isSignedIn
        ) {
          return true;
        }
      }
      return false;
    },
    userData: function () {
      return this.$store.getters.getUserData;
    },
    isSignedIn: function () {
      return this.$store.getters.getIsSignedIn;
    },
    isInactive: function () {
      return this.$store.state.idleVue.isIdle;
    },
    accountIconColor: function () {
      return this.isSignedIn ? "white" : "blue";
    },
    ...mapPreferences({
      currency: {
        defaultValue: "usd",
      },
      locale: {
        defaultValue: "en",
      },
    }),
  },
  components: {
    PulseBlock,
  },

  methods: {
    setNotifications(value) {
      this.notifications = value;
    },

    executeMigrations() {
      if (application_version.get() == null) {
        application_version.set(1);
      }
      if (application_version.get() == 1) {
        //migrate filterprefs
        var savedf = savedfilters.get();
        if (
          typeof savedf.pledgeRange != "undefined" &&
          savedf.pledgeRange.length == 2 &&
          savedf.pledgeRange[1] == 9
        ) {
          savedf.pledgeRange[1] = 12;
          savedfilters.set(savedf);
        }
        application_version.set(2);
      }
    },
    onScroll() {
      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      this.showBlockIcons = currentScrollPosition <= 0;
    },
    setCurrency(currency) {
      this.currency = currency;
    },
    setPulseVisible(toggle) {
      this.pulseVisible = toggle;
      if (!this.pulseVisible) {
        this.pulseitem = null;
      }
    },

    enableNotifications: function () {
      if (!("Notification" in window)) {
        console.log("Notifications are not supported");
      } else if (Notification.permission === "granted") {
        this.initializeFirebase();
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            this.initializeFirebase();
          }
        });
      } else {
        console.log("No permission to send notification");
      }
      this.requestPermission = Notification.permission;
    },
    initializeFirebase: function () {
      if (firebase.messaging.isSupported()) {
        messaging.onMessage(function (payload) {
          const notificationTitle = payload.notification.title;
          const notificationOptions = {
            body: payload.notification.body,
            icon: "/img/icons/android-chrome-192x192.png",
          };
          //console.log("Message received", payload);
          new Notification(notificationTitle, notificationOptions);
        });
      }
    },
    processCheckResetStatus: function (response) {
      if ("status" in response) {
        if (response.status == "verified") {
          if (this.isSignedIn) {
            this.verifymessage = "Transaction Verified.  Password is reset.";
            this.showclosebutton = true;
          } else {
            this.verifymessage =
              "Transaction Verified.  Password is reset.  You may now login with your new password.";
            this.showloginbutton = true;
          }

          this.verifymessagecolor = "success";

          this.checkverifystatus = false;
        } else {
          this.authform = "sendada";
          this.verifymessage = "Waiting to receive verification transaction";
          this.verifymessagecolor = "info";
          this.showclosebutton = false;
          this.showloginbutton = false;
        }
      }
    },
    processCheckVerifyStatus: function (response) {
      if ("status" in response) {
        if (response.status == "verified") {
          if (this.isSignedIn) {
            this.verifymessage =
              "Address Verified.  It will be added to your account.";
            this.showclosebutton = true;
          } else {
            this.verifymessage = "Address Verified.  You may now login.";
            this.showloginbutton = true;
          }
          this.verifymessagecolor = "success";
          this.checkresetstatus = false;
        } else {
          this.authform = "sendada";
          this.verifymessage = "Waiting to receive verification transaction";
          this.verifymessagecolor = "info";
          this.showclosebutton = false;
          this.showloginbutton = false;
        }
      }
    },
    claimAddress: function (address) {
      if (this.isSignedIn) {
        this.authform = "addnewaddressaccount";
        this.address = address;
        this.loginalertcolor = "success";
        this.loginalertmessage = null;
        this.authLoading = false;
        this.confirmcode = null;
        this.password = null;
        this.dialog = true;
      } else {
        this.authform = "createnewaddressaccount";
        this.address = address;
        this.loginalertcolor = "success";
        this.loginalertmessage = null;
        this.authLoading = false;
        this.confirmcode = null;
        this.password = null;
        this.dialog = true;
      }
    },
    toggleNetwork: function () {
      if (this.network == "Mainnet") {
        this.$store.commit("setNetwork", "Testnet1_25_1");
        window.location.reload();
      } else {
        this.$store.commit("setNetwork", "Mainnet");
        window.location.reload();
      }
    },
    login: function () {
      this.loginalertcolor = "success";
      this.loginalertmessage = null;
      this.authform = "signin";
      this.authLoading = false;
      this.confirmcode = null;
      this.password = null;
      this.emailaddress = null;
      this.dialog = true;
    },

    resetPassword: function () {
      this.confirmcode = null;
      this.authLoading = true;
      var self = this;
      this.axios({
        method: "post",
        url: "https://api.pooltool.io/v1/auth/forgotpassword",
        data: {
          address: this.address,
          password: this.password,
        },
        headers: {
          "x-api-key": "26969ceb-d2d0-46df-9813-852ed4bde2fe",
        },
      })
        .then(function (response) {
          if ("status" in response.data) {
            if (response.data.status == "verified") {
              self.verificationamount = numeral(
                response.data.paymentAmount / 1e6
              ).format("0,0.000000");
              self.verificationtoaddress = response.data.paymentToAddress;
              self.authform = "sendada";
              self.verifymessage = "Verification Transaction already sent";
              self.verifymessagecolor = "success";
              self.authLoading = false;
              self.checkresetstatus = false;
              self.showloginbutton = true;
              self.showclosebutton = false;
            } else {
              self.verificationamount = numeral(
                response.data.paymentAmount / 1e6
              ).format("0,0.000000");
              self.verificationtoaddress = response.data.paymentToAddress;
              self.authform = "sendada";
              self.verifymessage =
                "Waiting to receive verification transaction";
              self.verifymessagecolor = "success";
              self.authLoading = false;
              self.checkresetstatus = true;
              self.showloginbutton = false;
              self.showclosebutton = false;
            }
          } else {
            self.checkresetstatus = false;
            self.loginalertcolor = "error";
            self.loginalertmessage = "Something went wrong.  Please try again.";
            self.authLoading = false;
          }
        })
        .catch((error) => {
          console.log(error);
          if (error.response.status == 400) {
            //address already registered but not verified
            self.checkresetstatus = false;
            self.loginalertmessage = "Invalid Address or Password";
            self.loginalertcolor = "error";
            self.authLoading = false;
          } else if (error.response.status == 404) {
            self.checkresetstatus = false;
            self.loginalertcolor = "error";
            self.loginalertmessage =
              "There is no user registered with this address";
            self.authLoading = false;
          }
          console.log(error.response.status);
        });
    },
    enterConfirmCode: function () {
      this.authLoading = true;
    },
    sendConfirmationCode: function () {
      this.authLoading = true;
    },

    signUp: function () {
      this.authLoading = true;
      var self = this;
      //generate a new uuid
      if (this.isSignedIn) {
        this.verifyuserid = this.userId;
      } else {
        this.verifyuserid = uuidv4();
      }

      this.axios({
        method: "post",
        url: "https://api.pooltool.io/v1/verification/" + this.address,
        data: {
          userId: this.verifyuserid,
          password: this.password,
        },
        headers: {
          "x-api-key": "26969ceb-d2d0-46df-9813-852ed4bde2fe",
        },
      })
        .then(function (response) {
          if ("status" in response.data) {
            if (response.data.status == "verified") {
              console.log("verified");
              self.authform = "sendada";
              self.verifymessage = "Verified";
              if (self.isSignedIn) {
                self.showclosebutton = true;
                self.showloginbutton = false;
              } else {
                self.showloginbutton = true;
                self.showclosebutton = false;
              }

              self.verifymessagecolor = "info";

              self.authLoading = false;
              self.verificationtoaddress = "";
              self.checkverifystatus = false;
            } else {
              console.log("pending");
              self.verificationamount = numeral(
                response.data.paymentAmount / 1e6
              ).format("0,0.000000");
              self.verificationtoaddress = response.data.paymentToAddress;
              self.authform = "sendada";
              self.verifymessage =
                "Waiting to receive verification transaction";
              self.verifymessagecolor = "success";
              self.authLoading = false;
              self.checkverifystatus = true;
            }
          } else {
            self.checkverifystatus = false;
            self.loginalertcolor = "error";
            self.loginalertmessage = "Something went wrong.  Please try again.";
            self.authLoading = false;
          }
        })
        .catch((error) => {
          if (error.response.status == 422) {
            //address already registered but not verified
            self.authform = "alreadyverified";
            self.loginalertmessage = "This address has already been verified";
            self.loginalertcolor = "success";
            self.showloginbutton = true;
            self.authLoading = false;
            self.checkverifystatus = false;
          }
          if (error.response.status == 400) {
            //address already registered but not verified

            self.loginalertmessage = "This address is invalid";
            self.loginalertcolor = "error";

            self.authLoading = false;
            self.checkverifystatus = false;
          }
          console.log(error.response.status);
        });
    },
    addressSignOut: function () {
      firebase
        .auth()
        .signOut()
        .then(() => {
          // Sign-out successful.
        })
        .catch((error) => {
          console.log(error);
          // An error happened.
        });
    },
    addressSignIn: function () {
      var self = this;
      this.axios({
        method: "post",
        url: "https://api.pooltool.io/v1/auth/login",
        data: {
          address: this.address,
          password: this.password,
        },
        headers: {
          "x-api-key": "26969ceb-d2d0-46df-9813-852ed4bde2fe",
        },
      })
        .then(function (response) {
          self.showloginbutton = true;
          if ("token" in response.data) {
            firebase
              .auth()
              .signInWithCustomToken(response.data.token)
              .then(() => {
                self.dialog = false;
                self.loginalertcolor = "info";
                self.loginalertmessage = null;
                self.authLoading = false;
                self.password = null;
                self.confirmcode = null;
                self.checkverifystatus = false;
              })
              .catch((error) => {
                console.log(error);
                self.loginalertcolor = "error";
                self.loginalertmessage =
                  "Account not found or password incorrect.";
                self.authLoading = false;
                self.checkverifystatus = false;
              });
          } else {
            self.loginalertcolor = "error";
            self.loginalertmessage = "Account not found or password incorrect.";
            self.authLoading = false;
            self.checkverifystatus = false;
          }
        })
        .catch((error) => {
          if (error.response.status == 401) {
            //address already registered but not verified
            self.loginalertcolor = "error";
            self.loginalertmessage = "Account not found or password incorrect.";
            self.authLoading = false;
          } else if (error.response.status == 400) {
            self.loginalertcolor = "error";
            self.loginalertmessage = "Invalid Address or Password.";
            self.authLoading = false;
          }
          console.log(error.response.status);
        });
    },

    signIn: function () {
      this.authLoading = true;
    },

    reloadTranslations: function () {
      this.loadTranslations(this.$i18n.locale);
    },
    loadTranslations(locale) {
      console.log(locale);
      this.locale = locale;

      this.isLoading = true;
      setDocumentLang(locale);
      setDocumentDirectionPerLocale(locale);
      this.$i18n.locale = locale;
      db.ref(this.network + "/translations/en").once("value", (snapshot) => {
        this.$i18n.setLocaleMessage("en", snapshot.val());
        this.isLoading = false;
      });
      if (locale != "en") {
        db.ref(this.network + "/translations/" + locale).once(
          "value",
          (snapshot) => {
            this.$i18n.setLocaleMessage(locale, snapshot.val());
            this.isLoading = false;
          }
        );
      }
    },
    Loaded() {
      this.isLoaded = true;
    },
    onUnAuthenticated() {
      this.dialog = false;
      this.$store.commit("setUserId", null);
      this.$store.commit("setIsSignedIn", false);

      this.$store.dispatch("unbindUserData");
    },
    onAuthenticated(user) {
      this.$store.commit("setUserId", user.uid);
      this.$store.commit("setIsSignedIn", true);
      this.dialog = false;
      this.$store.dispatch("bindUserData");
    },
    reloadPoolToolNow: function () {
      window.location.reload();
    },

    togglePulseVisible: function (status) {
      if (status) {
        this.pulseVisible = status;
      } else {
        this.pulseVisible = !this.pulseVisible;
      }
      if (!this.pulseVisible) {
        this.pulseitem = null;
      }
    },
  },
  data() {
    return {
      notifications: 0,
      pulseitem: null,
      displayAdsModal: false,
      enableBlocks: true,
      showBlockIcons: true,
      windowWidth: window.innerWidth,
      showclosebutton: false,
      showloginbutton: false,
      verifyuserid: null,
      checkresetstatus: false,
      checkverifystatus: false,
      verificationamount: 0,
      verificationtoaddress: "",
      verifymessage: "",
      verifymessagecolor: "blue",

      reloadPoolTool: false,
      address: null,
      showNumberOne: true,
      notificationsSupported: false,
      showNotificationAlertBox: false,
      publicPath: process.env.BASE_URL,

      rules: {
        address: (value) => {
          const pattern = /^addr[a-z0-9]{99}|stake[a-z0-9]{54}$/gim;
          return pattern.test(value) || this.$t("app.InvalidAddress"); //'Invalid Address.'
        },
        required: (value) => !!value || this.$t("app.required"),
        password: (value) =>
          (value && value.length >= 8) || this.$t("app.Min8Characters"), //'Min 8 characters',
        //password: value => (value.length),
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || this.$t("app.InvalidEmail"); //'Invalid e-mail.'
        },
        confirmcode: (value) => {
          const pattern = /^[0-9]{6}$/;
          return pattern.test(value) || this.$t("app.InvalidCode"); //'Invalid code.'
        },
      },

      enableLogins: true,
      authLoading: false,
      confirmcode: null,
      loginalertcolor: "info",
      loginalertmessage: null,
      authform: "signin", //signin
      show1: false,
      password: null,
      emailaddress: null,
      dialog: false,

      counterdifference: 0,
      isLoading: true,

      isLoaded: false,
      loadTarget: 0,

      user: {},
      pulsedrawertimer: null,
      pulsedrawer: null,
      drawer: null,

      icons: {
        mdiThemeLightDark,
      },

      poollist: [],
      title: "Cardano PoolTool",
      translations: null,
      myUserId: myUserId.get(),

      pulseVisible: false,
    };
  },
};
</script>
<!--<style lang="scss">-->
<!--  @import "./styles/reset.scss";-->
<!--</style>-->
<style>
.nightmodesplash {
  display: table;
  width: 100%;
  height: 100vh;
  opacity: 1;
  background-color: rgb(33, 33, 33);
  border-color: rgb(33, 33, 33);
}

.daymodesplash {
  display: table;
  width: 100%;
  height: 100vh;
  opacity: 1;
  background-color: rgb(255, 255, 255);
  border-color: rgb(255, 255, 255);
}
</style>
<style lang="scss" scoped>
#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.pulseBlockVisible {
  margin-right: 50px;
  margin-bottom: 4px;
}

@media (max-width: 599px) {
  .v-application .v-main {
    padding-top: 56px !important;
  }
}
@media (min-width: 600px) {
  .v-application .v-main {
    padding-top: 0px !important;
  }
}
</style>