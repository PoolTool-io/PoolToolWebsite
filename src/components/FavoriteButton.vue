<template>
<div>
<v-icon  :size="size" @click="$emit('fav-click')" :color="value">mdi-heart</v-icon>
</div>
</template>
<script>
export default {
    props: [
        'favorites','me','size'
    ],

    computed: {
        value: function() {
            if(this.me != '' && this.favorites.length && this.favorites.indexOf(this.me)!=-1) {
                return 'red'
            }else{
                return ''
            }
        }
    }
}
</script>
