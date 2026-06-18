<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

type Provider = 'vercel' | 'netlify' | 'unknown'

const provider = ref<Provider>('unknown')
const route = useRoute()

async function detect() {
    try {
        const res = await fetch(window.location.href, {
            method: 'HEAD',
            cache: 'no-store',
            credentials: 'omit'
        })
        const headers = res.headers
        if (headers.has('x-vercel-id')) {
            provider.value = 'vercel'
        } else if (headers.has('x-nf-request-id')) {
            provider.value = 'netlify'
        } else {
            provider.value = 'unknown'
        }
    } catch {
        provider.value = 'unknown'
    }
}

onMounted(() => {
    detect()
})

// SPA 路由切换时也重新探测
watch(() => route.fullPath, () => {
    provider.value = 'unknown'
    detect()
})
</script>

<template>
    <span class="inline-flex items-center gap-1.5">
        <template v-if="provider === 'vercel'">
            此页面由
            <picture>
                <source srcset="/pic/vercel-dark.svg" media="(prefers-color-scheme: dark)" />
                <img src="/pic/vercel-light.svg" alt="Vercel" class="inline h-3.5 w-auto align-[-2px]" />
            </picture>
            提供
        </template>
        <template v-else-if="provider === 'netlify'">
            此页面由
            <img src="/pic/Netlify_Logo.svg" alt="Netlify" class="inline h-3.5 w-auto align-[-2px]" />
            提供
        </template>
        <template v-else>
            hubp.org · Powered by hubporg
        </template>
    </span>
</template>
