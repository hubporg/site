<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, BookOpen, Code, Download, ExternalLink, List, ChevronDown, Wand2 } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { useTocSpy } from '@/composables/useTocSpy'

const USERSCRIPT_URL = 'https://hubp.tbedu.top/userscript/github-accelerator.user.js'
const TAMPERMONKEY_URL = 'https://www.tampermonkey.net/'
const VIOLENTMONKEY_URL = 'https://violentmonkey.github.io/'

const toc = [
    { id: 'tampermonkey', label: 'Tampermonkey' },
    { id: 'violentmonkey', label: 'Violentmonkey' },
    { id: 'install', label: '安装脚本' },
    { id: 'verify', label: '验证与更新' }
]

const mobileTocOpen = ref(false)
const { activeId, jumpTo } = useTocSpy(toc.map((t) => t.id))

function jump(id: string) {
    jumpTo(id)
    mobileTocOpen.value = false
}
</script>

<template>
    <div>
        <section class="relative overflow-hidden border-b border-ink-200 dark:border-ink-800">
            <div class="absolute inset-0 grid-bg opacity-60 dark:opacity-30" />
            <div
                class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-50 dark:to-ink-950" />
            <div class="container-page relative pt-20 pb-16 sm:pt-28 sm:pb-20">
                <RouterLink to="/projects/extension"
                    class="inline-flex items-center gap-1.5 text-sm text-soft hover:text-primary transition-colors mb-6">
                    <ArrowLeft class="h-3.5 w-3.5" />
                    返回扩展详情
                </RouterLink>
                <div class="flex items-center gap-3 mb-4">
                    <div
                        class="flex items-center justify-center h-10 w-10 rounded-lg bg-accent/10 text-accent">
                        <Code class="h-5 w-5" />
                    </div>
                    <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
                        油猴脚本安装教程
                    </h1>
                </div>
                <p class="text-soft max-w-2xl">
                    不安装浏览器扩展也能用：通过 Tampermonkey / Violentmonkey 安装 GitHub Accelerator 用户脚本（0.x 版本）。
                </p>
                <div class="flex flex-wrap items-center gap-3 mt-6">
                    <a :href="USERSCRIPT_URL" target="_blank" rel="noreferrer" class="btn-primary">
                        <Download class="h-4 w-4" />
                        安装脚本
                    </a>
                    <RouterLink to="/projects/extension/install" class="btn-secondary">
                        <BookOpen class="h-4 w-4" />
                        扩展安装教程
                    </RouterLink>
                </div>
            </div>
        </section>

        <section class="container-page py-10">
            <div class="grid lg:grid-cols-[240px_1fr] gap-10">
                <aside>
                    <div class="lg:hidden mb-6 card overflow-hidden">
                        <button
                            class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
                            @click="mobileTocOpen = !mobileTocOpen"
                            :aria-expanded="mobileTocOpen">
                            <span class="flex items-center gap-2">
                                <List class="h-4 w-4 text-brand-500" />
                                目录
                            </span>
                            <ChevronDown
                                :class="['h-4 w-4 text-soft transition-transform', mobileTocOpen && 'rotate-180']" />
                        </button>
                        <ul v-if="mobileTocOpen" class="border-t border-ink-200 dark:border-ink-800 py-2">
                            <li v-for="t in toc" :key="t.id">
                                <button @click="jump(t.id)"
                                    class="w-full text-left flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                                    :class="activeId === t.id
                                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium'
                                        : 'text-soft hover:text-brand-500 hover:bg-ink-100/40 dark:hover:bg-ink-1000/40'"
                                    :aria-current="activeId === t.id ? 'location' : undefined">
                                    {{ t.label }}
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div class="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin pr-1">
                        <p class="text-[10px] font-mono uppercase tracking-wider text-soft mb-3">
                            目录
                        </p>
                        <ul class="space-y-1">
                            <li v-for="t in toc" :key="t.id">
                                <button @click="jump(t.id)"
                                    class="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors"
                                    :class="activeId === t.id
                                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium'
                                        : 'text-soft hover:text-brand-500 hover:bg-ink-100/40 dark:hover:bg-ink-1000/40'"
                                    :aria-current="activeId === t.id ? 'location' : undefined">
                                    {{ t.label }}
                                </button>
                            </li>
                        </ul>
                    </div>
                </aside>

                <div class="max-w-3xl space-y-10">
                    <div id="tampermonkey" class="scroll-mt-24 space-y-4">
                        <div class="flex items-center gap-2">
                            <Wand2 class="h-5 w-5 text-primary" />
                            <h2 class="text-2xl font-semibold tracking-tight">Tampermonkey</h2>
                        </div>
                        <p class="text-soft text-sm">
                            在
                            <a :href="TAMPERMONKEY_URL" target="_blank" rel="noreferrer"
                                class="text-primary hover:underline inline-flex items-center gap-1">
                                tampermonkey.net
                                <ExternalLink class="h-3 w-3" />
                            </a>
                            为对应浏览器安装脚本管理器，然后继续下面的「安装脚本」。
                        </p>
                        <!-- TODO: 填写 Tampermonkey 安装步骤（截图 / 注意事项） -->
                        <div class="card border-dashed p-5 text-sm text-soft">
                            <p class="font-medium mb-1">安装步骤（占位）</p>
                            <p>这里填写 Tampermonkey 的具体步骤：商店安装、开启开发者模式、首次使用提示等。</p>
                        </div>
                    </div>

                    <div id="violentmonkey" class="scroll-mt-24 space-y-4">
                        <div class="flex items-center gap-2">
                            <Wand2 class="h-5 w-5 text-accent" />
                            <h2 class="text-2xl font-semibold tracking-tight">Violentmonkey</h2>
                        </div>
                        <p class="text-soft text-sm">
                            也可以使用
                            <a :href="VIOLENTMONKEY_URL" target="_blank" rel="noreferrer"
                                class="text-accent hover:underline inline-flex items-center gap-1">
                                violentmonkey.github.io
                                <ExternalLink class="h-3 w-3" />
                            </a>
                            ，安装方式与 Tampermonkey 类似。
                        </p>
                        <!-- TODO: 填写 Violentmonkey 安装步骤（截图 / 注意事项） -->
                        <div class="card border-dashed p-5 text-sm text-soft">
                            <p class="font-medium mb-1">安装步骤（占位）</p>
                            <p>这里填写 Violentmonkey 的具体步骤，包括它与 Tampermonkey 的差异（如 @sandbox 行为）。</p>
                        </div>
                    </div>

                    <div id="install" class="scroll-mt-24 space-y-4">
                        <div class="flex items-center gap-2">
                            <Download class="h-5 w-5 text-brand-500" />
                            <h2 class="text-2xl font-semibold tracking-tight">安装脚本</h2>
                        </div>
                        <p class="text-soft text-sm">
                            脚本管理器装好后，点击下面的链接，管理器会弹出安装页，确认后即可生效：
                        </p>
                        <div class="card p-5">
                            <a :href="USERSCRIPT_URL" target="_blank" rel="noreferrer" class="btn-primary">
                                <Download class="h-4 w-4" />
                                安装 GitHub Accelerator 用户脚本
                            </a>
                            <p class="text-xs text-soft font-mono mt-3 break-all">{{ USERSCRIPT_URL }}</p>
                        </div>
                        <!-- TODO: 补充首次运行隐私确认的说明 -->
                        <div class="card border-dashed p-5 text-sm text-soft">
                            <p class="font-medium mb-1">首次运行说明（占位）</p>
                            <p>这里填写首次运行时的隐私确认流程，以及如何在脚本菜单里关闭匿名统计。</p>
                        </div>
                    </div>

                    <div id="verify" class="scroll-mt-24 space-y-4">
                        <div class="flex items-center gap-2">
                            <Code class="h-5 w-5 text-purple-500" />
                            <h2 class="text-2xl font-semibold tracking-tight">验证与更新</h2>
                        </div>
                        <p class="text-soft text-sm">
                            脚本的 <code class="font-mono text-xs">@updateURL</code> 指向扩展仓库，脚本管理器会自动检查更新；
                            托管地址作为备用安装源。
                        </p>
                        <!-- TODO: 填写验证方式（页面浮标 / 菜单）与更新、卸载步骤 -->
                        <div class="card border-dashed p-5 text-sm text-soft">
                            <p class="font-medium mb-1">验证与更新（占位）</p>
                            <p>这里填写如何确认脚本已生效、如何手动检查更新、如何卸载脚本。</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
