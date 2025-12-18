import Home from '../views/Home.vue'
import Recharge from '../views/Recharge.vue'
import Withdraw from '../views/Withdraw.vue'
import Me from '../views/Me.vue'
import Settings from '../views/Settings.vue'
import Bill from '../views/Bill.vue'
import WithdrawPassword from '../views/WithdrawPassword.vue'

const routes = [
  { path: '/', name: 'Home', component: Home},
  { path: '/home', redirect: '/'},
  { path: '/recharge', name: 'Recharge', component: Recharge },
  { path: '/bill', name: 'Bill', component: Bill },
  { path: '/withdraw', name: 'Withdraw', component: Withdraw },
  { path: '/me', name: 'Me', component: Me },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/withdraw-password', name: 'WithdrawPassword', component: WithdrawPassword },
]

export default routes
