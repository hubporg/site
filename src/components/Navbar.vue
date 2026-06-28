<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Sun, Moon, Github, Menu, X } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'

const theme = useThemeStore()
const route = useRoute()
const scrolled = ref(false)
const mobileOpen = ref(false)

const links = [
  { to: '/', label: '首页' },
  { to: '/projects', label: '项目' },
  { to: '/projects/extension', label: '扩展' },
  { to: '/accelerate', label: '加速' },
  { to: '/nodes', label: '节点' },
  { to: '/about', label: '关于' }
]

const isActive = (to: string) => computed(() => route.path === to)

function onScroll() {
  scrolled.value = window.scrollY > 8
}

// 路由切换自动关闭移动菜单 + 解锁滚动
watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  }
)

watch(mobileOpen, (open) => {
  if (typeof document === 'undefined') return
  document.documentElement.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (typeof document !== 'undefined') document.documentElement.style.overflow = ''
})
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b transition-all duration-300"
    :class="
      scrolled
        ? 'border-ink-200/70 dark:border-ink-800/70 bg-white/80 dark:bg-ink-950/80 backdrop-blur-md'
        : 'border-transparent bg-transparent'
    "
  >
    <div class="container-page flex h-16 items-center justify-between">
      <RouterLink
        to="/"
        class="flex items-center gap-2 group"
        aria-label="hubp home"
      >
        <img
          src="/hubp.svg"
          alt="hubp"
          class="h-8 w-8 rounded-md"
          width="32"
          height="32"
        />
        <span class="font-semibold text-lg tracking-tight">hubp</span>
      </RouterLink>

      <nav class="hidden md:flex items-center gap-1" aria-label="primary">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="px-3 py-2 text-sm font-medium rounded-md transition-colors"
          :class="
            route.path === l.to
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white'
          "
        >
          {{ l.label }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-2">
        <a
          href="https://github.com/hubporg"
          target="_blank"
          rel="noreferrer"
          class="btn-ghost"
          aria-label="GitHub"
        >
          <Github class="h-4 w-4" />
          <span class="hidden lg:inline">hubporg</span>
        </a>
        <button
          class="btn-ghost"
          :aria-label="theme.theme === 'dark' ? '切换亮色' : '切换暗色'"
          @click="theme.toggle()"
        >
          <Sun v-if="theme.theme === 'dark'" class="h-4 w-4" />
          <Moon v-else class="h-4 w-4" />
        </button>
        <button
          class="md:hidden btn-ghost"
          aria-label="菜单"
          @click="mobileOpen = !mobileOpen"
        >
          <Menu v-if="!mobileOpen" class="h-5 w-5" />
          <X v-else class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div
      v-if="mobileOpen"
      class="md:hidden border-t border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-950"
    >
      <nav class="container-page py-2 flex flex-col">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="px-3 py-2 text-sm rounded-md"
          :class="
            route.path === l.to
              ? 'text-brand-600 dark:text-brand-400 bg-ink-100 dark:bg-ink-900'
              : 'text-ink-700 dark:text-ink-300'
          "
          @click="mobileOpen = false"
        >
          {{ l.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
