<script lang="ts">
  import { onMount } from "svelte";
	import WaveformData from "waveform-data";
	import * as d3 from 'd3'

	export let name: string;
	export let offsetY: number = 100;
	
  let canvas: HTMLCanvasElement;
  let player: HTMLDivElement;
	let audio: HTMLAudioElement;
	let graph: any;
	let overlay: any;
	let svg: HTMLElement;

  const audioContext = new AudioContext();

  onMount(() => {
		console.log(audio);
		console.log(graph);

    fetch("http://localhost:5000/test.wav")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {

        const options = {
          audio_context: audioContext,
          array_buffer: buffer,
          scale: 128,
        };

        return new Promise((resolve, reject) => {
          WaveformData.createFromAudio(options, (err, waveform) => {
            if (err) {
              reject(err);
            } else {
              resolve(waveform);
            }
					});
        });
			})
      .then(canvasStyle);
  });
  
  let isPlaying = false, isReady = false, duration = 0, initial = true;
  
  function onCanPlay() {
  	console.log('is ready!')
		isReady = true
		
		if (initial) {
			play()
			initial = false
		}
	}
	
	function onError(e) {
  	console.error(e)
		isPlaying = false
	}
	
	function onStop(e) {
 		console.log('stop')
		isPlaying = false
	}
	
	function onStart(e) {
		console.log('start')
		isPlaying = true
		overlay.style.width = '0'
	}
	
	function onPlaying(e) {
 
	}
	
	function onTimeUpdate(e) {
  	const deltaT = e.currentTarget.currentTime / duration
		// overlay.attr('x', `${deltaT * 100}%`)
		// drawLines(Math.ceil(wf.length * deltaT), "green")
		const width = deltaT * 100
		overlay.style.width = `${isNaN(width) ? 0 : width}%`
	}
	
	function onDurationChange(e) {
  	duration = e.currentTarget.duration
		console.log(duration)
	}
  
  function play() {
  	
		console.log(isReady, isPlaying)
		
  	if (!isPlaying && !isReady) {
  		audio.load()
		} else if (isReady && isPlaying) {
			audio.pause()
			audio.currentTime = 0;
			return
		} else {
			audio.play()
			return;
		}
	
		audio.volume = 1
		audio.loop = true
		
		audio.addEventListener('canplay', onCanPlay)
		audio.addEventListener('playing', onStart)
		audio.addEventListener('play', onStart)
		audio.addEventListener('pause', onStop)
		audio.addEventListener('playing', onPlaying)
		audio.addEventListener('timeupdate', onTimeUpdate)
		audio.addEventListener('durationchange', onDurationChange)
		
	}
	
	function svgStyle(waveform) {
		
		const channel = waveform.channel(0);
		
		const graph = d3.select('main')
			.select('.wave')
		
		const x = d3.scaleLinear();
		const y = d3.scaleLinear();
		
		const min = channel.min_array();
		const max = channel.max_array();
		
		x.domain([0, waveform.length]).rangeRound([0, 1024]);
		y.domain([d3.min(min) as any, d3.max(max)]).rangeRound([offsetY, -offsetY]);
		
		const area = d3.area()
			.x((d, i) => x(i))
			.y0((d, i) => y(min[i]))
			.y1((d, i) => y(d));
		
		graph.select("path")
			.datum(max)
			.attr("transform", () => `translate(0, ${offsetY})`)
			.attr("d", area)
			.attr('id', 'main')
			.attr('style', `fill: green;`)
		
		overlay = graph.select('#cut-off-bottom')
			.attr('transform', () => `translate(0, -${offsetY})`)
			.select('rect')
		
	}

	function scaleY(amplitude, height) {
		const range = 256;
		const offset = 128;
	
		return height - ((amplitude + offset) * height) / range;
	}
	
	let wf: any

  function canvasStyle(waveform) {
		wf = waveform
		canvas.width = canvas.clientWidth
		canvas.height = canvas.clientHeight
    let ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		drawLines(ctx, wf.length, "black")
		
		const oc = overlay.querySelector('canvas')
		oc.width = canvas.clientWidth
		oc.height = canvas.clientHeight
		ctx = oc.getContext("2d")
		drawLines(ctx, wf.length, "green")
  }
  
  function drawLines(ctx: CanvasRenderingContext2D, amount: number, color: string) {
  
		const channel = wf.channel(0);
		const fx = canvas.width / wf.length
		const xMax = Math.min(amount, wf.length - 1)
  
		ctx.clearRect(0, 0, fx * xMax, canvas.height)
		
		ctx.beginPath();
		ctx.fillStyle = color
		ctx.strokeStyle = color
		
		
		// Loop forwards, drawing the upper half of the waveform
		for (let x = 0; x < Math.min(amount, wf.length); x++) {
			const val = channel.max_sample(x);
			ctx.lineTo(x * fx, scaleY(val, canvas.height) + fx);
		}
	
		// Loop backwards, drawing the lower half of the waveform
		for (let x = xMax; x >= 0; x--) {
			const val = channel.min_sample(x);
			ctx.lineTo(x * fx, scaleY(val, canvas.height) + fx);
		}
	
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		
	}
</script>

<style>
  main {
    position: relative;
		width: 100%;
		height: 100%;
    padding: 0;
    margin: 0;
    overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #333333;
  }

  .canvas-main {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
		position: relative;
		width: 100%;
  }
	
	.wave {
		position: absolute;
		width: 100%;
		height: 200px;
    padding: 0;
    margin: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.wave-one:last-of-type path {
		fill: green;
	}
	
	button {
		position: relative;
		outline: none;
		border-radius: 50%;
		height: 42px;
		width: 42px;
		border: 1px solid #FF7043;
		background-color: #fafafa;
		padding: 0;
		margin: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
		transition: all 0.4s cubic-bezier(.25,.8,.25,1);
	}
	
	button:hover {
		box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
		transform: scale(1.02);
	}
	
	.icon {
		width: 24px;
		height: 24px;
		position: relative;
		fill: blue;
	}
	
	.controls {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		width: auto;
		display: flex;
		padding: 32px 32px;
		z-index: 100;
		justify-content: center;
		align-items: center;
	}
	
	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
	}
	
	.overlay-container {
		position: absolute;
		transition: all 300ms;
		overflow: hidden;
		z-index: 1;
		right: 0;
		left:0;
		top: 0;
		bottom: 0;
		width: 0;
	}
	
	.player {
		width: 100%;
		height: auto;
		position: relative;
	}
	
</style>


<main>
	<div class="player" bind:this={player}>
		<div class="controls">
			<button on:click={play}>
				{#if isPlaying}
					<svg class="icon" viewBox="0 0 24 24">
						<path d="M6 5L6 19L10 19L10 5L6 5 z M 14 5L14 19L18 19L18 5L14 5 z"/>
					</svg>
				{:else}
					<svg class="icon"  viewBox="0 0 24 24"><path d="M8,5v14l11-7L8,5z"/></svg>
				{/if}
			</button>
		</div>
		<audio bind:this={audio} preload="auto" >
			<source src="http://localhost:5000/test.wav" type="audio/wav" />
		</audio>
		<canvas bind:this={canvas} width="800" height="300" class="canvas-main">
		</canvas>
		<div class="overlay-container" bind:this={overlay}>
			<canvas width="800" height="300" class="overlay">
			</canvas>
		</div>
	</div>
	
<!--	<svg class="wave" bind:this={svg}>-->
<!--		<defs>-->
<!--			<clipPath id="cut-off-bottom">-->
<!--				<rect x="0" y="0" width="100%" height="100%" />-->
<!--			</clipPath>-->
<!--		</defs>-->
<!--		<path />-->
<!--	</svg>-->
</main>
