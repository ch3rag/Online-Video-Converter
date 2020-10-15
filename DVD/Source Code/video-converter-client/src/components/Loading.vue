   <template>
  <v-dialog v-model="config.show" width="400" :persistent="config.isPersistent" hide-overlay>
    <v-card class="mx-auto" loading disabled>
      <v-card-title>Hold on..</v-card-title>
      <v-card-text>{{config.message}}</v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
	props: [
		'config',
	],
};
</script>
