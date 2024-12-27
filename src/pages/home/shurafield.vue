<template>
	<view class="container">
		<scroll-view scroll-y>
			<view class="content">
				<view v-if="isLoading">加载中...</view>
				<view v-else-if="error">{{ error }}</view>
                <view v-else>
                    <view class="tab">
                        <view class="tab-item" :class="{'active': tabIndex == index}" @click="tabIndexFun(index)" v-for="(item, index) in classList" :key="index">{{ item }}</view>
                    </view>
                    <view class="class-ai-list">
                        <!-- <canvas id="hexagonCanvas" :canvas-id="1" style="width: 130px; height: 130px;"></canvas> -->
                        <view class="class-ai-item-box" v-for="(item, index) in courseDataList" :key="index">
                            <view :class="index % 2 === 0 ? 'class-ai-item' : 'class-ai-item-right'">
                                <view :class="index % 2 === 0 ? 'class-ai-item-content' : 'class-ai-item-content-right'">
                                    <view class="class-ai-item-title">
                                        {{ item.title }}
                                        <text class="class-ai-item-title-type">{{ levelName[item.course_level] }}</text>
                                    </view>
                                    <view class="class-ai-item-desc">{{ item.background }}</view>
                                </view>
                            </view>
                            <view :class="index % 2 === 0 ? 'class-ai-item-img' : 'class-ai-item-img-left'">
                                <!-- <image class="class-ai-item-image" :src="getImg('/static/rectangle-left.png')" mode="widthFix"></image> -->
                                <image class="class-ai-item-image" src="/static/rectangle-left.png"></image>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </scroll-view>
        <Nav selectedView="Battlefield" />
    </view>
</template>
<script>
import Nav from '../../components/Nav.vue';
import { getImg } from '../../scripts/constants';
export default {
    data() {
        return {
            error: '',
            isLoading: false,
            tabIndex: 0,
            getImg,
            classList: [
                '全部',
                '职场',
                '家庭',
                '情感'
            ],
            levelName: {
                1: '简单',
                2: '中等',
                3: '困难'
            }
        }
    },
    computed: {
        courseDataList() {
            return this.$store.getters.getCourseDataList;
        },
    },
    watch: {

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
        padding-left: 40rpx;
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
        left: 80rpx;
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
        font-size: 30rpx;
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
        right: -15px;
        top: 0;
        z-index: 10;
        /* mask-image: radial-gradient(circle, white 90%, transparent 100%); */
        /* border-radius: 10%; */
        /* border-radius: 50%; */
    }
    .class-ai-item-img-left {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 10;
        /* border-radius: 50%; */
    }

    .class-ai-item-image {
        width: 260rpx; 
        height: 260rpx; 
        object-fit: cover; 
        clip-path: path("M49 2.6188C53.9504 -0.239323 60.0496 -0.239323 65 2.6188L105.292 25.8812C110.242 28.7393 113.292 34.0214 113.292 39.7376V86.2624C113.292 91.9786 110.242 97.2607 105.292 100.119L65 123.381C60.0496 126.239 53.9504 126.239 49 123.381L8.70835 100.119C3.75793 97.2607 0.708347 91.9786 0.708347 86.2624V39.7376C0.708347 34.0214 3.75793 28.7393 8.70835 25.8812L49 2.6188Z");
    }
</style>