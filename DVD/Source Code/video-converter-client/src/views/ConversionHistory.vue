<template>
	<v-main>
		<v-container class="fill-height" fluid>
			<v-row class="ma-0 pa-0 fill-height">
				<v-col cols="12" sm="12" offset-sm="3" class="ma-0 pa-0 fill-height">
					<v-card class="ma-0 pa-0 fill-height">
						<v-toolbar color="primary" dark>
							<v-toolbar-title class="white--text">Conversion History</v-toolbar-title>
							<v-spacer />
							<v-icon x-large>mdi-history</v-icon>
						</v-toolbar>
						<v-subheader>Converted Videos</v-subheader>
						<v-row>
							<v-text-field
								placeholder="Search Video..."
								v-model="filterString"
								rounded
								dense
								filled
								class="ml-5 my-2"
								prepend-inner-icon="mdi-magnify"
							/>
							<v-btn fab class="mx-5" @click="getVideos(generateParams())">
								<v-icon>mdi-movie-search</v-icon>
							</v-btn>
							<v-menu
								ref="menu"
								v-model="menu"
								:close-on-content-click="false"
								:return-value.sync="queryDate"
								transition="scale-transition"
								offset-y
								min-width="290px"
							>
								<template v-slot:activator="{ on }">
									<v-btn fab v-on="on" class="mx-2">
										<v-icon>mdi-calendar</v-icon>
									</v-btn>
								</template>
								<v-date-picker v-model="queryDate" no-title scrollable class="ma-2">
									<v-spacer></v-spacer>
									<v-btn
										text
										color="primary"
										@click="$refs.menu.save(queryDate) & getVideos(generateParams())"
										>OK</v-btn
									>
								</v-date-picker>
							</v-menu>
							<v-tooltip bottom>
								<template v-slot:activator="{ on, attrs }">
									<v-btn fab v-on="on" class="mx-2 mr-5" @click="getVideos({})">
										<v-icon color="error" v-bind="attrs">mdi-restore</v-icon>
									</v-btn>
								</template>
								<span>Clear Search Parameters</span>
							</v-tooltip>
						</v-row>
						<div class="text-center" style="position: relative; bottom: 0">
							<v-pagination
								v-model="page"
								:length="paginateLength == 0 ? 1 : paginateLength"
								circle
							></v-pagination>
						</div>
						<v-list two-line v-if="viewMode == 'List'">
							<v-list-item v-for="item in videos" :key="item._id" link>
								<v-list-item-avatar>
									<v-icon class="blue">mdi-video</v-icon>
								</v-list-item-avatar>
								<v-list-item-content>
									<v-list-item-title>{{ item.name }}</v-list-item-title>
									<v-list-item-subtitle>
										{{ new Date(item.createdAt).toUTCString() }}
									</v-list-item-subtitle>
								</v-list-item-content>
								<v-btn icon ripple>
									<v-icon color="grey lighten-1" @click="downloadVideo(item)"
										>mdi-download</v-icon
									>
								</v-btn>
								<v-btn icon ripple>
									<v-icon color="grey lighten-1" @click="showInfo(item)"
										>mdi-information</v-icon
									>
								</v-btn>
								<v-btn icon ripple>
									<v-icon color="grey lighten-1" @click="initDeleteVideo(item)"
										>mdi-delete</v-icon
									>
								</v-btn>
							</v-list-item>
						</v-list>
						<v-container fluid v-if="viewMode == 'Card'">
							<v-row>
								<v-card
									v-for="item in videos"
									:key="item._id"
									max-width="336px"
									color="primary"
									elevation="24"
									class="mx-5"
								>
									<v-img
										:src="'data:image/png;base64,' + item.thumbnail"
										class="white--text align-end"
										height="188px"
										width="336px"
									>
										<v-card-title v-text="item.name"></v-card-title>
									</v-img>

									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn icon @click="downloadVideo(item)">
											<v-icon>mdi-download</v-icon>
										</v-btn>

										<v-btn icon @click="showInfo(item)">
											<v-icon>mdi-information</v-icon>
										</v-btn>

										<v-btn icon @click="initDeleteVideo(item)">
											<v-icon>mdi-delete</v-icon>
										</v-btn>
									</v-card-actions>
								</v-card>
							</v-row>
						</v-container>
						<v-speed-dial
							absolute
							v-model="fab"
							bottom
							right
							direction="top"
							transition="slide-y-reverse-transition"
						>
							<template v-slot:activator>
								<v-btn v-model="fab" color="blue darken-2" dark fab>
									<v-icon v-if="fab">mdi-close</v-icon>
									<v-icon v-else>mdi-view-split-vertical</v-icon>
								</v-btn>
							</template>
							<v-btn fab dark small color="green" @click="viewMode = 'List'">
								<v-icon>mdi-view-list</v-icon>
							</v-btn>
							<v-btn fab dark small color="indigo" @click="viewMode = 'Card'">
								<v-icon>mdi-view-comfy</v-icon>
							</v-btn>
						</v-speed-dial>
					</v-card>
				</v-col>
			</v-row>
		</v-container>
		<v-dialog v-model="showInfoDlg" max-width="500px">
			<v-card>
				<v-card-title>Video Information</v-card-title>
				<v-card-text>
					<v-simple-table>
						<thead>
							<tr>
								<th class="text-left">Attribute</th>
								<th class="text-left">Value</th>
							</tr>
						</thead>
						<tbody v-if="this.selectedVideo != null">
							<tr>
								<td>Name</td>
								<td>{{ this.selectedVideo.name }}</td>
							</tr>
							<tr>
								<td>Format</td>
								<td>{{ this.selectedVideo.format }}</td>
							</tr>
							<tr>
								<td>Resolution</td>
								<td>{{ this.selectedVideo.height }}x{{ this.selectedVideo.width }}</td>
							</tr>
							<tr>
								<td>Size</td>
								<td>
									{{ parseFloat(this.selectedVideo.fileSize / 1000000.0).toFixed(2) }} MB
								</td>
							</tr>
							<tr>
								<td>Duration</td>
								<td>{{ secondsToHms(this.selectedVideo.durationEnd) }}</td>
							</tr>
							<tr>
								<td>Converted To</td>
								<td>{{ this.selectedVideo.type }}</td>
							</tr>
							<tr>
								<td>Frames Per Second</td>
								<td>{{ this.selectedVideo.frameRate }}</td>
							</tr>
							<tr>
								<td>Is Audio Disabled?</td>
								<td>{{ this.selectedVideo.isAudioDisabled }}</td>
							</tr>
							<tr>
								<td>Video Bitrate</td>
								<td>{{ this.selectedVideo.videoBitrate }} kb/s</td>
							</tr>
							<tr>
								<td>Audio Bitrate</td>
								<td>{{ this.selectedVideo.audioBitrate }} kb/s</td>
							</tr>
						</tbody>
					</v-simple-table>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" v-on:click="showInfoDlg = false">
						Close
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<YesNoDialog :config="yesNoConfig" />
		<Dialog :config="dConfig" />
		<Loading :config="lConfig" />
	</v-main>
</template>

<script>
import YesNoDialog from '@/components/YesNoDialog.vue';
import Dialog from '@/components/Dialog.vue';
import Loading from '@/components/Loading.vue';
import axios from 'axios';

export default {
	data: () => ({
		queryDate: new Date().toISOString().substr(0, 10),
		queryDateSuccessor: new Date().toISOString().substr(0, 10),
		viewMode: 'List',
		menu: false,
		page: 1,
		fab: false,
		filterString: '',
		videos: [],
		paginateLength: 0,
		queryLimit: 10,
		yesNoConfig: {},
		dConfig: {},
		lConfig: {
			isPersistent: true,
		},
		selectedVideo: null,
		showInfoDlg: false,
	}),
	mounted() {
		this.getVideos();
	},
	methods: {
		generateParams() {
			const params = {};
			if (this.queryDateSuccessor) {
				params.createdAt = {
					$gte: this.queryDate,
					$lt: this.queryDateSuccessor,
				};
			}
			if (this.filterString) {
				params.originalName = {
					$search: this.filterString,
				};
			}
			return params;
		},
		decode(dat) {
			try {
				const b = Buffer.from(dat, 'base64');
				return b.toString();
			} catch {
				return null;
			}
		},
		downloadVideo(video) {
			const token = window.localStorage['feathers-jwt'];
			axios
				.get(`${process.env.VUE_APP_SERVER_ADDR}/convert/${video._id}?download=true`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
					responseType: 'blob',
				})
				.then((response) => {
					const url = window.URL.createObjectURL(new Blob([response.data]));
					const link = document.createElement('a');
					link.href = url;
					link.setAttribute('download', `${video.name}.${video.format}`);
					document.body.appendChild(link);
					link.click();
					link.remove();
					this.dConfig = {
						show: true,
						title: 'Sucess',
						message: 'Your download has been started successfully.',
						buttonText: 'OK',
						isPersistent: true,
						type: 'info',
					};
				})
				.catch(() => {
					this.dConfig = {
						show: true,
						title: 'Error',
						message: 'Some error has occured while downloading your video.',
						buttonText: 'Retry',
						isPersistent: true,
						redirect: 'refresh',
						type: 'error',
					};
				});
		},
		secondsToHms(value) {
			return new Date(value * 1000).toISOString().substr(11, 8);
		},
		showInfo(video) {
			this.selectedVideo = video;
			this.showInfoDlg = true;
		},
		initDeleteVideo(video) {
			this.yesNoConfig = {
				show: true,
				message: `Are you sure you want to delete ${video.name}?`,
				title: 'Delete Video',
				onYes: [this.deleteVideo, video],
				onNo: [
					() => {
						this.yesNoConfig.show = false;
					},
					null,
				],
				persistent: true,
			};
		},
		async deleteVideo(video) {
			this.yesNoConfig.show = false;
			this.lConfig = {
				show: 'true',
				message: 'Deleting your video..',
			};
			const { Convert } = this.$FeathersVuex.api;
			const result = await Convert.get(video._id);
			result
				.remove()
				.then(() => {
					this.dConfig = {
						show: true,
						title: 'Sucess',
						message: 'Video deleted successfully.',
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
						message: 'Some error has occured while deleting your video.',
						buttonText: 'Retry',
						isPersistent: true,
						redirect: 'refresh',
						type: 'error',
					};
				});
		},
		async setupPagination(params) {
			const { Convert } = this.$FeathersVuex.api;
			const convertParams = {
				query: {
					$sort: { createdAt: 1 },
					$limit: 0,
					$skip: this.page - 1,
					...params,
				},
			};
			Convert.find(convertParams)
				.then((result) => {
					this.paginateLength = parseInt(result.total / this.queryLimit, 10);
				})
				.catch(() => {});
		},
		async getVideos(params) {
			const { Convert } = this.$FeathersVuex.api;
			const convertParams = {
				query: {
					$sort: { createdAt: 1 },
					$limit: this.queryLimit,
					$skip: this.page - 1,
					...params,
				},
			};
			Convert.find(convertParams)
				.then((result) => {
					this.videos = result.data;
				})
				.catch(() => {});
			await this.setupPagination(params);
		},
	},
	watch: {
		queryDate(val) {
			const date = new Date(val);
			this.queryDateSuccessor = date.setDate(date.getDate() + 1);
		},
		page() {
			this.getVideos([]);
		},
	},
	components: {
		YesNoDialog,
		Dialog,
		Loading,
	},
	name: 'ConversionHistory',
};
</script>
