<template>
	<view class="popup-content" @click.stop :style="{'--theme-color-matching': themeColors.matching, '--theme-color-theme': themeColors.theme, '--theme-color-font-title': themeColors.popup_font_title }">
		<view class="card-box">
			<image class="card-close-image" src="/static/battlefield/material-symbols_close.png" mode=""
				@click="setShowCardPopup"></image>
			<view class="card-header">
				<view class="title">
					{{ $t('pages.battlefield.playground.choose_card_title') }}
					<!-- 选择锦囊卡片 -->
				</view>
				<view class="jewelry">
					<image class="jewelry-image" src="/static/battlefield/jewelry.png" mode=""></image>
					<view class="jewelry-num">
						{{ diamondCount || 0 }}
					</view>
				</view>
			</view>
			<view class="card-center" @click.stop>
				<view class="box" :class="{ 'card-selected': selectedCard === 1}" @click="selectCard(1)" :style="{'--selected-border-color': selectedCard === 1 ? themeColors.theme : 'transparent'}">
					<image class="tip-mark-yellow" :src="getImgUrl(1)"></image>
					<view class="top">
						<text>{{ $t('pages.battlefield.playground.choose_card_best_answer') }}</text>
						
						<view class="top-content">
							{{ $t('pages.battlefield.playground.choose_card_best_answer_text') }}
							<!-- {{ $t('快速调整你的回答，提升质量，让对话更流畅。') }} -->
							<!-- 快速调整你的回答，提升质量，让对话更流畅。 <image class="tip-mark-yellow" :src="getImg('/static/web/battlefield/tips-icon-zh.webp') "></image> -->
						</view>
					</view>
					
					<!-- <image class="jewelry-image" src="/static/battlefield/jewelry.png" mode="widthFix"></image> -->
					<view class="jewelry">
						<image class="jewelry-image" src="/static/battlefield/jewelry.png" mode="widthFix"></image>
						<view class="jewelry-num-dark">
							60
						</view>
					</view>
				</view>
				<view class="box" :class="{ 'card-selected': selectedCard === 2 }" @click="selectCard(2)" :style="{'--selected-border-color': selectedCard === 2 ? themeColors.theme : 'transparent'}">
					<image class="tip-mark-yellow" :src="getImgUrl(2)"></image>
					<view class="top">
						<text>{{ $t('pages.battlefield.playground.choose_card_get_hint') }}</text>
						<view class="top-content">
							{{ $t('pages.battlefield.playground.choose_card_get_hint_text') }}
							<!-- {{ $t('提供情绪引导或建议，帮助你更好地理解和回应。') }} -->
						</view>
					</view>
					<view class="jewelry">
						<image class="jewelry-image" src="/static/battlefield/jewelry.png" mode="widthFix"></image>
						<view class="jewelry-num-dark">
							20
						</view>
					</view>
				</view>
			</view>
			<view class="card-button">
				<button :disabled="!selectedCard || cardButtonLoading || !canAfford(selectedCard) || !eqScoresNum"
					@click="exchangeClick" :style="{backgroundColor: themeColors.theme}">{{ $t('pages.battlefield.playground.choose_card_confirm') }}</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { getImg } from '../scripts/constants';
	import apiService from '../services/api-service';
	export default {
		props: {
			showCardPopup: {
				type: Boolean,
				default: false
			},
			cardButtonLoading: {
				type: Boolean,
				default: false
			},
			tip: {
				type: String,
				required: true
			}
		},
		data() {
			return {
				selectedCard: 0,
				loading: false,
				isLoading: true,
				error: null,
				isExchanging: false,
				getImg,
			};
		},
		onLoad(option) {
			console.log(option);
		},
		computed: {
			diamondCount() {
				return this.homepageData?.response?.personal_info?.num_diamond;
			},
			homepageData() {
				return this.$store.getters.getHomepageData;
			},
			userId() {
				return this.$store.getters.getUserId;
			},
			eqScoresNum() {
				if (Math.round(this.homepageData?.response?.eq_scores?.score || 0) <= 0) {
					return false;
				}
				return true;
			},
			themeColors() {
				return this.$store.getters.getThemeColors;
			}
		},
		methods: {
			setShowCardPopup() {
				this.$emit('closeCueCard');
			},
			selectCard(cardType) {
				this.selectedCard = cardType;
			},
			canAfford(cardType) {
				return cardType === 1 ? this.diamondCount >= 60 : this.diamondCount >= 20;
			},
			async exchangeClick() {
				if (this.isExchanging) return; // 如果已经在请求中，则直接返回
				this.isExchanging = true;
				try {
					const userId = this.$store.getters.getUserId;
					if (this.selectedCard === 1 && this.diamondCount >= 60) {
						this.$store.commit('setDiamondCount', this.diamondCount - 60);
						await apiService.updateDiamonds(userId, -60);
					} else if (this.selectedCard === 2 && this.diamondCount >= 20) {
						this.$store.commit('setDiamondCount', this.diamondCount - 20);
						await apiService.updateDiamonds(userId, -20);
					}

					// 发送事件通知
					this.$emit('exchangeClick', this.selectedCard);
				} catch (error) {
					console.error("Exchange request failed:", error);
				} finally {
					this.isExchanging = false; // 请求完成后重置标志位
				}
			},
			async exchangeClickWithoutEmit() {
				try {
					const userId = this.$store.getters.getUserId;
					if (this.selectedCard === 1 && this.diamondCount >= 60) {
						this.$store.commit('setDiamondCount', this.diamondCount - 60);
						await apiService.updateDiamonds(userId, -60);
					} else if (this.selectedCard === 2 && this.diamondCount >= 20) {
						this.$store.commit('setDiamondCount', this.diamondCount - 20);
						await apiService.updateDiamonds(userId, -20);
					}
				} catch (error) {
					console.error("Exchange request failed:", error);
				}
			},
			getImgUrl(type) {
				const theme = this.themeColors.theme.replace(/^#/, '');
				if(type == 1) {
					return getImg(`/static/web/battlefield/tipping-info-${theme}.webp`);
				} else {
					return getImg(`/static/web/battlefield/tipping-quest-${theme}.webp`);
				}
			}
		},
		created() {
			// this.getHomepageData();
		},
	}
</script>
<style>
	uni-button:after {
		border: 0;
	}
</style>
<style scoped>
	.popup-content {
		width: 654rpx;
		/* Set the width to 90% */
		/* height: 810rpx; */
		background-color: var(--theme-color-matching);
		/* background-color: #FDEDC8; */
		border-radius: 32rpx;
		display: flex;
		/* justify-content: center; */
		align-items: left;
		flex-direction: column;
	}

	.card-box {
		position: relative;
		padding: 56rpx 32rpx;
	}

	.card-header {
		display: block;
		position: relative;
	}

	.title {
		width: 100%;
		/* position: relative; */
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 40rpx;
		font-weight: 500;
		/* color: #8C5225; */
		color: var(--theme-color-font-title);
		margin-top: 32rpx;
	}

	.card-close-image {
		position: absolute;
		right: 32rpx;
		top: 32rpx;
		width: 48rpx;
		height: 48rpx;
	}

	.jewelry {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 32rpx;
		gap: 16rpx;
	}

	.jewelry-image {
		width: 56rpx;
		height: 56rpx;
	}



	.card-center {
		margin-top: 24rpx;
		display: flex;
		gap: 24rpx;
	}

	.box {
		position: relative;
		display: block;
		justify-content: center;
		color: #252529;
		width: 282rpx;
		/* height: 354rpx; */
		padding: 40rpx 24rpx;
		gap: 40rpx;
		border-radius: 32rpx;
		background: #FFFFFF;
		box-shadow: 0px 0px 12px 0px var(--theme-color-theme);
		/* box-shadow: 0px 0px 12px 0px #FED397; */
	}

	.top {
		display: block;
		height: 176rpx;
		text-align: center;
	}

	text {
		font-size: 34rpx;
		font-weight: 600;
		color: #252529;
	}

	.top-content {
		font-size: 24rpx;
		font-weight: 400;
		margin-top: 24rpx;
		text-align: left;
		line-height: 32rpx;
		color: #67677A;
	}

	.jewelry {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 40rpx;
		gap: 16rpx;
	}

	.jewelry-image {
		width: 56rpx;
		height: 56rpx;
	}

	.jewelry-num {
		/* color: #F2BC74; */
		color: var(--theme-color-font-title);
		font-size: 40rpx;
		font-weight: 800;
		text-align: left;
	}

	.jewelry-num-dark {
		/* color: #8C5225; */
		color: var(--theme-color-font-title);
		font-size: 40rpx;
		font-weight: 900;
		text-align: left;
	}
	.tip-mark-yellow {
		position: absolute;
		top: 70rpx; /* Adjust as needed */
		right: 0rpx; /* Adjust as needed */
		width: 200rpx;
		height: 240rpx;
	}

	.card-selected {
		/* border: 3px solid #90E0E7; */

	}
	.card-selected::after {
		content: '';
		position: absolute;
		top: -3px;
		left: -3px;
		right: -3px;
		bottom: -3px;
		border: 3px solid var(--selected-border-color, transparent);
		/* border: 3px solid #F2BC74; */
		border-radius: 35rpx;
		pointer-events: none;
	}

	.card-button {
		display: flex;
		width: 100%;
		margin-top: 64rpx;
	}

	button {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		/* background-color: #90E0E7 !important; */
		/* background-color: #F2BC74 !important; */
		border-radius: 400rpx;
		font-size: 30rpx;
		font-weight: 600;
		color: #252529 !important;


	}

	button[disabled] {
		opacity: 50%;
	}
</style>