<template>
	<div class="nav-contation">
		<view class="nav-contation-inner">
			<view class="nav-item" @click="navigateToProfilePage('Home')">
				<image class="nav-image"
					:src="selectedView === 'Home' ? '/static/nav/home1.png' : '/static/nav/home.png'" mode="widthFix">
				</image>
				<text class="nav-text" :class="{ 'highlight': selectedView === 'Home' }">{{ $t('components.Nav.home') }}</text>
			</view>
			<view class="nav-item" @click="navigateToProfilePage('Battlefield')">
				<image class="nav-image" :class="{ 'highlight': selectedView === 'Battlefield' }"
					:src="selectedView === 'Battlefield' ? '/static/nav/battlefield1.png' : '/static/nav/battlefield.png'"
					mode="widthFix"></image>
				<text class="nav-text" :class="{ 'highlight': selectedView === 'Battlefield' }">{{ $t('components.Nav.Battlefield') }}</text>
			</view>
			<view class="nav-item" @click="navigateToProfilePage('Profile')">
				<image class="nav-image" :class="{ 'highlight': selectedView === 'Profile' }"
					:src="selectedView === 'Profile' ? '/static/nav/profile1.png' : '/static/nav/profile.png'"
					mode="widthFix"></image>
				<text class="nav-text" :class="{ 'highlight': selectedView === 'Profile' }">{{ $t('components.Nav.Profile') }}</text>
			</view>
		</view>
	</div>
</template>
<script>
	export default {
		props: {
			selectedView: {
				type: String,
				required: true,
				default: 'Home',
			},
		},
		methods: {
			navigateToProfilePage(val) {
				if (val === 'Home') {
					uni.navigateTo({
						url: `/pages/home/index`
					});
					uni.setNavigationBarTitle({
						title: this.$t('components.Nav.home'),
					});
					// this.$emit('switchHomeView', "dashboard");
				}
				if (val === 'Battlefield') {
					uni.navigateTo({
						url: `/pages/home/shurafield`
					});
					uni.setNavigationBarTitle({
						title: this.$t('components.Nav.Battlefield'),
					});
				}
				if (val === 'Profile') {
					uni.navigateTo({
						url: `/pages/profile/profile_zh`
					});
					uni.setNavigationBarTitle({
						title: this.$t('components.Nav.Profile'),
					});
				}
			}
		}
	}
</script>
<style scoped>
	.nav-contation {
		display: flex;
		z-index: 9999;
		height: 140rpx;
		width: 100%;
		position: fixed;
		bottom: 0px;
		transform: translateX(-50%);
		left: 50%;
		background: #252529;
		border-top: 1px solid #373742;

	}

	.nav-contation-inner {
		width: 100%;
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 0 120rpx; /* 添加左右距离 */
		margin-top: -10rpx;
		/* height: 150rpx;
    background-color: #252529;
    color: #252529;
    font-size: 36rpx;
    text-align: center;
    line-height: 100rpx; */
	}

	.nav-image {
		width: 44rpx;
		height: 44rpx;
		display: block;
		margin: 0 auto;
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		width: 100rpx;
		text-align: center;
		height: 82rpx;
	}

	.nav-text {
		color: #67677A;
		font-size: 24rpx;
		font-weight: 400;
		text-align: center;
		margin-top: 10rpx;
	}

	.highlight {
		color: #9EE44D;
	}
</style>