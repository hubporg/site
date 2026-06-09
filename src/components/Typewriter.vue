<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'

const props = withDefaults(
    defineProps<{
        text: string
        speed?: number
    }>(),
    { speed: 35 }
)

const displayed = ref('')
const typing = ref(true)
let timer: number | null = null

const lines = computed(() => props.text.split('\n'))
const lineText = computed(() => props.text)

function start() {
    displayed.value = ''
    typing.value = true
    let i = 0
    const target = lineText.value
    const tick = () => {
        if (i <= target.length) {
            displayed.value = target.slice(0, i)
            i++
            timer = window.setTimeout(tick, props.speed)
        } else {
            typing.value = false
        }
    }
    tick()
}

onMounted(start)
onBeforeUnmount(() => {
    if (timer) window.clearTimeout(timer)
})

watch(
    () => props.text,
    () => {
        if (timer) window.clearTimeout(timer)
        start()
    }
)
</script>

<template>
    <span class="font-mono whitespace-pre">
        {{ displayed }}<span v-if="typing" class="animate-blink text-brand-400">▍</span>
    </span>
</template>
