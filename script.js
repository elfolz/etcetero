var audioEnabled = false
var synth = new SpeechSynthesisUtterance()
var persona = document.querySelector('figure')
var sentenseIndex = 0
var imgSize
var sentenses = []

function refreshPosition(x, y) {
	let centerWidth = document.documentElement.clientWidth / 2
	let marginBottom = (document.documentElement.clientHeight - (persona.offsetTop + persona.clientHeight)) / 2
	let centerHeight = persona.offsetTop + (persona.clientHeight / 2) + marginBottom
	if (x < 0) x = centerWidth
	if (y < 0) y = centerHeight
	let posX = (x - centerWidth) / centerWidth
	let posY = (y - centerHeight) / centerHeight
	posX = posX != 0 ? posX * 30 : 0
	posY = posY != 0 ? posY * 30 : 0
	let perspective = imgSize
	document.documentElement.style.setProperty('--y-angle', `${posX}deg`)
	document.documentElement.style.setProperty('--x-angle', `${posY * -1}deg`)
	document.documentElement.style.setProperty('--z-angle', `${posX}deg`)
	document.documentElement.style.setProperty('--perspective', `${perspective}px`)
}
function resize() {
	imgSize = Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight) / 1.5
	let mouthSize = Math.round(imgSize * 0.06)
	if (mouthSize % 2 != 0) mouthSize++
	document.documentElement.style.setProperty('--size', `${imgSize}px`)
	document.documentElement.style.setProperty('--mouth-size', `${mouthSize}px`)
}
function lookTo(dir) {
	if (dir == 1) refreshPosition(document.documentElement.clientWidth/5, document.documentElement.clientHeight/5*4)
	else if (dir == 2) refreshPosition(-1, document.documentElement.clientHeight)
	else if (dir == 3) refreshPosition(document.documentElement.clientWidth/5*4, document.documentElement.clientHeight/5*4)
	else if (dir == 7) refreshPosition(document.documentElement.clientWidth/5, document.documentElement.clientHeight/5)
	else if (dir == 8) refreshPosition(-1, document.documentElement.clientHeight/5)
	else if (dir == 9) refreshPosition(document.documentElement.clientWidth/5*4, document.documentElement.clientHeight/5)
	else refreshPosition(-1, -1)
}
function speek() {
	if (!sentenses.length) return
	if (speechSynthesis.speaking) return
	if (sentenseIndex >= sentenses.length) return
	if (sentenses[sentenseIndex].wait) {
		setTimeout(() => {
			lookTo(sentenses[sentenseIndex].direction)
			setupVoice(sentenses[sentenseIndex].text)
			sentenseIndex++
		}, sentenses[sentenseIndex].wait)
	} else {
		lookTo(sentenses[sentenseIndex].direction)
		setupVoice(sentenses[sentenseIndex].text)
		sentenseIndex++
	}
}
function setupVoice(text) {
	if (!synth.voice) {
		let actors = ['Daniel']
		let voice = speechSynthesis.getVoices().find(el => {
			return new RegExp(`(${actors.join('|')})`, 'i').test(el.name.toLocaleLowerCase())
		})
		if (!voice) return setTimeout(() => setupVoice(text), 100)
		synth.voice = voice
	}
	speechSynthesis.cancel()
	synth.lang = synth.voice?.lang ?? 'pt-BR'
	synth.text = text
	synth.pitch = 1.5
	synth.rate = 1.5
	speechSynthesis.speak(synth)
}
persona.onclick = e => {
	e.stopPropagation()
	speek()
}
synth.onboundary = e => {
	let vowel = e?.utterance?.text?.substr(e?.charIndex)?.match(/[aeiou]/)
	if (vowel[0]) persona.classList.add(vowel[0])
	setTimeout(() => persona.classList.remove(vowel[0]), 250)
}
synth.onstart = () => {
	if (/edg/i.test(navigator.appVersion) && (/windows/i.test(navigator.appVersion) || /android/i.test(navigator.appVersion)) ) return
	persona.classList.add('speaking')
}
synth.onresume = () => {
	if (/edg/i.test(navigator.appVersion) && (/windows/i.test(navigator.appVersion) || /android/i.test(navigator.appVersion)) ) return
	persona.classList.add('speaking')
}
synth.onend = () => {
	speek()
	persona.classList.remove('speaking')
}
synth.onpause = () => {
	persona.classList.remove('speaking')
}
synth.onerror = () => {
	speechSynthesis.cancel()
	persona.classList.remove('speaking')
}
window.onpagehide = () => {
	speechSynthesis.cancel()
}
window.onresize = () => {
	resize()
}
window.onclick = () => {
	speechSynthesis.cancel()
	persona.classList.remove('speaking')
}
window.onload = () => {
	let params = new URLSearchParams(location.search)
	if (params.get('text')) {
		sentenses = [{
			text: params.get('text'),
			direction: params.get('dir') ?? 5
		}]
	} else {
		fetch('sentenses.json')
		.then(response => {
			return response.json()
		})
		.then(response => {
			sentenses = response
		})
	}
}
/* window.onmousemove = e => {
	refreshPosition(e.pageX, e.pageY)
} */
document.onreadystatechange = () => {
	if (document.readyState != 'complete') return
	persona.classList.add('show')
	persona.classList.add('smooth')
	resize()
}