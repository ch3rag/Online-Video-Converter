<template>
	<v-app>
		<TitleBar v-if="isElectron" />

		<!-- Navigation Drawer -->
		<v-navigation-drawer
			v-model="drawer"
			app
			clipped
			hide-overlay
			v-bind:style="{ marginTop: isElectron ? '35px' : 0 }"
		>
			<!-- List View If Not Logged In -->
			<v-list v-if="!isAuthenticated">
				<!-- Login -->
				<v-list-item link to="/login">
					<v-list-item-action>
						<v-icon>mdi-login</v-icon>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>Login</v-list-item-title>
					</v-list-item-content>
				</v-list-item>

				<!-- Sign Up -->
				<v-list-item link to="/signup">
					<v-list-item-action>
						<v-icon>mdi-account</v-icon>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>Sign Up</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>

			<!-- List View If Logged In -->
			<v-list v-if="isAuthenticated">
				<!-- Profile -->
				<v-list-item link to="/account">
					<v-list-item-action>
						<v-icon>mdi-face-profile</v-icon>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>Account</v-list-item-title>
					</v-list-item-content>
				</v-list-item>

				<!-- Converted Files -->
				<v-list-item link to="/videos">
					<v-list-item-action>
						<v-icon>mdi-video</v-icon>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>My Videos</v-list-item-title>
					</v-list-item-content>
				</v-list-item>

				<!-- Converted Files -->
				<v-list-item link to="/conversionhistory">
					<v-list-item-action>
						<v-icon>mdi-history</v-icon>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>Conversion History</v-list-item-title>
					</v-list-item-content>
				</v-list-item>

				<!-- Log Out -->
				<v-list-item v-on:click="logOut">
					<v-list-item-action>
						<v-icon>mdi-logout</v-icon>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>Log Out</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>

		<!-- NavBar -->
		<v-app-bar app clipped-left v-bind:style="{ marginTop: isElectron ? '35px' : 0 }">
			<v-app-bar-nav-icon @click.stop="drawer = !drawer" />
			<v-toolbar-title>Online Video Converter</v-toolbar-title>
		</v-app-bar>

		<!-- Views Injection -->
		<transition name="fade" mode="out-in">
			<router-view v-bind:style="{ marginTop: isElectron ? '35px' : 0 }" />
		</transition>

		<!-- Footer -->
		<v-footer app>
			<span>&copy; 2020 Created By Bharat Singh Rajput</span>
		</v-footer>
	</v-app>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import TitleBar from './components/TitleBar.vue';

export default {
	name: 'app',
	props: {
		source: String,
	},
	data: () => ({
		drawer: null,
	}),
	created() {
		this.$vuetify.theme.dark = true;
	},
	computed: {
		...mapGetters('auth', ['isAuthenticated']),
		isElectron: () => process.env.IS_ELECTRON,
	},
	methods: {
		...mapActions('auth', ['logout']),
		logOut() {
			this.logout()
				.then(() => {
					this.$router.push('/login');
					this.$router.go();
				})
				.catch(() => {
					this.$router.push('/login');
					this.$router.go();
				});
		},
	},
	components: {
		TitleBar,
	},
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition-duration: 0.3s;
	transition-property: opacity;
	transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
	opacity: 0;
}

.offset-y {
	margin-top: 35px;
}
</style>
