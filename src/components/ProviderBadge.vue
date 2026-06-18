<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Provider = 'vercel' | 'netlify' | 'unknown'

const provider = ref<Provider>('unknown')
const CACHE_KEY = 'hubp:provider'

onMounted(async () => {
    // 1. 优先读 session 缓存
    try {
        const cached = sessionStorage.getItem(CACHE_KEY) as Provider | null
        if (cached === 'vercel' || cached === 'netlify') {
            provider.value = cached
            return
        }
    } catch {
        /* noop */
    }

    // 2. HEAD 请求同源 URL,从响应头探测
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
        try {
            sessionStorage.setItem(CACHE_KEY, provider.value)
        } catch {
            /* noop */
        }
    } catch {
        provider.value = 'unknown'
    }
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
