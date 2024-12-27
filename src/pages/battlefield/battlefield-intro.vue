<template>
	<view class="container" :style="{'--theme-color-matching': themeColors.matching, '--theme-color-theme': themeColors.theme ,'--bgimg':`url(${getBgImg})`}">
		<view class="overlay"></view>
		<view class="navbar" :style="{ height: navBarHeight + 'px' }">
			<image class="back-button" src="/static/back-left.png" @tap="goToDashboard" :style="{marginTop: navBarTop + 'px'}"></image>
			<!-- #ifdef MP-WEIXIN -->
			<!-- <view class="wetchat-menu" :style="{marginTop: navBarTop + 'px'}"></view> -->
			<!-- #endif -->
		</view>
		
		<!-- Content -->
		<view class="content">
			<view class="progress-bar">
				<progress-bar :isActive="true" class="progress-bar-item"></progress-bar>
				<progress-bar :isActive="false" class="progress-bar-item"></progress-bar>
			</view>
			<view class="content-text">
				<text class="title content-item">Unit {{ this.courseInfo.course_data.course_level }} </text>
				<text class="subtitle content-item">{{ this.courseInfo.course_data.title }}</text>
				<text class="time-info content-item">{{ $t('pages.battlefield.intro.unit1.time') }}</text>
				<rich-text :nodes="generateNpcHtml"></rich-text>
			</view>
			<!-- <view class="description content-item" id="desc">
				{{ this.courseInfo.course_data.background }}
			</view> -->
			<!-- <text class="title content-item">{{ $t('pages.battlefield.intro.unit1.title') }}</text>
			<text class="subtitle content-item">{{ $t('pages.battlefield.intro.unit1.subtitle') }}</text>
			<text class="time-info content-item">{{ $t('pages.battlefield.intro.unit1.time') }}</text>
			<view class="description content-item" id="desc">
				{{ $t('pages.battlefield.intro.unit1.desc') }}
			</view> -->
		</view>
		<view class="continue-button-container">
			<button class="continue-btn" @click="navigateToNextPage">{{ $t('pages.battlefield.intro.continue') }}</button>
		</view>
	</view>
</template>

<script>
	import ProgressBar from '@/components/ProgressBar.vue'; // 引入组件
	import {
		getImg
	} from "../../scripts/constants";
	import locale from '@/locale';
	export default {
		components: {
			ProgressBar, // 注册组件
		},
		data() {
			return {
				htmlContent: `<view class="description content-item" id="desc">111</view>`,
				nodes: [],
				previousCourseData: null, // 初始化之前的课程数据
				courseId: 0,
			};
		},
		created() {
			
		},
		onLoad(options) {
			if(!options.courseId || options.courseId <= 0) {
				uni.navigateBack();
			}
			this.courseId = options.courseId;
		},
		computed: {
			npcs() {
				return this.$store.getters.getNpcs;
			},
			courseData() {
				return this.$store.getters.getcourseData;
			},
			courseInfo() {
				return this.$store.getters.getCourseInfo;
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
			generateNpcHtml() {
				if(this.courseInfo.course_data && this.courseInfo.course_data.npc) {
					const npcData = JSON.parse(this.courseInfo.course_data.npc);
					let content = this.courseInfo.course_data.background;
					const names = Object.values(npcData).map(npc => npc.name);
					// 定义一个空的节点数组
					let nodes = [
					];
       				let lastIndex = 0;
					
					// names.forEach((npcName) => {
					// 	const regex = new RegExp(`(${npcName})`, 'gi'); // 正则匹配npcName，不区分大小写
					// 	content = content.replace(regex, (match) => {
					// 		const npc = Object.values(npcData).find(n => n.name === npcName);
					// 		return `<span class="npc-name"><img src="${npc.avatar_url}" class="npc-avatar">${match}</span>`;
					// 	});
					// });
					// return `
					// 	<div class="description content-item" id="desc">
					// 		${content}
					// 	</div>
					// `;
					// 遍历所有 NPC 名字并替换
					if(locale.getShortLocale() === 'en') {
						names.forEach((npcName) => {
							const regex = new RegExp(`(${npcName})`, 'gi'); // 匹配 npcName，不区分大小写
							let match;
	
							while ((match = regex.exec(content)) !== null) {
								// 插入 NPC 名字前的文本
								if (match.index > lastIndex) {
									nodes.push({
										type: 'text',
										text: content.substring(lastIndex, match.index)
									});
								}
	
								// 找到对应的 NPC
								const npc = Object.values(npcData).find(n => n.name === npcName);
								console.log(npc);
								// 用 <view> 和 <image> 替代 <span> 和 <img>
								nodes.push({
									name: 'span',
									attrs: {
										class: "npc-name",
										style: "background-color: " + this.themeColors.theme_deep
									},
									children: [
										{
											name: 'img',
											attrs: {
												src: getImg(npc.avatar_url), // NPC 头像 URL
												class: 'npc-avatar', // 可以使用样式类来控制图像大小等
												alt: npc.name // 可选：提供 alt 属性用于图像描述
											}
										},
										{
											type: 'text',
											text: match[0] // 插入 NPC 名字
										}
									]
								});
								console.log(regex);
								lastIndex = regex.lastIndex;
							}
						});
					}

					// 插入剩余的文本
					if (lastIndex < content.length) {
						nodes.push({
							type: 'text',
							text: content.substring(lastIndex)
						});
					}

					// 包装所有内容的 view 组件，模拟 <div> 标签
					return [{
						name: 'div',
						attrs: {
							class: 'description content-item', // 如果需要样式，可以通过 class 或 style 来模拟
							id: 'desc'
						},
						children: nodes
					}]
				}
			},
			themeColors() {
				return this.$store.getters.getThemeColors;
			},
			getBgImg(){
				return getImg(this.themeColors.background);
			},
		},
		watch: {
			courseInfo(newValue) {
				// console.log("courseInfo : ", newValue);
				if (newValue && newValue.course_data && newValue.course_data !== this.previousCourseData) {
					this.previousCourseData = newValue.course_data; // 存储当前的 course_data
					// this.generateNpcHtml(newValue.course_data);
				}
			},
			courseId: {
				handler(newValue) {
					console.log(newValue);
					if(newValue > 0) {
						this.loadCourse();
					}
				},
				deep: true,
			},
		},
		methods: {
			navigateToNextPage() {
				uni.redirectTo({
					url: `/pages/battlefield/battlefield-task?courseId=${this.courseId}` // Replace this with the actual path to your next page
				});
			},
			goToDashboard() {
				if (getCurrentPages().length > 1) {
					uni.navigateBack(); // 返回上一个页面
				} else {
					uni.redirectTo({
						url: '/pages/home/index' // 如果没有历史记录，导航到指定页面
					});
				}
			},
			async loadCourse() {
				try {
					await this.$store.dispatch('fetchCourseInfo', this.courseId)
					// console.log('courseInfo:', this.courseInfo)
					// 成功获取课程信息后的操作
				} catch (error) {
					// 处理错误
				}
			}
		}
	}
</script>
<style>
.description {
		font-size: 16px;
		font-weight: 400;
		align-items: center;
		line-height: 30px;
		text-align: center;
		color: #fff;
		/* 具体设置白色 */
	}
	.npc-name {
		width: max-content;
		height: 26px;
		/* background-color: #2D6985; */
		font-size: 17px;
		font-weight: 400;
		white-space: nowrap;
		/* 强制不换行 */
		padding: 4rpx 12rpx;
		line-height: 26px;
		/* 上下居中 */
		position: relative;
		border-radius: 12px;
	}
	.npc-avatar {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background-color: #fff;
		position: relative;
		top: 8rpx;
		margin-right: 4px;
		/* position: absolute;
		top: 50%;
		transform: translateY(-50%); */
	}
	#desc,
	#desc .npc-name {
		line-height: 27px;
	}
</style>
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
		/* margin-top: 160rpx; */
		/* 确保页面内容在叠加层之上 */
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

	.title {
		font-size: 24px;
		font-weight: 700;
		color: #fff;
		/* 具体设置白色 */
	}

	.subtitle {
		font-size: 34px;
		font-weight: 700;
		margin: 10px 0;
		color: #fff;
		/* 具体设置白色 */
	}

	.time-info {
		font-size: 16px;
		color: #bbb;
		margin-bottom: 20px;
	}

	.description {
		font-size: 34rpx;
		font-weight: 400;
		align-items: center;
		line-height: 48rpx;
		text-align: center;
		color: #fff;
		/* 具体设置白色 */
	}

	#desc,
	#desc .npc-name {
		line-height: 54rpx;
	}

	.content-item {
		/* margin-top: 30rpx; */
		line-height: 68rpx;
	}

	/* .npc-name {
		width: max-content;
		height: 52rpx;
		background-color: #2D6985;
		font-size: 34rpx;
		font-weight: 400;
		white-space: nowrap;
		padding: 4rpx 12rpx;
		line-height: 52rpx;
		position: relative;
		border-radius: 26rpx;
	}

	.npc-avatar {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background-color: #fff;
		position: relative;
		top: 8rpx;
		margin-right: 8rpx;
	} */
</style>