<script setup lang="ts">
import { computed } from 'vue'
import { Info, TriangleAlert, AlertCircle, X } from 'lucide-vue-next'
import { useAnnouncements, type AnnouncementLevel } from '@/composables/useAnnouncements'

const { current, dismiss } = useAnnouncements()

const iconMap = { info: Info, warning: TriangleAlert, critical: AlertCircle } as const
const icon = computed(() => (current.value ? iconMap[current.value.level] : Info))

const tone: Record<AnnouncementLevel, string> = {
    info: 'border-brand-500/30 bg-brand-500/10 text-brand-700 dark:text-brand-300',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    critical: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
}
</script>

<template>
    <div v-if="current" class="border-b" :class="tone[current.level]" role="status" aria-live="polite">
        <div class="container-page flex items-start sm:items-center gap-2.5 py-2.5 text-xs sm:text-sm">
            <component :is="icon" class="h-4 w-4 flex-shrink-0 mt-[1px] sm:mt-0" />
            <p class="flex-1 min-w-0 leading-relaxed">
                <span class="font-medium">{{ current.title }}</span>
                <span v-if="current.content" class="opacity-80"> · {{ current.content }}</span>
            </p>
            <a v-if="current.link" :href="current.link" target="_blank" rel="noreferrer"
                class="flex-shrink-0 underline underline-offset-2 hover:opacity-80">
                {{ current.linkText || '查看详情' }}
            </a>
            <button v-if="current.dismissible" type="button"
                class="flex-shrink-0 p-1 -m-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="关闭公告" @click="dismiss(current.id)">
                <X class="h-3.5 w-3.5" />
            </button>
        </div>
    </div>
</template>
