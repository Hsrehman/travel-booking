import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import FlightResultsPage from '../pages/FlightResultsPage.vue'
import SearchModificationTestPage from '../pages/SearchModificationTestPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/flights',
      name: 'flight-results',
      component: FlightResultsPage,
      props: route => ({
        searchParams: route.query
      })
    },
    {
      path: '/test-search-modification',
      name: 'test-search-modification',
      component: SearchModificationTestPage
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
