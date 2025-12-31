<template>
  <div>
    <v-btn
      outlined
      block
      class="my-0"
      :dark="nightmode"
      @click="expand = !expand"
    >
      PoolTool Drep Platform
    </v-btn>
    <v-card
      style="position: absolute; z-index: 100"
      :dark="nightmode"
      v-show="expand"
      class="mx-auto mb-2 pooltoolbot"
      outlined
      raised
    >
      <v-card-text>
        <v-container v-show="expand" fluid>
          <h2 class="white--text text-center mb-2">Platform</h2>
          <p>
            As a DRep for the Cardano ecosystem, I believe in a balance of
            innovation and financial prudence to ensure the long-term success of
            Cardano. My focus is on driving adoption, supporting developers, and
            maintaining the core principles that make Cardano a unique and
            sustainable blockchain platform. I will advocate for:
          </p>

          <ul>
            <li>
              <strong>Financial Conservatism</strong><br />
              I am committed to preserving the integrity of ADA by opposing any
              efforts to burn or increase its supply. A fixed supply ensures
              long-term value and security for ADA holders and strengthens the
              foundation of the Cardano economy.
            </li>
            <li>
              <strong>Platform Adoption & Developer Empowerment</strong><br />
              I prioritize the growth of the Cardano ecosystem through tools,
              resources, and partnerships that simplify development and attract
              a wide range of developers. By creating strong relationships and
              fostering innovation, we can push for wider adoption of Cardano,
              making it the go-to blockchain for businesses and individuals.
            </li>
            <li>
              <strong>Scalability & User Experience</strong><br />
              Enhancing Cardano’s Layer 1 scalability and improving user
              experience are essential to making the platform more accessible. I
              will support initiatives that simplify onboarding, streamline
              interactions, and improve transaction efficiency.
            </li>
            <li>
              <strong>VC Collaboration with Purpose</strong><br />
              I believe in the value that Venture Capital (VC) can bring to
              Cardano, but only when aligned with the right motives. VC
              involvement must prioritize genuine development, partnerships, and
              relationships that help grow the ecosystem, not undermine its
              values.
            </li>
            <li>
              <strong>Sustainability & Long-term Vision</strong><br />
              Cardano’s future is built on long-term sustainability. I will
              support projects, developers, and organizations with proven track
              records of delivery and consistency. Their ongoing contributions
              to the ecosystem are crucial for ensuring that Cardano continues
              to grow while maintaining its decentralized nature.
            </li>
          </ul>

          <h2 class="white--text text-center mt-8 mb-2">Mission Statement</h2>
          <p>
            As a Cardano DRep, my mission is to ensure that the network remains
            a dominant, competitive, and decentralized platform while fostering
            innovation and financial integrity. I believe in adopting a
            pragmatic approach that encourages the widespread use of Cardano
            through strong developer tooling, meaningful partnerships, and a
            commitment to economic growth. My goal is to drive forward
            initiatives that enable Cardano’s evolution, while safeguarding the
            core principles of financial sovereignty and sustainability that it
            was built upon. Together, we can create a future where Cardano is
            not just a leader in blockchain technology but a driver of
            real-world economic prosperity.
          </p>
        </v-container>

        <h2 class="white--text text-center mb-2">Delegate</h2>
        <p class="white--text text-center">
          You can delegate your ADA to PoolTool Drep by using the drep id below
          in popular wallets:
        </p>
        <p class="text-center text-h6">
          <strong>dRep ID:</strong> {{ drepid | ellipsiscrypto(24) }}
          <v-btn text x-small icon v-clipboard="drepid" class="pa-0 ma-0">
            <v-icon x-small class="pa-0 ma-0">mdi-content-copy</v-icon>
          </v-btn>
        </p>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn text @click="expand = !expand">{{ $t("global.close") }}</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    expand: false,
    drepid: "drep1wwmwukesapdkwzqycnfmtlva4hxdgmvuudxpczv88ujewk5tgkt",
  }),
  props: ["nightmode"],
  methods: {},
};
</script>
