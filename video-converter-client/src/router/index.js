import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '@/views/Login.vue';
import SignUp from '@/views/SignUp.vue';
import Videos from '@/views/Videos.vue';
import Account from '@/views/Account.vue';
import Verify from '@/views/Verify.vue';
import Reset from '@/views/Reset.vue';
import ConversionHistory from '@/views/ConversionHistory.vue';
import Store from '@/store/index';

Vue.use(VueRouter);

const routes = [
	{
		path: '/',
		name: 'home',
		beforeEnter(to, from, next) {
			Store.dispatch('auth/authenticate').then(() => {
				next('/videos');
			}).catch(() => {
				next('/login');
			});
		},
	},
	{
		path: '/verify',
		name: 'verify',
		component: Verify,
	},
	{
		path: '/reset',
		name: 'reset',
		component: Reset,
	},
	{
		path: '/signup',
		name: 'signup',
		component: SignUp,
		beforeEnter(to, from, next) {
			Store.dispatch('auth/authenticate').then(() => {
				next('/videos');
			}).catch(() => {
				next();
			});
		},
	},
	{
		path: '/login',
		name: 'login',
		component: Login,
		beforeEnter(to, from, next) {
			Store.dispatch('auth/authenticate').then(() => {
				next('/videos');
			}).catch(() => {
				next();
			});
		},
	},
	{
		path: '/videos',
		name: 'videos',
		component: Videos,
		beforeEnter(to, from, next) {
			if (!Store.getters['auth/isAuthenticated']) {
				Store.dispatch('auth/authenticate').then(() => {
					next();
				}).catch(() => {
					next('/login');
				});
			} else {
				next();
			}
		},
	},
	{
		path: '/account',
		name: 'account',
		component: Account,
		beforeEnter(to, from, next) {
			Store.dispatch('auth/authenticate').then(() => {
				next();
			}).catch(() => {
				next('/login');
			});
		},
	},
	{
		path: '/conversionhistory',
		name: 'conversionhistory',
		component: ConversionHistory,
		beforeEnter(to, from, next) {
			Store.dispatch('auth/authenticate').then(() => {
				next();
			}).catch(() => {
				next('/login');
			});
		},
	},
];

const router = new VueRouter({
	routes,
	mode: 'history',
});

export default router;
