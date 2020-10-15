<template>
	<div class="menubar">
		<img src="@/assets/logo.png" class="mx-2" width="20px" style="filter: invert(100%)"/>
		<span>Online Video Converter</span>
		<div class="menubar-end d-flex flex-row align-center">
			<span class="menubar-button" id="menu-minimize"
			v-on:click="currentWindow.minimize()">
			<v-icon>mdi-window-minimize</v-icon>
			</span>
			<span class="menubar-button" v-on:click="maximizeWindow()" v-if="!windowMaximized">
				<v-icon>mdi-window-maximize</v-icon>
			</span>
			<span class="menubar-button" v-on:click="unmaximizeWindow()" v-if="windowMaximized">
				<b-icon pack="fas" icon="window-restore" />
				<v-icon>mdi-window-restore</v-icon>
			</span>
			<span class="menubar-button" v-on:click="currentWindow.close()">
				<v-icon>mdi-window-close</v-icon>
			</span>
		</div>
	</div>
</template>

<script>
// eslint-disable-next-line
const electron = window.require ? window.require('electron') : null;

export default {
	name: 'TitleBar',
	data: () => ({
		currentWindow: electron.remote.getCurrentWindow(),
		windowMaximized: false,
	}),
	methods: {
		maximizeWindow() {
			if (this.currentWindow.isMaximizable) {
				this.currentWindow.maximize();
				this.windowMaximized = true;
			}
		},

		unmaximizeWindow() {
			if (this.currentWindow.isMaximized()) {
				this.currentWindow.unmaximize();
				this.windowMaximized = false;
			}
		},
	},
};
</script>

<style scoped lang="scss">
.menubar {
	height: 35px;
	background: rgb(37, 37, 38);
	display: flex;
	align-items: center;
	position: fixed;
	top: 0;
	z-index: 100;
	width: 100%;
	-webkit-user-select: none;
	-webkit-app-region: drag;
}

.menubar-end {
	margin-left: auto;
}

.menubar-button {
	height: 35px;
	padding: 0px 20px;
	display: inline-flex;
	align-items: center;
	transition-duration: 0.5s;
	-webkit-app-region: no-drag;
}

.menubar-button:hover {
	background: rgb(18, 18, 18);
	color: white;
}
</style>
