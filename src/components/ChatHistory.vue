
<template>
    <view class="history-item">
        <view class="item-container">
            <!-- <view class="title">{{ randomEmoji }} {{ title }}</view> -->
			<view class="title">{{ title }}</view>
            <view class="line"></view>
            <view class="detail" v-if="details != ''">{{details}}</view>
            <view class="detail" v-else>No details available</view>
        </view>
    </view>
</template>
<script>
export default{
    props: {
        title: {
            type: String,
            required: true
        },
        details: {
            type: String,
            required: true
        }
    },
	// computed: {
	// 	randomEmoji() {
	// 		const emojiList = ['🌟', '✨', '🔥', '💥', '🌈', '🚀', '💫', '🎉', '🦄', '🌸'];
	// 		const randomIndex = Math.floor(Math.random() * emojiList.length);
	// 		return emojiList[randomIndex];
	// 	}
	// }
}
</script>
<style scoped>
    .history-item {
        width: 324rpx;
        height: 320rpx;
        background-color: #373742;
        border-radius: 32rpx;

        display: flex;
        flex-direction: column;
        align-items: left;
    }

    .item-container {
        margin: 32rpx 32rpx 24rpx 32rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .title {
        display: -webkit-box;
        font-weight: 600;
        font-size: 34rpx;
        color: #fff;
        justify-self: space-between;
        text-overflow: ellipsis;
		-webkit-box-orient: vertical;
  		-webkit-line-clamp: 2;
        overflow: hidden;
    }

    .line {
        border-top: 1rpx solid #fff;
        width: 100%;
        margin-top: 24rpx;
    }

    .detail {
        margin-top: 24rpx;
        display: -webkit-box;
        font-weight: 400;
        font-size: 30rpx;
        line-height: 40rpx;
        color: #fff;
        text-overflow: ellipsis;
		-webkit-box-orient: vertical;
  		-webkit-line-clamp: 3;
        overflow: hidden;
    }
</style>
