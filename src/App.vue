<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
	<div class="Main-container">
		<RouterView></RouterView>
	</div>
</template>

<style>
* {
	padding: 0;
	margin: 0;
	font-family: Arial, Helvetica, sans-serif;
}

.Main-container {
	display: flex;
	justify-content: center;
	align-items: center;
	/* background-image: linear-gradient(to bottom right, transparent, rgb(248, 248, 248)); */
	background-color: rgb(242, 234, 224);
	background-repeat: no-repeat;
	background-size: cover;
	background-attachment: fixed;
}
</style>
