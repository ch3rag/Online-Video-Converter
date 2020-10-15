<template>
	<v-dialog
		v-model="config.show"
		max-width="500px"
		:persistent="config.isPersistent ? config.isPersistent : false"
	>
		<v-card>
			<v-card-title>{{ config.title ? config.title : title }}</v-card-title>
			<v-card-text>
				{{ config.message ? config.message : message }}
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn
					color="red"
					v-on:click="config.onYes ? config.onYes[0](config.onYes[1]) : (show = false)"
				>
					{{ config.yesText ? config.yesText : yesText }}
				</v-btn>
				<v-btn
					color="primary"
					v-on:click="config.onNo ? config.onNo[0](config.onNo[1]) : (show = false)"
				>
					{{ config.noText ? config.noText : noText }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: 'YesNoDialog',
	data: () => ({
		show: false,
		title: 'Dialog Title',
		message: 'Dialog Message',
		onYes: null,
		onNo: null,
		yesText: 'Yes',
		noText: 'No',
	}),
	props: ['config'],
};
</script>
