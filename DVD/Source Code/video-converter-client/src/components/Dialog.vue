<template>
  <v-dialog
	v-model="config.show"
	:width="config.width || width"
	:persistent="config.isPersistent || isPersistent">
    <v-card>
      <v-card-title
		class="title lighten-1"
		primary-title :class="config.color || defaults.color">
		<v-icon left>{{config.icon || defaults.icon}}</v-icon>
        {{config.title || title}}
      </v-card-title>
      <v-card-text>
        <br />
        {{config.message || message}}
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
			:color="config.buttonColor || defaults.buttonColor"
			text
			@click="onClick()"
			:to="config.redirect === 'refresh' ? '' : config.redirect || redirect">
				{{config.buttonText || buttonText}}
			</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
	data: () => ({
		title: 'Dialog Title',
		show: false,
		width: 400,
		color: 'info',
		icon: 'mdi-alert-circle',
		message: 'Dialog Message',
		redirect: '',
		buttonText: 'OK',
		buttonColor: 'primary',
		isPersistent: false,
		type: 'info',
	}),
	computed: {
		defaults() {
			switch (this.config.type ? this.config.type.toLowerCase() : 'info') {
			case 'info':
				return {
					color: 'info',
					icon: 'mdi-information',
					buttonColor: 'info',
				};
			case 'error':
				return {
					color: 'error',
					icon: 'mdi-alert-circle',
					buttonColor: 'error',
				};
			default:
				return {};
			}
		},
	},
	methods: {
		onClick() {
			this.config.show = false;
			if (this.config.redirect === 'refresh') {
				this.$router.go();
			}
		},
	},
	props: [
		'config',
	],
};
</script>
