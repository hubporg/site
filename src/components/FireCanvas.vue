<script setup lang="ts">
import { ref } from 'vue'
import { useWebglFire } from './useWebglFire'

const canvasRef = ref<HTMLCanvasElement | null>(null)
useWebglFire(canvasRef)
</script>

<template>
    <canvas ref="canvasRef" class="fire-bg" />
</template>

<style scoped>
.fire-bg {
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0;
    mix-blend-mode: screen;
    transition: opacity 0.8s ease;
}
:root.dark .fire-bg { opacity: 1; }
</style>
