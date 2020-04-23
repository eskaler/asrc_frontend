import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'app',
      component: App,
    },     
    {
      path: '/trends',
      name: 'trends-objects',
      component: () => import(/* webpackChunkName: "contacts" */ './components/TrendsObjects.vue'),
    },
    {
      path: '/trends/:objects+/graph',
      name: 'trends-graph',
      component: () => import(/* webpackChunkName: "contacts" */ './components/TrendsGraph.vue'),
    },
    {
      path: '/trends/:objects+/table',
      name: 'trends-table',
      component: () => import(/* webpackChunkName: "contacts" */ './components/TrendsTable.vue'),
    }   
  ]
})