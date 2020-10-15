<template>
	<v-main>
		<v-row align="center" justify="center" class="fill-height">
			<v-col cols="12" sm="8" md="4">
				<v-card class="elevation-12">
					<!-- Top Bar -->
					<v-toolbar color="primary" dark flat>
						<v-toolbar-title>Recover Your Password.</v-toolbar-title>
						<v-spacer />

						<!-- Login ToolTip -->
						<v-tooltip right>
							<template v-slot:activator="{ on }">
								<v-btn icon large v-on="on">
									<v-icon>mdi-key</v-icon>
								</v-btn>
							</template>
							<span>Recover Your Password</span>
						</v-tooltip>
					</v-toolbar>

					<!-- Card Content -->
					<v-card-text>
						<!-- Recovery Form -->
						<v-form v-model="valid" ref="formRecovery">
							<!-- Password -->
							<v-text-field
								id="password"
								label="Password"
								name="password"
								prepend-icon="mdi-lock"
								:type="showPassword ? 'text' : 'password'"
								hint="Choose a secret password"
								maxlength="30"
								v-model="password"
								:rules="passwordRules"
								counter="30"
								:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
								@click:append="showPassword = !showPassword"
								clearable
							/>

							<!-- Confirm Password -->
							<v-text-field
								id="confirmPassword"
								label="Confirm Password"
								name="confirmPassword"
								hint="Re-enter the password"
								prepend-icon="mdi-refresh"
								:type="showConfirmPassword ? 'text' : 'password'"
								v-model="confirmPassword"
								:rules="confirmPasswordRules"
								maxlength="30"
								counter="30"
								clearable
								:append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
								@click:append="showConfirmPassword = !showConfirmPassword"
							/>
						</v-form>
					</v-card-text>
					<v-card-actions>
						<v-spacer />
						<v-btn color="primary" v-on:click="beginReset" class="ma-2">
							<v-icon left>mdi-key</v-icon>Reset Password
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-col>
		</v-row>
		<Dialog :config="dConfig" />
		<Loading :config="lConfig" v-if="isResetPending" />
	</v-main>
</template>

<script>
import Dialog from '@/components/Dialog.vue';
import Loading from '@/components/Loading.vue';

export default {
	name: 'Reset',
	data: (vm) => ({
		valid: false,
		password: 'Abc@1234',
		confirmPassword: 'Abc@1234',
		showPassword: false,
		showConfirmPassword: false,
		passwordRules: [
			(v) => v.length >= 8 || 'Password length must be greater than 8 characters',
			/* eslint-disable */
			(v) =>
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(v) ||
				'Password must contain a nummber, a lowercase alphabet and an uppercase alphabet',
			/* eslint-enable */
		],
		confirmPasswordRules: [(v) => v === vm.password || 'Passwords does not match'],
		isResetPending: false,
		dConfig: {},
		lConfig: {
			isPersistent: true,
			show: 'true',
			message: 'Please wait while we change your password!',
		},
	}),
	methods: {
		beginReset() {
			const url = new URL(window.location.href);
			const token = url.searchParams.get('token');
			const resetData = {
				action: 'resetPwdLong',
				value: {
					token,
					password: this.password,
				},
			};
			const { AuthManagement } = this.$FeathersVuex.api;
			const authRequest = new AuthManagement(resetData);
			authRequest
				.save()
				.then(() => {
					this.dConfig = {
						show: true,
						title: 'Sucess',
						message: 'Password changed successfully!',
						buttonText: 'Continue',
						isPersistent: true,
						redirect: '/login',
						type: 'info',
					};
				})
				.catch(() => {
					this.dConfig = {
						show: true,
						title: 'Error',
						message: 'Some error has occured while changing your password.',
						buttonText: 'OK',
						isPersistent: true,
						redirect: '/login',
						type: 'error',
					};
				});
		},
	},
	components: {
		Dialog,
		Loading,
	},
};
</script>
