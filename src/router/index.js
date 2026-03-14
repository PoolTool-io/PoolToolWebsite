import Vue from 'vue'
import VueRouter from 'vue-router'
let { bech32 } = require('bech32')
const Buffer = require('buffer/').Buffer

Vue.use(VueRouter)

function bechToHex(addr) {
  try {
    const decoded = bech32.decode(addr, 256)
    return Buffer.from(bech32.fromWords(decoded.words)).toString('hex').slice(2)
  } catch (e) {
    return null
  }
}

const routes = [
  { path: '/', name: 'Home', component: () => import(/* webpackChunkName: "home" */ '../pages/HomePage.vue') },
  { path: '/mobile', name: 'Mobile', component: () => import(/* webpackChunkName: "announce" */ '../pages/MobilePage.vue') },
  { path: '/pools', name: 'Pools', component: () => import(/* webpackChunkName: "pools" */ '../pages/PoolsPage.vue') },
  {
    path: '/pool/:poolid', name: 'pool', component: () => import(/* webpackChunkName: "poolpage" */ '../pages/PoolPage/PoolPage.vue'),
    children: [
     { path: 'epochs', name: 'poolepochs', component: () => import(/* webpackChunkName: "poolpage" */ '../pages/PoolPage/PoolPageHistory.vue') },
     { path: 'manage', name: 'poolmanagement', component: () => import(/* webpackChunkName: "poolpage" */ '../pages/PoolPage/PoolManage.vue') },
     { path: 'admin', name: 'pooladmin', component: () => import(/* webpackChunkName: "poolpage" */ '../pages/PoolPage/PoolAdmin.vue') },
     { path: 'blocks', name: 'poolblocks', component: () => import(/* webpackChunkName: "poolpage" */ '../pages/PoolPage/PoolBlocks.vue') },
     { path: 'orphans', name: 'poolorphans', component: () => import(/* webpackChunkName: "poolpage" */ '../pages/PoolPage/PoolOrphans.vue') },
     { path: 'curve', name: 'curve', component: () => import(/* webpackChunkName: "poolpage" */ '../pages/PoolPage/SaturationCurve.vue') },
     { path: 'metrics', name: 'poolmetrics', component: () => import(/* webpackChunkName: "poolpage" */ '../pages/PoolPage/PoolMetrics.vue') },
      { path: 'awards', name: 'awards', component: () => import(/* webpackChunkName: "poolpage" */ '../pages/PoolPage/PoolAwards.vue') },
    ],
  },
  
  { path: '/privacy', component: () => import(/* webpackChunkName: "termsandprivacy" */ '../pages/PrivacyPage.vue') },
  { path: '/terms', component: () => import(/* webpackChunkName: "termsandprivacy" */ '../pages/TermsPage.vue') },
  {
    path: '/address/:address',
    name: 'address',
    component: () => import(/* webpackChunkName: "address" */ '../pages/AddressDetail.vue'),
    beforeEnter(to, from, next) {
      const addr = to.params.address
      if (addr && addr.startsWith('stake')) {
        const hex = bechToHex(addr)
        if (hex && hex.length === 56) {
          next({ path: `/address/${hex}`, replace: true })
          return
        }
      }
      next()
    }
  },
  {
    path: '/realtime',
    name: 'RecentBlocks',
    component: () => import(/* webpackChunkName: "recentblocks" */ '../pages/RecentBlocks.vue')
  },
  {
    path: '/realtime/:height([0-9]*)',
    name: 'recentBlocksHeight',
    component: () => import(/* webpackChunkName: "recentblocks" */ '../pages/RecentBlocks.vue')
  },
  {
    path: '/networkhealth',
    name: 'NetworkHealth',
    component: () => import(/* webpackChunkName: "networkhealth" */ '../pages/NetworkHealth.vue')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../pages/AboutPage.vue')
  },
  { path: '/translation', component: () => import(/* webpackChunkName: "translations" */ '../pages/TranslationPage.vue') },
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ '../pages/AdminPage.vue')
  },
  // {
  //   path: '/analysis',
  //   name: 'Analysis',
  //   component: () => import(/* webpackChunkName: "analysis" */ '../pages/LiveAnalysis.vue')
  // },
  // {
  //   path: '/analytics',
  //   name: 'analytics',
  //   component: () => import(/* webpackChunkName: "analysis" */ '../pages/LiveAnalytics.vue')
  // },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
