<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Copy, Check } from 'lucide-vue-next'

const props = defineProps<{
    language?: string
    code: string
    label?: string
}>()

const copied = ref(false)

async function copy() {
    try {
        await navigator.clipboard.writeText(props.code)
        copied.value = true
        setTimeout(() => (copied.value = false), 1500)
    } catch {
        /* noop */
    }
}

onMounted(() => {
    /* noop */
})
</script>

<template>
    <div class="rounded-lg overflow-hidden border border-ink-200 dark:border-ink-800 bg-ink-1000 text-ink-100">
        <div class="flex items-center justify-between px-4 py-2 border-b border-ink-800 bg-ink-950/80">
            <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span class="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span class="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                <span v-if="label" class="ml-3 text-xs font-mono text-ink-400">{{ label }}</span>
                <span v-else-if="language" class="ml-3 text-xs font-mono text-ink-400">{{ language }}</span>
            </div>
            <button class="text-xs text-ink-300 hover:text-white transition-colors flex items-center gap-1.5"
                @click="copy">
                <Check v-if="copied" class="h-3.5 w-3.5 text-accent" />
                <Copy v-else class="h-3.5 w-3.5" />
                {{ copied ? '已复制' : '复制' }}
            </button>
        </div>
        <pre class="px-4 py-4 text-xs sm:text-sm font-mono leading-6 overflow-x-auto"><code>{{ code }}</code></pre>
    </div>
</template>
