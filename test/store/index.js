import { createStore } from 'vuex'
import apiService from "@/services/api-service";

export default createStore({
  state: {
    userId: 0, //用户ID
    username: '', //用户名
    userInfo: {}, //用户信息
    jobId: '',
    selectedOptions: {},
    homepageData: {},
    intervalId: null, // 定时器ID
    homeNavName: 'dashboard',
  },
  mutations: {
    setUserId(state, userId) {
      state.userId = userId;
    },
    clearIntervalId(state) {
      if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
      }
    },
    setUsername(state, username) {
      state.username = username;
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
    },
    setJobId(state, jobId) {
      state.jobId = jobId;
    },
    setSelectedOptions(state, selectedOptions) {
      state.selectedOptions = selectedOptions;
    },
    setSelectedOptions(state, selectedOptions) {
      state.selectedOptions = selectedOptions;
    },
    setHomepageData(state, homepageData) {
      state.homepageData = homepageData;
    },
    setHomeNavName(state, homeNavName) {
      state.homeNavName = homeNavName;
    }
  },
  getters: {
    getUserId(state) {
      return state.userId;
    },
    getUsername(state) {
      return state.username;
    },
    getUserInfo(state) {
      return state.userInfo;
    },
    getJobId(state) {
      return state.jobId;
    },
    getSelectedOptions(state) {
      return state.selectedOptions;
    },
    getHomepageData(state) {
      return state.homepageData;
    },
    getHomeNavName(state) {
      return state.homeNavName;
    }
  },
  actions: {
    async fetchHomepageData({ commit, state }) {
      try {
        const homepageData = await apiService.getHomepageData(this.state.userId);
        commit('setHomepageData', homepageData);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      }
    },
    clearAllState({ commit }) {
      commit('setUserId', null);
      commit('setUsername', null);
      commit('setUserInfo', null);
      commit('setJobId', null);
      commit('setSelectedOptions', []);
      commit('setHomepageData', {});
      commit('setHomeNavName', '');
    }
  }
})