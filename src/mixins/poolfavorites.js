import {
    preference
} from 'vue-preferences'
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
        },
    }
}