<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Project } from '@/data/projects'
import { Github, ArrowUpRight, Star, Globe } from 'lucide-vue-next'

const props = defineProps<{ project: Project; compact?: boolean }>()

const detailTo = computed(() =>
    props.project.category === 'extension' ? '/projects/extension' : null
)

// 项目的外部在线地址
const externalUrl = computed(() => {
    const map: Record<string, string> = {
        'ghproxy-next': 'https://github.akams.cn',
        'cf-github-proxy': 'https://gh-proxy.geekertao.com'
    }
    return map[props.project.id] || null
})

const accentBar = computed(() => {
    switch (props.project.category) {
        case 'extension':
            return 'from-purple-500 to-pink-400'
        case 'frontend':
            return 'from-accent to-emerald-300'
        case 'cf-proxy':
            return 'from-orange-500 to-amber-400'
        case 'core':
            return 'from-brand-500 to-brand-300'
    }
    return 'from-brand-500 to-accent'
})

const categoryLabel = computed(() => {
    switch (props.project.category) {
        case 'extension':
            return '浏览器扩展'
        case 'frontend':
            return 'Web 前端'
        case 'cf-proxy':
            return '边缘代理'
        case 'core':
            return '后端核心'
    }
    return '项目'
})
function openRepo(e: Event) {
    window.open(props.project.url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
    <component
        :is="detailTo ? RouterLink : 'article'"
        :to="detailTo ?? undefined"
        class="card group relative overflow-hidden hover:border-brand-400/60 dark:hover:border-brand-500/60 hover:shadow-soft transition-all block">
        <span class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r" :class="accentBar" />
        <div class="p-6">
            <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center gap-2">
                    <span
                        class="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-ink-200 dark:border-ink-800 text-soft">{{
                            categoryLabel }}</span>
                </div>
                <span
                    class="text-[10px] font-mono text-soft border border-ink-200 dark:border-ink-800 rounded px-1.5 py-0.5">{{
                        project.license }}</span>
            </div>

            <h3 class="text-xl font-semibold tracking-tight mb-1.5">
                {{ project.name }}
            </h3>
            <p class="text-sm text-soft mb-3">{{ project.tagline }}</p>
            <p v-if="!compact" class="text-sm text-muted leading-relaxed mb-4">
                {{ project.description }}
            </p>

            <div v-if="project.language" class="mb-4">
                <div class="flex items-center justify-between text-xs mb-1.5">
                    <span class="font-mono text-soft">{{ project.language.name }}</span>
                    <span class="font-mono text-soft">{{ project.language.percent }}%</span>
                </div>
                <div class="h-1.5 bg-ink-200 dark:bg-ink-800 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all" :style="{
                        width: project.language.percent + '%',
                        backgroundColor: project.language.color
                    }" />
                </div>
            </div>

            <div class="flex flex-wrap gap-1.5 mb-5">
                <span v-for="s in project.stack" :key="s"
                    class="text-[11px] font-mono px-2 py-0.5 rounded border border-ink-200 dark:border-ink-800 text-soft">{{
                        s }}</span>
            </div>

            <div class="flex items-center justify-between">
                <a v-if="!detailTo" :href="project.url" target="_blank" rel="noreferrer"
                    class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 group-hover:gap-2.5 transition-all">
                    <Github class="h-4 w-4" />
                    <span class="font-mono text-xs">{{ project.repo }}</span>
                    <ArrowUpRight class="h-3.5 w-3.5" />
                </a>
                <span v-else
                    class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 group-hover:gap-2.5 transition-all">
                    <Github class="h-4 w-4" />
                    <span class="font-mono text-xs">{{ project.repo }}</span>
                    <ArrowUpRight class="h-3.5 w-3.5" />
                </span>
                <div class="flex items-center gap-2">
                    <a v-if="externalUrl" :href="externalUrl" target="_blank" rel="noreferrer"
                        class="btn-ghost text-xs">
                        <Globe class="h-3.5 w-3.5" />
                        在线
                    </a>
                    <button class="btn-ghost text-xs" :aria-label="`Star ${project.name}`"
                        @click="openRepo">
                        <Star class="h-3.5 w-3.5" />
                        Star
                    </button>
                </div>
            </div>
        </div>
    </component>
</template>
