<template>
	<view class="container">
		<scroll-view scroll-y>
			<view class="content">
				<view v-if="isLoading">加载中...</view>
				<view v-else-if="error">{{ error }}</view>
                <view v-else>
                    <view class="tab">
                        <view class="tab-item" :class="{'active': tabIndex == 0}" @click="tabIndexFun(0)">全部</view>
                        <view class="tab-item" :class="{'active': tabIndex == 1}" @click="tabIndexFun(1)">职场</view>
                        <view class="tab-item" :class="{'active': tabIndex == 2}" @click="tabIndexFun(2)">家庭</view>
                        <view class="tab-item" :class="{'active': tabIndex == 3}" @click="tabIndexFun(3)">情感</view>
                    </view>
                    <view class="class-ai-list">
                        <view class="class-ai-item-box">
                            <view class="class-ai-item">
                                <view class="class-ai-item-content">
                                    <view class="class-ai-item-title">
                                        老板肚子的蛔虫
                                        <text class="class-ai-item-title-type">简单</text>
                                    </view>
                                    <view class="class-ai-item-desc">在一个精致的会所包厢里，你与一位高层领导和两名同事共进晚餐。看似轻松的聚会，实际上领导在暗自</view>
                                </view>
                                <view class="class-ai-item-img">
                                    <image class="class-ai-item-image" src="/static/web/level1completed.webp" mode="widthFix"></image>
                                </view>
                            </view>
                        </view>
                        <view class="class-ai-item-box">
                            <view class="class-ai-item-right">
                                <view class="class-ai-item-content-right">
                                    <view class="class-ai-item-title">
                                        拒绝背锅
                                        <text class="class-ai-item-title-type">简单</text>
                                    </view>
                                    <view class="class-ai-item-desc">在一个精致的会所包厢里，你与一位高层领导和两名同事共进晚餐。看似轻松的聚会，实际上领导在暗自</view>
                                </view>
                            </view>
                            <view class="class-ai-item-img-left">
                                <image class="class-ai-item-image" src="/static/web/level1completed.webp" mode="widthFix"></image>
                            </view>
                        </view>
                        <view class="class-ai-item-box">
                            <view class="class-ai-item">
                                <view class="class-ai-item-content">
                                    <view class="class-ai-item-title">
                                        老板肚子的蛔虫
                                        <text class="class-ai-item-title-type">简单</text>
                                    </view>
                                    <view class="class-ai-item-desc">在一个精致的会所包厢里，你与一位高层领导和两名同事共进晚餐。看似轻松的聚会，实际上领导在暗自</view>
                                </view>
                                <view class="class-ai-item-img">
                                    <image class="class-ai-item-image" src="/static/web/level1completed.webp" mode="widthFix"></image>
                                </view>
                            </view>
                        </view>
                        <view class="class-ai-item-box">
                            <view class="class-ai-item-right">
                                <view class="class-ai-item-content-right">
                                    <view class="class-ai-item-title">
                                        拒绝背锅
                                        <text class="class-ai-item-title-type">简单</text>
                                    </view>
                                    <view class="class-ai-item-desc">在一个精致的会所包厢里，你与一位高层领导和两名同事共进晚餐。看似轻松的聚会，实际上领导在暗自</view>
                                </view>
                            </view>
                            <view class="class-ai-item-img-left">
                                <image class="class-ai-item-image" src="/static/web/level1completed.webp" mode="widthFix"></image>
                            </view>
                        </view>
                        <view class="class-ai-item-box">
                            <view class="class-ai-item">
                                <view class="class-ai-item-content">
                                    <view class="class-ai-item-title">
                                        老板肚子的蛔虫
                                        <text class="class-ai-item-title-type">简单</text>
                                    </view>
                                    <view class="class-ai-item-desc">在一个精致的会所包厢里，你与一位高层领导和两名同事共进晚餐。看似轻松的聚会，实际上领导在暗自</view>
                                </view>
                                <view class="class-ai-item-img">
                                    <image class="class-ai-item-image" src="/static/web/level1completed.webp" mode="widthFix"></image>
                                </view>
                            </view>
                        </view>
                        <view class="class-ai-item-box">
                            <view class="class-ai-item-right">
                                <view class="class-ai-item-content-right">
                                    <view class="class-ai-item-title">
                                        拒绝背锅
                                        <text class="class-ai-item-title-type">简单</text>
                                    </view>
                                    <view class="class-ai-item-desc">在一个精致的会所包厢里，你与一位高层领导和两名同事共进晚餐。看似轻松的聚会，实际上领导在暗自</view>
                                </view>
                            </view>
                            <view class="class-ai-item-img-left">
                                <image class="class-ai-item-image" src="/static/web/level1completed.webp" mode="widthFix"></image>
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
import Nav from '../../components/Nav.vue';
export default {
    data() {
        return {
            error: '',
            isLoading: false,
            tabIndex: 0,
        }
    },
    computed: {

    },
    watch: {

    },
    created() {
    },
    methods: {
        tabIndexFun(index) {
            this.tabIndex = index;
        }
    },
    components: {
        Nav,
    },
}
</script>
<style scoped>
	.container {
		position: relative;
		background-color: #2F2F38;
		/* display: flex; */
		flex-direction: column;
		align-items: left;
		/* padding-top: 22rpx; */
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
	.tab {
        position: fixed;
        background-color: #2F2F38;
        display: flex;
        width: 100%;
        height: 80rpx;
        gap: 20rpx;
        left: 0;
        /* margin-bottom: 40rpx; */
        z-index: 998;
        margin-left: 40rpx;
    }
    
	.tab-item {
        width: 132rpx;
        height: 56rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        /* padding: 10rpx 42rpx; */
        background-color: #454552;
		border: 1px solid transparent;
        color: #FFFFFF;
        border-radius: 40rpx;
        font-size: 24rpx;
	}

	.tab-item.active {
		border-color: white;
	}

    .class-ai-list {
        display: block;
        margin-top: 80rpx;
        border-radius: 32rpx;
        position: relative;
        z-index: 1;
        margin-bottom: 100rpx;
    }
    
    .class-ai-item-box {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: 130px;
        margin-bottom: 32rpx;
        background-color: #2F2F38;
    }
    .class-ai-item {
        display: flex;
        width: 70%;
        height: 114px;
        background-color: #373742;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        border-top-left-radius: 20rpx;
        border-bottom-left-radius: 20rpx;
        background-color: #373742;
        /* padding-bottom: 20px; */
    }
    .class-ai-item-right {
        display: flex;
        position: absolute;
        right: 0;
        width: 70%;
        height: 114px;
        background-color: #373742;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        border-top-right-radius: 20rpx;
        border-bottom-right-radius: 20rpx;
        background-color: #373742;
        /* padding-bottom: 20px; */
    }

    .class-ai-item-content {
        width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
    }
    .class-ai-item-content-right {
        position: relative;
        left: 120rpx;
        width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
    }

    .class-ai-item-title {
        display: flex;
        align-items: center;
        font-size: 34rpx;
        color: #FFFFFF;
    }
    .class-ai-item-title-type {
        background-color: #E8FFC4;
        padding: 4rpx 16rpx;
        border-radius: 11px;
        font-size: 24rpx;
        color: #000000;
        margin-left: 16rpx;
    }

    .class-ai-item-desc {
        font-size: 12px;
        color: #D7D8E0;
        margin-top: 12rpx;
    }

    .class-ai-item-img {
        position: absolute;
        right: 0;
        top: -5px;
        z-index: 10;
        /* border-radius: 50%; */
    }
    .class-ai-item-img-left {
        position: absolute;
        left: 0;
        top: -5px;
        z-index: 10;
        /* border-radius: 50%; */
    }
    .class-ai-item-image {
        width: 130px;
        height: 130px;
    }
</style>