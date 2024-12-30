<template>
	<view :style="{ '--theme-color-matching': themeColors.matching, '--theme-color-theme': themeColors.theme }">
		<view class="container" :style="{'--bgimg':`url(${getBgImg})`}" @click="handleContainerClick">

			<image class="background-image" :src="getBgImg"
				mode="aspectFill" />
			<view v-if="state === 'userTalk'" class="overlay user-overlay"></view>
			<view v-else class="overlay"></view>

			<view class="navbar" :style="{ height: navBarHeight + 'px' }" :class="{ shadowed: shouldShadow }">
				<image class="back-button" src="/static/back-left.png" @tap="goToDashboard"
					:style="{ marginTop: navBarTop + 'px' }"></image>
				<!-- #ifdef MP-WEIXIN -->
				<image class="setting-item" src="/static/battlefield/task-list.png" @click="handleClickTaskList"
					:style="{ marginTop: navBarTop + 'px' }"></image>
				<!-- #endif -->
				<reward-bar :gemCount="gemCount"
					:style="{ marginTop: navBarTop + 'px', marginLeft: isWeChatMiniProgram ? '' : '80rpx', background: '#10101066', borderRadius: '21px' }"></reward-bar>
				<view class="setting-group" :style="{ marginTop: navBarTop + 'px' }">
					<!-- #ifdef APP-PLUS || H5 -->
					<image class="setting-item" src="/static/battlefield/task-list.png" @click="handleClickTaskList">
					</image>
					<image class="setting-item" src="/static/battlefield/setting.png"></image>
					<!-- #endif -->
				</view>
			</view>
			<view v-if="showToolTips && isTooltipVisible && showTaskTooltip" class="taskTooltip">
				{{ $t('pages.battlefield.playground.review') }}
			</view>

			<!-- <view class="text-area">语音识别内容：1111{{transcript}}</view> -->

			<view class="npc-group" :class="{ shadowed: shouldShadow }">
				<npc-status v-for="npc in npcs" :key="npc.characterName" :health="npc.health" :avatar="npc.avatar"
					:characterName="npc.characterName"></npc-status>
			</view>

			<view class="chat-container" v-if="state !== 'NpcTalk'">
				<scroll-view class="chat-history-container" scroll-y ref="chatHistoryContainer"
					:scroll-into-view="scrollIntoViewId" :show-scrollbar="false" :enable-passive="true"
					:scroll-top="scrollTop">
					<view v-for="(chat, index) in displayedMessages" class="chat-item" :key="index"
						:id="'chat-item-' + index">
						<npc-chat-box v-if="
							npcNames.includes(
								chat.role
							)
						" :key="'npc-' + index" :index="index" :avatar="getBattlefieldAvatar(chat.role)" :name="chat.role"
							:dialog="chat.content" :isLastElement="index === displayedMessages.length - 1"
							:playAudioIndex="playAudioIndex" @playAudio="playAudio"></npc-chat-box>
						<view v-else-if="chat.role === 'user'"
							:class="['message-wrapper', { animate: chat.shouldAnimate }]">
							<self-chat-box :key="'user' + index" :wording="chat.content" :commit="userJudgeContent"
								:isLastElement="index === lastUserIndex"></self-chat-box>
						</view>
						<view v-else-if="chat.role === 'tipping'"
							:class="['message-wrapper', { animate: chat.shouldAnimate }]">
							<tipping-chat-box :key="'tipping' + index" :tip="chat.content"></tipping-chat-box>
						</view>
						<view v-else-if="chat.role === 'empty'" :class="['message-wrapper']"></view>
						<view v-else-if="chat.role === 'empty-audio'" :class="['message-wrapper-empty']"></view>
					</view>
					<view class="loading-container" v-if="anasLoadingObj.loading">
						<image class="loading-icon" src="/static/battlefield/loading.png"></image>
						<span v-if="anasLoadingObj.text !== ''">{{
							anasLoadingObj.text
						}}</span>
					</view>
				</scroll-view>
			</view>

			<view v-if="state === 'NpcTalk' && !isFinish" class="npc-talk-container">
				<large-avatar-bubble :avatar="npcs[talkingNpc].avatar" :character="npcs[talkingNpc].characterName"
					:wording="chattingHistory[displayedNpcChatIndex].content">
				</large-avatar-bubble>
			</view>

			<!-- 录音弹框 -->
			<!-- avoid opacity inheriting -->
			<view class="popup-overlay" v-if="isRecording" @click="handleRecordingDone">
				<view class="recording-box">
					<text class="timer">{{ remainingTime }}''</text>
					<view class="waveform">
						<!-- 声波动画 -->
						<view class="wave"></view>
						<view class="wave"></view>
						<view class="wave"></view>
						<view class="wave"></view>
						<view class="wave"></view>
					</view>

					<text class="cancel-text">{{ $t('pages.battlefield.playground.submit_or_cancel') }}</text>
				</view>
			</view>

			<view
				v-if="state === 'userTalk' && showToolTips && isTooltipVisible && (showHintTooltip || showRecordTooltip || showTaskTooltip)"
				class="tooltipOverlay" @click.stop="hideTooltip">
			</view>
			<!-- tooltip -->
			<!-- tooltip for record -->
			<!-- #ifndef H5 -->
			<view v-if="
				state === 'userTalk' &&
				showToolTips &&
				isTooltipVisible &&
				showRecordTooltip
			" class="recordTooltip">
				{{ $t('pages.battlefield.playground.record') }}
			</view>
			<!-- #endif -->

			<!-- #ifdef H5 -->
			<view v-if="
				state === 'userTalk' &&
				showToolTips &&
				isTooltipVisible &&
				showRecordTooltip
			" class="keyboardToolTip">
				{{ $t('pages.battlefield.playground.enter') }}
			</view>
			<!-- #endif -->
			<!-- tooltip for hint -->
			<view v-if="
				state === 'userTalk' &&
				showToolTips &&
				isTooltipVisible &&
				showHintTooltip
			" class="hintTooltip">
				{{ $t('pages.battlefield.playground.help') }}
			</view>

			<!-- 操作按钮组 -->
			<view class="player-action-container" v-if="state !== 'NpcTalk' && sendMessageNavShow"
				:style="{ zIndex: isRecording ? 1000 : 10 }">
				<view class="action-item" v-if="!isRecording" @click.stop="handleClickInput()">
					<image class="action-icon" src="/static/battlefield/keyboard.png"></image>
				</view>

				<!-- #ifndef H5 -->
				<view class="middle-container">
					<view class="action-item action-item-middle" @touchstart="handleClickRecording"
						@touchend="handleRecordingDone" @touchmove="handleTouchMove" @click.stop="hideTooltip">
						<image class="action-icon action-icon-middle" src="/static/battlefield/microphone.png"></image>
					</view>
				</view>
				<!-- #endif -->
				<view class="action-item" v-if="!isRecording" @click.stop="clickHintButton">
					<image class="action-icon" src="/static/battlefield/light.svg"></image>
				</view>
			</view>

			<view v-if="showTippingCard" class="tipping-card">
				<tipping :quit="handleTippingQuit" :hint="hint" :help="help"></tipping>
			</view>

			<view class="popup-overlay" v-if="showInput" @click="showInput = false">
				<view class="input-container-wrapper"
					:style="{ position: showKeyboardInput ? 'unset' : 'fixed', marginBottom: showKeyboardInput ? '24rpx' : '' }">
					<view class="input-container" @click.stop>
						<!-- <input type="text" :focus="focusInput" placeholder="请输入..." /> -->
						<textarea :placeholder="$t('pages.battlefield.playground.type_in')" v-model="inputContent"
							auto-height @focus="scrollToInput" />
					</view>
					<view class="send-sms-container" @click="inputRecordingBlur">
						<image class="send-sms-icon" src="/static/battlefield/send-sms-icon.png"></image>
					</view>
				</view>
			</view>

			<!-- 任务完成卡 -->
			<view class="judge-container" v-if="state === 'judge' || state === 'judgeTry'">
				<judge :title="judgeTitle" :wording="judgeContent" @judge="gotoNextRound" :good-judge="isGoodReply"
					:isCompleteTask="isCompleteTask" :currentTask="currentTask" @setIsLoadingShow="setIsLoadingShow">
				</judge>
			</view>

			<!-- 精囊卡片 -->
			<view v-if="showCardPopup" class="popup-overlay" @click="showCardPopup = false">
				<CueCardsVue @closeCueCard="closeCueCard" @exchangeClick="exchangeClick"
					:cardButtonLoading="cardButtonLoading" />
			</view>

			<view v-if="missionShow" class="judge-mission-container">
				<MissionList :listData="taskList.taskList" @closeMissionCard="closeMissionCard" />
			</view>
		</view>
		<view v-if="isLoadingShow" class="judge-loading-container">
			<view class="loading-spinner"></view>
		</view>
	</view>
</template>

<script>
let recorderManager;
// #ifdef MP-WEIXIN
const plugin = requirePlugin("WechatSI");
recorderManager = plugin.getRecordRecognitionManager();
// #endif

// #ifdef APP-PLUS || H5 || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO
recorderManager = uni.getRecorderManager();
// #endif

import RewardBar from "@/components/RewardBar.vue";
import NpcStatus from "@/components/NpcStatus.vue";
import LargeAvatarBubble from "@/components/LargeAvatarBubble.vue";
import Judge from "@/components/Judge.vue";
import Tipping from "@/components/Tipping.vue";
import TippingChatBox from "@/components/TippingChatBox.vue";
import SelfChatBox from "@/components/SelfChatBox.vue";
import NpcChatBox from "@/components/NpcChatBox.vue";
import MissionList from "../../components/MissionList.vue";
import CueCardsVue from "../../components/CueCards.vue";
import {
	reply,
	startField,
	helpReply,
	hint,
	continueChat,
	evalBattlefield,
	checkShowToolTips,
} from "@/scripts/battlefield-chat";
import {
	getBattlefieldAvatar
} from "../../scripts/locate_name";
import {
	filterChatHistory
} from "../../scripts/battlefield-chat";
// import Task from "../../models/Task";
// import TaskList from "../../models/TaskList";
import state from "../../state";
import apiService from '../../services/api-service';
import { getImg } from "../../scripts/constants";
export default {
	components: {
		RewardBar,
		NpcStatus,
		LargeAvatarBubble,
		Judge,
		Tipping,
		TippingChatBox,
		SelfChatBox,
		NpcChatBox,
		MissionList,
		CueCardsVue,
	},
	data() {
		return {
			getImg,
			// userId: state.userId,
			transcript: "",
			judgeTitle: "",
			judgeContent: "",
			userJudgeContent: "",
			// taskList: new TaskList([]),
			isGoodReply: true,
			state: "NpcTalk", // Current state
			userTalkCount: 0, // 计数器，用来控制tooltip的出现时机
			showToolTips: checkShowToolTips(2) ? checkShowToolTips(2) : true, // 假设tooltip显示状态为 true，等后端数据返回后更新
			showRecordTooltip: true,
			showHintTooltip: false,
			showTaskTooltip: false,
			isTooltipVisible: true, // 控制tooltip的可见性，默认可见
			showTippingCard: false, // Controls the tipping card visibility
			talkingNpc: 0,
			displayedNpcChatIndex: 0, // Tracks the last displayed NPC chat
			npcDialog: "这里是NPC的对话", // 替换为实际对话
			someoneTalk: true,
			chattingHistory: [],
			taskcheck: 0,
			allHistory: [],
			showInput: false,
			showKeyboardInput: false,
			focusInput: false,
			gemCount: 2,
			isPass: false, // 初始化 isPass 值，可以是 true 或 false
			diamonds: 0,
			tempFilePath: "", // 临时录音文件路径
			getBattlefieldAvatar,
			showCardPopup: false,
			cardButtonLoading: false,
			selectedCard: 0,
			missionShow: false,
			inputContent: "",
			missionResultList: [{
				num: 10,
				content: "",
			},
			{
				num: 30,
				content: "",
			},
			],
			isRecording: false, // Controls the display state of recording box
			remainingTime: 30, // 录音剩余时间
			isCanceling: false, // 判断是否处于取消状态
			touchStartY: 0, // 记录touchstart的位置
			touchThreshold: -100, // 上滑取消的阈值（负值表示向上滑动）
			countdownInterval: null, // 倒计时的定时器
			getBattlefieldAvatar,
			anasLoadingObj: {
				loading: false,
				text: "",
			},
			// jobId: "",
			answerNotGoodNum: 0,
			totalTaskNum: 1,
			completedTaskNum: 1,
			scrollIntoViewId: "",
			isCompleteTask: false,
			currentTask: null,
			isLoadingShow: false,
			task2CompletedStatusOne: false,
			taskFinished: false,
			isFinish: false,
			playAudioIndex: -1,
			sendMessageNavShow: true,
			scrollIntoViewIdOffset: 0,
			scrollTop: 0,
			dynamicIndex: 2,
		};
	},
	created() {
		console.log("created");
		// console.log("state userid", state.userId);
		// 动态添加任务到 taskList
		// this.taskList.addTask(
		// 	new Task(0, "Cheer up Sam while avoiding further infuriating Jason.")
		// );
		// this.taskList.addTask(
		// 	new Task(1, "Encourage teammates to engage and get at least one to say, \"I agree with you.\"")
		// );
		this.scrollToInput();
	},
	methods: {
		scrollToInput() {
			// 监听键盘高度变化
			uni.onKeyboardHeightChange(res => {
				console.log(res);
				if (res.height == 0) {
					// 键盘收起
					this.showKeyboardInput = false;
				} else {
					// 键盘弹起
					this.showKeyboardInput = true;
				}
			});
		},
		setIsLoadingShow(value) {
			this.isLoadingShow = value;
		},
		goToDashboard() {
			uni.navigateTo({
				url: "/pages/home/index",
			});
			this.$store.commit('initNpcsHealth');
		},
		handleClickTaskList() {
			this.missionShow = true; // 显示任务
			this.showTaskTooltip = false; // 隐藏 Tooltip
			this.isTooltipVisible = false; //去掉蒙层
		},
		handleClickRecording(e) {
			// console.log("click start , isRecording: ", this.isRecording)
			this.isRecording = true;
			const newMessage = {
				role: "empty-audio",
				content: 'empty-audio',
			};
			this.chattingHistory.push(newMessage);
			this.showInput = false;
			this.inputContent = "";
			this.isCanceling = false;
			this.remainingTime = 30;
			this.touchStartY = e.touches[0].clientY;
			this.startRecording();
			this.startCountdown();
			// 隐藏tooltip
			this.isTooltipVisible = false;
			this.showRecordTooltip = false;
			// console.log(("change tooltip visible into:", this.isTooltipVisible));
		},
		handleTouchMove(e) {
			console.log("move start , isRecording: ", this.isRecording);
			if (!this.isRecording) return;
			const currentY = e.touches[0].clientY;
			const distance = currentY - this.touchStartY;
			if (distance < this.touchThreshold) {
				this.isCanceling = true;
				console.log("canceled");
			} else {
				this.isCanceling = false;
				console.log("not canceled");
			}
		},
		handleRecordingDone() {
			console.log("stop record");
			// console.log("handling touch move...");
			if (!this.isRecording) return;
			recorderManager.stop();
			clearInterval(this.countdownInterval);
			this.isRecording = false;
			// Remove the empty message from chattingHistory
			this.chattingHistory = this.chattingHistory.filter(chat => chat.role !== 'empty-audio');
			this.anasLoadingObj.loading = true;
			// if (this.isCanceling) {
			//   this.cancelRecording();
			// } else {
			//   this.sendRecording();
			// }
		},
		resetRecording() {
			this.isRecording = false;
			this.isCanceling = false;
			this.remainingTime = 30;
			clearInterval(this.countdownInterval);
		},
		startCountdown() {
			this.countdownInterval = setInterval(() => {
				console.log("Counting down:", this.remainingTime);
				if (this.remainingTime > 0) {
					this.remainingTime--;
				} else {
					this.handleRecordingDone();
				}
			}, 1000);
		},
		hideTooltip() {
			this.isTooltipVisible = false;
			this.showRecordTooltip = false;
			this.showHintTooltip = false;
			this.showTaskTooltip = false;
			console.log(("change tooltip visible into:", this.isTooltipVisible));
		},
		async gotoNextRound() {
			console.log("go next round");
			this.sendMessageNavShow = true;
			if (!this.isGoodReply) {
				this.retry();
				this.isLoadingShow = false;
				return;
			}
			// this.answerNotGoodNum = 0;
			// console.log("结果1this.pass", this.pass)
			// console.log("结果2this.taskFinished", this.taskFinished)
			// await this.Pass();

			if (this.taskFinished) {
				this.isFinish = true;

				await this.Pass();
				return;
			}
			// return false;
			if (!this.isLoadingShow) {
				this.isLoadingShow = true;
			}
			try {
				const nextRound = await continueChat(this.allHistory, "1");
				// nextRound = nextRound.response;
				console.log("next round data", nextRound);
				this.taskcheck = nextRound.task_check
				// console.log("……taskcheck", this.taskcheck);

				nextRound.dialog = nextRound.response.dialog.map(item => ({
					role: item.role,
					content: item.content ?? item.words,
				}));

				// const npcsMap = new Map(this.$store.getters.getNpcs.map(item => [item.characterName, item]));
				nextRound.response.dialog.map(item => {
					this.$store.commit('setAudios', {
						key: `voice-${item.content}`,
						value: item.voice_url
					});
				});

				// console.log("current chatting history:", this.chattingHistory);
				this.chattingHistory = nextRound.dialog;
				this.allHistory = [...this.allHistory, ...nextRound.dialog];
				// console.log("after concat, chatting history:", this.chattingHistory);

				// await this.checkBossComplimentTask2(this.taskcheck);

				this.displayedNpcChatIndex = 0;
				this.talkingNpc = this.getNpcIndexByName(this.chattingHistory[0].role);
				this.state = "NpcTalk";
			} catch (error) {
				console.error("get audio fail", error);
			}

			this.isLoadingShow = false;
		},
		playAudio(params) {
			console.log(params);
			this.playAudioIndex = params.index;
			const audioContext = uni.createInnerAudioContext();
			const audio = this.$store.getters.getAudios(`voice-${params.dialog}`);
			console.log(audio);
			if (audio) {
				audioContext.src = audio;
				audioContext.play();
				audioContext.onEnded(() => {
					this.playAudioIndex = -1;
				});
			}
		},
		retry() {
			this.state = "userTalk";
		},
		startRecording() {
			const options = {
				duration: 30000, // 最大录音时长 30 秒
				sampleRate: 16000, // 采样率，Azure 推荐16kHz
				numberOfChannels: 1, // 单声道
				encodeBitRate: 16000, // 编码码率
				format: "wav", // 设置录音格式为 wav
			};
			recorderManager.start({
				lang: 'zh_CN',
			});
			this.userJudgeContent = "";
		},
		getNextState() {
			if (this.state === "NpcTalk" && this.chattingHistory.length === 0) {
				console.log("Dismiss npc");
				this.state = "userTalk";
			} else {
				// Other state transitions
			}
		},
		handleTippingQuit() {
			console.log("Clicked quit tipping");
			this.state = "userTalk"; // Change state
		},
		// showInput = true; focusInput = true;
		handleClickInput() {
			this.showInput = true;
			this.focusInput = true;
			this.inputContent = "";
		},
		help() {
			console.log("Choose help card");
		},
		hint() {
			console.log("Choose hint card");
		},
		clickHintButton(event) {
			event.stopPropagation();
			this.state = "hint";
			this.showCardPopup = true;
			this.showHintTooltip = false;
			this.isTooltipVisible = false;
		},

		// async uploadAndRecognizeSpeech(filePath) {
		// 	try {
		// 		const response = await uni.uploadFile({
		// 			url: "https://eqmaster.azurewebsites.net/upload-audio/", // 替换为你的 FastAPI 服务地址
		// 			filePath: filePath, // 录音的 WAV 文件路径
		// 			name: "file", // 与 FastAPI 后端的字段名保持一致
		// 			header: {
		// 				"Content-Type": "multipart/form-data", // 确保使用 multipart/form-data 进行文件上传
		// 			},
		// 		});

		// 		const resData = JSON.parse(response.data); // 解析返回的 JSON 数据
		// 		const transcript = resData.transcript; // 获取返回的识别文本
		// 		return transcript; // 成功返回识别结果
		// 	} catch (error) {
		// 		throw error;
		// 	}
		// },

		async dismissNpcTalk() {
			let foundNpcMessage = false;
			const history = this.chattingHistory;
			console.log("this.displayedNpcChatIndex, history", this.displayedNpcChatIndex, history);
			for (let i = this.displayedNpcChatIndex + 1; i < history.length; i++) {
				if (history[i].role !== "user") {
					// Found the next NPC message
					this.displayedNpcChatIndex = i;
					this.talkingNpc = this.getNpcIndexByName(history[i].role);
					console.log(this.talkingNpc);
					this.npcDialog = history[i].content;
					foundNpcMessage = true;
					break;
				}
				// this.displayedNpcChatIndex ++;
			}
			if (!foundNpcMessage) {
				// No more NPC messages; change state to 'userTalk'
				// console.log("no more npc, now user turn.");
				this.state = "userTalk";
				// const validChats = filterChatHistory(this.allHistory);
				// const judgeResult = await reply(validChats, "1");
				// const taskCheck = judgeResult.task_check;
				// const taskCheck = judgeResult.task_check;
				// console.log("2222222111111111111this.taskcheck.", this.taskcheck);
				if (this.taskcheck > 0) { //如果是下一轮的话
					await this.checkBossComplimentTask(true, this.taskcheck);
				}
				// if(this.taskcheck == 2) {
				// }
				const newMessage = {
					role: "empty",
					content: 'empty',
				};
				this.chattingHistory.push(newMessage);
				// await this.checkBossComplimentTask1(judgeResult, taskCheck);
				// await this.checkBossComplimentTask2(this.taskcheck);
			}
		},

		// Helper method to get NPC index by name
		getNpcIndexByName(name) {
			console.log(this.npcs, name);
			return this.npcs.findIndex((npc) => npc.characterName === name);
		},
		async Pass() {
			console.log("Pass！！！！！！！！");
			const isPass = this.isPass; // 假设你从当前状态得知是否通过
			const gemCount = this.calculateStars(); // 假设 this.gemCount 是当前的宝石数量
			const diamonds = this.diamonds; // 假设 this.diamonds 是当前的钻石数量
			this.$store.commit('setGemCount', gemCount);
			const evaluationResult = await evalBattlefield(
				this.allHistory,
				isPass,
				gemCount,
				diamonds
			);
			const userId = this.$store.getters.getUserId;
			console.log("evaluation result！！！！！！！！:", evaluationResult);
			this.$store.commit('setEvalResult', evaluationResult);
			this.$store.commit('setGemCount', this.gemCount);
			this.$store.commit('setIsPass', this.isPass);
			// 将所有 NPC 的 health 值保存到本地存储
			const npcHealthValues = this.npcs.map((npc) => npc.health);
			// this.$store.commit('setNpcHealth', npcHealthValues);
			await this.$store.dispatch('fetchHomepageData');
			// console.log("getCurrentPages().pop().route", getCurrentPages().pop().route);
			if (getCurrentPages().pop().route !== "pages/battlefield/battlefield-summary-zh") {
				uni.navigateTo({
					url: "/pages/battlefield/battlefield-summary-zh",
				});
			}
		},
		calculateStars() {
			const totalMood = this.npcs.reduce((sum, npc) => sum + npc.health, 0);
			const adjustedMood = totalMood; // 调整情绪值，确保为正数
			console.log(adjustedMood);
			if (adjustedMood >= 41 && adjustedMood <= 60) {
				return 3; // 三颗星
			} else if (adjustedMood >= 21 && adjustedMood <= 40) {
				return 2; // 两颗星
			} else if (adjustedMood >= 0 && adjustedMood <= 20) {
				return 1; // 一颗星
			} else {
				return 0; // 如果调整后的情绪值小于0，返回0颗星
			}
		},
		handleContainerClick() {
			if (this.state === "NpcTalk") {
				console.log("handleContainerClick");
				this.dismissNpcTalk();
			}
			// If needed, handle clicks in other states
		},

		initRecorderManager() { //语音输入
			// 设置录音识别回调
			recorderManager.onRecognize = (res) => {
				this.transcript = res.result;
			}

			recorderManager.onStop = async (res) => {
				let text = res.result;

				// 检查是否有录音内容
				if (!text || text.trim() === '') {
					console.log('没有检测到语音内容');
					this.isCanceling = true;
					this.resetRecording();
					uni.showToast({
						title: "Not clear",
						icon: "none"
					});
					this.anasLoadingObj.loading = false;
					return;
				}

				// 更新transcript并添加到聊天历史
				this.transcript = text;
				const newMessage = {
					role: "user",
					content: text,
					shouldAnimate: false
				};

				this.chattingHistory.push(newMessage);
				this.allHistory.push(newMessage);

				// 添加动画效果
				this.$nextTick(() => {
					setTimeout(() => {
						newMessage.shouldAnimate = true;
						this.anasLoadingObj.text = this.$t('pages.battlefield.playground.analyzing');;
					}, 50);
				});

				// 发送消息进行处理
				this.sendMessageNavShow = false;
				try {
					// this.anasLoadingObj.loading = true;
					const validChats = filterChatHistory(this.allHistory);
					// this.anasLoadingObj.loading = true;
					const judgeResult = await reply(validChats, "1");
					// this.anasLoadingObj.loading = true;
					await this.handleRecorderReply(judgeResult);
				} catch (error) {
					console.error('处理录音回复出错:', error);
					uni.showToast({
						title: "Failed to process the message",
						icon: "none"
					});
				} finally {
					this.anasLoadingObj.loading = false;
				}
			}
		},
		async inputRecordingBlur() { //键盘输入
			this.showInput = false;
			console.log(this.taskList);
			if (this.inputContent !== "") {
				this.anasLoadingObj = {
					loading: true,
					text: "",
				};
				this.userJudgeContent = "";
				const newMessage = {
					role: "user",
					content: this.inputContent,
					shouldAnimate: false,
				};
				this.chattingHistory.push(newMessage);
				this.allHistory.push(newMessage);
				this.$nextTick(() => {
					// Force a repaint to trigger the animation
					void this.$el.offsetWidth;

					newMessage.shouldAnimate = true;
					this.anasLoadingObj.text = this.$t('pages.battlefield.playground.analyzing');

					// 使用 requestAnimationFrame 确保动画在下一帧开始
					requestAnimationFrame(() => {
						setTimeout(() => {
							// 这个空函数强制浏览器应用更改
						}, 0);
					});
				});
				try {
					this.sendMessageNavShow = false;
					const validChats = filterChatHistory(this.allHistory);
					const judgeResult = await reply(validChats, "1");
					// judgeResult = judgeResult.response;
					// console.log("validChat:", validChat);
					console.log("judge Result:", judgeResult);
					this.gemCount = this.calculateStars();
					console.log("-----------#####after judge:", this.gemCount);
					await this.handleRecorderReply(judgeResult);
					this.inputContent = "";
					this.anasLoadingObj.loading = false;
				} catch (error) {
					this.anasLoadingObj.loading = false;
					if (this.chattingHistory.length > 0) {
						this.chattingHistory.pop();
					}
					this.anasLoadingObj.loading = false;
					this.sendMessageNavShow = true;
				}
			}
		},
		async exchangeClick(selectedCard) { //点击帮助 事件触发
			// console.log(selectedCard);
			this.cardButtonLoading = true;
			console.log("Exchangeclick:", this.allHistory);
			const validChats = filterChatHistory(this.allHistory);
			console.log("validChats:", validChats);
			let replyContent = null;
			this.userJudgeContent = "";
			try {
				if (selectedCard == 1) {
					this.anasLoadingObj = {
						loading: true,
						text: this.$t('pages.battlefield.playground.generating'),
					};
					console.log("validChats:", validChats);
					replyContent = await helpReply(validChats, "1");
					// console.log(replyContent);
					console.log("r66666666666666eplyContent:", replyContent);
					if (replyContent.response.responsive) {
						await this.$store.dispatch('fetchHomepageData');
						this.showCardPopup = false;
						const newMessage = {
							role: "user",
							content: replyContent.response.responsive,
							shouldAnimate: false,
						};
						this.chattingHistory.push(newMessage);
						this.allHistory.push(newMessage);
						this.$nextTick(() => {
							// Force a repaint to trigger the animation
							void this.$el.offsetWidth;

							newMessage.shouldAnimate = true;
							this.anasLoadingObj.text = this.$t('pages.battlefield.playground.analyzing'); // 中文翻译

							// 使用 requestAnimationFrame 确保动画在下一帧开始
							requestAnimationFrame(() => {
								setTimeout(() => {
									// 这个空函数强制浏览器应用更改
								}, 0);
							});
						});

						this.sendMessageNavShow = false;
						await new Promise(resolve => setTimeout(resolve, 3000));
						const validChatsRepy = filterChatHistory(this.allHistory);
						const judgeResultRepy = await reply(validChatsRepy, "1");
						await this.handleRecorderReply(judgeResultRepy);
					} else {
						this.sendMessageNavShow = false;
						uni.showToast({
							title: "回复异常",
							icon: "none",
							duration: 2000,
						});
					}
				}
				if (selectedCard == 2) {
					console.log("get hint card!!!!!!!!!!1");
					this.anasLoadingObj = {
						loading: true,
						text: this.$t('pages.battlefield.playground.generating'),
					};
					const judgeResult = await hint(validChats, "1");
					console.log("get tips from backend:", judgeResult);
					if (judgeResult.response.tips) {
						await this.$store.dispatch('fetchHomepageData');
						this.showCardPopup = false;
						const newMessage2 = {
							role: "tipping",
							content: judgeResult.response.tips,
							shouldAnimate: false,
						};
						this.chattingHistory.push(newMessage2);
						this.$nextTick(() => {
							// Force a repaint to trigger the animation
							void this.$el.offsetWidth;

							newMessage2.shouldAnimate = true;
							this.anasLoadingObj.text = this.$t('pages.battlefield.playground.analyzing');

							// 使用 requestAnimationFrame 确保动画在下一帧开始
							requestAnimationFrame(() => {
								setTimeout(() => {
									// 这个空函数强制浏览器应用更改
								}, 0);
							});
						});
					}
				}
				this.cardButtonLoading = false;
				this.anasLoadingObj.loading = false;
			} catch (error) {
				this.anasLoadingObj.loading = false;
				this.sendMessageNavShow = true;
			}
		},
		async handleRecorderReply(judgeResult) {
			try {
				console.log("1111111judgeResult:", judgeResult);
				if (judgeResult) {
					const taskCheck = judgeResult.task_check;
					console.log("t222222222askCheck:", taskCheck);
					judgeResult = judgeResult.response;

					await this.checkBossComplimentTask(judgeResult, taskCheck);

					// this.updateScrollIntoView();

					// 遍历 judgeResult.moods 并根据角色调整 this.mood 的值
					judgeResult.moods.forEach((item) => {
						const moodValue = parseInt(item.mood, 10);
						this.npcs.forEach((npc, index) => {
							if (npc.characterName === item.role) {
								const health = Math.min(
									npc.health +
									(moodValue > 0 ? 4 : moodValue < 0 ? -2 : 0),
									20
								);
								// console.log(npc.characterName, "health:", health);
								this.$store.commit('setNpcHealth', { index, health });
							}
						});
					});
					// 检查任何 NPC 的 health 是否 <= 0，通关失败
					const anyNpcHealthLow = this.npcs.some((npc) => npc.health <= 0);
					if (anyNpcHealthLow) {
						this.isPass = false; //通关失败
						this.diamonds = 3;
						this.isFinish = true;
						await this.Pass();
					}

					return true; // 添加返回值，表示处理成功
				} else {
					throw new Error("judgeResult is undefined or null");
				}
			} catch (error) {
				uni.showToast({
					title: this.$t('pages.battlefield.playground.error'),
					icon: "none",
					duration: 2000,
				});
				if (this.chattingHistory.length > 0) {
					this.chattingHistory.pop();
				}
				this.sendMessageNavShow = true;
				return false; // 添加返回值，表示处理失败
			}
		},
		async checkBossComplimentTask(judgeResult, taskCheck) {
			try {
				if (judgeResult) {
					if (taskCheck <= 0) { //没完成任务 继续下一轮
						if (this.answerNotGoodNum < 2) {
							this.answerNotGoodNum++;
							this.isGoodReply = true;
							this.state = "userTalk";
							this.userJudgeContent = judgeResult.comments;
							const newMessage = {
								role: "empty",
								content: 'empty',
							};
							this.chattingHistory.push(newMessage);
							// this.updateScrollIntoView();

							// Add a 3-second delay before going to the next round
							setTimeout(async () => {
								await this.gotoNextRound();
							}, 5000);
						} else {
							this.isGoodReply = false;
							this.isTooltipVisible = true;
							if (this.answerNotGoodNum == 2) {
								this.showHintTooltip = true;
							} else {
								this.showHintTooltip = false;
							}
							this.judgeTitle = this.$t('pages.battlefield.playground.need_improve');;
							this.isCompleteTask = false;
							this.judgeContent = judgeResult.comments;
							this.state = "judgeTry";
							this.answerNotGoodNum++;
						}
						// console.log("userJudgeContent", this.userJudgeContent);

					} else { //如果完成任务了
						console.log("任务完成了", taskCheck);
						this.isGoodReply = true;
						this.judgeContent = judgeResult.comments ? judgeResult.comments : '';
						this.answerNotGoodNum = 0;
						const task = this.getTask(taskCheck - 1);
						console.log("task", task);
						if (task) {
							if (!this.taskFinished && !task.one) { //如果该任务还没有完成
								const totalTaskLength = this.getTotalTaskLength;
								this.state = "judge";
								this.currentTask = task;
								task._status = true;
								task._completedRoundNum++;
								if (task.totalRoundNum >= task._completedRoundNum) { //如果该任务已经全部完成
									this.isCompleteTask = true;
									task.one = true;
									this.$store.commit('setDoneTaskLength');
									// this.taskList.doneTaskLength++;
									this.judgeTitle = `(${this.getDoneTaskLength}/${totalTaskLength}) ` + this.$t('pages.battlefield.playground.achieved');
									// taskCompleted = false;
									console.log(`task ${taskCheck} success`);
								} else { //若一个任务包含多次重复动作（得到领导的夸赞2次），完成一次则只显示“任务达成”
									this.judgeTitle = this.$('pages.battlefield.playground.achieved');
									this.isCompleteTask = true;
								}
								if (this.getDoneTaskLength >= totalTaskLength) { //如果任务全部完成 
									this.taskFinished = true;
									this.isPass = true; //通关成功
									setTimeout(async () => {
										await this.Pass();
									}, 5000);
								}
							} else {
								await this.gotoNextRound();
							}
						} else {
							throw new Error("Failed to get task");
						}
					}
				}
			} catch (error) {
				console.error("Error in checkBossComplimentTask:", error);
				uni.showToast({
					title: this.$t('pages.battlefield.playground.error'),
					icon: "none",
					duration: 2000,
				});
				if (this.chattingHistory.length > 0) {
					this.chattingHistory.pop();
				}
				this.sendMessageNavShow = true;
				return false; // 添加返回值，表示处理失败
			}
		},
		closeCueCard() {
			this.showCardPopup = false;
		},
		closeMissionCard() {
			this.missionShow = false;
		},
		updateScrollIntoView() {
			this.$nextTick(() => {
				setTimeout(() => {
					const lastMessageId = "chat-item-" + (this.displayedMessages.length - 1);
					this.scrollIntoViewId = lastMessageId;
				}, 100); // 添加100毫秒的延迟
			});
		},
	},
	onLoad(option) {
		console.log("loaded", option);
		uni.getStorage({
			key: "chats",
			success: (res) => {
				console.log("chatting histories,", res.data);
				console.log("chatting historiestask_check,", res.data.task_check);
				this.chattingHistory = res.data.dialog.map((item) => ({
					...item,
					content: item.words || item.content,
				}));
				this.allHistory = JSON.parse(JSON.stringify(this.chattingHistory));
			},
		});
		this.jobId = option.jobId || "154ee592-287b-4675-b8bd-8f88de348476";
		this.initRecorderManager();
		uni.getSystemInfo({
			success: (res) => {
				this.systemInfo = res;
			},
		});
	},
	watch: {
		isCanceling(newValue) {
			console.log("isCanceling : ", newValue);
			if (newValue) {
				console.log("Doing canceling ");
				this.handleRecordingDone();
			}
		},
		chattingHistory: {
			handler(newValue, oldValue) {
				// console.log(newValue, oldValue)
				this.updateScrollIntoView();
			},
			deep: true,
		},
		state(newVal, oldVal) {
			if (newVal === "userTalk") {
				this.userTalkCount++; // 增加计数器
				console.log("The user round:", this.userTalkCount);

				// 第二次进入 'userTalk' 时显示任务tooltip
				if (this.userTalkCount === 2) {
					// console.log("show task tool tip!!!!", this.showTaskTooltip);
					this.showTaskTooltip = true;
					this.isTooltipVisible = true;
				}
			}
		},
	},
	computed: {
		userId() {
			return this.$store.getters.getUserId;
		},
		jobId() {
			return this.$store.getters.getJobId;
		},
		npcs() {
			return this.$store.getters.getNpcs;
		},
		taskList() {
			return this.$store.getters.getTaskList;
		},
		themeColors() {
			return this.$store.getters.getThemeColors;
		},
		shouldShadow() {
			return (
				this.state === "NpcTalk" || this.isRecording || this.showTippingCard
			);
		},
		npcNames() {
			return this.npcs.map(npc => npc.characterName);
		},
		displayedMessages() {
			const validChats = filterChatHistory(this.chattingHistory);
			const userAndNpcChats = validChats.filter(
				(chat) =>
					chat.role === "user" ||
					this.npcNames.includes(chat.role) ||
					chat.role === "tipping" ||
					chat.role === "empty" ||
					chat.role === "empty-audio"
			);
			// console.log("displayedMessages", userAndNpcChats);
			this.gemCount = this.calculateStars();
			// 按顺序展示user和npc的记录
			return userAndNpcChats;
		},
		lastUserIndex() {
			const userAndNpcChats = this.displayedMessages;
			// Find last index of user chat
			const lastUserIndex = userAndNpcChats.map(chat => chat.role).lastIndexOf("user");
			return lastUserIndex;
		},
		displayedHistory() {
			const userChats = this.chattingHistory.filter(
				(chat) => chat.role === "user"
			);
			const npcChats = this.chattingHistory.filter((chat) => this.npcNames.includes(chat.role));
			// const npcChats = this.chattingHistory.filter((chat) => ["领导", "同事A", "同事B"].includes(chat.role));

			// 只保留来自 'user' 的最新一条
			const latestUserChat = userChats.slice(-1); // 取最后一条

			// 保留来自 '领导'、'同事A' 和 '同事B' 的最新三条消息
			const latestNpcChats = npcChats.slice(-3); // 取最后三条

			// 合并 'user' 的消息和 'npc' 的消息
			return [...latestNpcChats, ...latestUserChat];
		},
		navBarTop() {
			return this.$store.getters.getNavBarTop;
		},
		navBarHeight() {
			return this.$store.getters.getNavBarHeight;
		},
		isWeChatMiniProgram() {
			const systemInfo = uni.getSystemInfoSync();
			return systemInfo.uniPlatform === 'mp-weixin';
		},
		getTask() {
			return this.$store.getters.getTask;
		},
		getTotalTaskLength() {
			return this.$store.getters.getTotalTaskLength;
		},
		getDoneTaskLength() {
			return this.$store.getters.getDoneTaskLength;
		},
		getBgImg(){
			return getImg(this.themeColors.background);
		},
	},
};
</script>
<style>
.uni-scroll-view {
	position: relative;
}

.uni-scroll-view-content {
	height: auto;
	padding-bottom: 60rpx;
}

::-webkit-scrollbar {
	display: none;
	width: 0 !important;
	height: 0 !important;
	-webkit-appearance: none;
	background: transparent;
	color: transparent;
}
</style>
<style scoped>
@import "./common.css";

.container {
	/* position: relative; */
	width: 100%;
	height: 100%;
	color: #fff;
	height: 100vh;
}

.navbar {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding: 0 20rpx;
	position: relative;
	z-index: 12;
	/* margin-top: 60rpx; */
	/* margin-left: 20rpx; */
}

.back-button {
	width: 24rpx;
	height: 50rpx;
	/* margin-left: 20rpx; */
}

.content {
	padding: 20px;
	text-align: center;
	position: relative;
	z-index: 3;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 200rpx;
}

.header {
	position: absolute;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	z-index: 6;
	width: 95%;
	height: 104rpx;
	padding-top: 82rpx;
}

.header-icon {
	width: 50rpx;
	height: 50rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

.header-icon {
	width: 50rpx;
	height: 50rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: 16rpx;
}

.time-info {
	font-size: 16px;
	color: #bbb;
	margin-bottom: 20px;
}

.description {
	font-size: 16px;
	/* line-height: 1.9; */
	color: #fff;
}

.content-item {
	margin-top: 30rpx;
}

.setting-group {
	display: flex;
	width: 170rpx;
	flex-direction: row;
	position: relative;
	justify-content: space-around;
}

.setting-item {
	width: 28px;
	/* margin-right: 20rpx; */
	height: 28px;
	z-index: 12;
}

.npc-group {
	display: flex;
	flex-direction: row;
	z-index: 3;
	justify-content: space-around;
	margin-top: 50rpx;
}

.player-action-container {
	display: flex;
	flex-direction: row;
	width: 100%;
	justify-content: space-around;
	z-index: 10;
	overflow: visible;
	position: absolute;
	bottom: 80rpx;
}

.action-icon {
	width: 30px;
	height: 30px;
}

.action-icon-middle {
	width: 40px;
	height: 40px;
}

.action-icon-hint {
	width: 30px;
	height: 30px;
	box-shadow: 0 0 18px #90e0e7;
}

.action-item {
	width: 40px;
	height: 40px;
	border-radius: 20px;
	background: var(--theme-color-matching);
	display: flex;
	justify-content: center;
	align-items: center;
}

.action-item-middle {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	background: linear-gradient(180deg, var(--theme-color-matching) 0%, var(--theme-color-theme) 100%);
}

.middle-container {
	width: 56px;
	height: 56px;
	border-radius: 50%;
	background-color: transparent;
	border: 2rpx solid var(--theme-color-theme);
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	bottom: -10rpx;
	box-shadow: 0px 0px 4px 0px var(--theme-color-theme);
	z-index: 12;
}

.recordTooltip {
	position: absolute;
	z-index: 12;
	top: 83%;
	left: 50%;
	width: auto;
	padding: 10px 20px;
	transform: translateX(-50%);
	background-color: rgba(16, 16, 16, 0.4);
	border-radius: 10px;
}

.recordTooltip::after {
	content: "";
	position: absolute;
	top: 100%;
	/* Position the arrow right below the tooltip */
	left: 50%;
	transform: translateX(-50%);
	border-width: 6px;
	border-style: solid;
	border-color: rgba(16, 16, 16, 0.4) transparent transparent transparent;
}

.keyboardToolTip {
	position: absolute;
	z-index: 12;
	top: 83%;
	left: 10%;
	width: 120px;
	padding: 10px 20px;
	/* transform: translateX(-50%); */
	background-color: rgba(16, 16, 16, 0.4);
	border-radius: 10px;
}

.keyboardToolTip::after {
	content: "";
	position: absolute;
	top: 100%;
	/* Position the arrow right below the tooltip */
	left: 40%;
	transform: translateX(-50%);
	border-width: 6px;
	border-style: solid;
	border-color: rgba(16, 16, 16, 0.4) transparent transparent transparent;
}

.hintTooltip {
	position: absolute;
	z-index: 12;
	top: 83%;
	right: 1%;
	width: 458rpx;
	padding: 10px 16px;
	font-size: 26rpx;
	font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
	/* transform: translateX(-50%); */
	background-color: rgba(16, 16, 16, 0.4);
	border-radius: 10px;
}

.hintTooltip::after {
	content: "";
	position: absolute;
	top: 100%;
	/* Position the arrow right below the tooltip */
	left: 65%;
	transform: translateX(-50%);
	border-width: 6px;
	border-style: solid;
	border-color: rgba(16, 16, 16, 0.4) transparent transparent transparent;
}

.taskTooltip {
	position: absolute;
	z-index: 12;
	top: 10.5%;
	left: 3.5%;
	width: 192rpx;
	padding: 10px 5px;
	font-size: 26rpx;
	font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
	/* transform: translateX(-50%); */
	background-color: rgba(16, 16, 16, 0.4);
	border-radius: 10px;
}

.taskTooltip::before {
	content: "";
	position: absolute;
	bottom: 100%;
	/* Position the arrow above the tooltip */
	left: 50%;
	transform: translateX(-50%);
	border-width: 6px;
	border-style: solid;
	border-color: transparent transparent rgba(16, 16, 16, 0.4) transparent;
}

.tooltipOverlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(46, 46, 47, 0.75);
	z-index: 11;
}

.recording-box {
	position: absolute;
	z-index: 12;
	/* top: 76%; */
	bottom: 298rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 420rpx;
	height: 160rpx;
	background-color: var(--theme-color-matching);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	border-radius: 32rpx;
	/* 确保录音框在最上层 */
}

.waveform {
	position: absolute;
	left: 20%;
	top: 20%;
	width: 80%;
	height: 120rpx;
	/* margin-bottom: 20rpx; */
	display: flex;
	flex-direction: row-reverse;
	justify-content: center;
	align-items: center;
}

.timer {
	position: relative;
	left: -15%;
	top: 12%;
	color: #252529;
	font-size: 30rpx;
	margin-bottom: 10rpx;
}

.cancel-text {
	position: relative;
	top: 60%;
	font-size: 26rpx;
	line-height: 34rpx;
	color: white;
}

.wave {
	width: 10rpx;
	/* 每个波形条的宽度 */
	background-color: #d6fcf6;
	/* 初始颜色 */
	border-radius: 5px;
	margin-left: 10rpx;
	/* 圆角效果 */
	animation: audio-wave 2s ease-in-out infinite;
}

.wave:nth-child(1) {
	animation-delay: 0.1s;
}

.wave:nth-child(2) {
	animation-delay: 0.2s;
}

.wave:nth-child(3) {
	animation-delay: 0.3s;
}

.wave:nth-child(4) {
	animation-delay: 0.4s;
}

.wave:nth-child(5) {
	animation-delay: 0.5s;
}

@keyframes audio-wave {

	0%,
	100% {
		height: 10rpx;
		/* 波形条的最小高度 */
		background-color: #2f2f38;
		transform: translateY(0);
	}

	50% {
		height: 40rpx;
		/* 波形条的最大高度 */
		background-color: #2f2f38;
		opacity: 52%;
		transform: translateY(-15px);
		/* 向上移动一点，制造波动效果 */
	}
}

.npc-talk-container {
	width: 100%;
	z-index: 4;
	background-color: transparent;
	position: absolute;
	top: 30%;
}

.shadowed {
	z-index: 2;
	opacity: 0.5;
}

.input-container-wrapper {
	position: fixed;
	display: flex;
	width: 100%;
	/* left: 10%; */
	bottom: 200rpx;
	justify-content: center;
	gap: 20rpx;
}

.input-container {
	/* position: fixed; */
	width: 550rpx;
	/* left: 10%; */
	/* bottom: 200rpx; */
	/* 将其固定在屏幕底部 */
	display: flex;
	align-items: center;
	/* justify-content: center; */
	/* padding: 20rpx 0; */
	border-radius: 40rpx;
	/* 增加一些内边距 */
	background-color: var(--theme-color-matching);
	border: 2px solid var(--theme-color-theme)
		/* 可选的背景色，用于强调输入框 */
}

.input-container textarea {
	height: 44rpx;
}

.send-sms-container {
	width: 88rpx;
	height: 88rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--theme-color-matching);
	border-radius: 50%;
}

.send-sms-icon {
	width: 28rpx;
	height: 32rpx;
}

textarea {
	padding: 0 20rpx;
	color: #252529;
}

.keyboard-container {
	width: 100%;
	z-index: 3;
	display: flex;
	flex-direction: row;
	justify-content: center;
}

.judge-container {
	width: 100%;
	z-index: 100;
	position: absolute;
	height: 350rpx;
	bottom: 0px;
}

.chat-container {
	z-index: 3;
	width: 100%;
	display: flex;
	justify-content: center;
	/* 水平居中 */
	align-items: center;
	/* 垂直居中 */
	height: calc(100vh - 370px);
	/* 使父容器高度占满整个视口高度 */
}

.chat-history-container {
	z-index: 3;
	width: 654rpx;
	height: 100%;
	margin: auto;
	overflow-y: auto;
	overflow-x: hidden;
	margin-top: 20rpx;
}

/* .chat-item:last-child {
		padding-bottom: 100px;
	} */

/* 消息动效 */
.message-wrapper {
	opacity: 0;
	transform: translateX(-100%);
	transition: opacity 0.5s ease-out,
		transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.message-wrapper-empty {
	opacity: 0;
	transform: translateX(-100%);
	transition: opacity 0.5s ease-out,
		transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
	height: 300px;
}

.message-wrapper.animate {
	opacity: 1;
	transform: translateX(0);
}

.message-wrapper2 {
	opacity: 0;
	transform: translateX(-100%);
	transition: opacity 0.5s ease-out,
		transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.message-wrapper2.animate2 {
	opacity: 1;
	transform: translateX(0);
}

/* loading */
.loading-container {
	display: flex;
	align-items: center;
	justify-content: right;
	margin-top: 50rpx;
	margin-right: 10px;
	gap: 16rpx;
}

.loading-icon {
	width: 40rpx;
	height: 40rpx;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

.loading-container span {
	margin-left: 8px;
	font-size: 13px;
	color: #d7d8e0;
}

.input-field {
	width: 80%;
	height: 40px;
	/* 确保高度适当 */
	padding: 10px;
	font-size: 16px;
	border: 1px solid #ccc;
	border-radius: 5px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.navbar.shadowed,
.npc-group.shadowed,
.chat-history-container.shadowed,
.player-action-container.shadowed {
	opacity: 0.5;
}

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
	/* padding: 10rpx; */
}

.judge-mission-container {
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
}

.judge-loading-container,
.judge-mission-container {
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
}

.loading-spinner {
	width: 70rpx;
	height: 70rpx;
	border: 2px solid #fff;
	/* border-top: 3px solid #007AFF; */
	border-right: 2px solid transparent;
	/* Create a gap */
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}
</style>