<template>
	<view class="container" :style="{ '--nav-bar-height': navBarHeight }">
		<view class="header" :style="{ height: navBarHeight + 'px'}">
			<image class="header-icon" src="/static/back-left.png" @click="navigateToHome" :style="{marginTop: navBarTop + 'px'}"></image>
			<text class="score-title-head" :style="{marginTop: navBarTop + 'px'}">{{ $t('pages.dashboard.moment_analysis.title') }}</text>
			<view class="header-icon"></view>
		</view>
		<view class="content">
			<!-- <view class="analysis-header">
				<image class="back" src="../../static/dashboard/left-arrow.png" @click="goback"></image>
				<text class="title">对话分析</text>
				<image style="width: 64rpx;height:64rpx" src="../../static/dashboard/trash.png" @click="openModal">
				</image>
			</view> -->
			<scroll-view scroll-y="true" class="details">
				<ul class="detail-ul">
					<view class="detail-ui-title">
						<image class="xinxin" src="/static/dashboard/xinxin.png"></image>
						<view class="detail-title" style="">
							{{analysisResult.analysis.title.title}}
						</view>
					</view>
					<view class="detail-summary" style="">
						{{analysisResult.analysis.summary.summary}}
					</view>
					<view class="detail-summary" style="">{{ $t('pages.dashboard.moment_analysis.youcan') }}</view>
					<li class="detail-item" v-for="suggestion in analysisResult.analysis.suggestions">
						{{ suggestion.point }}
					</li>
				</ul>
			</scroll-view>
			<view class="chat-history">
				<text class="title">{{ $t('pages.dashboard.moment_analysis.chathistory') }}</text>
				<view class="chat-list">
					<scroll-view scroll-y="true" style="height: 594rpx">
						<view class="history-detail">
							<view v-for="(message, index) in analysisResult.chatHistory" :key="index"
								:class="['bubble', message.user == 'me' ? 'me' : 'other']">
								{{message.message}}
							</view>
						</view>
					</scroll-view>
				</view>
			</view>
			<view class="delete" @click="openModal">{{ $t('pages.dashboard.moment_analysis.deletethismoment') }}</view>

			<!-- delete model -->
			<view v-if="isModelOpen" class="overlay">
				<view class="delete-model">
					<view v-if="isDeleteSuccess">
						<view class="model-title">{{ $t('pages.dashboard.moment_analysis.deletesuccess') }}</view>
						<view class="model-desc">{{ $t('pages.dashboard.moment_analysis.delete_success_text') }}</view>
						<view class="button-container">
							<view class="button right" style="width: 446rpx" @click="goback">{{ $t('pages.dashboard.moment_analysis.bank_home') }}</view>
						</view>
					</view>
					<view v-else>
						<view class="overlay-content">
							<view class="model-title">{{ $t('pages.dashboard.moment_analysis.delete_record') }}</view>
							<view class="model-desc">{{ $t('pages.dashboard.moment_analysis.delete_record_analysis') }}</view>
						</view>
						<view class="button-container">
							<view class="button left" :class="{ 'is-loading': isLoading }" @click="cancelDelete">{{ $t('index.cancel') }}
							</view>
							<view class="button right" @click="deleteMoment">
								<text v-if="!isDeleting">{{ $t('index.confirm') }}</text>
								<view v-else class="loader"></view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import apiService from '../../services/api-service';

	export default {
		data() {
			return {
				analysisId: 0,
				isModelOpen: false,
				isDeleting: false,
				isDeleteSuccess: false,
				// analysisResult: {},
			}
		},
		computed: {
			navBarTop() {
				return this.$store.getters.getNavBarTop;
			},
			navBarHeight() {
				return this.$store.getters.getNavBarHeight;
			},
			analysisResult() {
				return this.$store.getters.getAnalysisById(this.analysisId);
			}
		},
		onLoad(options) {
			const { analysisId } = options;
			this.analysisId = analysisId;
		},
		methods: {
			navigateToHome() {
				if (getCurrentPages().length > 1) {
					uni.navigateBack(); // 返回上一个页面
				} else {
					uni.redirectTo({
						url: '/pages/dashboard/dashboard_zh' // 如果没有历史记录，导航到指定页面
					});
				}
			},
			openModal() {
				this.isModelOpen = true;
			},
			cancelDelete() {
				this.isModelOpen = false;
			},
			async deleteMoment() {
				try {
					if (this.isDeleting) return;
					this.isDeleting = true;
					await apiService.deleteMoment(this.analysisId);
					this.isDeleteSuccess = true;
				} catch (error) {
					return false;
				} finally {
					this.isDeleting = false;
				}
			},
		},
	}
</script>

<style scoped>
	.container {
		position: relative;
		background-color: #2f2f38;
		height: 100vh;
		width: 100%;
		/* display: flex; */
	}
	.header {
		position: relative;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		z-index: 6;
		width: 100%;
		height: 104rpx;
		/* padding: 0 32rpx; */
		/* padding-top: 82rpx; */
	}

	.header-icon {
		width: 24rpx;
		height: 50rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		padding-left: 32rpx;
	}

	.content {
		display: flex;
		height: calc(100vh - var(--nav-bar-height));
		flex-direction: column;
		justify-content: center;
		/* text-align: center; */
		/* margin-top: 160rpx; */
	}

	.score-title-head {
		font-size: 40rpx;
		font-weight: bold;
		color: #FFFFFF;
		z-index: 6;
	}


	.analysis-header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		height: 64rpx;
	}

	.back {
		width: 34.66rpx;
		height: 37.76rpx;
	}

	.loader {
		border: 2px solid #1c1c1e;
		/* Match button background color */
		border-top: 2px solid #ffffff;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	.title {
		font-weight: 600;
		font-size: 44rpx;
		line-height: 56rpx;
		color: #fff;
	}

	.details {
		width: 670rpx;
		height: 606rpx;
		background-color: #373742;
		margin-top: 30rpx;
		border-radius: 32rpx;
		overflow: hidden;
		margin: 26rpx auto;
	}

	.chat-history {
		/* margin-top: 34rpx; */
		margin: 24rpx auto;
	}

	.chat-list {
		width: 670rpx;
		height: 594rpx;
		border-radius: 32rpx;
		border: 1px solid #67677a;
		margin-top: 16rpx;
	}

	.detail-title {
		font-size: 40rpx;
		font-weight: 700;
		color: #fff;
		line-height: 60rpx;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: keep-all;
		white-space: normal;
	}
	.xinxin {
		width: 70rpx;
		height:50rpx;
		position: relative;
		top: 5px;
	}

	.detail-summary {
		font-size: 30rpx;
		font-weight: 400;
		color: #fff;
		line-height: 40rpx;
		padding: 8rpx 0 8rpx 44rpx;
	}	

	.detail-ui-title {
		display: flex;
	}

	.detail-ul {
		/* width: 100%; */
		padding: 32rpx;
		color: #fff;
		font-size: 26rpx;
		font-weight: 400;
		line-height: 36rpx;
		list-style-type: none;
		/* padding-left: 0; */
	}

	.detail-item {
		position: relative;
		padding-left: 44rpx;
	}

	.detail-item::before {
		content: "•";
		font-weight: 900;
		position: absolute;
		left: 16rpx;
	}

	.history-detail {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		margin-top: 32rpx;
		padding-bottom: 32rpx;
	}

	.bubble {
		width: auto;
		max-width: 460rpx;
		height: auto;
		border-radius: 16rpx;
		padding: 8rpx 16rpx 8rpx 16rpx;

		font-weight: 400;
		font-size: 26rpx;
		line-height: 36rpx;
		color: #fff;
	}

	.me {
		background-color: #9ee44d4d;
		margin-left: auto;
		margin-right: 24rpx;
	}

	.other {
		background-color: #ffffff4d;
		margin-left: 24rpx;
		margin-right: auto;
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: #00000073;
		backdrop-filter: blur(40rpx);

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.delete-model {
		width: 542rpx;
		height: 356rpx;
		background-color: #2f2f38;
		border-radius: 32rpx;
		box-shadow: 0px 16rpx 72rpx 0px #00000029;
		/* padding-left: 48rpx; */
	}

	.overlay-content {
		padding: 0 32rpx;
	}
	.model-title {
		width: 542rpx;
		height: 96rpx;
		font-size: 38rpx;
		font-weight: 700;
		line-height: 48rpx;
		color: #ffffff;

		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	.model-desc {
		width: 542rpx;
		height: 96rpx;
		font-size: 28rpx;
		font-weight: 400;
		line-height: 40rpx;
		color: #ffffff;

		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	.button-container {
		display: flex;
		flex-direction: row;
		gap: 12px;
		margin-top: 24rpx;
		justify-content: center;
	}

	.button {
		width: 211rpx;
		height: 84rpx;
		border-radius: 40rpx;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.left {
		border: 1px solid #67677a;
		background-color: #2f2f38;
		box-shadow: 0px 16rpx 72rpx 0px #00000029;
		color: #fff;
	}

	.right {
		background-color: #9ee44d;
		color: #000;
	}
	.delete {
		display: block;
		text-align: center;
		font-family: Source Han Sans SC;
		font-size: 30rpx;
		font-weight: 400;
		line-height: 44rpx;
		text-align: center;
		text-underline-position: from-font;
		text-decoration-skip-ink: none;
		color: #9EE44D;
		margin-bottom: 54rpx;
	}
</style>