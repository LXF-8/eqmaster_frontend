<template>
	<view class="container" :style="{'--theme-color-matching': themeColors.matching, '--theme-color-theme': themeColors.theme, '--bgimg':`url(${getBgImg})`}">
		<view class="overlay"></view>
		<view class="navbar" :style="{ height: navBarHeight + 'px' }">
			<image @click="goback" class="back-button" src="/static/back-left.png" :style="{marginTop: navBarTop + 'px'}"></image>
			<!-- #ifdef MP-WEIXIN -->
			<!-- <view class="wetchat-menu" :style="{marginTop: navBarTop + 'px'}"></view> -->
			<!-- #endif -->
		</view>
		<view class="content">
			<view class="progress-bar">
				<progress-bar :isActive="true" class="progress-bar-item"></progress-bar>
				<progress-bar :isActive="true" class="progress-bar-item"></progress-bar>
			</view>
			<view class="content-text">
				<view class="task-header">
					<!-- <text class="main-title">A Cross-Department Meeting</text> -->
					<text class="sub-title">{{ $t('pages.battlefield.task.subtitle') }}</text>
				</view>
	
				<!-- 任务列表 -->
				<view class="task-list">
					<view class="task-item">
						<view class="index-circle">
							<text class="index-word">
								1
							</text>
						</view>
						<text class="task-word">{{ taskList[0]}}</text>
						<!-- <text class="task-word">{{ $t('pages.battlefield.task.task1') }}</text> -->
						<!-- <text class="task-word">得到领导的夸赞× 2</text> -->
					</view>
					<view class="task-item">
						<view class="index-circle">
							<text class="index-word">
								2
							</text>
						</view>
						<text class="task-word">{{ taskList[1] }}</text>
						<!-- <text class="task-word">{{ $t('pages.battlefield.task.task2') }}</text> -->
					</view>
				</view>
			</view>
		</view>
		<view class="continue-button-container">
			<button class="continue-btn" @click="navigateToNextPage">{{ $t('pages.battlefield.task.continue') }}</button>
		</view>
	</view>
</template>

<script>
	import ProgressBar from '@/components/ProgressBar.vue'; // 引入组件
	import { getImg } from '../../scripts/constants';
	export default {
		data() {
			return {
				courseId: 0,
			};
		},
		components: {
			ProgressBar, // 注册组件
		},
		onLoad(options) {
			if(!options.courseId || options.courseId <= 0) {
				uni.navigateBack();
			}
			this.courseId = options.courseId;
		},
		computed: {
			courseInfo() {
				return this.$store.getters.getCourseInfo;
			},
			taskList() {
				if (this.courseInfo?.course_data?.task) {
					return this.courseInfo.course_data.task.split(':');
					// 返回数组 ['一句话让每位同事心情愉悦', '点出让每位同事满意的菜品']
				}
				return [];
			},
			navBarTop() {
				return this.$store.getters.getNavBarTop;
			},
			navBarHeight() {
				return this.$store.getters.getNavBarHeight;
			},
			isWeChatMiniProgram() {
				const systemInfo = uni.getSystemInfoSync();
				return systemInfo.uniPlatform === 'mp-weixin';
			},
			themeColors() {
				return this.$store.getters.getThemeColors;
			},
			getBgImg(){
				return getImg(this.themeColors.background);
			},
		},

		methods: {
			navigateToNextPage() {
				uni.redirectTo({
					url: `/pages/battlefield/battlefield-loading`
				});
			},
			goback() {
				if (getCurrentPages().length > 1) {
					uni.navigateBack(); // 返回上一个页面
				} else {
					uni.redirectTo({
						url: `/pages/battlefield/battlefield-intro?courseId=${this.courseId}`
					});
				}
			}
		}
	}
</script>

<style scoped>
	@import "./common.css";

	.navbar {
		display: flex;
		flex-direction: row;
		justify-content: left;
		align-items: center;
		padding: 0 20rpx;
		position: relative;
		z-index: 3;
		/* margin-top: 90rpx; */
		/* margin-left: 0 20rpx; */
		/* 确保导航栏在叠加层之上 */
	}

	.back-button {
		width: 24rpx;
		height: 50rpx;
	}
	.content-text {
		margin-top: 156rpx;
		display: grid;
	}
	.progress-bar {
		/* flex: 1; */
		width: 100%;
		height: 28px;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 16rpx;
	}
	.progress-bar-item {
		width: 50%;
	}
	.progress-bar-item-wetchat {
		width: 274rpx;
	}

	.wetchat-menu {
		width: 200rpx;
	}

	.content {
		padding: 0 40rpx;
		text-align: center;
		z-index: 3;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.task-word {
		color: #fff;
		font-size: 34rpx;
		font-weight: 350;
		line-height: 51rpx;
		width: 80%;
		text-align: start;
		margin-left: 24rpx;
	}

	.task-header {
		/* margin-top: 30rpx; */
		text-align: center;
		color: #fff;
	}

	.main-title {
		font-size: 40rpx;
		font-weight: bold;
		color: #fff;
	}

	.sub-title {
		font-size: 34px;
		margin-top: 30rpx;
		font-weight: 700;
		color: #fff;
	}

	.task-list {
		width: 100%;
		margin-top: 64rpx;
		display: flex;
		gap: 24rpx;
		/* min-height: 40rpx; */
		/* flex-direction: row; */
		/* justify-content: flex-start; */
	}

	.task-item {
		display: flex;
		flex-direction: row;
		gap: 12rpx;
		justify-content: flex-start;
		align-items: center;
		font-size: 28rpx;
		margin-bottom: 20rpx;
		width: 100%;
		/* margin-top: 30rpx; */
		margin-left: 48rpx;
	}

	/* 确保内容区域占满屏幕高度 */
	.task-header,
	.task-list {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.index-circle {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		/* background-color: #F2BC74; */
		background-color: var(--theme-color-theme);
		color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.index-word {
		color: #000;
		font-size: 40rpx;
		font-weight: 600;
	}

	.continue-btn {
		width: 80%;
		height: 44px;
		line-height: 44px;
		/* 调整这里的值来控制按钮距离底部的高度 */
		background-color: var(--theme-color-theme); /* #F2BC74 */
		border: none;
		border-radius: 25px;
		font-size: 15px;
		font-weight: 600;
		color: #252529;
		padding: 10px, 23px;
		z-index: 3;
	}
</style>