<template>
	<view class="container">
		<image class="avatar" :src="avatar" mode="aspectFill" />
		<view class="bubble-container">
			<view class="character">{{ character }}</view>
			<view class="wording">{{ wording }}</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			avatar: {
				type: String,
				required: true
			},
			character: {
				type: String,
				required: true
			},
			wording: {
				type: String,
				required: true
			}
		}
	}
</script>

<style scoped>
	.container {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 10px;
		background-color: #2a2d37;
		border-radius: 10px;
	}

	.avatar {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		border: 2px solid #90E0E7;
		/* border: 2px solid #fcc764; */
		margin-right: 10px;
	}

	.bubble-container {
		background-color: #393d4f;
		border-radius: 10px;
		padding: 10px;
		color: #ffffff;
		max-width: 80%;
		font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
	}

	.character {
		font-weight: bold;
		margin-bottom: 5px;
	}

	.wording {
		font-size: 16px;
	}
</style>