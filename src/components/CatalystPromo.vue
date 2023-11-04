<template>
  <v-row dense align="stretch">
    <v-col cols="12" xs="12" sm="12" md="6">
      <v-card
        dark
        class="promotion-card"
        color="transparent"
        elevation="0"
        style="
          height: 100%;
          background-color: rgba(13, 72, 160, 0.75);
          border-color: rgba(13, 72, 160, 0.75);
        "
      >
        <div
          class="background-image"
          :style="{
            backgroundImage: ` linear-gradient(to bottom, rgba(13, 72, 160,.9), rgba(13, 72, 160,.3)), url(${backgroundImage})`,
          }"
        >
          <v-card-title class="headline text-center white--text">
            Pooltool Catalyst Proposal
          </v-card-title>
          <v-card-subtitle class="text-center white--text">
            This proposal is not merely about sustaining PoolTool.io, It's about
            democratizing it, making it a truly community-owned asset.
          </v-card-subtitle>
          <v-card-actions class="justify-center">
            <v-btn
              class="primary--text"
              small
              href="https://cardano.ideascale.com/c/idea/105998"
              target="_blank"
            >
              <span class="hidden-sm-and-down">Catalyst&nbsp;</span>Proposal
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" xs="12" sm="12" md="6">
      <v-card
        dark
        class="promotion-card"
        color="transparent"
        elevation="0"
        style="
          height: 100%;
          background-color: rgba(13, 72, 160, 0.75);
          border-color: rgba(13, 72, 160, 0.75);
        "
      >
        <div
          class="background-image"
          :style="{
            backgroundImage: `linear-gradient(to bottom, rgba(13, 72, 160,.9), rgba(13, 72, 160,.3)), url(${backgroundImage2})`,
            height: `100%;`,
          }"
        >
          <v-card-title class="headline text-center white--text">
            MarloweHub Catalyst Proposal
          </v-card-title>
          <v-card-subtitle class="text-center white--text">
            Our goal is to drive more utility on Cardano by making smart
            contracts Dead, Simple, Easy. So even your lawyer could do it....
          </v-card-subtitle>
          <v-card-actions class="justify-center">
            <v-btn
              class="primary--text"
              small
              href="https://cardano.ideascale.com/c/idea/106387"
              target="_blank"
            >
              <span class="hidden-sm-and-down">Catalyst&nbsp;</span>Proposal
            </v-btn>
            <v-btn
              class="primary--text"
              small
              href="https://www.marlowehub.io"
              target="_blank"
            >
              <span class="hidden-sm-and-down">Prototype&nbsp;</span>Website
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      backgroundImage2: "marlowehubbig.png", // Replace with your background image path
      backgroundImage: "pooltool_logo_white_background.jpg", // Replace with your background image path
    };
  },
};
</script>

<style>
.promotion-card {
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
}

.background-image {
  background-size: cover;
  background-position: center;
  padding: 0px;
  background-repeat: no-repeat;
  color: white;
  height: 100%;
  position: relative;
}
</style>
