<template>
  <v-card
    dark
    class="promotion-card mb-2 ml-1"
    color="transparent"
    elevation="0"
    style="
      height: 100%;
      background-color: rgba(13, 72, 160, 0.75);
      border-color: rgba(13, 72, 160, 0.75);
    "
  >
    <div
      class=""
      :style="{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.9), rgba(0,0,0,.7)), url(${backgroundImage})`,
      }"
    >
      <v-card-title class="headline text-center white--text">
        MarloweHub Catalyst Proposal
      </v-card-title>
      <v-card-subtitle class="text-center white--text">
        Our goal is to drive more utility on Cardano by making smart contracts
        Dead, Simple, Easy. So even your lawyer could do it....
      </v-card-subtitle>
      <v-card-actions class="justify-center">
        <v-btn
          small
          href="https://cardano.ideascale.com/c/idea/106387"
          target="_blank"
        >
          View Proposal
        </v-btn>
      </v-card-actions>
    </div>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      backgroundImage: "marlowehubbig.png", // Replace with your background image path
      catalystProposalLink: "https://link-to-catalyst-proposal.com", // Replace with your catalyst proposal link
    };
  },
};
</script>

<style>
.promotion-card {
  border-radius: 10px;
  overflow: hidden;
}

.background-image {
  background-size: cover;
  background-position: center;
  padding: 0px;
  background-repeat: no-repeat;
  color: white;
  position: relative;
}
</style>
