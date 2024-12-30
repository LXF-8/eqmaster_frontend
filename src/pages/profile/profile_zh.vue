<template>
	<view class="container" :style="{ backgroundImage: `url(${getImg('/static/web/profile-bg.webp')})` }">
		<view class="header" :style="{ height: navBarHeight + 'px' }">
			<!--<image class="header-icon" src="/static/back-left.png" @click="navigateToHome" :style="{marginTop: navBarTop + 'px', opacity: 0}"></image>
			<text class="score-title-head" :style="{marginTop: navBarTop + 'px'}">{{ $t('components.Nav.Profile') }}</text>
			<view class="header-icon"></view>
			 <image class="header-icon" src="/static/battlefield/share.png"></image> -->
		</view>
		<!-- <scroll-view scroll-y> -->
			<view class="content">
				<view class="user-name">
					<image :src="userIconSrc" class="user-icon"></image>
					<text class="user-name-text">{{ username }}</text>
				</view>

				<view class="have-been-view" :style="{ backgroundImage: `url(${getImg('/static/web/have-been-bg.webp')})` }">
					<view class="have-been-view-center">
						<view class="have-been-header">
							<image src="/static/calinda.png" class="have-been-header-icon"></image>
							<text class="have-been-header-text">{{ $t('pages.profile.header') }}</text>
						</view>
						<view class="day">
							<view class="day-content">
								<view class="day-text">{{ homepageData?.response?.personal_info?.days_till_reg }}</view>
								<text class="day-text-days">{{ $t('pages.profile.days') }}</text>
							</view>
						</view>
						<view class="diamonds-stars">
							<view class="diamonds">
								<image class="diamonds-icon" src="/static/baoshi.png"></image>
								<view class="diamonds-source">
									<view class="diamonds-source-text">{{ $t('pages.profile.diamonds') }}</view>
									<view class="diamonds-source-number">
										{{ homepageData?.response?.personal_info?.num_diamond }}
									</view>
								</view>
							</view>
							<view class="stars">
								<image class="diamonds-icon" src="/static/xinxin.png"></image>
								<view class="diamonds-source">
									<view class="diamonds-source-text">{{ $t('pages.profile.stars') }}</view>
									<view class="diamonds-source-number">
										{{ homepageData?.response?.personal_info?.num_star }}
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="eqoach-bot-wrapper" v-if="!isDelEqoashBot">
					<view class="eqoach-bot" :style="{ transform: `translateX(${swipeOffset}px)` }"
						@touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
						<image class="eqoach-bot-icon" :src="getImg('/static/web/eqoach-icon.png')"></image>
						<view class="eqoach-bot-center">
							<view class="eqoach-bot-title">EQoach bot</view>
							<view class="eqoach-bot-desc">{{ $t('pages.profile.bot.desc') }}</view>
						</view>
						<view class="eqoach-bot-add">
							<button class="eqoach-bot-add-btn"
								@click="showEqoachPopup = true; saveqrcodeLoding = false;">{{ $t('pages.profile.bot.add') }}</button>
						</view>
					</view>
					<view class="delete-btn" :style="{ 
              opacity: deleteOpacity,
              pointerEvents: deleteOpacity === 0 ? 'none' : 'auto'
          }">
						<image class="delete-btn-icon" src="/static/delete.png" @click="isDelEqoashBot = true"></image>
					</view>
				</view>

			</view>

		<!-- </scroll-view> -->
		<view class="log-out" @click="logoutShow = true">
			{{ $t('pages.profile.logout') }}
		</view>

		<view class="language" @click="showLanguagePopup = true">
			{{ $t('pages.profile.language') }}
		</view>

		<Nav selectedView="Profile" />

		
		 <!-- 语言选择弹框 -->
		<view v-if="showLanguagePopup" class="popup-overlay">
			<view class="popup-content" @click.stop>
				<view class="card-box">
					<view class="card-header">
						<view class="title">
							<image class="card-close-image" src="/static/code_close.png" mode=""
								@click="showLanguagePopup = false">
							</image>
						</view>
					</view>
					<view class="locale" @click.stop>
						<view class="locale-text">
							{{ $t('pages.profile.language') }}
						</view>
						<view class="locale-list">
							<view class="locale-item" v-for="(item, index) in locales" :key="index" @click="onLocaleChange(item)">
								<text class="text">{{item.text}}</text>
								<text class="icon-check" v-if="item.code == applicationLocale"></text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		
		<!-- 二维码弹框 -->
		<view v-if="showEqoachPopup" class="popup-overlay">
			<view class="popup-content" @click.stop>
				<view class="card-box">
					<view class="card-header">
						<view class="title">
							<image class="card-close-image" src="/static/code_close.png" mode=""
								@click="showEqoachPopup = false">
							</image>
						</view>
					</view>
					<view class="eqoach-center" @click.stop>
						<view class="eqoach-center-text">
							{{$t('pages.profile.line.addbot')}}
						</view>
						<!-- <image class="eqoach-center-code-image" :src="getImg('/static/web/eqoach-telegram.webp')" ref="qrCodeImage"></image> -->
						<image class="eqoach-center-code-image" :src="qrCodeBase64" ref="qrCodeImage"></image>
						<view class="eqoach-center-line">
							<view class="save-code-one">
								<view class="save-code-num">1</view>
								{{$t('pages.profile.line.saveqrcode')}}
							</view>
							<view class="save-code-two">
								<view class="save-code-num">2</view>
								{{$t('pages.profile.line.swapcode')}}
							</view>
						</view>
					</view>
					<view class="card-button">
						<button :disabled="saveqrcodeLoding" @click="saveQRCode()">{{$t('pages.profile.line.saveqrcode')}}</button>
					</view>
				</view>
			</view>
		</view>

		<view v-if="logoutShow" class="popup-overlay">
			<view class="logout-popup-content" @click.stop>
				<view class="logout-header">{{ $t('pages.profile.popup.header') }}</view>
				<view class="logout-center" @click="logOutClick()">{{ $t('pages.profile.popup.ok') }}</view>
				<view class="logout-button" @click="logoutShow = false">{{ $t('pages.profile.popup.cancel') }}</view>
			</view>
		</view>
	</view>
</template>

<script>
	import locale from '@/locale';
	import apiService from '../../services/api-service';
	import Nav from '../../components/Nav.vue';
	import {
			getImg
		} from '../../scripts/constants.js';
import { generateAsync } from 'jszip';
	export default {
		components: {
			Nav
		},
		data() {
			return {
				getImg,
				name: '',
				intervalId: null,
				swipeOffset: 0,
				deleteOpacity: 0,
				startX: 0,
				showEqoachPopup: false,
				showLanguagePopup: false,
				logoutShow: false,
				saveqrcodeLoding: false,
				progressInterval: null,
				isLoading: true,
				error: null,
				// homepageData: {
				//   response: {
				//     personal_info: {
				//       name: ''
				//     },
				//     eq_scores: {
				//       score: 0,
				//       overall_suggestion: ''
				//     },
				//     contacts: []
				//   }
				// },
				isDelEqoashBot: false,
				applicationLocale: '',
				qrImg: null,
				qrCodeBase64: '',
			};
		},
		computed: {
			homepageData() {
				return this.$store.getters.getHomepageData;
			},
			userId() {
				return this.$store.getters.getUserId;
			},
			username() {
				return this.$store.getters.getUsername;
			},
			locales() {
				return [
					{
					text: this.$t('locale.en'),
					code: 'en'
					},
					{
						text: this.$t('locale.zh-hans'),
						code: 'zh-Hans'
					},
				]
			},
			navBarTop() {
				return this.$store.getters.getNavBarTop;
			},
			navBarHeight() {
				return this.$store.getters.getNavBarHeight;
			},
			userIconSrc() {
				const numDiamond = this.homepageData?.response?.personal_info?.num_diamond;
				if (numDiamond === 'male') {
					return '/static/male_icon.png';
				} else if (numDiamond === 'female') {
					return '/static/female_icon.png';
				} else {
					return '/static/user_icon.png'; // default or empty case
				}
			},
		},
		
		onLoad(option) {
			console.log('Received options:', option);
			this.getQrCode();

			// 接收上一个页面传递的数据
			// this.userId = option.userId || '';
			// this.username = decodeURIComponent(option.username || '');
			// this.gender = option.gender || '';
			// this.jobId = option.jobId || '';
			// this.num = option.num || '';

			// 立即调用一次
			// this.getHomepageData(this.userId);

			// 新增：接收个人名称
			// this.personalName = decodeURIComponent(option.personal_name || '');

			// 接收联系人相关信息
			// this.name = decodeURIComponent(option.name || '');
			// this.relation = decodeURIComponent(option.relation || '');
			// this.contactId = option.contactId || '';

			// 设置定时调用
			// this.intervalId = setInterval(() => {
			//   console.log('this.userId:', this.userId);
			//   this.getHomepageData(this.userId);
			// }, 50000); // 每50秒调用一次

			this.applicationLocale = locale.getLocale();
			uni.onLocaleChange((e) => {
				this.applicationLocale = e.locale;
			})
		},
		onUnload() {
			// 页面卸载时清除定时器
			if (this.intervalId) {
				clearInterval(this.intervalId);
			}
			if (this.progressInterval) {
				clearInterval(this.progressInterval);
			}
		},
		methods: {
			
			onLocaleChange(e) {
				uni.setLocale(e.code);
				this.$i18n.locale = e.code;
				this.$store.commit('setLocale', e.code);
				this.showLanguagePopup = false;
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
				} catch (error) {
					this.error = 'Error fetching homepage data';
					console.error(this.error, error);
				} finally {
					this.isLoading = false;
				}
			},
			async getQrCode() {
				try {
					const data = await apiService.generate_qrcode(this.userId, "telegram");
					this.qrCodeBase64 = `data:image/png;base64,${data.qr_code}`;
				} catch (error) {
					this.error = 'Error generating qrcode';
					console.error(this.error, error);
				}
			},
			touchStart(event) {
				this.startX = event.touches[0].clientX;
			},
			touchMove(event) {
				const currentX = event.touches[0].clientX;
				const diff = currentX - this.startX;

				if (diff < 0 && diff > -60) {
					this.swipeOffset = diff;
					this.deleteOpacity = Math.abs(diff) / 60;
				} else if (diff > 0 && this.swipeOffset < 0) {
					this.swipeOffset = Math.min(0, this.swipeOffset + diff);
					this.deleteOpacity = Math.abs(this.swipeOffset) / 60;
				}
			},
			touchEnd() {
				if (this.swipeOffset < -40) {
					this.swipeOffset = -60;
					this.deleteOpacity = 1;
				} else {
					this.swipeOffset = 0;
					this.deleteOpacity = 0;
				}
			},
			saveQRCode() {
				this.saveqrcodeLoding = true;

				const saveImage = () => {
					var save = wx.getFileSystemManager(); // 获取文件管理器对象
					var number = Math.random();
					save.writeFile({
					filePath: wx.env.USER_DATA_PATH + '/pic' + number + '.png', // 表示生成一个临时文件名
					data: this.qrCodeBase64.replace(/^data:image\/png;base64,/, ''),
					encoding: 'base64',
					success: res => {
						wx.saveImageToPhotosAlbum({
							filePath: wx.env.USER_DATA_PATH + '/pic' + number + '.png',
							success: function (res) {
								uni.showToast({
									title: 'Image saved successfully',
									icon: 'success'
								});
							},
							fail: function (err) {
								uni.showToast({
									title: 'Image save failed',
									icon: 'none'
								});
							}
						})
						console.log(res)
					}, fail: err => {
						console.log(err)
					}
					});
				};
				// const qrCodeImage = this.$refs.qrCodeImage;
				// if (!qrCodeImage) {
				// 	console.error('QR code image not found');
				// 	return;
				// }
				const sysInfo = uni.getSystemInfoSync();
				// #ifndef MP-WEIXIN
					uni.saveImageToPhotosAlbum({
						filePath:getImg('/static/web/eqoach-telegram.webp'),
						success: () => {
							uni.showToast({
								title: 'Image saved successfully',
								icon: 'success'
							});
						},
						fail: (err) => {
							console.log('保存图片失败：', err);
							uni.showToast({
								title: 'Image save failed',
								icon: 'none'
							});
						}
					});
				 // #endif
					 // #ifdef MP-WEIXIN
					uni.authorize({
					scope: 'scope.writePhotosAlbum',
					success: () => {
						saveImage();
						this.saveqrcodeLoding = false;
						// uni.downloadFile({
						// url: getImg('/static/web/eqoach-telegram.webp'),
						// success: (downloadRes) => {
						// 	if (downloadRes.statusCode === 200) {
						// 	uni.saveImageToPhotosAlbum({
						// 		filePath: downloadRes.tempFilePath,
						// 		success: () => {
						// 		uni.showToast({
						// 			title: 'Image saved successfully',
						// 			icon: 'success'
						// 		});
						// 		this.saveqrcodeLoding = false;
						// 		},
						// 		fail: (err) => {
						// 		console.log('保存图片失败：', err);
						// 		uni.showToast({
						// 			title: 'Image save failed',
						// 			icon: 'none'
						// 		});
						// 		this.saveqrcodeLoding = false;
						// 		}
						// 	});
						// 	} else {
						// 	console.error('下载图片失败：', downloadRes.statusCode);
						// 	this.saveqrcodeLoding = false;
						// 	}
						// },
						// fail: (err) => {
						// 	console.error('下载图片失败：', err);
						// 	this.saveqrcodeLoding = false;
						// }
						// });
					},
					fail: (err) => {
						console.log('授权失败：', err);
						uni.showModal({
						title: '授权失败',
						content: '请前往设置开启保存到相册的权限',
						showCancel: false,
						success: () => {
							this.saveqrcodeLoding = false;
						}
						});
					}
					});
					 // #endif
				
			},
			async logOutClick() {
				console.log("logOutClick");
				this.logoutShow = false;
				await apiService.deleteUserData(this.userId);
				await this.clearLocalUserId();
				uni.reLaunch({
					url: `/pages/landing/landing`
				});
			},
			async clearLocalUserId() {
				try {
					uni.removeStorageSync('userId');
					this.$store.dispatch('clearAllState');
					console.log('Local userId cache cleared');
				} catch (e) {
					console.error('Error clearing local userId cache:', e);
				}
			},
			navigateToHome() {
				if (getCurrentPages().length > 1) {
					uni.navigateBack(); // 返回上一个页面
				} else {
					uni.redirectTo({
						url: '/pages/home/index' // 如果没有历史记录，导航到指定页面
					});
				}
			}
		},
		mounted() {
			// this.startProgress(); // 开始进度条
			// this.animateImage(); // 开始图片动画
			// 如果需要在弹窗打开时设置默认选项，可以在此处调用
			// this.selectedOption = '同事'; // 已在 data 中设置，不需要额外操作
			
		},
		beforeDestroy() {
			// 页面销毁前清除定时器
			if (this.intervalId) {
				clearInterval(this.intervalId);
			}
			if (this.progressInterval) {
				clearInterval(this.progressInterval);
			}
		}
	};
</script>
<style scoped>
	.container {
		position: absolute;
		background-color: #2F2F38;
		display: flex;
		flex-direction: column;
		align-items: left;
		/* padding-top: 100rpx; */
		width: 100%;
		/* height: calc(100vh - 100rpx); */
		height: 100vh;
		overflow-x: hidden;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		/* 启用 iOS 惯性滚动 */
	}

	.content {
		display: flex;
		flex-direction: column;
		/* align-items: left; */
		width: 654rpx;
		/* height: 100%; */
		margin: 0 auto;
		/* margin-left: 20px; */
		margin-top: 140rpx;
		/* overflow: hidden; */
	}

	.header {
		position: absolute;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		z-index: 6;
		width: 100%;
		/* height: 156rpx; */
		/* padding-top: 82rpx; */
	}

	.score-title-head {
		font-size: 40rpx;
		font-weight: bold;
		color: #FFFFFF;
		z-index: 6;
	}

	.header-icon {
		width: 24rpx;
		height: 50rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: 16rpx;
	}

	.user-name {
		display: flex;
		align-items: center;
		gap: 24rpx;
		/* margin-top: 50rpx; */
	}

	.user-name-text {
		font-size: 34rpx;
		color: #FFFFFF;
		font-weight: 500;
	}

	.user-icon {
		width: 96rpx;
		height: 96rpx;
	}

	.have-been-view {
		/* display: flex; */
		/* width: auto; */
		height: 654rpx;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		margin-top: 50rpx;
	}

	.have-been-view-center {
		/* width: 100%; */
		padding: 16px 12px;
	}

	.have-been-header {
		position: relative;
		display: flex;
		gap: 8rpx;
	}

	.have-been-header-icon {
		width: 40rpx;
		height: 40rpx;
	}

	.have-been-header-text {
		font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
		font-size: 30rpx;
		font-weight: 600;
		line-height: 40rpx;
		text-align: left;
		color: #FFFFFF;
	}

	.day {
		width: 100%;
		height: 444rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.day-content {
		position: relative;
		display: flex;
		/* width: 302rpx; */
		height: 136rpx;
		justify-content: left;
		align-items: center;
	}

	.day-text {
		font-size: 192rpx;
		color: #E8FFC4;
		font-weight: 700;
	}

	.day-text-days {
		/* position: absolute; */
		font-size: 30rpx;
		color: #E8FFC4;
		font-weight: 400;
		margin-top: 100rpx;
		font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
		/* bottom: 0;
  right: 0; */
	}

	.diamonds-stars {
		display: flex;
		/* width: 622rpx; */
		height: 128rpx;
		gap: 18rpx;
		/* justify-content: space-around; */
	}

	.diamonds {
		display: flex;
		align-items: center;
		justify-content: left;
		width: 312rpx;
		height: 100%;
		background-color: #FFFFFF1A;
		border-radius: 32rpx;
		gap: 16rpx;
		padding-left: 24rpx;
	}

	.diamonds-icon {
		width: 80rpx;
		height: 80rpx;
	}

	.diamonds-source {
		display: block;
	}

	.diamonds-source-text {
		font-size: 30rpx;
		font-weight: 400;
		color: #D7D8E0;
		font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
	}

	.diamonds-source-number {
		font-size: 40rpx;
		font-weight: 700;
		color: #F2BC74;
	}

	.stars {
		display: flex;
		align-items: center;
		justify-content: left;
		width: 312rpx;
		height: 100%;
		background-color: #FFFFFF1A;
		border-radius: 32rpx;
		gap: 16rpx;
		padding-left: 24rpx;
	}

	.eqoach-bot-wrapper {
		position: relative;
		overflow: hidden;
		margin-top: 10rpx;
	}

	.eqoach-bot {
		display: flex;
		position: relative;
		 height: 80rpx; 
		background-color: #373742;
		border-radius: 32rpx;
		/* justify-content: space-between; */
		align-items: center;
		margin-top: 24rpx;
		padding: 28rpx 24rpx;
	}

	.eqoach-bot-icon {
		width: 88rpx;
		height: 88rpx;
	}

	.eqoach-bot-center {
		width: 368rpx;
		display: block;
		padding-left: 16rpx;
	}

	.eqoach-bot-add {
		position: absolute;
		right: 24rpx;
		display: flex;
		width: 100rpx;
		justify-content: right;
		/* margin-left: 140rpx; */
	}

	.eqoach-bot-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #E8FFC4;
		font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
	}

	.eqoach-bot-desc {
		font-size: 24rpx;
		font-weight: 400;
		color: #FFFFFF;
		font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
		margin-top: 20rpx;
	}

	.eqoach-bot-add-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100rpx;
		height: 48rpx;
		border: 1px solid #9EE44D;
		border-radius: 100rpx;
		box-shadow: 0px -2px 8.1px 0px #757CE029;
		background-color: #373742;
		font-size: 22rpx;
		font-weight: 600;
		color: #9EE44D;
		white-space: nowrap;
	}

	.eqoach-bot {
		transition: transform 0.3s ease;
	}

	.delete-btn {
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		/* height: 128rpx; */
		background-color: #373742;
		border-radius: 32rpx;
		/* justify-content: space-between; */
		align-items: center;
		margin-top: 24rpx;
		padding: 28rpx 24rpx;
		/* padding: 32rpx 24rpx; */
		width: 60rpx;
		height: 80rpx;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		transition: opacity 0.3s ease;
	}

	.delete-btn-icon {
		width: 40rpx;
		height: 40rpx;
	}

	.log-out {
		width: 100%;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		margin-top: 280rpx;
		bottom: 100rpx;
		color: #9EE44D;
		font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
	}

	.language {
		width: 100%;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		/* margin-top: 40rpx; */
		/* margin-bottom: 20px; */
		bottom: 120rpx;
		color: #9EE44D;
		font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
	}


	/* 二维码弹框 */
	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		z-index: 1000;
		padding: 0rpx;
		margin: -20rpx 0rpx;
	}

	.popup-content {
		width: 610rpx;
		/* Set the width to 90% */
		/* height: 810rpx; */
		background-color: #373742;
		border-radius: 32rpx;
		padding: 56rpx 32rpx;
		display: flex;
		/* justify-content: center; */
		align-items: left;
		flex-direction: column;
	}

	.logout-popup-content {
		width: 580rpx;
		/* Set the width to 90% */
		/* height: 810rpx; */
		background-color: #373742;
		border-radius: 32rpx;
		/* padding: 56rpx 32rpx; */
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.logout-header {
		display: flex;
		width: 100%;
		height: 160rpx;
		align-items: center;
		justify-content: center;
		color: #D7D8E0;
		font-size: 44rpx;
		font-weight: 600;
	}

	.logout-center {
		display: flex;
		width: 100%;
		height: 88rpx;
		align-items: center;
		justify-content: center;
		color: #FF6262;
		font-size: 30rpx;
		font-weight: 600;
		border-top: 1px solid #454552;
	}

	.logout-button {
		display: flex;
		width: 100%;
		height: 88rpx;
		align-items: center;
		justify-content: center;
		color: #D7D8E0;
		font-size: 30rpx;
		font-weight: 600;
		border-top: 1px solid #454552;
	}

	.eqoach-center {
		margin-top: 60rpx;
		display: block;
		width: 590rpx;
		/* height: 508rpx; */
		text-align: center;
	}

	.eqoach-center-text {
		font-size: 42rpx;
		font-weight: 6000;
		font-weight: bold;
		color: #FFFFFF;
	}

	.eqoach-center-code-image {
		width: 360rpx;
		height: 360rpx;
		margin-top: 32rpx;
	}

	.eqoach-center-line {
		display: block;
		text-align: left;
		width: 500rpx;
		/* height: 96rpx; */
		margin: 24rpx auto;
		color: #FFFFFF;
		line-height: 60rpx;
	}

	.save-code-one,
	.save-code-two {
		display: flex;
		align-items: center;
		font-size: 30rpx;
		gap: 14rpx;
	}

	.save-one-two {
		border-left: 2rpx solid #FFFFFF;
		height: 28px;
	}

	.save-code-num {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #454552;
		width: 32rpx;
		height: 32rpx;
		border-radius: 99px;
		text-align: center;
		font-size: 26rpx;
		font-weight: 400;
	}

	.card-header {
		display: block;
	}

	.title {
		width: 100%;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 48rpx;
		font-weight: 700;
		color: #8C5225;
	}

	.card-close-image {
		position: absolute;
		right: 0;
		width: 48rpx;
		height: 48rpx;
	}

	.top {
		display: block;
		height: 176rpx;
		text-align: center;
	}

	text {
		font-size: 34rpx;
		font-weight: 500;
		color: #252529;
	}

	.card-button {
		display: flex;
		width: 100%;
		margin-top: 24rpx;
	}

	.card-button button {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background: linear-gradient(101.13deg, #EDFB8B 13.84%, #9EE44D 84.78%);
		border-radius: 400rpx;
		font-size: 30rpx;
		color: #2F2F38;
	}

	.card-button button[disabled] {
		opacity: 50%;
	}

	.locale-text {
		font-size: 42rpx;
		color: #FFFFFF;
	}

	.locale-item {
		display: flex;
		flex-direction: row;
		padding: 10px 0;
	}

	.locale-item .text {
		flex: 1;
		color: #FFFFFF;
	}
	
	.icon-check {
		margin-right: 5px;
		border: 2px solid #FFFFFF;
		border-left: 0;
		border-top: 0;
		height: 12px;
		width: 6px;
		transform-origin: center;
		/* #ifndef APP-NVUE */
		transition: all 0.3s;
		/* #endif */
		transform: rotate(45deg);
	}
</style>