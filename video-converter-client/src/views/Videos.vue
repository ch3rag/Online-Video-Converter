<template>
	<v-main>
		<v-container class="fill-height" fluid>
			<v-row class="ma-0 pa-0 fill-height">
				<v-col cols="12" sm="12" offset-sm="3" class="ma-0 pa-0 fill-height">
					<v-card class="ma-0 pa-0 fill-height">
						<v-toolbar color="primary" dark>
							<v-toolbar-title class="white--text">My Videos</v-toolbar-title>
							<v-spacer />
							<v-icon x-large>mdi-video</v-icon>
							<template v-slot:extension>
								<v-btn
									fab
									color="red accent-2"
									bottom
									left
									absolute
									@click="dialog = !dialog"
								>
									<v-icon>mdi-plus</v-icon>
								</v-btn>
							</template>
						</v-toolbar>
						<v-row class="mt-8">
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
							<v-list-item v-for="item in videos" :key="item._id">
								<v-list-item-avatar>
									<v-icon class="blue">mdi-video</v-icon>
								</v-list-item-avatar>
								<v-list-item-content>
									<v-list-item-title>{{ item.originalName }}</v-list-item-title>
									<v-list-item-subtitle>
										{{ new Date(item.createdAt).toUTCString() }}
									</v-list-item-subtitle>
								</v-list-item-content>
								<v-btn icon ripple  @click="play(item)">
									<v-icon color="grey lighten-1">mdi-play</v-icon>
								</v-btn>
								<v-btn icon ripple  @click="showInfo(item)">
									<v-icon color="grey lighten-1"
										>mdi-information</v-icon
									>
								</v-btn>
								<v-btn icon ripple  @click="initConvert(item)">
									<v-icon color="grey lighten-1"
										>mdi-refresh</v-icon
									>
								</v-btn>
								<v-btn icon ripple @click="initConvert(item, 'gif')">
									<v-img src="@/assets/gif.png" max-width="25px" style="filter: invert(100%);"/>
								</v-btn>
								<v-btn icon ripple  @click="confirmDeleteVideo(item)">
									<v-icon color="grey lighten-1">
										mdi-delete
									</v-icon>
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
										<v-card-title class="text-subtitle-1" v-text="item.originalName"></v-card-title>
									</v-img>

									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn icon @click="play(item)">
											<v-icon>mdi-play</v-icon>
										</v-btn>

										<v-btn icon @click="showInfo(item)">
											<v-icon>mdi-information</v-icon>
										</v-btn>
										<v-btn icon @click="initConvert(item)">
											<v-icon>mdi-refresh</v-icon>
										</v-btn>
										<v-btn icon ripple @click="initConvert(item, 'gif')">
											<v-img src="@/assets/gif.png" max-width="25px" style="filter: invert(100%);"/>
										</v-btn>
										<v-btn icon @click="confirmDeleteVideo(item)">
											<v-icon>mdi-delete</v-icon>
										</v-btn>
									</v-card-actions>
								</v-card>
							</v-row>
						</v-container>
						<v-dialog v-model="isUploading" max-width="400px" persistent>
							<v-card loading class="text-center">
								<v-card-title>Uploading Your Video...</v-card-title>
								<v-card-text>
									<v-divider></v-divider>
									<br />
									<v-progress-circular
										:rotate="360"
										:size="100"
										:width="15"
										:value="uploadProgress"
										color="primary"
										>{{ uploadProgress }}</v-progress-circular
									>
								</v-card-text>
							</v-card>
						</v-dialog>
						<Dialog :config="dConfig" />
						<Loading :config="lConfig" />
						<v-dialog v-model="dialog" max-width="500px">
							<v-card>
								<v-card-title>Upload A New Video</v-card-title>
								<v-card-text>
									<v-form v-model="valid" ref="uploadForm">
										<v-file-input
											:rules="videoRules"
											show-size
											counter
											label="Select a video to be converted"
											prepend-icon="mdi-video"
											accept="video/*"
											v-model="video.files"
										></v-file-input>
										<p class="caption grey--text text--darken-1">
											This video size must be less than 500MB
										</p>
										<p class="caption grey--text text--darken-1">
											Currently *.mp4, *.avi, *.flv, *.ogm, *.wmv, *.mpg, *.ogv, *.mov,
											*.asx, *.mpeg and *.m4v are supported.
										</p>
										<v-text-field
											label="Description"
											name="description"
											prepend-icon="mdi-text"
											clearable
											counter="100"
											:rules="notEmptyRules"
											v-model="video.description"
											hint="A short description of your video"
											maxlength="100"
											type="text"
										/>
									</v-form>
								</v-card-text>
								<v-card-actions>
									<v-spacer></v-spacer>
									<v-btn color="primary" @click="validate()">
										<v-icon left>mdi-upload</v-icon>Upload
									</v-btn>
								</v-card-actions>
							</v-card>
						</v-dialog>
						<YesNoDialog :config="yesNoConfig" />
						<v-dialog v-model="playVideo" max-width="50%">
							<video :src="videoData" controls :type="videoMime" autoplay></video>
						</v-dialog>
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
												<td>{{ this.selectedVideo.originalName }}</td>
											</tr>
											<tr>
												<td>Description</td>
												<td>{{ this.selectedVideo.description }}</td>
											</tr>
											<tr>
												<td>Format</td>
												<td>{{ this.selectedVideo.format }}</td>
											</tr>
											<tr>
												<td>Size</td>
												<td>
													{{
														parseFloat(this.selectedVideo.fileSize / 1000000.0).toFixed(2)
													}}
													MB
												</td>
											</tr>
											<tr>
												<td>Duration</td>
												<td>{{ this.selectedVideo.duration }}</td>
											</tr>
											<tr>
												<td>Resolution</td>
												<td>{{ this.selectedVideo.resolution }}</td>
											</tr>
											<tr>
												<td>Frames Per Second</td>
												<td>{{ this.selectedVideo.frameRate }}</td>
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
									<v-btn class="ma-2" color="primary" v-on:click="showInfoDlg = false">
										Close
									</v-btn>
								</v-card-actions>
							</v-card>
						</v-dialog>
						<v-dialog v-model="convertVideo" max-width="50%">
							<v-card>
								<v-card-title>Convert Video</v-card-title>
								<v-card-text>
									<v-form v-model="valid" ref="convertForm">
										<v-row>
											<v-col>
												<v-text-field
													label="Name"
													name="name"
													prepend-icon="mdi-rename-box"
													type="text"
													hint="Name of the converted file"
													v-model="convert.name"
													maxlength="30"
													counter="30"
													clearable
													:rules="notEmptyRules"
												/>
												<section v-if="convert.type === 'video'">
													<span>Resolution</span>
													<v-radio-group v-model="resType">
														<v-row>
															<v-col>
																<v-radio label="Standard Resolution" value="standard" />
															</v-col>
															<v-col>
																<v-radio label="Custom Resolution" value="custom" />
															</v-col>
														</v-row>
													</v-radio-group>
													<v-row v-if="resType === 'custom'">
														<v-col>
															<v-text-field
																label="Width"
																clearable
																suffix="px"
																v-model="convert.width"
																:rules="dimRules"
															></v-text-field>
														</v-col>
														<v-col>
															<v-text-field
																label="Height"
																clearable
																suffix="px"
																v-model="convert.height"
																:rules="dimRules"
															></v-text-field>
														</v-col>
													</v-row>
													<v-row v-if="resType === 'standard'">
														<v-col cols="5">
															<v-select
																v-model="aspectRatio"
																:rules="notEmptyRules"
																:items="aspectRatios"
																label="Select aspect ratio"
															></v-select>
														</v-col>
														<v-col>
															<v-select
																v-model="selectedStandardResolution"
																:rules="notEmptyRules"
																:items="standardResolutions"
																label="Select a standard resolution"
															></v-select>
														</v-col>
													</v-row>
													<p>Frame Rate</p>
													<v-slider
														v-model="convert.frameRate"
														class="mt-10"
														track-color="grey"
														min="1"
														thumb-label="always"
														:max="selectedVideo ? selectedVideo.frameRate : 100"
													>
													</v-slider>
													<v-checkbox
														label="Disable Audio"
														v-model="convert.isAudioDisabled"
														:disabled="
															selectedVideo ? selectedVideo.audioBitrate == 0 ||
															convert.format == 'gif' : false
														"
													></v-checkbox>
												</section>
												<div>
													<p>Audio Quality</p>
													<v-slider
														v-model="convert.audioQuality"
														class="mt-10"
														track-color="grey"
														min="1"
														thumb-label="always"
														:max="100"
														:disabled="
															selectedVideo ? selectedVideo.audioBitrate == 0 ||
															convert.isAudioDisabled : false
														"
													>
													</v-slider>
												</div>
											</v-col>
											<v-col>
												<p>Convert To</p>
												<v-radio-group v-model="convert.type">
													<v-row>
														<v-col>
															<v-radio label="Video" value="video"></v-radio>
														</v-col>
														<v-col>
															<v-radio label="Audio" value="audio"></v-radio>
														</v-col>
													</v-row>
													<v-spacer />
													<v-select
														v-model="convert.format"
														:rules="notEmptyRules"
														:items="
															convert.type === 'video' ? videoFormats : audioFormats
														"
														label="Select the output file format"
													></v-select>
												</v-radio-group>
												<p>Duration</p>
												<v-row>
													<v-col>
														<v-card>
															<img
																:src="`data:image/png;base64,${thumbStart}`"
																type="img/png"
																height="100px"
															/>
														</v-card>
													</v-col>
													<v-col> </v-col>
													<v-col>
														<v-card>
															<img
																:src="`data:image/png;base64,${thumbEnd}`"
																type="img/png"
																height="100px"
															/>
														</v-card>
													</v-col>
												</v-row>
												<v-row>
													<v-col>
														<v-range-slider
															v-model="convert.range"
															:max="
																selectedVideo ? hmsToSeconds(selectedVideo.duration) : 0
															"
															:min="0"
															hide-details
															@change="getThumb()"
															class="align-center"
														>
															<template v-slot:append>
																<span>{{ secondsToHms(convert.range[1]) }}</span>
															</template>
															<template v-slot:prepend>
																<span>{{ secondsToHms(convert.range[0]) }}</span>
															</template>
														</v-range-slider>
													</v-col>
												</v-row>
												<div v-if="convert.type === 'video'">
													<p>Video Quality</p>
													<v-slider
														v-model="convert.videoQuality"
														class="mt-10"
														track-color="grey"
														min="1"
														thumb-label="always"
														:max="100"
													>
													</v-slider>
												</div>
											</v-col>
										</v-row>
									</v-form>
								</v-card-text>
								<v-card-actions>
									<v-spacer></v-spacer>
									<v-btn color="primary" @click="beginConvert()">
										<v-icon left>mdi-refresh</v-icon>Convert
									</v-btn>
								</v-card-actions>
							</v-card>
						</v-dialog>
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
	</v-main>
</template>
<script>
import axios from 'axios';
import Dialog from '@/components/Dialog.vue';
import Loading from '@/components/Loading.vue';
import YesNoDialog from '@/components/YesNoDialog.vue';
import mime from 'mime-types';

export default {
	watch: {
		playVideo(val) {
			if (val === false) {
				this.videoData = '';
			}
		},
		// eslint-disable-next-line
		'convert.format': function() {
			if (this.convert.format === 'gif') {
				this.convert.isAudioDisabled = true;
			}
		},
		queryDate(val) {
			const date = new Date(val);
			this.queryDateSuccessor = date.setDate(date.getDate() + 1);
		},
		page() {
			this.getVideos([]);
		},
		selectedStandardResolution(value) {
			const splitted = value.toString().split('x');
			this.convert.height = parseInt(splitted[0], 10);
			this.convert.width = parseInt(splitted[1], 10);
		},
		selectedVideo(value) {
			this.convert.frameRate = value.frameRate;
			this.convert.range[1] = this.hmsToSeconds(value.duration);
		},
	},
	name: 'Videos',
	data: () => ({
		videos: [],
		viewMode: 'List',
		menu: false,
		queryDateSuccessor: null,
		queryDate: new Date().toISOString().substr(0, 10),
		paginateLength: 0,
		queryLimit: 10,
		page: 1,
		yesNoConfig: {},
		fab: false,

		videoMime: '',
		thumbStart: null,
		thumbEnd: null,
		videoData: null,
		playVideo: false,
		filterString: '',
		selectedStandardResolution: '',
		testConfig: {
			show: true,
		},
		selectedVideo: null,
		resType: 'standard',
		lConfig: {
			isPersistent: true,
			show: false,
			message: 'Processing your video!',
		},
		videoFormats: ['avi', 'mp4', 'flv', 'webm', 'mov', 'ogg', 'gif'],
		audioFormats: ['mp3', 'wav', 'oga'],
		convert: {
			videoQuality: 100,
			audioQuality: 100,
			name: '',
			format: '',
			width: 0,
			height: 0,
			upload: null,
			type: 'video',
			isAudioDisabled: false,
			frameRate: 10,
			range: [null, null],
		},
		dConfig: {
			show: false,
			color: '',
			title: '',
			icon: '',
			message: '',
			buttonText: '',
		},
		uploadProgress: 0,
		dialog: false,
		convertVideo: false,
		deleteVideoDlg: false,
		video: {
			files: null,
			description: '',
		},
		notEmptyRules: [(v) => !!v || 'Field cannot be empty.'],
		videoRules: [
			(v) => !!v || 'Please choose a video',
			(v) => !v || v.size < 500000000 || 'Video size should be less than 500 MB!',
		],
		dimRules: [
			(v) => !!v || 'Field cannot be empty.',
			(v) => !v || Number.isInteger(Number.parseInt(v, 10)) || 'Invalid Dimension',
		],
		valid: false,
		isUploading: false,
		isConverting: true,
		showInfoDlg: false,
		standardResolutions43: [
			'640x480',
			'800x600',
			'960x720',
			'1024x768',
			'1280x960',
			'1400x1050',
			'1440x1080',
			'1600x1200',
			'1856x1392',
			'1920x1440',
			'2048x1536',
		],
		standardResolutions1610: [
			'1280x800',
			'1440x900',
			'1680x1050',
			'1920x1200',
			'2560x1600',
		],
		standardResolutions169: [
			'1024x576',
			'1152x648',
			'1280x720',
			'1366x768',
			'1600x900',
			'1920x1080',
			'2560x1440',
			'3840x2160',
			'7680x4320',
		],
		aspectRatios: ['4:3', '16:10', '16:9'],
		aspectRatio: '',
	}),
	mounted() {
		this.getVideos();
	},
	computed: {
		standardResolutions() {
			switch (this.aspectRatio) {
			/* eslint-disable */
				case '4:3':
					return this.standardResolutions43;
				case '16:10':
					return this.standardResolutions1610;
				case '16:9':
					return this.standardResolutions169;
				default:
					return [];
				/* eslint-enable */
			}
		},
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
		async setupPagination(params) {
			const { Uploads } = this.$FeathersVuex.api;
			const uploadParams = {
				query: {
					$sort: { createdAt: 1 },
					$limit: 0,
					$skip: this.page - 1,
					...params,
				},
			};
			Uploads.find(uploadParams)
				.then((result) => {
					this.paginateLength = parseInt(result.total / this.queryLimit, 10);
				})
				.catch(() => {});
		},
		async getVideos(params) {
			const { Uploads } = this.$FeathersVuex.api;
			const uploadParams = {
				query: {
					$sort: { createdAt: -1 },
					$limit: this.queryLimit,
					$skip: this.page - 1,
					...params,
				},
			};
			Uploads.find(uploadParams)
				.then((result) => {
					this.videos = result.data;
				})
				.catch(() => {});
			await this.setupPagination(params);
		},
		play(video) {
			this.selectedVideo = video;
			this.playVideo = true;
			this.videoData = `${process.env.VUE_APP_SERVER_ADDR}/streams/${video._id}`;
			this.videoMime = mime.lookup(this.selectedVideo.format);
		},
		getThumb() {
			const { range } = this.convert;
			const defVal = [0, this.hmsToSeconds(this.selectedVideo.duration)];
			const [start, end] = range[0] != null ? range : defVal;
			const factor = this.hmsToSeconds(this.selectedVideo.duration) / 30 + 1;
			let startThumbId = parseInt(start / factor, 10);
			let endThumbId = parseInt(end / factor, 10);
			if (startThumbId <= 0) {
				startThumbId = 1;
			} else if (startThumbId > 30) {
				startThumbId = 30;
			}
			if (endThumbId <= 0) {
				endThumbId = 1;
			} else if (endThumbId > 30) {
				endThumbId = 30;
			}
			const { Thumbs } = this.$FeathersVuex.api;
			Thumbs.get(this.selectedVideo._id, {
				query: {
					thumbId: startThumbId,
				},
			}).then((result) => {
				this.thumbStart = result.data;
			});
			Thumbs.get(this.selectedVideo._id, {
				query: {
					thumbId: endThumbId,
				},
			}).then((result) => {
				this.thumbEnd = result.data;
			});
		},
		hmsToSeconds(value) {
			const a = value.split(':');
			const seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
			return seconds;
		},
		secondsToHms(value) {
			return new Date(value * 1000).toISOString().substr(11, 8);
		},
		showInfo(video) {
			this.showInfoDlg = true;
			this.selectedVideo = video;
		},
		confirmDeleteVideo(video) {
			this.yesNoConfig = {
				show: true,
				message: `Are you sure you want to delete ${video.originalName}?`,
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
		initConvert(video, preset) {
			if (preset) {
				if (preset === 'gif') {
					this.convert.format = 'gif';
				}
			}
			this.selectedVideo = video;
			this.convert.name = `${video.originalName}_Converted`;
			this.convertVideo = true;
			this.convert.upload = video;
			this.getThumb();
		},
		async deleteVideo(video) {
			this.yesNoConfig.show = false;
			this.lConfig = {
				show: 'true',
				message: 'Deleting your video..',
			};
			const { Uploads } = this.$FeathersVuex.api;
			const result = await Uploads.get(video._id);
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
		beginConvert() {
			if (this.$refs.convertForm.validate()) {
				const token = window.localStorage['feathers-jwt'];
				axios
					.post(`${process.env.VUE_APP_SERVER_ADDR}/convert`, this.convert, {
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
						},
					})
					.then((res) => {
						axios
							.get(
								`${process.env.VUE_APP_SERVER_ADDR}/convert/${res.data._id}?download=true`,
								{
									headers: {
										Authorization: `Bearer ${token}`,
									},
									responseType: 'blob',
								},
							)
							.then((response) => {
								const url = window.URL.createObjectURL(new Blob([response.data]));
								const link = document.createElement('a');
								link.href = url;
								link.setAttribute(
									'download',
									`${this.convert.name}.${this.convert.format}`,
								);
								document.body.appendChild(link);
								link.click();
								link.remove();
							});
						this.lConfig.show = false;
						this.dConfig = {
							show: true,
							color: 'info',
							title: 'Sucess',
							icon: 'mdi-information',
							message: 'Video Converted Successully!',
							buttonText: 'OK',
							isPersistent: true,
						};
					})
					.catch(() => {
						this.dConfig = {
							show: true,
							color: 'red',
							title: 'An error occured',
							icon: 'mdi-alert',
							message: 'An error has occured while converting your video.',
							buttonText: 'OK',
							isPersistent: true,
						};
						this.lConfig.show = false;
						this.convertVideo = false;
					});
				this.convertVideo = false;
				this.lConfig.show = true;
			}
		},
		validate() {
			if (this.$refs.uploadForm.validate()) {
				const token = window.localStorage['feathers-jwt'];
				const formData = new FormData();
				formData.append('files', this.video.files, this.video.files.name);
				formData.append('description', this.video.description);
				axios
					.post(`${process.env.VUE_APP_SERVER_ADDR}/uploads`, formData, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
						onUploadProgress: (e) => {
							if (e.lengthComputable) {
								this.uploadProgress = parseInt((e.loaded / e.total) * 100, 10);
							}
						},
					})
					.then(() => {
						this.dConfig = {
							show: true,
							color: 'info',
							title: 'Sucess',
							icon: 'mdi-information',
							message: 'Video Sucessfully Uploaded!',
							buttonText: 'Continue',
							isPersistent: true,
							redirect: 'refresh',
						};
						this.dialog = false;
						this.isUploading = false;
						this.video.files = null;
						this.video.description = null;
					})
					.catch(() => {
						this.dConfig = {
							show: true,
							color: 'red',
							title: 'An error occured',
							icon: 'mdi-alert',
							message: 'An error has occured while uploading your video.',
							buttonText: 'OK',
							isPersistent: true,
						};
						this.isUploading = false;
					});
				this.isUploading = true;
			}
		},
	},
	components: {
		Dialog,
		Loading,
		YesNoDialog,
	},
};
</script>
