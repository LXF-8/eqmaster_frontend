<template>
	<view class="container">
		<scroll-view scroll-y>
			<view class="content">
				<!-- 添加错误处理和加载状态 -->
				<view v-if="isLoading">{{ $t('pages.home.loading') }}</view>
				<view v-else-if="error">{{ error }}</view>
				<view v-else>
					<view class="today-recommend">
						<view class="today-recommend-title">{{ $t('pages.home.index.today-recommend') }}</view>
						<view class="today-recommend-desc">{{ $t('pages.home.index.today-recommend-desc') }}</view>
						<view class="class-item-container">
							<view class="class-item-left" v-for="(item, index) in courseDataList" :key="index" @click="jumpBattlefield(item)">
								<!-- <image class="class-item-image" :src="getImg(item.image)" mode="widthFix"></image> -->
								<image class="class-item-image" src="/static/rectangle-right.png" mode="widthFix"></image>
								<view class="class-item-text">
									<view class="class-item-text-title">
										{{ item.title }}
									</view>
									<view class="class-item-text-desc">
										100人在玩
									</view>
								</view>
							</view>
						</view>
					</view>

					<view class="chat-interpretation">
						<view class="chat-interpretation-title">{{ $t('pages.home.index.chat-interpretation') }}</view>
						<view class="chat-interpretation-desc">{{ $t('pages.home.index.chat-interpretation-desc') }}</view>
						<view class="upload-card" @click="chooseImage">
							<view class="upload-card-container">
								<view class="upload-card-title">
									<image class="upload-card-image" src="/static/chat-upload.png" mode="widthFix"></image>
									{{ $t('pages.home.index.upload-chat-history') }}
								</view>
								<view class="upload-card-desc">{{ $t('pages.home.index.upload-chat-history-desc') }}</view>
							</view>
						</view>
					</view>

					<view class="history-solid"><span class="line"></span>{{ $t('pages.home.index.history') }}<span class="line"></span></view> 

					<view class="history-list">
						<view class="history-item" v-for="(item, index) in analysisList" :key="index" @tap="navigateToAnalysis(item)">
							<view class="history-list-title">{{ item.analysis.title.title }}</view>
							<view class="history-list-content">{{ item.analysis.summary.summary }}</view>
							<view class="history-list-footer">
								<view class="history-list-tab">
									<view class="tab-item">职场</view>
									<view class="tab-item">沟通技巧</view>
								</view>
								<view class="history-list-time">11:31</view>
							</view>
						</view>
					</view>

				</view>
			</view>
		</scroll-view>
		<Nav selectedView="Home" />
	</view>
</template>


<script>
	import SProgressBar from '@/components/SProgressBar.vue'; // 根据实际路径调整
	import apiService from '../../services/api-service';
	import ChatHistory from '@/components/ChatHistory.vue';
	import Nav from '../../components/Nav.vue';
	import AbilityProgressBar from '@/components/AbilityProgressBar.vue';
	import {
		illustrationSrc
	} from '../../scripts/illustrationHelper_zh';
	import locale from '@/locale';
	import { getImg } from '../../scripts/constants';

	export default {

		data() {
			return {
				getImg,
				isLoading: true,
				error: null,
			};
		},
		computed: {
			homepageData() {
				return this.$store.getters.getHomepageData;
			},
			currentView() {
				return this.$store.getters.getHomeNavName;
			},
			userId() {
				return this.$store.getters.getUserId;
			},
			username() {
				return this.$store.getters.getUsername;
			},
			gemCount() {
				return this.$store.getters.getGemCount;
			},
			weakness() {
				return this.$store.getters.getWeakness;
			},
			courseDataList() {
				return this.$store.getters.getCourseDataList;
			},
			analysisList() {
				return this.$store.getters.getAnalysisList;
			}
		},
		watch: {
			homepageData: {
				immediate: true,
				async handler(val) {
					if (val && val.response) {
						this.isLoading = false;
					}
				},
				// deep: true,
			},
			userId: {
				immediate: true,
				async handler(val) {
					if (val && val > 0) {
						this.getAnalysisList(val);
						this.$store.dispatch('fetchcourseData');
					}
				},
				// deep: true,
			},
		},
		components: {
			SProgressBar,
			ChatHistory,
			Nav,
			AbilityProgressBar
		},
		async created() {
			illustrationSrc(this.homepageData, this.$store, this.$t);
		},
		onLoad(option) {
			// this.$store.dispatch('fetchHomepageData');
		},
		onUnload() {

		},
		onShow() {
			if (typeof wx !== 'undefined' && uni.getSystemInfoSync().platform === 'wx') {
				wx.hideHomeButton();
			}
		},
		methods: {
			async chooseImage() {
				try {
					const res = await uni.chooseImage({
						count: 1,
						sizeType: ['original', 'compressed'],
						sourceType: ['album', 'camera']
					});
					const tempFilePaths = res.tempFilePaths;
					console.log(tempFilePaths);
					await this.uploadImage(tempFilePaths[0]);
				} catch (error) {
					console.error('Error choosing image:', error);
				}
			},
			async uploadImage(filePath) {
				try {
					this.isLoading = true;
					const result = await apiService.uploadChatHistory(filePath, this.userId);
					const resultJson = JSON.parse(result);
					this.navigateToAnalysis(resultJson);
				} catch (error) {
					uni.showToast({
						title: 'Upload failed, please try again',
						icon: 'none', 
						duration: 2000 
					});
					console.error('Upload failed:', error);
					this.isLoading = false;
					// 处理上传失败的情况
				}
			},
			jumpBattlefield(row) {
				if(row.result_list) {
					const result_list = row.result_list;
					if(result_list.status === 'complete') {
						uni.navigateTo({
							url: `/pages/battlefield/battlefield-summary?isFromMap=true&courseId=${row.id}`
						});
					}
				}
				uni.navigateTo({
					url: `/pages/battlefield/battlefield-intro?courseId=${row.id}`
				});
			},
			navigateToAnalysis(analysis) {
				console.log("navigate To analysis....");
				uni.navigateTo({
					url: `/pages/chat/details?analysisId=${analysis.id}`
				});
				this.isLoading = false;
			},
			async getAnalysisList() {
				try {
					const data = await apiService.getAnalysisList(this.userId);
					data.forEach(item => {
						item.analysis = JSON.parse(item.analysis);
						item.chatHistory = JSON.parse(item.chatHistory);
					});
					console.log(data);
					// this.analysisList = data;
					this.$store.commit('setAnalysisList', data);
				} catch (error) {
					// this.error = 'Error fetching analysis data';
					console.error(this.error, error);
				} finally {

				}
			},
			navigateToResult() {
				uni.reLaunch({
					url: `/pages/result/result_zh`
				});
			},
		},
	};
</script>



<style scoped>
	.container {
		position: relative;
		background-color: #2F2F38;
		/* display: flex; */
		flex-direction: column;
		align-items: left;
		/* padding-top: 100rpx; */
		width: 100%;
		height: calc(100vh - 75px);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.content {
		display: flex;
		/* 避免 flex 布局干扰 */
		flex-direction: column;
		align-items: left;
		/* width: 100%; */
		padding: 0 40rpx;
	}

	.today-recommend {
		display: block;
		/* margin-bottom: 50rpx; */
	}
	.today-recommend-title {
		font-size: 45rpx;
		color: #FFFFFF;
		font-weight: bold;
		margin-bottom: 10rpx;
	}
	.today-recommend-desc {
		font-size: 24rpx;
		color: #D7D8E0;
		font-weight: 400;
	}
	
	.class-item-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 24rpx;
		gap: 22rpx;
	}
	.class-item-left {
		width: 366rpx;
		display: block;
		align-items: center;
		background-color: #373742;
		border-radius: 32rpx;
	}
	.class-item-image {
		width: 100%;
		height: 110px;
	}
	.class-item-text {
		display: block;
		padding: 24rpx 32rpx;
	}
	.class-item-text-title {
		font-size: 16px;
		font-weight: 600;
		color: #FFFFFF;
	}
	.class-item-text-desc {
		font-size: 13px;
		font-weight: 400;
		color: #D7D8E0;
		margin-top: 5px;
	}
	
	.chat-interpretation {
		display: block;
		margin-top: 40rpx;
	}
	.chat-interpretation-title {
		font-size: 45rpx;
		color: #FFFFFF;
		font-weight: bold;
		margin-bottom: 10rpx;
	}
	.chat-interpretation-desc {
		font-size: 24rpx;
		color: #D7D8E0;
		font-weight: 400;
	}
	.upload-card {
		width: 100%;
		height: 168rpx;
		display: block;
		border: 1px solid #9EE44D;
		margin-top: 24rpx;
		border-radius: 32rpx;
	}
	.upload-card-container {
		padding: 32rpx;
	}
	.upload-card-image {
		width: 48rpx;
		height: 48rpx;
	}
	.upload-card-title {
		font-size: 17px;
		font-weight: 600;
		color: #9EE44D;
		display: flex;
		align-items: center;
	}
	.upload-card-desc {
		font-size: 15px;
		font-weight: 600;
		color: #D7D8E0;
		margin-left: 50rpx;
		/* margin-top: 16rpx; */
	}

	.history-solid {
		width: 90%;
		color: #67677A;
		display: flex;
		align-items: center;
		margin: 16rpx auto;
	}
	.line {
		flex: 1; /* 使线条占据剩余空间 */
		height: 1px; /* 线条的高度 */
		background-color: #67677A; /* 线条的颜色 */
		margin: 0 10px; /* 线条与文字之间的间距 */
	}

	.history-list {
		display: block;
		margin-bottom: 100rpx;
	}
	.history-item {
		padding: 32rpx;
		border-radius: 32rpx;
		background-color: #373742;
		margin-bottom: 24rpx;
	}
	.history-list-title {
		font-size: 17px;
		font-weight: 600;
		color: #FFFFFF;
	}
	.history-list-content {
		font-size: 15px;
		font-weight: 400;
		color: #D7D8E0;
		margin-top: 8rpx;
	}
	.history-list-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 16rpx;
	}
	.history-list-tab {
		display: flex;
		align-items: center;
	}
	.tab-item {
		background-color: #454552;
		font-size: 12px;
		font-weight: 400;
		color: #FFFFFF;
		margin-right: 8rpx;
		padding: 4rpx 20rpx;
		border-radius: 20rpx;
	}
	.history-list-time {
		font-size: 13px;
		font-weight: 400;
		color: #D7D8E0;
	}
</style>