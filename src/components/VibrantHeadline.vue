<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "snapsvg-cjs"
import { computed, onMounted, onUpdated, ref } from "vue"

const props = defineProps({
	class: {
		type: String,
	},
})

const slots = defineSlots()

const inputText = computed(() => {
	return slots.default()[0].children.trim().toUpperCase().split(" ")
})

/*
 Original Script by
 https://codepen.io/yoksel/pen/yNJYyE
 */

const s = ref(null)

const sMaxX = 500
const sMaxY = 300
const viewBoxList = [0, 0, sMaxX, sMaxY]

const textDur = 1000
const dashoffset = 800

const pSize = sMaxX
const maxLines = 16
const maxLinesDouble = maxLines * 2
const lineStep = pSize / maxLines
const lines = []
const pathDur = 100
const delay = 50

const gLines = ref(null)
const gText = ref(null)
const maskElem = ref(null)

let patt
let maskObj
let text

const colorSteps = maxLines / 2
const colors = ["purple", "crimson", "orangered", "orange", "gold", "yellowgreen", "steelblue", "teal", "purple"]

const lineLength = Math.sqrt(Math.pow(pSize, 2) * 2)

const lineObj = function () {
	if (!s.value) {
		return
	}

	const d = "M" + [pSize, 0, 0, pSize]
	const path = s.value.path(d)
	let pos = 0
	let addMask = false
	let pathDelay = 0
	let dashArray = 0
	let strokeW = 0

	this.init = function (params: {
		pos: number
		strokeW: number
		offsetX: number
		delay: number
		addMask: boolean
		color: string
	}) {
		pos = params.pos
		strokeW = params.strokeW
		const strokeColor = params.color || "hotpink"
		const offsetX = params.offsetX || 0
		const x = pSize - lineStep * (pos + 0.5) + offsetX
		const translateParams = [x, 0]

		pathDelay = params.delay || delay
		dashArray = lineLength
		addMask = params.addMask || false

		path.attr({
			transform: "translate(" + translateParams + ")",
			"stroke-width": strokeW,
			stroke: strokeColor,
			"stroke-linecap": "square",
			"stroke-dashoffset": lineLength,
			"stroke-dasharray": dashArray,
		})

		if (!gLines.value) {
			return
		}

		gLines.value.add(path)
	}

	this.reset = function () {
		path.attr({
			"stroke-dashoffset": lineLength,
			"stroke-dasharray": dashArray,
		})
	}

	this.animdDelay = function () {
		setTimeout(pathAnim, (maxLinesDouble - pos) * pathDelay)
	}

	function runNextAnim() {
		if (addMask === true) {
			// Why 0?
			if (pos === 0) {
				maskObj.maskAnim()
			}
		}
	}

	function pathAnim() {
		path.animate(
			{
				"stroke-dashoffset": "0",
			},
			pathDur,
			runNextAnim,
		)
	}
}

function createLines(params) {
	for (let i = 0; i < maxLinesDouble; i++) {
		const line = new lineObj()
		const color = params.color || colors[i % colorSteps]

		line.init({
			pos: i,
			strokeW: params.strokeW,
			offsetX: params.offsetX,
			delay: params.delay,
			addMask: params.addMask || false,
			color: color,
		})

		lines.push(line)
	}
}

function createPattern() {
	const rect = s.value.rect(0, 0, pSize, pSize)
	rect.attr({
		fill: "white",
	})

	gLines.value.add(rect)

	createLines({
		strokeW: lineStep / 1.4,
		addMask: false,
	})

	createLines({
		strokeW: 2,
		color: "#002",
		offsetX: lineStep / 2 + 7,
		delay: 300,
		addMask: false,
	})

	patt = gLines.value.toPattern(0, 0, pSize, pSize)
}

function animatePattern() {
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		line.reset()
		line.animdDelay()
	}
}

const textObj = function () {
	if (!s.value) {
		return
	}

	const textGInit = s.value.g()

	for (let i = 0; i < inputText.value.length; i++) {
		const word = inputText.value[i]
		const text = s.value.text("50%", `${0.1 * i * 100}%`, word)

		text.attr({
			dy: `${(0.35 + i * 0.25) * 100}%`,
			"font-size": "0.5em",
		})

		textGInit.add(text)
	}

	textGInit.attr({
		"text-anchor": "middle",
		font: "15em/1 Impact",
		fill: "white",
		stroke: "#000",
		"stroke-width": 3,
		"stroke-dasharray": dashoffset,
		"stroke-dashoffset": dashoffset,
	})

	const textGFill = textGInit.clone()

	textGInit.attr({
		transform: "translate(10,10)",
	})

	gText.value.add(textGInit, textGFill)

	this.textAnim = function () {
		textGFill.animate(
			{
				"stroke-dashoffset": 0,
			},
			textDur,
			setTextStroke,
		)
	}

	function setTextStroke() {
		setTextFill()

		textGInit.animate(
			{
				"stroke-dashoffset": 0,
			},
			textDur,
		)
	}

	function setTextFill() {
		animatePattern()

		textGFill.attr({
			fill: patt,
		})
	}

	this.reset = function () {
		const initState = {
			fill: "white",
			"stroke-dasharray": dashoffset,
			"stroke-dashoffset": dashoffset,
		}

		textGInit.attr(initState)
		textGFill.attr(initState)

		this.textAnim()
	}
}

function createText() {
	text = new textObj()
	text.textAnim()
}

const maskObjInit = function () {
	let maskShape

	let currentStep = 0
	const steps = [
		{ rx: "10%", ry: "10%" },
		{ rx: "35%", ry: "35%" },
		{ rx: "0%", ry: "0%" },
	]

	this.init = function () {
		maskShape = s.value.ellipse("50%", "50%", "100%", "100%")

		maskShape.attr({
			fill: "white",
		})

		maskElem.value.add(maskShape)

		gText.value.attr({
			mask: maskElem.value,
		})
	}

	this.maskAnim = function () {
		if (currentStep === steps.length) {
			setTimeout(reRun, 1000)
			return
		}

		maskShape.animate(steps[currentStep], 300, maskObj.maskAnim)
		currentStep++
	}

	this.reset = function () {
		currentStep = 0

		const initState = {
			rx: "100%",
			ry: "100%",
		}

		maskShape.attr(initState)
	}
}

function createMask() {
	maskObj = new maskObjInit()
	maskObj.init()
}

function reRun() {
	maskObj.reset()
	text.reset()
}

function setupSnap() {
	s.value = Snap("#svgElement")

	if (!s.value) {
		return
	}

	s.value.attr({
		viewBox: viewBoxList,
	})

	gLines.value = s.value.g()
	gText.value = s.value.g()
	maskElem.value = s.value.mask()
}

onMounted(() => {
	setupSnap()
	createPattern()
	createText()
	createMask()
})

onUpdated(() => {
	reRun()
})
</script>

<template>
	<svg id="svgElement" :class="props.class">
		<slot />
	</svg>
</template>
