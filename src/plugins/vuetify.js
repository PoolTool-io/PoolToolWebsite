import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
		themes: {
			light: {
				primary: '#A0FE6A',
				secondary: '#070f28',
			},
			dark: {
			},
		},
	},
});
