<script setup lang="ts">
import { computed, ref } from 'vue'
import { projects } from '@/data/projects'
import ProjectCard from '@/components/ProjectCard.vue'
import { Cpu, Globe, Puzzle } from 'lucide-vue-next'

type FilterKey = 'all' | 'extension' | 'frontend' | 'cf-proxy' | 'core'

const filter = ref<FilterKey>('all')

const filtered = computed(() =>
    filter.value === 'all'
        ? projects
        : projects.filter((p) => p.category === filter.value)
)

const filters: { key: FilterKey; label: string; icon: typeof Cpu }[] = [
    { key: 'all', label: '全部', icon: Cpu },
    { key: 'extension', label: '浏览器扩展', icon: Puzzle },
    { key: 'frontend', label: 'Web 前端', icon: Globe },
    { key: 'cf-proxy', label: '边缘代理', icon: Cpu }
]
</script>

<template>
    <div>
        <section
            class="border-b border-ink-200 dark:border-ink-800 bg-gradient-to-b from-ink-100/40 to-transparent dark:from-ink-1000/40">
            <div class="container-page py-16 sm:py-20">
                <p class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                    项目 / PROJECTS
                </p>
                <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
                    hubp 项目矩阵
                </h1>
                <p class="text-soft max-w-2xl leading-relaxed">
                    三个仓库，三个层次。每一个都可以独立使用，也可以组合起来构建完整的加速体验。
                </p>
            </div>
        </section>

        <section class="container-page py-10">
            <div class="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto pb-2 mb-6 scrollbar-thin">
                <div class="flex items-center gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
                    <button v-for="f in filters" :key="f.key" class="btn h-9 px-3 text-sm border transition-colors flex-shrink-0" :class="filter === f.key
                        ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-500/5'
                        : 'border-ink-200 dark:border-ink-800 text-soft hover:border-brand-400/60'
                        " @click="filter = f.key">
                        <component :is="f.icon" class="h-3.5 w-3.5" />
                        {{ f.label }}
                    </button>
                </div>
            </div>

            <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <ProjectCard v-for="p in filtered" :key="p.id" :project="p" />
            </div>
        </section>
    </div>
</template>
