<template>
	<view>
		<view class="container" :style="{'--bgimg':`url(${getBgImg()})`}" @click="handleContainerClick">
			<image class="background-image" :src="getImg('/static/web/battlefield/background.webp')"
				mode="aspectFill" />
			<view class="overlay"></view>

			<view class="navbar" :class="{ shadowed: shouldShadow }">
				<image class="back-button" src="/static/battlefield/back-iconpng.png" @tap="goToDashboard"></image>
				<reward-bar :gemCount="gemCount"></reward-bar>
				<view class="setting-group">
					<!-- <image class="setting-item" src="/static/battlefield/copy.png" @click="missionShow = true"></image> -->
					<image class="setting-item" src="/static/battlefield/task-list.png" @click="handleClickTaskList">
					</image>
					<image class="setting-item" src="/static/battlefield/setting.png"></image>
				</view>
			</view>
			<view v-if="showToolTips && isTooltipVisible && showTaskTooltip" class="taskTooltip">
				{{ $t('"pages.battlefield.playground.review"') }}
			</view>

			<!-- <view class="text-area">语音识别内容：1111{{transcript}}</view> -->

			<view class="npc-group" :class="{ shadowed: shouldShadow }">
				<npc-status v-for="npc in npcs" :key="npc.characterName" :health="npc.health" :avatar="npc.avatar"
					:characterName="npc.characterName"></npc-status>
			</view>

			<view class="chat-container" :class="{ shadowed: shouldShadow }" v-if="state !== 'NpcTalk'">
				<scroll-view class="chat-history-container" scroll-y :scroll-top="scrollTop" ref="chatHistoryContainer"
					:scroll-into-view="scrollIntoViewId">
					<view v-for="(chat, index) in displayedMessages" :key="index" :id="'chat-item-' + index">
						<npc-chat-box v-if="
                ['领导', '同事A', '同事B'].includes(
                  chat.role
                )
              " :key="'npc-' + index" :index="index" :avatar="getBattlefieldAvatar(chat.role)" :name="chat.role"
							:dialog="chat.content" :isLastElement="index === displayedMessages.length - 1"
							:playAudioIndex="playAudioIndex" @playAudio="playAudio"></npc-chat-box>
						<view v-else-if="chat.role === 'user'"
							:class="['message-wrapper', { animate: chat.shouldAnimate }]">
							<self-chat-box :key="'user' + index" :wording="chat.content" :commit="userJudgeContent"
								:isLastElement="index === displayedMessages.length - 1"></self-chat-box>
						</view>
						<view v-else-if="chat.role === 'tipping'"
							:class="['message-wrapper', { animate: chat.shouldAnimate }]">
							<tipping-chat-box :key="'tipping' + index" :tip="chat.content"></tipping-chat-box>
						</view>
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
			<view v-if="isRecording" class="recording-box">
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

			<view
				v-if="state === 'userTalk' && showToolTips && isTooltipVisible && (showHintTooltip || showRecordTooltip || showTaskTooltip)"
				class="tooltipOverlay" @click="hideTooltip">
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
				{{ $y('pages.battlefield.playground.record') }}
			</view>
			<!-- #endif -->

			<!-- #ifdef H5 -->
			<view v-if="
          state === 'userTalk' &&
          showToolTips &&
          isTooltipVisible &&
          showRecordTooltip
        " class="keyboardToolTip">
				{{ $y('pages.battlefield.playground.enter') }}
			</view>
			<!-- #endif -->
			<!-- tooltip for hint -->
			<view v-if="
          state === 'userTalk' &&
          showToolTips &&
          isTooltipVisible &&
          showHintTooltip
        " class="hintTooltip">
				{{ $y('pages.battlefield.playground.help') }}
			</view>


			<view class="player-action-container" :class="{ shadowed: shouldShadow }"
				v-if="state !== 'NpcTalk' && sendMessageNavShow">
				<view class="action-item" v-if="!isRecording" @click="handleClickInput()">
					<image class="action-icon" src="/static/battlefield/keyboard.png"></image>
				</view>

				<!-- #ifndef H5 -->
				<view class="middle-container">
					<view class="action-item action-item-middle" @touchstart="handleClickRecording"
						@touchend="handleRecordingDone" @touchmove="handleTouchMove" @click="hideTooltip">
						<image class="action-icon action-icon-middle" src="/static/battlefield/microphone.png"></image>
					</view>
				</view>
				<!-- #endif -->
				<view class="action-item" v-if="!isRecording">
					<image class="action-icon" src="/static/battlefield/light.svg" @click="clickHintButton">
					</image>
				</view>
			</view>

			<view v-if="showTippingCard" class="tipping-card">
				<tipping :quit="handleTippingQuit" :hint="hint" :help="help"></tipping>
			</view>

			<view class="popup-overlay" v-if="showInput" @click="showInput = false">
				<view class="input-container-wrapper">
					<view class="input-container" @click.stop>
						<!-- <input type="text" :focus="focusInput" placeholder="请输入..." /> -->
						<textarea :placeholder="$t('pages.battlefield.playground.type_in')" v-model="inputContent"
							auto-height @blur="inputRecordingBlur" />
					</view>
					<view class="send-sms-container">
						<image class="send-sms-icon" src="/static/battlefield/send-sms-icon.png"
							@click="inputRecordingBlur">
						</image>
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
		filterChatHistory,
		getNpcIndex
	} from "../../scripts/battlefield-chat";
	import Task from "../../models/Task";
	import TaskList from "../../models/TaskList";
	import state from "../../state";
	import apiService from '../../services/api-service';
	import {
		getImg
	} from "../../scripts/constants";
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
				taskList: new TaskList([]),
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
				focusInput: false,
				gemCount: 2,
				isPass: false, // 初始化 isPass 值，可以是 true 或 false
				diamonds: 0,
				tempFilePath: "", // 临时录音文件路径
				isRecording: false, // Controls the display state of left and right icons
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
				audioContext: null,
				sendMessageNavShow: true,
			};
		},
		created() {
			console.log("created");
			console.log("state userid", state.userId);
			// 动态添加任务到 taskList
			this.taskList.addTask(
				new Task(0, "一句话让三个人心情愉悦", async (judgeResult) => {
					const samMood = judgeResult.find(item => item.role === "同事A")?.mood;
					const jasonMood = judgeResult.find(item => item.role === "领导")?.mood;

					const taskResult = parseInt(samMood, 10) > 0 && parseInt(jasonMood, 10) >= 0;
					// const allPositive = judgeResult.moods.some((item) => parseInt(item.mood, 10) > 0);
					if (taskResult && !this.taskList.getTask(0).once) {
						this.judgeTitle = `做得好！ ${this.taskList.getTask(0).title} (${
            this.taskList.doneTaskLength + 1
          }/${this.taskList.taskLength})`;
						return true;
					}
					return false;
				})
			);
			this.taskList.addTask(
				new Task(1, "让领导认可你点的菜（说出你点的菜真不错）", async (
					judgeResult) => {
					let res = "";

					judgeResult.moods.filter((mood) => {
						if (mood.role === "Anna") res = mood.mood;
					});
					const bMood = parseInt(res ? res : 0, 10);
					if (bMood < 0 && !this.taskList.getTask(1).once) {
						this.judgeTitle = `做得好！！ ${this.taskList.getTask(1).title} (${
            this.taskList.doneTaskLength + 1
          }/${this.taskList.taskLength})`;
						return true;
					}
					return false;
				})
			);
		},
		methods: {
			getBgImg(){
				return getImg('/static/web/battlefield/background1.webp');
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
				console.log("handling touch move...");
				if (!this.isRecording) return;
				recorderManager.stop();
				clearInterval(this.countdownInterval);
				this.isRecording = false;

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
					if (this.remainingTime > 0) {
						this.remainingTime--;
					} else {
						this.handleRecordingDone();
					}
				}, 1000);
			},
			resetRecording() {
				this.isRecording = false;
				this.isCanceling = false;
				this.remainingTime = 30;
				clearInterval(this.countdownInterval);
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

				if (this.taskFinished) {
					this.isFinish = true;
					await this.Pass();
					return;
				}
				console.log(this.task2CompletedStatusOne);
				if (this.task2CompletedStatusOne) {
					this.task2CompletedStatusOne = false;
					this.state = "NpcTalk";
				} else {
					if (!this.isLoadingShow) {
						this.isLoadingShow = true;
					}
					try {
						const nextRound = await continueChat(this.allHistory, "1");
						// nextRound = nextRound.response;
						console.log("next round data", nextRound);

						nextRound.dialog = nextRound.response.dialog.map(item => ({
							role: item.role,
							content: item.content ?? item.words,
							voice: item.voice_url
						}));

						const npcsMap = new Map(this.$store.getters.getNpcs.map(item => [item.characterName, item]));

						nextRound.dialog.map(item => {

							this.$store.commit('setAudios', {
								key: `voice-${item.content}`,
								value: item.voice_url
							});
						});

						console.log("current chatting history:", this.chattingHistory);
						this.chattingHistory = nextRound.dialog;
						this.taskcheck = nextRound.taskcheck;
						this.allHistory = [...this.allHistory, ...nextRound.dialog];
						console.log("after concat, chatting history:", this.chattingHistory);

						this.displayedNpcChatIndex = 0;
						this.talkingNpc = this.getNpcIndexByName(this.chattingHistory[0].role);
						this.state = "NpcTalk";
					} catch (error) {
						console.error("get audio fail", error);
					}
				}
				this.sendMessageNavShow = true;
				this.isLoadingShow = false;
			},
			playAudio(params) {
				console.log(params);
				this.playAudioIndex = params.index;
				this.audioContext = uni.createInnerAudioContext();
				const audio = this.$store.getters.getAudios(`voice-${params.dialog}`);
				console.log(audio);
				if (audio) {
					this.audioContext.src = audio;
					this.audioContext.play();
					this.audioContext.onEnded(() => {
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
			handleRecordingDone() {
				// console.log('Released');
				if (this.isRecording) {
					recorderManager.stop();
					this.isRecording = false;
				}
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
				console.log(555);
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
			clickHintButton() {
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
						this.npcDialog = history[i].content;
						foundNpcMessage = true;
						break;
					}
					// this.displayedNpcChatIndex ++;
				}
				if (!foundNpcMessage) {
					// No more NPC messages; change state to 'userTalk'
					console.log("no more npc, now user turn.");
					this.state = "userTalk";
					// const validChats = filterChatHistory(this.allHistory);
					// const judgeResult = await reply(validChats, "1");
					// const taskCheck = judgeResult.task_check;
					// const taskCheck = judgeResult.task_check;

					if (taskCheck === 1 || taskCheck === 3) {
						console.log("taskCheck11111111111111", taskCheck);
						this.isGoodReply = true;
						this.judgeContent = judgeResult.comments;
						this.answerNotGoodNum = 0;
						// const allPositive = judgeResult.moods.every(
						// 	(item) => parseInt(item.mood, 10) > 0
						// );
						// console.log(allPositive);

						// if (allPositive) {
						if (taskCheck === 1 || taskCheck === 3) {
							if (!this.taskFinished && !this.taskList.getTask(0).one) {
								this.state = "judge";
								// console.log("allPositive:", allPositive);
								this.currentTask = this.taskList.getTask(0);
								const totalTaskLength = this.taskList.getTotalTaskLength();
								console.log("Total task length:", totalTaskLength);
								this.taskList.getTask(0)._status = true;
								this.taskList.getTask(0)._completedRoundNum++;
								if (
									this.taskList.getTask(0).totalRoundNum ==
									this.taskList.getTask(0)._completedRoundNum
								) {
									this.isCompleteTask = true;
									this.taskList.getTask(0).one = true;
									this.taskList.doneTaskLength++;
									this.judgeTitle =
										`(${this.taskList.doneTaskLength}/${totalTaskLength}) ` +
										this.$('pages.battlefield.playground.achieved');
									if (this.taskList.doneTaskLength >= totalTaskLength) {
										this.taskFinished = true;
										this.isPass = true;
									}
								} else {
									this.judgeTitle = this.$('pages.battlefield.playground.achieved');
									this.isCompleteTask = true;
								}
							} else {
								await this.gotoNextRound();
							}
						} else {
							await this.gotoNextRound();
						}
					} else {
						// if (taskCheck === 0 || taskCheck === 1) {
						if (this.answerNotGoodNum < 2) {
							this.answerNotGoodNum++;
							this.isGoodReply = true;
							this.state = "userTalk";
							this.userJudgeContent = judgeResult.comments;
							console.log("userJudgeContent", this.userJudgeContent);
							// Add a 3-second delay before going to the next round
							setTimeout(async () => {
								await this.gotoNextRound();
							}, 3000);
						} else {
							this.isGoodReply = false;
							this.isTooltipVisible = true;
							// this.showHintTooltip = true;
							if (this.answerNotGoodNum === 2) {
								this.showHintTooltip = true;
							} else {
								this.showHintTooltip = false;
							}
							console.log("tooltip for hint", this.isTooltipVisible);
							this.judgeTitle = this.$t('pages.battlefield.playground.need_improve');
							this.isCompleteTask = false;
							this.judgeContent = judgeResult.comments;
							this.state = "judgeTry";
							this.answerNotGoodNum++;
							// this.answerNotGoodNum = 0;
						}
					}
				}
			},
			async checkBossComplimentTask2(dialog, taskCheck) {
				let taskCompleted = false;
				if (!this.taskFinished && !this.taskList.getTask(1).one) {
					const goalKeyword = this.$t('pages.battlefield.playground.goal_keyword');
					console.log(dialog);
					for (let chat of dialog) {
						if (taskCheck === 2 || taskCheck === 3) {
							// if (chat.content.includes(goalKeyword)) {
							if (this.taskList && this.taskList.getTask(1)) {
								this.isGoodReply = true;
								this.state = "judge";
								const task2 = this.taskList.getTask(1);
								this.currentTask = task2;
								task2._status = true;
								task2._completedRoundNum++;
								if (task2.totalRoundNum === task2._completedRoundNum) {
									this.isCompleteTask = true;
									task2.one = true;
									this.taskList.doneTaskLength++;
									const totalTaskLength =
										this.taskList.getTotalTaskLength();
									this.judgeTitle =
										`(${this.taskList.doneTaskLength}/${totalTaskLength}) ` +
										this.$t('pages.battlefield.playground.achieved');
									taskCompleted = false;
									this.task2CompletedStatusOne = true; //如果任务2完成
									console.log("task2 success");
								} else {
									this.judgeTitle = this.$t('pages.battlefield.playground.achieved');
									this.isCompleteTask = true;
									taskCompleted = true;
								}
							}
							break;
						} else {
							taskCompleted = true;
						}
					}
					const totalTaskLength = this.taskList.getTotalTaskLength();
					if (this.taskList.doneTaskLength >= totalTaskLength) {
						this.taskFinished = true;
						this.isPass = true;
						taskCompleted = false;
					}
				} else {
					taskCompleted = true;
				}
				return taskCompleted;
			},
			closeCueCard() {
				this.showCardPopup = false;
			},
			closeMissionCard() {
				this.missionShow = false;
			},
			updateScrollIntoView() {
				this.$nextTick(() => {
					const lastMessageId =
						"chat-item-" + (this.displayedMessages.length - 1);
					this.scrollIntoViewId = lastMessageId;
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
			shouldShadow() {
				return (
					this.state === "NpcTalk" || this.isRecording || this.showTippingCard
				);
			},

			displayedMessages() {
				const validChats = filterChatHistory(this.chattingHistory);
				const userAndNpcChats = validChats.filter(
					(chat) =>
					chat.role === "user" ||
					chat.role === "领导" ||
					chat.role === "同事A" ||
					chat.role === "同事B" ||
					chat.role === "tipping"
				);
				console.log("displayedMessages");
				this.gemCount = this.calculateStars();
				// 按顺序展示user和npc的记录
				return userAndNpcChats;
				// const userChats = this.chattingHistory.filter((chat) => chat.role === 'user');
				// const npcChats = this.chattingHistory.filter((chat) => ['领导', '同事A', '同事B'].includes(chat.role));

				// // 只保留来自 'user' 的最新一条
				// const latestUserChat = userChats.slice(-1); // 取最后一条

				// // 保留来自 '领导'、'同事A' 和 '同事B' 的最新三条消息
				// const latestNpcChats = npcChats.slice(-3); // 取最后三条

				// 合并 'user' 的消息和 'npc' 的消息
				// return [...latestNpcChats, ...latestUserChat];
				// return [...npcChats, ...userChats];
			},

			displayedHistory() {
				const userChats = this.chattingHistory.filter(
					(chat) => chat.role === "user"
				);
				const npcChats = this.chattingHistory.filter((chat) => ["领导", "同事A", "同事B"].includes(chat.role));

				// 只保留来自 'user' 的最新一条
				const latestUserChat = userChats.slice(-1); // 取最后一条

				// 保留来自 '领导'、'同事A' 和 '同事B' 的最新三条消息
				const latestNpcChats = npcChats.slice(-3); // 取最后三条

				// 合并 'user' 的消息和 'npc' 的消息
				return [...latestNpcChats, ...latestUserChat];
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
		padding: 20rpx;
		position: relative;
		z-index: 12;
		margin-top: 80rpx;
		margin-left: 20rpx;
	}

	.back-button {
		width: 24px;
		height: 24px;
		margin-left: 20rpx;
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
		flex-direction: row;
		position: relative;
	}

	.setting-item {
		width: 24px;
		margin-right: 20rpx;
		height: 24px;
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
		/* background: #FDEDC8; */
		background-color: #d6fcf6;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.action-item-middle {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		box-shadow: 0px 0px 12px 0px #FED397;
		border: 1px solid #F2BC74;
		/* background: linear-gradient(180deg, #d6fcf6 0%, #90e0e7 100%); */
	}

	.middle-container {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background-color: transparent;
		border: 2rpx solid #90e0e7;
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		bottom: -10rpx;
		box-shadow: 0px 0px 4px 0px rgba(254, 211, 151, 1);
		z-index: 12;
	}

	.recordTooltip {
		position: absolute;
		z-index: 12;
		top: 83%;
		left: 50%;
		width: 140rpx;
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
		width: 118px;
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
		top: 12%;
		right: 3.2%;
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
		top: 76%;
		left: 50%;
		transform: translateX(-50%);
		width: 420rpx;
		height: 160rpx;
		/* background-color: #FDEDC8; */
		background-color: #d6fcf6;
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
		margin-bottom: 20rpx;
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
		top: 50%;
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
		/* background-color: #FDEDC8; */
		background-color: #d6fcf6;
		/* border: 2px solid #F2BC74; */
		border: 2px solid #90e0e7;
		/* 可选的背景色，用于强调输入框 */
	}

	.send-sms-container {
		width: 88rpx;
		height: 88rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #F2BC74;
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

	/* 消息动效 */
	.message-wrapper {
		opacity: 0;
		transform: translateX(-100%);
		transition: opacity 0.5s ease-out,
			transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
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
		margin-top: 10px;
		margin-right: 10px;
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

	.text-area {
		margin-top: 30rpx;
		padding: 20rpx;
		min-height: 100rpx;
		border: 1px solid #eee;
		border-radius: 10rpx;
		z-index: 1001;
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