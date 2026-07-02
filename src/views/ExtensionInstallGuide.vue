<script setup lang="ts">
import { ArrowLeft, BookOpen, Chrome, Globe, Sparkles, Package } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

interface StepItem {
    text: string
    image?: string
}
interface Section {
    title: string
    steps: StepItem[]
}

const steps: { browser: string; icon: any; sections: Section[] }[] = [
    {
        browser: 'Chrome / Edge',
        icon: Chrome,
        sections: [
            {
                title: '方式 A：直接拖入 CRX（推荐）',
                steps: [
                    {
                        text: '从 Releases 下载最新版本的 .crx 文件（无需解压）。',
                        image: '/extension/crx-download.png'
                    },
                    {
                        text: '在地址栏输入 chrome://extensions 并回车，进入扩展管理页。'
                    },
                    {
                        text: '开启页面右上角的「开发者模式」开关。',
                        image: '/extension/dev-mode.png'
                    },
                    {
                        text: '将下载好的 .crx 文件直接拖入扩展管理页面，弹出确认后点击「添加扩展程序」即可完成安装。',
                        image: '/extension/drag-crx.png'
                    }
                ]
            },
            {
                title: '方式 B：解压后开发者模式安装（不推荐）',
                steps: [
                    {
                        text: '从 Releases 下载 .zip 文件。',
                        image: '/extension/zip-download.png'
                    },
                    {
                        text: '将压缩包解压到任意目录。'
                    },
                    {
                        text: '打开 chrome://extensions，开启「开发者模式」。',
                        image: '/extension/dev-mode.png'
                    },
                    {
                        text: '点击「加载已解压的扩展」→ 选择解压后的目录(请勿删除解压后的目录，否则扩展将无法工作，浏览器会提示未能成功加载扩展程序)。',
                        image: '/extension/load-unpacked.png'
                    }
                ]
            }
        ]
    },
    {
        browser: 'Firefox',
        icon: Globe,
        sections: [
            {
                title: '从文件安装附加组件',
                steps: [
                    {
                        text: '从 Releases 下载最新 .xpi 文件。',
                        image: '/extension/xpi-download.png'
                    },
                    {
                        text: '此时Firefox会问你是否确认安装。',
                        image: '/extension/ff-confirm.png'
                    },
                    {
                        text: '点击「添加」即可完成安装。',
                        image: '/extension/ff-install.png'
                    }
                ]
            }
        ]
    }
]
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
                        class="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                        <BookOpen class="h-5 w-5" />
                    </div>
                    <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
                        安装教程
                    </h1>
                </div>
                <p class="text-soft max-w-2xl">
                    手把手教你如何手动安装 ghproxy-extension 浏览器扩展。
                </p>
            </div>
        </section>

        <section class="container-page py-12 sm:py-16 space-y-10">
            <div class="max-w-3xl space-y-10">
                <div v-for="(group, gi) in steps" :key="gi" class="space-y-6">
                    <div class="flex items-center gap-2">
                        <component :is="group.icon" class="h-5 w-5 text-primary" />
                        <h2 class="text-2xl font-semibold tracking-tight">{{ group.browser }}</h2>
                    </div>

                    <div v-for="(s, si) in group.sections" :key="si" class="card p-5 sm:p-6">
                        <div class="flex items-center gap-2 mb-4">
                            <Sparkles class="h-4 w-4 text-amber-500" />
                            <h3 class="font-semibold">{{ s.title }}</h3>
                        </div>

                        <ol class="space-y-5 text-sm">
                            <li v-for="(step, idx) in s.steps" :key="idx" class="space-y-3">
                                <div class="flex gap-3">
                                    <span
                                        class="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                        {{ idx + 1 }}
                                    </span>
                                    <span class="text-soft leading-relaxed pt-0.5">{{ step.text }}</span>
                                </div>
                                <div v-if="step.image" class="ml-9">
                                    <img :src="step.image" :alt="`步骤 ${idx + 1}`"
                                        class="rounded-lg border border-ink-200 dark:border-ink-800 w-full" />
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>

                <div
                    class="card p-5 border-l-4 border-l-primary bg-primary/5 text-sm flex items-start gap-3">
                    <Package class="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                        <p class="font-semibold mb-1">还没下载扩展？</p>
                        <p class="text-soft mb-3">前往 GitHub Releases 下载最新版本的 CRX / XPI 文件。</p>
                        <a href="https://github.com/hubporg/ghproxy-extension/releases" target="_blank"
                            rel="noreferrer"
                            class="inline-flex items-center gap-1.5 text-primary hover:underline">
                            前往 Releases 下载
                        </a>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
