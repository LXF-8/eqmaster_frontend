<template>
  <view class="background-image loading-container">
    <image class="background-image" :src="getBgImg" mode="aspectFill" />
    <!-- Content -->
    <view class="loading-text-container">
      <text class="loading-text">{{ this.courseInfo.course_data.location }}</text>
      <!-- <text class="loading-text">{{ $t('pages.battlefield.loading.title') }}</text> -->
    </view>
  </view>
</template>

<script>
import { startField } from "../../scripts/battlefield-chat";
import apiService from '../../services/api-service';
import { getImg } from "../../scripts/constants";
export default {
  data() {
    return {
      getImg,
      courseId: 0,
    }
  },
  onLoad(options) {
    // if(!options.courseId || options.courseId <= 0) {
    //   uni.navigateBack();
    // }
    // this.courseId = options.courseId;
  },
  computed: {
    courseInfo() {
      return this.$store.getters.getCourseInfo;
    },
    themeColors() {
      return this.$store.getters.getThemeColors;
    },
    getBgImg() {
      return getImg(this.themeColors.background);
    },
  },


  async mounted() {
    const course_id = this.$store.getters.getCourseInfo;
    const user_id = this.$store.getters.getUserId;
    const result = await startField(user_id, course_id);
    result.response.dialog.map((item) => {
      this.$store.commit('setAudios', { key: `voice-${item.words || item.content}`, value: item.voice_url });
    })
    // uni.setStorage({
    //   key: "chats",
    //   data: result.response.dialog,
    //   // task_check: result.task_check, 
    // });
    uni.setStorage({
      key: "chats",
      data: {
        dialog: result.response.dialog,
        task_check: result.task_check
      }
    });
    uni.reLaunch({
      url: '/pages/battlefield/battlefield-playground'
    })

  }
}
</script>

<style scoped>
@import "./common.css";

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-text-container {
  width: 30%;
  background-color: rgba(16, 16, 16, 0.4);
  height: 40px;
  border-radius: 40rpx;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-text {
  color: #fff;
  font-size: 25rpx;
}
</style>
