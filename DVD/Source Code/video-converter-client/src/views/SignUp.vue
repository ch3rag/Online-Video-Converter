<template>
	<v-main>
		<v-row align="center" justify="center" class="fill-height">
			<v-col cols="12" sm="8" md="4">
				<v-card class="elevation-12">
					<!-- Top Bar -->
					<v-toolbar color="primary" dark flat>
						<v-toolbar-title>Create a new account.</v-toolbar-title>
						<v-spacer />

						<!-- Login ToolTip -->
						<v-tooltip right>
							<template v-slot:activator="{ on }">
								<v-btn icon large v-on="on">
									<v-icon>mdi-account</v-icon>
								</v-btn>
							</template>
							<span>Sign Up</span>
						</v-tooltip>
					</v-toolbar>

					<!-- Card Content -->
					<v-card-text>
						<v-row justify="space-around">
							<v-avatar color="indigo" size="150">
								<v-icon size="100" dark v-if="user.avatar === ''"
									>mdi-account-circle</v-icon
								>
								<img :src="user.avatar" v-if="user.avatar !== ''" />
							</v-avatar>
						</v-row>

						<!-- Sign Form -->
						<v-form v-model="valid" ref="form">
							<!-- Display Name -->
							<v-text-field
								label="Name"
								name="name"
								prepend-icon="mdi-face-profile"
								clearable
								counter="30"
								:rules="notEmptyRules"
								v-model="user.displayName"
								hint="Your friendly name"
								maxlength="30"
								type="text"
							/>

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
								v-model="user.confirmPassword"
								:rules="confirmPasswordRules"
								maxlength="30"
								counter="30"
								clearable
								:append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
								@click:append="showConfirmPassword = !showConfirmPassword"
							/>

							<!-- Date Of Birth -->
							<v-menu
								ref="menu"
								v-model="menu"
								:close-on-content-click="false"
								:return-value.sync="user.dob"
								transition="scale-transition"
								offset-y
								min-width="290px"
							>
								<template v-slot:activator="{ on }">
									<v-text-field
										v-model="user.dob"
										label="Date Of Birth"
										prepend-icon="mdi-calendar"
										readonly
										v-on="on"
									></v-text-field>
								</template>
								<v-date-picker v-model="user.dob" no-title scrollable>
									<v-spacer></v-spacer>
									<v-btn text color="primary" @click="$refs.menu.save(user.dob)"
										>OK</v-btn
									>
								</v-date-picker>
							</v-menu>

							<!-- Avatar -->
							<v-file-input
								:rules="avatarRules"
								accept="image/png, image/jpeg, image/bmp"
								placeholder="Pick an avatar"
								prepend-icon="mdi-camera"
								label="Avatar"
								v-model="avatarFile"
								v-on:change="onFilePicked"
							></v-file-input>
						</v-form>
					</v-card-text>

					<v-card-actions>
						<v-spacer />
						<v-btn color="primary" v-on:click="validate" class="ma-2">
							<v-icon left>mdi-account-plus-outline</v-icon>Sign Up
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-col>
		</v-row>
		<Dialog :config="dConfig" />
		<Loading :config="lConfig" v-if="isCreatePending" />
	</v-main>
</template>

<script>
import Dialog from '@/components/Dialog.vue';
import Loading from '@/components/Loading.vue';
import { mapState } from 'vuex';

export default {
	name: 'SignUp',
	data: (vm) => ({
		dConfig: {},
		lConfig: {
			isPersistent: true,
			show: 'true',
			message: 'Signing you up!',
		},
		valid: false,
		avatarFile: null,
		user: {
			displayName: '',
			email: '',
			password: '',
			confirmPassword: '',
			dob: new Date().toISOString().substr(0, 10),
			avatar: '',
		},
		showPassword: false,
		showConfirmPassword: false,
		menu: false,
		avatarRules: [
			(v) => !!v || 'Please choose an avatar',
			(v) => !v || v.size < 2000000 || 'Avatar size should be less than 2 MB!',
		],
		notEmptyRules: [(v) => v.length > 0 || 'Field cannot be empty'],
		emailRules: [(v) => /.+@.+/.test(v) || 'E-mail must be valid'],
		passwordRules: [
			(v) => v.length >= 8 || 'Password length must be greater than 8 characters',
			/* eslint-disable */
			(v) =>
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(v) ||
				'Password must contain a nummber, a lowercase alphabet and an uppercase alphabet',
			/* eslint-enable */
		],
		confirmPasswordRules: [(v) => v === vm.user.password || 'Passwords does not match'],
	}),
	props: {
		source: String,
	},
	methods: {
		validate() {
			if (this.$refs.form.validate()) {
				const { User } = this.$FeathersVuex.api;
				const newUser = new User(this.user);
				newUser
					.save()
					.then(() => {
						this.dConfig = {
							show: true,
							title: 'Sucess',
							message:
								'Sign up sucessful! Please Check Your Email For The Verification Link.',
							buttonText: 'Log In',
							isPersistent: true,
							redirect: '/login',
							type: 'info',
						};
					})
					.catch((error) => {
						if (error.code === 409) {
							this.dConfig = {
								show: true,
								title: 'An error occured',
								message: 'An account with the same e-mail already exists.',
								isPersistent: true,
								type: 'error',
							};
						} else {
							this.dConfig = {
								show: true,
								title: 'An error occured',
								message: 'A server error has occured.',
								isPersistent: true,
								type: 'error',
							};
						}
					});
			}
		},
		onFilePicked(file) {
			if (file) {
				const fileReader = new FileReader();
				fileReader.addEventListener('load', () => {
					this.user.avatar = fileReader.result;
				});
				fileReader.readAsDataURL(file);
			} else {
				this.user.avatar = '';
			}
		},
	},
	components: {
		Dialog,
		Loading,
	},
	computed: {
		...mapState('users', ['isCreatePending']),
	},
};
</script>
