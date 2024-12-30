<template>
	<view class="container">
		<view v-if="showSplash" :class="{'splash-screen': true, 'splash-screen-hidden': splashHidden}">
			<image class="splash-image"  :src="getImg($t('images.onboarding.splash'))" mode='aspectFill'></image>
		</view>
		<!-- <view class="splashBackground"></view>
		<view v-if="showSplash" class="splash-screen">

			<view class="slogan">
				Anyone can become EQ Master
			</view>
			<image class="splashImage" src="/static/onboarding/IP.png" mode="widthFix"></image>
		</view> -->
		<view v-else>
			<!-- 添加背景图片 
			<image class="background-image" :src="getImg('/static/web/onboarding/landingB2.webp')" mode="widthFix"></image>-->
			<image class="background-image" :src="getImg( $t('images.onboarding.landing'))" mode="widthFix"></image>
	
			<!-- 开始体验按钮 -->
			<view class="start-button">
				<!-- #ifndef MP-WEIXIN -->
				<view class="quizButton" @click="startQuiz">
					<text class="quizText">{{ $t('pages.landing.get_started') }}</text>
				</view>
				<!-- #endif -->
				<!-- #ifdef MP-WEIXIN -->
				<view class="quizButton" @click="startLoginWx">
					<text class="quizText">{{$t('pages.landing.get_wechatlogin') }}</text>
				</view>
				<!--<button class="quizButton" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
					<text class="quizText">{{$t('pages.landing.get_wechatlogin')}}</text>
				</button>-->
				<!-- #endif -->
			</view>
			<view class="third-party">
				<!-- #ifndef MP-WEIXIN -->
				<view class="third-party-text"><span class="line"></span>或使用其他方式<span class="line"></span></view> 
				<view class="third-party-login">
					<!-- #ifndef MP-WEIXIN -->
					<view class="loginButton" @click="googleLogin">
						<image class="google-image" src="/static/onboarding/google_button.png"></image>
						<!-- <text class="login-text-apple">Google Login</text> -->
					</view>
					<view class="loginButton" @click="wetchLogin">
						<image class="google-image" src="/static/onboarding/wetch_button.png"></image>
						<!-- <text class="login-text-apple">Wetch Login</text> -->
					</view>
					<!-- #endif -->
					<!-- 
					<view class="loginButton" @click="startLoginWx">
						<image class="google-image" src="/static/onboarding/wetch_button.png"></image>
					</view>
					-->
					<!-- <view class="loginButton" @click="appleleLogin">
						<image class="apple-image" src="/static/onboarding/appleid_button.png"></image>
						<text class="login-text-apple">Sign in with Apple</text>
					</view> -->
				</view>
				<!-- #endif -->
			</view>
	
			<!-- <view class="button button2" @click="startDialogue">
				<text class="button-text">开始对话</text>
			</view> -->
	
			<!-- <text class="login-text">登录已有账号</text> -->
		</view>
	</view>
</template>


<script>
	import {
		getImg,
		downLoadZip
	} from '../../scripts/constants.js';
	import API_ENDPOINT from '../../services/api-service.js';
	export default {
		data() {
			return {
				showSplash: true,
				splashHidden: false, // 控制渐隐
				username: '', // 用于存储从上一页接收的用户名
				getImg,
				API_ENDPOINT,
				isLoading: false,
			};
		},
		computed: {
			homepageData() {
				return this.$store.getters.getHomepageData;
			},
		},
		watch: {
			homepageData: {
				immediate: true,
				async handler(val) {
					console.log(val)
				},
				// deep: true,
			},
			isLoading(newVal) {
				if (newVal) {
					uni.showLoading({
					title: 'Loading...',
					mask: true
					});
				} else {
					uni.hideLoading();
				}
			}
		},
		methods: {
			startQuiz() {
				// 生成随机用户名
				// this.username = 'user_' + Math.floor(Math.random() * 10000); // 生成随机用户名
				// 跳转到问题页面并传递用户名
				uni.navigateTo({
					url: `/pages/landing/experience`
				});
			},
			goToLogin() {
				// 跳转到登录页面
				uni.navigateTo({
					url: '/pages/login/login'
				});
			},
			sendCodeToServer(code,iv,encryptedData){
				
				uni.request({
				    url: API_ENDPOINT.baseURL + '/wxprogram/login',
				    method: 'POST',
				    data: {
				        code: code,
						iv: iv,
						encryptedData: encryptedData
				    },
				    success: (res) => {
						console.log(res)
						this.isLoading = false;

						uni.setStorageSync('userId', res.data.userid);
						uni.setStorageSync('jobId', res.data.jobid);
						this.$store.commit('setUserId', res.data.userid);
						this.$store.commit('setJobId',  res.data.jobid);
						if(res.data.isNewUser)
						{
							uni.navigateTo({
								url: `/pages/landing/experience`
							});
						}
						else
						{
							uni.navigateTo({
								url: `/pages/dashboard/dashboard_zh?userId=${res.data.userid}&username=${res.data.name}&jobId=${res.data.jobid}`
							});
						}
							
						
				    },
				    fail: (err) => {
				        console.log('请求失败：', err);
						this.isLoading = false;
				    }
				});
			},
			
			getPhoneNumber(e) {
			      if (e.detail.errMsg === 'getPhoneNumber:ok') {
			        const { iv, encryptedData } = e.detail;
					console.log(iv, encryptedData);
					// uni.login({
					// 	"provider": "weixin",   
					// 	"onlyAuthorize": true, // 微信登录仅请求授权认证
					// 	success: (event) => {
					// 		console.log(event);
					// 		const {code} = event;
					// 	uni.getUserInfo({
					// 		provider: 'weixin',
					// 		success:  (infoRes) =>{
					// 			this.sendCodeToServer(code, iv,encryptedData);
					// 		}
					// 	});
					// 		//this.sendCodeToServer(code); // 发送 code 到服务器
					// 	},
					// 	fail: function (err) {
					// 		console.log('登录失败：', res.errMsg);
					//     }
					// });
			        
			      } else {
			        console.error('用户拒绝授权获取手机号');
			      }
			    },
			
			startLoginWx() {
				this.isLoading = true;
				uni.login({
					"provider": "weixin",   
					"onlyAuthorize": true, // 微信登录仅请求授权认证
					success: (event) => {
						console.log(event);
						const {code} = event;
					uni.getUserInfo({
						provider: 'weixin',
						success:  (infoRes) =>{
							this.sendCodeToServer(code,infoRes.iv,infoRes.encryptedData);
						}
					});
						//this.sendCodeToServer(code); // 发送 code 到服务器
					},
					fail: function (err) {
						console.log('登录失败：', err.errMsg);
				    }
				});
				
			},
			startDialogue() {
				uni.navigateTo({
					url: '/pages/battlefield/battlefield-loading'
				});
			},
			googleLogin() {
				uni.login({
				    provider: 'google',
				    success: (loginRes) => {
				        // 登录成功
				        uni.getUserInfo({
				            provider: 'google',
				            success: async (info) => {
				                uni.showLoading({
				                    title: 'Loading...',
				                    mask: true
				                });
				                // 获取用户信息成功, info.authResult保存用户信息
								const loginResponse = await API_ENDPOINT.appGoogleLogin(info.userInfo.unionid, info.userInfo.nickname, info.userInfo.headimgurl, info.userInfo.email);
								// console.log(loginResponse);
								if(loginResponse) {
									uni.hideLoading();
									// console.log('用户昵称为：' + info.userInfo.nickName);
									uni.setStorageSync('username', loginResponse.name);
									this.$store.commit('setUsername', loginResponse.name);
									uni.setStorageSync('userId', loginResponse.userid);
									uni.setStorageSync('jobId', loginResponse.jobid);
									this.$store.commit('setUserId', loginResponse.userid);
									this.$store.commit('setJobId', loginResponse.jobid);
									this.$store.dispatch('fetchHomepageData').then(() => {
										const homepageData = this.$store.getters.getHomepageData;
										console.log(homepageData);
										if (homepageData.response && homepageData.response.eq_scores) {
											uni.navigateTo({
												url: `/pages/dashboard/dashboard_zh?currentView=dashboard`
											});
										} else {
											uni.navigateTo({
												url: `/pages/preference/preference3`
											});
										}
									}).catch((error) => {
										console.error('Error fetching homepage data:', error);
									});
								}
				            }
				        })
				    },
				    fail: (err) => {
				        // 登录授权失败
				        // err.code是错误码
						uni.hideLoading();
						uni.showToast({
							title: 'Authorization failed, please try again',
							icon: 'none'
						});
				    }
				});
			},
			appleleLogin() {
				uni.login({
				    provider: 'apple',
				    success: (loginRes) => {
				        // 登录成功
				        uni.getUserInfo({
				            provider: 'apple',
				            success: (info) => {
				                // 获取用户信息成功, info.authResult保存用户信息
								console.log(info);
								uni.setStorageSync('username', info.userInfo.nickName);
								this.$store.commit('setUsername', info.userInfo.nickName);
								uni.navigateTo({
									url: `/pages/preference/preference3`
								});
				            }
				        })
				    },
				    fail: (err) => {
						console.log(err)
				        // 登录授权失败
				        // err.code是错误码
				    }
				});
			},
			wetchLogin() {
				uni.login({
				    "provider": "weixin",
				    "onlyAuthorize": true, // 微信登录仅请求授权认证
				    success: async (event) => {
						uni.showLoading({
							title: 'Loading...',
							mask: true
						});
						const loginResponse = await API_ENDPOINT.appWeixinLogin(event.code);
						if(loginResponse) {
							uni.hideLoading();
							uni.setStorageSync('username', loginResponse.name);
							this.$store.commit('setUsername', loginResponse.name);
							uni.setStorageSync('userId', loginResponse.userid);
							uni.setStorageSync('jobId', loginResponse.jobid);
							this.$store.commit('setUserId', loginResponse.userid);
							this.$store.commit('setJobId', loginResponse.jobid);
							if (homepageData.response && homepageData.response.eq_scores) {
								uni.navigateTo({
									url: `/pages/home/index`
								});
							} else {
								uni.navigateTo({
									url: `/pages/preference/preference3`
								});
							}
						}
				    },
				    fail: (err) => {
						console.log(err);
				        // 登录授权失败
				        // err.code是错误码
						uni.hideLoading();
						uni.showToast({
							title: 'Authorization failed, The client is not installed',
							icon: 'none'
						});
				    }
				});

			},
		},
		onLoad(options) {
			// downLoadZip()
			// 获取URL传递的参数
			if (options.username) {
				this.username = options.username; // 将传递过来的用户名存储起来
			}
		},
		mounted() { // 使用 mounted 钩子
			console.log('页面已挂载，showSplash:', this.showSplash);
			// 设置闪屏持续时间（例如 3 秒）
			setTimeout(() => {
				console.log('开始渐隐');
				this.splashHidden = true; // 开始渐隐动画

				// 再等待 0.5 秒（与 CSS transition 时间一致）后，彻底移除
				setTimeout(() => {
					console.log('隐藏闪屏');
					this.showSplash = false; // 完全隐藏
				}, 500); // 等同于 CSS 动画的持续时间
			}, 2000); // 闪屏持续时间
		}
	};
</script>

<style scoped>
	.container {
		display: flex;
		flex-direction: column;
		background-color: #252529;
		width: 100%;
		height: 100vh;
		z-index: 1;
	}

	/* 闪屏样式 */
	.splash-screen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
		opacity: 1;
		/* 初始完全显示 */
		transition: opacity 2s ease-out;
		/* 渐隐动画，2 秒 */

	}

	.splash-screen-hidden {
		opacity: 0;
		/* 隐藏时的透明度 */
	}

	.splash-image {

		width: 100%;
		height: 100%;
		
		object-fit: contain;
	}

	.background-image {
		/* margin-top: 5vh; */
		width: 100%;
		z-index: 5;
	}

	/* .button {
		width: 654rpx;
		height: 80rpx;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		transition: transform 0.2s;
		border-color: #ffffff;
		background-color: #ffffff;
		z-index: 6;
	} */

	.start-button {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		top: 75vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 6;
		
	}

	.quizButton {
		background-color: #9EE44D;
		width: 654rpx;
		height: 80rpx;
		border-radius: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
	}

	.button2 {
		background-color: #9EE44D;
		border-radius: 45rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		bottom: 150rpx;
		transform: translateX(-50%);
	}

	.button3 {
		background-color: #fff;
	}

	.login-text {
		color: #9EE44D;
		font-weight: 400;
		font-size: 30rpx;
		line-height: 40rpx;
		font-family: Arial;
	}



	.quizText {
		color: #252529;
		font-size: 30rpx;
		line-height: 40rpx;
		font-weight: 400;
		font-family: Arial;
	}
	.third-party {
		position: absolute;
		bottom: -100rpx;
		display: block;
		z-index: 100;
		justify-content: center;
		text-align: center;
		width: 100%;
	}
	.third-party-text {
		color: #4f4e4e;
		display: flex;
		align-items: center;
	}
	.line {
		flex: 1; /* 使线条占据剩余空间 */
		height: 1px; /* 线条的高度 */
		background-color: #4f4e4e; /* 线条的颜色 */
		margin: 0 10px; /* 线条与文字之间的间距 */
	}
	.third-party-login {
		display: flex;
		gap: 100rpx;
		justify-content: center;
	}
	.loginButton {
		/* background-color: white; */
		width: 80rpx;
		height: 80rpx;
		border-radius: 64rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16rpx;
		margin-top: 40rpx;
		border: 1rpx solid #4f4e4e; /* 添加灰色的边框 */
	}
	.google-image {
		width: 32rpx;
		height: 32rpx;
		/* margin-right: 20rpx; */
	}
	.apple-image {
		width: 80rpx;
		height: 80rpx;
	}
	.login-text-apple {
		color: #252529;
	}
</style>