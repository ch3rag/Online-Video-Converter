<template>
	<v-main>
		<v-row align="center" justify="center" class="fill-height">
			<v-col cols="8" md="4">
				<v-carousel
					hide-delimiters
					:show-arrows="false"
					:value="carouselVal"
					height="500px"
					fluid
				>
					<!-- Login Carousel -->
					<v-carousel-item>
						<v-card class="elevation-12">
							<!-- Top Bar -->
							<v-toolbar color="primary" dark flat>
								<v-toolbar-title>Login to your account.</v-toolbar-title>
								<v-spacer />

								<!-- Login ToolTip -->
								<v-tooltip right>
									<template v-slot:activator="{ on }">
										<v-btn icon large v-on="on">
											<v-icon>mdi-login</v-icon>
										</v-btn>
									</template>
									<span>Login</span>
								</v-tooltip>
							</v-toolbar>

							<!-- Card Content -->
							<v-card-text>
								<!-- Login Form -->
								<v-form v-model="valid" ref="form">
									<!-- Email -->
									<v-text-field
										label="Email"
										name="email"
										prepend-icon="mdi-email"
										type="email"
										hint="Your existing email"
										v-model="user.email"
										maxlength="30"
										counter="30"
										clearable
										:rules="emailRules"
									/>

									<!-- Password -->
									<v-text-field
										id="password"
										label="Password"
										name="password"
										prepend-icon="mdi-lock"
										:type="showPassword ? 'text' : 'password'"
										hint="Choose a secret password"
										maxlength="30"
										v-model="user.password"
										:rules="notEmptyRules"
										counter="30"
										:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
										@click:append="showPassword = !showPassword"
										clearable
									/>
								</v-form>
							</v-card-text>
							<v-card-actions>
								<v-spacer />
								<v-btn color="error" class="ma-2" v-on:click="setCarouselVal(1)">
									Forgot Password?
								</v-btn>
								<v-btn color="primary" class="ma-2" v-on:click="login">
									<v-icon left>mdi-login</v-icon>Login
								</v-btn>
							</v-card-actions>
						</v-card>
					</v-carousel-item>
					<!-- Forgot Password Carousel -->
					<v-carousel-item>
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
								<!-- Login Form -->
								<v-form v-model="valid" ref="formRecovery">
									<!-- Email -->
									<v-text-field
										label="Email"
										name="email"
										prepend-icon="mdi-email"
										type="email"
										hint="Your existing email"
										v-model="user.email"
										maxlength="30"
										counter="30"
										clearable
										:rules="emailRules"
									/>
								</v-form>
							</v-card-text>
							<v-card-actions>
								<v-btn color="error" class="ma-2" v-on:click="setCarouselVal(0)">
									<v-icon size="30" left> mdi-keyboard-backspace </v-icon>
								</v-btn>
								<v-spacer />
								<v-btn color="primary" class="ma-2" v-on:click="sendResetMail">
									<v-icon left>mdi-mail</v-icon>Send Reset Mail
								</v-btn>
							</v-card-actions>
						</v-card>
					</v-carousel-item>
				</v-carousel>
				<Dialog :config="dConfig" />
				<Loading :config="lConfig" v-if="isAuthenticatePending" />
			</v-col>
		</v-row>
	</v-main>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Dialog from '@/components/Dialog.vue';
import Loading from '@/components/Loading.vue';

export default {
	name: 'Login',
	data: () => ({
		carouselVal: 0,
		dConfig: {},
		lConfig: {
			isPersistent: true,
			show: 'true',
			message: 'Loggin in...',
		},
		user: {
			email: '',
			password: '',
		},
		showPassword: false,
		valid: false,
		notEmptyRules: [(v) => v.length > 0 || 'Field cannot be empty'],
		emailRules: [(v) => /.+@.+/.test(v) || 'E-mail must be valid'],
	}),
	props: {
		source: String,
	},
	components: {
		Dialog,
		Loading,
	},
	methods: {
		sendResetMail() {
			const { AuthManagement } = this.$FeathersVuex.api;
			const data = {
				action: 'sendResetPwd',
				value: {
					email: this.user.email,
				},
			};
			const authRequest = new AuthManagement(data);
			authRequest
				.save()
				.then(() => {
					this.dConfig = {
						show: true,
						type: 'info',
						title: 'Sucess',
						message: 'Please check your email for a password reset link!',
						isPersistent: true,
						redirect: '/login',
					};
					this.carouselVal = 0;
				})
				.catch(() => {
					this.dConfig = {
						show: true,
						title: 'An error occured',
						message: 'Please check your email.',
						buttonText: 'Retry',
						isPersistent: true,
						type: 'error',
					};
				});
		},
		setCarouselVal(val) {
			this.carouselVal = val;
		},
		login() {
			if (this.$refs.form.validate()) {
				this.authenticate({
					strategy: 'local',
					...this.user,
				})
					.then((data) => {
						if (data.user.isVerified === false) {
							const er = new Error();
							er.code = 400;
							throw er;
						}
						this.dConfig = {
							show: true,
							type: 'info',
							title: 'Sucess',
							message: 'Sucessfully logged in!',
							isPersistent: true,
							redirect: '/videos',
						};
					})
					.catch((error) => {
						if (error.code === 401) {
							this.dConfig = {
								show: true,
								title: 'An error occured',
								message: 'User not found. Please check your email and password.',
								buttonText: 'Retry',
								isPersistent: true,
								type: 'error',
							};
						} else if (error.code === 403) {
							this.dConfig = {
								show: true,
								title: 'An error occured',
								message:
									'It looks like your email is not verified yet. Please verify your email in order to continue.',
								buttonText: 'Retry',
								isPersistent: true,
								type: 'error',
							};
							this.logout();
						} else {
							this.dConfig = {
								show: true,
								title: 'An error occured',
								message: 'Unknown server error has occured.',
								buttonText: 'Retry',
								isPersistent: true,
								type: 'error',
							};
							this.logout();
						}
					});
			}
		},
		...mapActions('auth', ['authenticate', 'logout']),
	},
	computed: {
		...mapState('auth', ['isAuthenticatePending']),
	},
};
</script>

          :to="config.redirect === 'refresh' ? '' : config.redirect || redirect"
