import locale from '@/locale';
import url from './url';
import { API_ENDPOINT } from './url';


export default {
	baseURL: API_ENDPOINT, // 将 baseURL 添加到导出的对象中

	async getHomepageData(userId) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/get_homepage/${userId}`),
				// url: `${API_ENDPOINT}/get_homepage/217`,
				method: 'POST'
			});

			if (response.statusCode === 200) {
				return response.data;
			} else {
				console.error('Failed to fetch homepage data:', response.statusCode);
				// Return mock data in case of failure
				return {
					"response": {
						"personal_info": {
							"name": "John Doe",
							"tag": "Engineer",
							"tag_description": "A detail-oriented engineer with a passion for problem-solving.",
							"job_id": "12345"
						},
						"eq_scores": {
							"score": 46,
							"dimension1_score": 54,
							"dimension1_detail": "Shows excellent emotional regulation in stressful situations.",
							"dimension2_score": 26,
							"dimension2_detail": "Displays strong empathy towards others' feelings.",
							"dimension3_score": 42,
							"dimension3_detail": "Able to make decisions without letting emotions interfere.",
							"dimension4_score": 50,
							"dimension4_detail": "Communicates emotions clearly and effectively.",
							"dimension5_score": 44,
							"dimension5_detail": "Manages interpersonal relationships with ease.",
							"summary": "Overall, emotionally intelligent and adaptive.",
							"detail": "John demonstrates balanced emotional intelligence across all areas.",
							"overall_suggestion": "Continue to enhance emotional regulation and interpersonal communication.",
							"detail_summary": "A well-rounded emotional intelligence profile with strong interpersonal skills."
						},
					}
				};
			}
		} catch (error) {
			console.error('Error fetching homepage data:', error);
			throw error;
		}
	},

	async getAnalysisList(userId) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/${userId}/analysisList`),
				method: 'GET',
			});

			if (response.statusCode === 200) {
				console.log("get analysislist:", response.data);
				return response.data;
			} else {
				throw new Error(`Failed to get analysis list: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error getting analysis list:', error);
			throw error;
		}
	},
	async deleteUserData(userId) {
		try {
			const response = await uni.request({
				url: `${API_ENDPOINT}/delete_eqscore/${userId}`,
				method: 'DELETE',
			});
	
			if (response.statusCode === 200) {
				console.log("delete UserData suc");
			} else {
				throw new Error(`Failed to delete UserData: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error getting analysis list:', error);
			throw error;
		}
	},
	async updateDiamonds(userId, count) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/update/diamond`),
				method: 'POST',
				data: {
					person_id: userId,
					num_diamond: count,
				}
			});

			if (response.statusCode === 200) {
				return response.data;
			} else {
				throw new Error(`update diamonds failed: ${response.statusCode}`);
			}
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
	async uploadChatHistory(filePath, userId) {
		try {
			const response = await uni.uploadFile({
				url: url.getUrl(`/analyze/history`),
				header: {
				    'Content-Type': 'multipart/form-data',
				},
				filePath: filePath,
				name: 'file',
				formData: {
					user_id: userId,
				}
			});

			if (response.statusCode === 200) {
				console.log("response data:", response.data);
				return response.data;
			} else {
				throw new Error(`upload chat history failed: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('upload chat history failed', error);
			throw error;
		}
	},

	async deleteMoment(chatId) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/delete_chats/${chatId}`),
				method: 'DELETE',
			});

			if (response.statusCode === 200) {
				return response;
			} else {
				throw new Error(`Failed to create contact profile: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error creating contact profile:', error);
			throw error;
		}
	},

	async createContactProfile(data) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/create_contact_profile`),
				method: 'POST',
				data: data
			});

			if (response.statusCode === 200) {
				return response.data;
			} else {
				throw new Error(`Failed to create contact profile: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error creating contact profile:', error);
			throw error;
		}
	},

	async getResult(jobId) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/get_result/${jobId}`),
				method: 'GET'
			});

			if (response.statusCode === 200) {
				return response.data;
			} else {
				throw new Error(`Failed to get result: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error getting result:', error);
			throw error;
		}
	},

	async getBattlefield(userId, tagName='') {
		try {
			console.info('mapdata@@@@@@@@:');
			let path = `/get_course_list/${userId}`;
			if(tagName && tagName !== '') {
				path = `/get_course_list/${userId}?dim_name=${tagName}`;
			}
			const response = await uni.request({
				// url: url.getUrl(`/get_battlefield_map/${1}?dim_name=self_regulation`),
				url: url.getUrl(path),
				method: 'GET'
			});

			if (response.statusCode === 200) {
				console.info('mapdata@@@@@@@@:', response.data);
				return response.data;
			} else {
				throw new Error(`Failed to get result: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error getting result:', error);
			throw error;
		}
	},

	async getCourseInfo(courseId) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/get_course_data/${courseId}`),
				// url: url.getUrl(`/get_course_data/${1}`),
				method: 'GET'
			});
	
			if (response.statusCode === 200) {
				return response.data;
			} else {
				throw new Error(`Failed to get course data: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error getting course data:', error);
			throw error;
		}
	},

	async getVoice(wording, voice, style, rate) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/ttsaz`),
				method: 'POST',
				data: {
					text: wording,
					voice: voice,
					style: style,
					rate: rate
				},
			});
			if (response.statusCode === 200) {
				return response.data;
			} else {
				throw new Error(`Failed to get result: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error getting result:', error);
			throw error;
		}
	},

	async getContactProfile(contactId) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/get_contact_profile/${contactId}`),
				method: 'GET'
			});

			if (response.statusCode === 200) {
				return response.data;
			} else {
				console.error('Failed to fetch contact profile:', response.statusCode);
				throw new Error(`Failed to fetch contact profile: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error fetching contact profile:', error);
			throw error;
		}
	},

	async uploadImage(filePath) {
		try {
			const uploadFileRes = await uni.uploadFile({
				url: url.getUrl(`/upload_image`),
				filePath: filePath,
				name: 'file'
			});

			if (uploadFileRes.statusCode === 200) {
				return JSON.parse(uploadFileRes.data);
			} else {
				throw new Error(`Upload failed: ${uploadFileRes.statusCode}`);
			}
		} catch (error) {
			console.error('Upload failed', error);
			throw error;
		}
	},

	async createProfile(profileData) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/create_profile`),
				method: 'POST',
				data: profileData
			});

			if (response.statusCode === 200) {
				return response.data;
			} else {
				throw new Error(`Failed to create profile: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error creating profile:', error);
			throw error;
		}
	},
	async updateName(profileData) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/update_name`),
				method: 'POST',
				data: profileData
			});

			if (response.statusCode === 200) {
				return response.data;
			} else {
				throw new Error(`Failed to update name: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error update name:', error);
			throw error;
		}
	},
	async startScenario(jobId) {
		console.log('startScenario called with jobId:', jobId);
		try {
			const response = await uni.request({
				url: url.getUrl(`/start_scenario/${jobId}`),
				method: 'POST'
			});

			if (response.statusCode === 200) {
				console.log('response:', response);
				return response.data;
			} else {
				throw new Error(`Failed to start scenario: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error starting scenario:', error);
			throw error;
		}
	},

	async startScenarioWithId(jobId, scenarioId) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/start_scenario_by_scenario_id/${jobId}/${scenarioId}`),
				method: 'POST'
			});

			if (response.statusCode === 200) {
				console.error('response:', response);
				return response.data;
			} else {
				throw new Error(`Failed to start scenario: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error starting scenario:', error);
			throw error;
		}
	},

	async getCurrentScenario(jobId) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/get_current_scenario/${jobId}`),
				method: 'POST'
			});

			if (response.statusCode === 200) {
				return response.data;
			} else {
				throw new Error(`Failed to get current scenario: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error getting current scenario:', error);
			throw error;
		}
	},

	async initializeScenario() {
		// console.log('startScenario called with jobId:', jobId);
		try {
			const response = await uni.request({
				url: url.getUrl(`/initialize_scenario`),
				method: 'POST',
			});

			if (response.statusCode === 200) {
				console.log('response:', response);
				return response.data;
			} else {
				throw new Error(`Failed to initialize_scenario: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error initialize_scenario:', error);
			throw error;
		}
	},

	async retrieveScenario(scenarioId, num) {
		// console.log('startScenario called with jobId:', jobId);
		console.log("#####retrieveScenarioResponse data:", scenarioId);
		console.log("#####retrieveScenarioResponse data:", num);
		try {
			const response = await uni.request({
				url: url.getUrl(`/retrieve_scene`),
				method: 'POST',
				data: {
					scenario_id: parseInt(scenarioId),
					choices: String(num),
					locale: locale.getShortLocale()
				}
			});

			if (response.statusCode === 200) {
				console.log('response:', response);
				return response.data;
			} else {
				throw new Error(`Failed to initialize_scenario: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error initialize_scenario:', error);
			throw error;
		}
	},

	async finalizeScenario(scores, job_id, dialogue_history) {
		// console.log('startScenario called with jobId:', jobId);
		// console.log("#####finalizeScenarioResponse data:", scores);
		// console.log("#####finalizeScenarioResponse data:", job_id);
		// console.log("#####finalizeScenarioResponse data:", dialogue_history);
		console.log("#####locale:", locale);
		try {
			const response = await uni.request({
				url: url.getUrl(`/finalize_scenario`),
				method: 'POST',
				data: {
					scores: scores,
					job_id: job_id,
					dialogue_history: dialogue_history,
					locale: locale.getShortLocale()
				}
			});

			if (response.statusCode === 200) {
				console.log('response:', response);
				return response.data;
			} else {
				throw new Error(`Failed to finalizeScenarioResponse: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error finalizeScenarioResponse:', error);
			throw error;
		}
	},

	async chooseScenario(choice, jobId) {
		try {
			const response = await uni.request({
				url: url.getUrl(`/choose_scenario`),
				method: 'POST',
				data: {
					choice: choice,
					job_id: jobId
				}
			});

			if (response.statusCode === 200) {
				return response.data;
			} else {
				throw new Error(`Failed to choose scenario: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error choosing scenario:', error);
			throw error;
		}
	},

	async appGoogleLogin(unionid='', nickname='', headimgurl='', email='') {
		try {
			const response = await uni.request({
				url: `${API_ENDPOINT}/google/login`,
				method: 'POST',
				data: {
					email: email,
					headimgurl: headimgurl,
					nickname: nickname,
					unionid: unionid
				}
			});

			if (response.statusCode === 200) {
				return response.data;
			} else {
				throw new Error(`Failed to weixin login: ${response.statusCode}`);
			}
		} catch (error) {
			console.log(error);
			console.error('Error weixin login:', error);
			throw error;
		}
	},

	async appWeixinLogin(code) {
		try {
			const response = await uni.request({
				url: `${API_ENDPOINT}/app2wx/login`,
				method: 'POST',
				data: {
					code: code
				}
			});

			if (response.statusCode === 200) {
				return response.data;
			} else {
				throw new Error(`Failed to weixin login: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error weixin login:', error);
			throw error;
		}
	},
	async getImgToken() {
		try {
			const response = await uni.request({
				url: API_ENDPOINT+'/getImgToken',
				method: 'POST'
			});

			if (response.statusCode === 200) {
				return response.data.token;
			} else {
				throw new Error(`Failed to get img token: ${response.statusCode}`);
			}
		} catch (error) {
			console.error('Error getting img token:', error);
			throw error;
		}
	},

	async generate_qrcode(userId, platform) {
		try {
			const response = await uni.request({
				url: API_ENDPOINT + '/generate_qr',
				method: 'GET',
				data: {
					userId: userId,
					platform: platform
				}
			});
			if (response.statusCode === 200) {
				return response.data;
			}
		} catch(error) {
			console.log('generate qrcode failed', error);
			throw error;
		}
	}
	// Add more API methods here as needed
};