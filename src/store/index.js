import {
	createStore
} from 'vuex';
import apiService from "@/services/api-service";
import {DEFAULT_LOCALE} from "@/locale";

import { getImg } from '../scripts/constants';
export default createStore({
	state: {
		userId: 0, //用户ID
		username: '', //用户名
		userInfo: {}, //用户信息
		locale: DEFAULT_LOCALE,
		jobId: '',
		selectedOptions: {},
		homepageData: {},
		courseData: {},
		intervalId: null, // 定时器ID
		homeNavName: 'dashboard',
		npcs: [{
				characterName: "Jason",
				health: 10,
				avatar: getImg("/static/web/battlefield/boss11.webp"),
				voice: "en-US-DavisNeural",
				style: "chat",
				rate: "0%",
				
			},
			{
				characterName: "Sam",
				health: 10,
				avatar:  getImg("/static/web/battlefield/xiaoA1.webp"),
				voice: "en-US-JasonNeural",
				style: "friendly",
				rate: "10%",
			},
			{
				characterName: "Anna",
				health: 10,
				avatar:  getImg("/static/web/battlefield/xiaoB1.webp"),
				voice: "en-US-JennyNeural",
				style: "chat",
				rate: "10%",
			},
		],
		weakness: null,
		characteristics: null,
		diamondCount: 0,
		gemCount: 0,
		evalResult: {},
		audios: new Map(),
		scenario_id: 1,
		scenarioResponse: {},
		courseInfo: {}, // 添加新的state属性
		navBarTop: 0,
		navBarHeight: (typeof wx !== 'undefined' ? wx.getSystemInfoSync().statusBarHeight + 60 : 60),
		themeColors: {
			theme: '#90E0E7', //主题颜色
			// theme: '#F2BC74', //主题颜色
			theme_deep: '#2D6985', //主题深颜色
			matching: '#D6FCF6', //搭配主题颜色
			// matching: '#FDEDC8', //搭配主题颜色
			popup_font_title: '#2D6985', //弹框标题文字颜色
			// popup_font_title: '#8C5225', //弹框标题文字颜色
		}
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
		setLocale(state, locale) {
			state.locale = locale;
			console.log(`setStorageSync locale: ${locale}`);
			uni.setStorageSync("locale", locale);
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
		},
		setNpcs(state, npcs) {
			state.npcs = npcs;
		},
		setWeakness(state, weakness) {
			state.weakness = weakness;
		},

		setcourseDatas(state, courseData) {
			state.courseData = courseData;
		},

		setCharateristics(state, characteristics) {
			state.characteristics = characteristics;
		},
		setDiamondCount(state, diamondCount) {
			state.diamondCount = diamondCount;
		},
		setGemCount(state, gemCount) {
			state.gemCount = gemCount;
		},
		setevalResult(state, evalResult) {
			state.evalResult = evalResult;
		},
		setAudios(state, {
			key,
			value
		}) {
			state.audios.set(key, value);
		},
		initNpcsHealth(state) {
			state.npcs.forEach((item) => item.health = 10);
		},
		setScenarioId(state, scenarioId) {
		  state.scenarioId = scenarioId;
		},
		setScenarioResponse(state, scenarioResponse) {
		  state.scenarioResponse = scenarioResponse;
		  console.log('@@@@@@@@@@@@Scenario response updated:', scenarioResponse);
		},
		setCourseInfo(state, courseInfo) {
			state.courseInfo = courseInfo;
		},
		setNavBarTop(state, navBarTop) {
			state.navBarTop = navBarTop;
		},
		setNavBarHeight(state, navBarHeight) {
			state.navBarHeight = navBarHeight;
		},
		setThemeColors(state, themeColors) {
			state.themeColors = themeColors;
		},
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
		getLocale(state) {
			return state.locale;
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
		},
		getNpcs(state) {
			return state.npcs;
		},
		getWeakness(state) {
			return state.weakness;
		},
		getcourseData(state) {
			return state.courseData;
		},
		getCharacteristics(state) {
			return state.characteristics;
		},
		getDiamondCount(state) {
			return state.diamondCount;
		},
		getGemCount(state) {
			return state.gemCount;
		},
		getevalResult(state) {
			return state.evalResult;
		},
		getAudios: (state) => (key) => {
			return state.audios.get(key);
		},
		getScenarioId(state) {
			return state.scenarioId;
		},
		getScenarioResponse(state) {
			console.log('@@@@@@@@@@@@@Getting scenario response:', state.scenarioResponse);
		  
			return state.scenarioResponse;
		},
		getCourseInfo(state) {
			return state.courseInfo;
		},
		getNavBarHeight(state) {
			return state.navBarHeight;
		},
		getNavBarTop(state) {
			return state.navBarTop;
		},
		getThemeColors(state) {
			return state.themeColors;
		},
	},
	actions: {
		async fetchHomepageData({
			commit,
			state
		}) {
			try {
				const homepageData = await apiService.getHomepageData(this.state.userId);
				console.log("#####store homepage data:", homepageData);

				if (homepageData.response && homepageData.response.eq_scores) {
					commit('setHomepageData', homepageData);
					commit('setGemCount', homepageData.response.personal_info.num_star)
				}

				// commit('setDiamondCount', homepageData.response.personal_info.num_diamond);
				console.log("##########commit homepage data:", homepageData);
			} catch (error) {
				// console.error('Error fetching homepage data:', error);
				console.log("####get home page data failed.")
				throw error;
			}
		},
		async fetchcourseData({
			commit,
			state
		}) {
			try {
				console
				const courseData = await apiService.getBattlefield(this.state.userId);
				if (!courseData) {
					throw new Error('No course data received');
				}
				console.log("Fetched course data:", courseData);
				commit('setcourseDatas', courseData);
				console.log("Committed course data:", state.courseData);
			} catch (error) {
				console.error('Error fetching course Data:', error);
			}
		},
		async fetchCourseInfo({ commit }, courseId) {
			try {
				const courseInfo = await apiService.getCourseInfo(courseId);
				if (!courseInfo) {
					throw new Error('No course info received');
				}
				console.log("Fetched course info:", courseInfo);
				commit('setCourseInfo', courseInfo);
				if(courseInfo.course_data && courseInfo.course_data.theme) {
					// console.log(courseInfo.course_data.theme);
					commit('setThemeColors', JSON.parse(courseInfo.course_data.theme));
				}
			} catch (error) {
				console.error('Error fetching course info:', error);
				throw error;
			}
		},
		clearAllState({
			commit
		}) {
			commit('setUserId', null);
			commit('setUsername', null);
			commit('setUserInfo', null);
			commit('setJobId', null);
			commit('setSelectedOptions', []);
			commit('setHomepageData', {});
			commit('setHomeNavName', '');
			commit('setWeakness', '');
			commit('setCharateristics', '');
			commit('setcourseData', {});
			commit('setAudios', {});
			commit('evalResult', {});
			commit('setGemCount', 0); 
			commit('setDiamondCount', 0);

			const username = uni.getStorageSync('username');
			localStorage.clear();
			uni.setStorageSync('username', username);
		},
		async getNavBarHeight({ commit }) {
			try {
				const systemInfo = wx.getSystemInfoSync();
				const menuButtonInfo = wx.getMenuButtonBoundingClientRect();

				const statusBarHeight = systemInfo.statusBarHeight;

				// 获取胶囊按钮的位置信息
				const menuButtonHeight = menuButtonInfo.height;
				const menuButtonTop = menuButtonInfo.top;

				// 计算导航栏高度
				const navBarHeight = statusBarHeight + menuButtonHeight + 2 * (menuButtonTop - statusBarHeight);

				// 计算胶囊中心的Y坐标
				const capsuleCenterY = menuButtonTop + menuButtonHeight / 2;

				// 计算导航栏中心的Y坐标
				const navBarCenterY = navBarHeight / 2;

				// 计算胶囊中心距离导航栏中心的距离
				const distance = Math.abs(capsuleCenterY - navBarCenterY);
				const navBarTop = distance * 2;

				commit('setNavBarHeight', navBarHeight);
				commit('setNavBarTop', navBarTop);
				return navBarHeight;
			} catch (error) {
				console.error('Error getting nav bar height:', error);
				return 60; // Default fallback height
			}
		},
	}
})