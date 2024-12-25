<template>
	<view class="container">
		<scroll-view scroll-y>
			<view class="content">
				<!-- 添加错误处理和加载状态 -->
				<view v-if="isLoading">加载中...</view>
				<view v-else-if="error">{{ error }}</view>
				<view v-else>
					<view class="today-recommend">
						<view class="today-recommend-title">今日推荐</view>
						<view class="today-recommend-desc">提升情商，从此“课”开始！</view>
						<view class="class-item-container">
							<view class="class-item-left">
								<image class="class-item-image" src="/static/rectangle-left.png" mode="widthFix"></image>
								<view class="class-item-text">
									<view class="class-item-text-title">
										老板肚子的蛔虫
									</view>
									<view class="class-item-text-desc">
										100人在玩
									</view>
								</view>
							</view>
							<view class="class-item-right">
								<image class="class-item-image" src="/static/rectangle-right.png" mode="widthFix"></image>
								<view class="class-item-text">
									<view class="class-item-text-title">
										事业爱情两难全
									</view>
									<view class="class-item-text-desc">
										100人在玩
									</view>
								</view>
							</view>
						</view>
					</view>

					<view class="chat-interpretation">
						<view class="chat-interpretation-title">聊天解读</view>
						<view class="chat-interpretation-desc">分析聊天对话，获得独到见解的聊天建议</view>
						<view class="upload-card" @click="chooseImage">
							<view class="upload-card-container">
								<view class="upload-card-title">
									<image class="upload-card-image" src="/static/chat-upload.png" mode="widthFix"></image>
									上传聊天记录
								</view>
								<view class="upload-card-desc">遇到难以回复的消息？立刻上传吧！</view>
							</view>
						</view>
					</view>

					<view class="history-solid"><span class="line"></span>历史记录<span class="line"></span></view> 

					<view class="history-list">
						<view class="history-item">
							<view class="history-list-title">清晰且及时的沟通是钥匙</view>
							<view class="history-list-content">当前问题在于，虽然任务已达成一致，但缺乏关于进展或延误的主动沟通，导致未接来电...</view>
							<view class="history-list-footer">
								<view class="history-list-tab">
									<view class="tab-item">职场</view>
									<view class="tab-item">沟通技巧</view>
								</view>
								<view class="history-list-time">11:31</view>
							</view>
						</view>

						<view class="history-item">
							<view class="history-list-title">清晰且及时的沟通是钥匙</view>
							<view class="history-list-content">当前问题在于，虽然任务已达成一致，但缺乏关于进展或延误的主动沟通，导致未接来电...</view>
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
		<Nav :selectedView="currentView === 'dashboard' ? 'Home' : 'Battlefield'" @switchHomeView="switchView"
			:userId="userId" :username="username" :jobId="jobId" />
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

	export default {

		data() {
			return {
				score: 28, // 示例分数，可根据需要动态改
				maxScore: 100, // 假设最大分数为100
				gender: '',
				birthday: null,
				selectedOptions: [],
				jobId: null,
				num: null,
				finishComponents: 1,
				totalComponents: 3,
				isLoading: true,
				error: null,
				analysisList: [],
				animal: '',
				animal_zh: '',
				minanimal: '',
				maxanimal: '',
				// courseData: {},
				showSplash: false, // 默认不显示闪屏
				progress: 0,
				progressInterval: null,
				isExpanded: false, // 默认收起状态
				showPopup: false, // 将初始值设为 false，使弹窗在页面加载时不显示
				selectedOption: 'subordinate', // 默认选择"同事"
				// 添加同类型的标签表
				colleagueTags: ['摸鱼高手', '时间管理大师', '潜力股', '马屁精', '靠谱伙伴'],
				bossSubordinateTags: ['完美主义者', 'PUA大', '加班狂魔', '甩锅侠', '独裁者'],
				selectedTags: [],
				isProfileComplete: false, // New data property to track profile completion
				profileName: '', // New data property for profile name
				roleCards: [{
						title: '角色卡1'
					},
					{
						title: '角色卡2'
					},
					{
						title: '角色卡3'
					},
					{
						title: '角色卡4'
					},
					{
						title: '角色卡5'
					},
					// 可以根需要添加更多卡片
				],
				showNewPopup: false,
				currentDate: new Date(),
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
			courseData() {
				return this.$store.getters.getcourseData;
			},
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
			await this.getAnalysisList();

			illustrationSrc(this.homepageData, this.$store, this.$t);
		},
		onLoad(option) {
			this.$store.dispatch('fetchHomepageData');
		},
		onUnload() {

		},
		onShow() {
			this.getAnalysisList(this.userId);
			if (typeof wx !== 'undefined') {
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
			async getHomepageData() {
				try {
					this.isLoading = true;
					this.error = null;
					this.userId
					console.log('Fetching homepage data with userId:', this.userId);

					const data = await apiService.getHomepageData(this.userId);
					this.homepageData = data;
					console.log('Homepage data received:', this.homepageData);

					// this.$nextTick(() => {
					// 	this.drawRadar();
					// });
				} catch (error) {
					this.error = 'Error fetching homepage data';
					console.error(this.error, error);
				} finally {
					this.isLoading = false;
				}
			},

			async getAnalysisList() {
				try {
					this.userId;
					const data = await apiService.getAnalysisList(this.userId);
					data.forEach(item => {
						item.analysis = JSON.parse(item.analysis);
						item.chatHistory = JSON.parse(item.chatHistory);
					});
					console.log(data);
					this.analysisList = data;
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
	.class-item-left, .class-item-right {
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
		font-size: 17px;
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
		margin-top: 16rpx;
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