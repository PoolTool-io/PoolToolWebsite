import {
    preference
} from 'vue-preferences'
import { addFavorite, removeFavorite } from '@/services/api'

const favoritepools = preference('fav_mainnet_pools', {
    defaultValue: []
})
export default {
    data() {
        return {
            favorites: favoritepools.get(),
        }
    },
    methods: {
        togglefavorite: function (poolid) {
            var indx = this.favorites.indexOf(poolid)
            if (indx == -1) {
                this.favorites.push(poolid)
            } else {
                this.favorites.splice(indx, 1);
            }
            favoritepools.set(this.favorites)

            const userId = this.$store && this.$store.state.userId;
            if (userId) {
                (indx == -1 ? addFavorite(userId, poolid) : removeFavorite(userId, poolid))
                    .catch(e => console.warn('Failed to sync pool favorite', e));
            }
        },
    }
}
