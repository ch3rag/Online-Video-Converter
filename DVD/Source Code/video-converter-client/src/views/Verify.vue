<template>
	<v-card>
		<Dialog :config="dConfig" />
		<Loading :config="lConfig" v-if="isVerificationPending" />
	</v-card>
</template>

<script>
import Dialog from '@/components/Dialog.vue';
import Loading from '@/components/Loading.vue';

export default {
	name: 'Verify',
	methods: {
		beginVerify() {
			const { AuthManagement } = this.$FeathersVuex.api;
			const url = new URL(window.location.href);
			const token = url.searchParams.get('token');
			const verficationData = {
				action: 'verifySignupLong',
				value: token,
			};
			const authRequest = new AuthManagement(verficationData);
			authRequest
				.save()
				.then(() => {
					this.isVerificationPending = false;
					this.dConfig = {
						show: true,
						title: 'Sucess',
						message: 'Verification Successful! Please Login To Continue.',
						buttonText: 'Log In',
						isPersistent: true,
						redirect: '/login',
						type: 'info',
					};
				})
				.catch(() => {
					this.dConfig = {
						show: true,
						title: 'Error',
						message: 'Some Error Has Occured In The Verfication Process!.',
						buttonText: 'OK',
						isPersistent: true,
						redirect: '/login',
						type: 'error',
					};
				});
		},
	},
	beforeMount() {
		this.beginVerify();
	},
	data: () => ({
		isVerificationPending: true,
		dConfig: {},
		lConfig: {
			isPersistent: true,
			show: 'true',
			message: 'Please Wait While We Verify You!',
		},
	}),
	components: {
		Dialog,
		Loading,
	},
};
</script>
