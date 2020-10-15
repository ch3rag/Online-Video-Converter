<template>
	<v-main>
		<v-row align="center" justify="center" class="fill-height">
			<v-col cols="8" md="4">
				<v-carousel
					hide-delimiters
					:show-arrows="false"
					:value="carouselVal"
					height="50%"
					fluid
				>
					<v-carousel-item>
						<v-card>
							<v-toolbar color="primary" dark>
								<v-toolbar-title class="white--text">My Account</v-toolbar-title>
								<v-spacer></v-spacer>
								<v-tooltip right>
									<template v-slot:activator="{ on }">
										<v-btn icon large v-on="on">
											<v-icon>mdi-account</v-icon>
										</v-btn>
									</template>
									<span>My Account</span>
								</v-tooltip>
							</v-toolbar>
							<v-row justify="space-around" class="mt-4">
								<v-avatar size="150">
									<img :src="user.avatar" position="top" />
								</v-avatar>
							</v-row>
							<v-row justify="space-around" class="mt-2">
								<h2>{{ user.displayName }}</h2>
							</v-row>
							<v-row>
								<v-spacer />
								<v-col cols="12" md="10">
									<v-simple-table class="ma-5">
										<tbody>
											<tr>
												<td>Display Name</td>
												<td>{{ user.displayName }}</td>
											</tr>
											<tr>
												<td>Email</td>
												<td>{{ user.email }}</td>
											</tr>
											<tr>
												<td>Date Of Birth</td>
												<td>
													{{
														new Date(user.dob)
															.toUTCString()
															.split(' ')
															.slice(0, 4)
															.join(' ')
													}}
												</td>
											</tr>
											<tr>
												<td>Date Of Joining</td>
												<td>
													{{
														new Date(user.createdAt)
															.toUTCString()
															.split(' ')
															.slice(0, 4)
															.join(' ')
													}}
												</td>
											</tr>
										</tbody>
									</v-simple-table>
								</v-col>
								<v-spacer />
							</v-row>
							<v-spacer />
							<v-card-actions>
								<v-spacer />
								<v-btn v-on:click="setCarouselVal(1)" color="primary" class="ma-2">
									<v-icon left>mdi-pen</v-icon>Edit Profile
								</v-btn>
							</v-card-actions>
						</v-card>
					</v-carousel-item>
					<v-carousel-item>
						<v-card>
							<v-toolbar color="primary" dark>
								<v-toolbar-title class="white--text">Edit Profile</v-toolbar-title>
								<v-spacer></v-spacer>
								<v-tooltip right>
									<template v-slot:activator="{ on }">
										<v-btn icon large v-on="on">
											<v-icon>mdi-pen</v-icon>
										</v-btn>
									</template>
									<span>Edit Profile</span>
								</v-tooltip>
							</v-toolbar>
							<v-row justify="space-around" class="mt-4">
								<v-avatar size="150">
									<img
										:src="this.editUser.avatar ? editUser.avatar : user.avatar"
										position="top"
									/>
								</v-avatar>
							</v-row>
							<v-form v-model="valid" ref="form" class="mx-5">
								<!-- Display Name -->
								<v-text-field
									label="Name"
									name="name"
									prepend-icon="mdi-face-profile"
									clearable
									counter="30"
									:rules="notEmptyRules"
									v-model="editUser.displayName"
									hint="Your friendly name"
									maxlength="30"
									type="text"
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
											v-model="editUser.dob"
											label="Date Of Birth"
											prepend-icon="mdi-calendar"
											readonly
											v-on="on"
										></v-text-field>
									</template>
									<v-date-picker v-model="editUser.dob" no-title scrollable>
										<v-spacer />
										<v-btn text color="primary" @click="$refs.menu.save(editUser.dob)">
											OK
										</v-btn>
									</v-date-picker>
								</v-menu>

								<!-- Avatar -->
								<v-file-input
									:rules="avatarRules"
									accept="image/png, image/jpeg, image/bmp"
									placeholder="Change avatar"
									prepend-icon="mdi-camera"
									label="Avatar"
									v-model="avatarFile"
									v-on:change="onFilePicked"
								></v-file-input>
							</v-form>
							<v-spacer />
							<v-card-actions>
								<v-btn color="error" class="ma-2" v-on:click="setCarouselVal(0)">
									<v-icon size="30" left> mdi-keyboard-backspace </v-icon>
								</v-btn>
								<v-spacer />
								<v-btn
									color="deep-purple darken-3"
									class="ma-2"
									@click="changePasswordDlg = true"
								>
									<v-icon left>mdi-key</v-icon>Password
								</v-btn>
								<v-btn color="primary" class="ma-2" v-on:click="validate">
									<v-icon left>mdi-content-save</v-icon>Save
								</v-btn>
							</v-card-actions>
						</v-card>
					</v-carousel-item>
					<v-dialog v-model="changePasswordDlg" width="400px">
						<v-card>
							<v-card-title class="headline">Change Your Password</v-card-title>
							<v-card-text>
								Changing your password requires an e-mail verification. Click confirm to
								generate a reset password e-mail.
							</v-card-text>
							<v-card-actions>
								<v-spacer></v-spacer>
								<v-btn color="error" text @click="changePasswordDlg = false"
									>Cancel</v-btn
								>
								<v-btn color="primary" text @click="sendResetMail()">Confirm</v-btn>
							</v-card-actions>
						</v-card>
					</v-dialog>
				</v-carousel>
			</v-col>
		</v-row>
		<Dialog :config="dConfig" />
		<Loading :config="lConfig" v-if="isUpdatePending" />
	</v-main>
</template>

<script>
import { mapGetters } from 'vuex';
import Dialog from '@/components/Dialog.vue';
import Loading from '@/components/Loading.vue';
// import axios from 'axios';

export default {
	name: 'Account',
	data: () => ({
		editUser: {
			displayName: 'displayName',
			avatar: '',
			dob: new Date(),
		},
		changePasswordDlg: false,
		dConfig: {},
		lConfig: {
			isPersistent: true,
			show: 'true',
			message: 'Updating your profile!',
		},
		isUpdatePending: false,
		avatarFile: null,
		valid: true,
		menu: false,
		carouselVal: 0,
		notEmptyRules: [(v) => (v && v.length) > 0 || 'Field cannot be empty'],
		avatarRules: [
			(v) => !v || v.size < 2000000 || 'Avatar size should be less than 2 MB!',
		],
	}),
	computed: {
		...mapGetters('auth', ['user']),
	},
	methods: {
		sendResetMail() {
			this.changePasswordDlg = false;
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
		validate() {
			if (this.$refs.form.validate()) {
				this.isUpdatePending = true;
				this.user.displayName = this.editUser.displayName;
				this.user.dob = this.editUser.dob;
				if (this.avatarFile) {
					this.user.avatar = this.editUser.avatar;
				}
				this.user.displayName = this.editUser.displayName;
				delete this.user.isVerified;
				this.user
					.patch()
					.then(() => {
						this.avatarFile = null;
						this.dConfig = {
							show: true,
							title: 'Success',
							message: 'Your changes have been saved successfully.',
							buttonText: 'OK',
							isPersistent: true,
							redirect: 'refresh',
							type: 'info',
						};
					})
					.catch(() => {
						this.dConfig = {
							show: true,
							title: 'Error',
							message: 'An error occured while updating your details.',
							buttonText: 'Retry',
							isPersistent: true,
							redirect: 'refresh',
							type: 'error',
						};
					});
			}
		},
		setCarouselVal(val) {
			this.carouselVal = val;
		},
		decode(dat) {
			try {
				const b = Buffer.from(dat, 'base64');
				return b.toString();
			} catch {
				return null;
			}
		},
		onFilePicked(file) {
			if (file) {
				const fileReader = new FileReader();
				fileReader.addEventListener('load', () => {
					this.editUser.avatar = fileReader.result;
				});
				fileReader.readAsDataURL(file);
			} else {
				this.editUser.avatar = '';
			}
			this.avatarFile = file;
		},
	},
	mounted() {
		this.editUser.displayName = this.user.displayName;
		this.editUser.dob = new Date(this.user.dob).toISOString().substring(0, 10);
	},
	components: {
		Dialog,
		Loading,
	},
};
</script>
