import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'hubp-theme'

function detect(): Theme {
    if (typeof window === 'undefined') return 'dark'
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
}

export const useThemeStore = defineStore('theme', () => {
    const theme = ref<Theme>('dark')

    function init() {
        theme.value = detect()
        apply(theme.value)
    }

    function apply(t: Theme) {
        if (typeof document === 'undefined') return
        const root = document.documentElement
        if (t === 'dark') root.classList.add('dark')
        else root.classList.remove('dark')
    }

    function toggle() {
        theme.value = theme.value === 'dark' ? 'light' : 'dark'
    }

    watch(theme, (t) => {
        apply(t)
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, t)
        }
    })

    return { theme, init, toggle }
})
