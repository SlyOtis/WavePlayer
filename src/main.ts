import App from './App.svelte';

console.log("Trøkkstad for life")

const app = new App({
	target: document.querySelector(".player")!!,
	props: {
		name: 'world'
	}
});

export default app;