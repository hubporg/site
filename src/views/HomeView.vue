<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
    ArrowRight,
    Github,
    Heart,
    Users,
    Globe2,
    Code2,
    Sparkles,
    MessageCircle,
    BookOpen,
    GitFork,
    Star,
    Zap
} from 'lucide-vue-next'
import CodeBlock from '@/components/CodeBlock.vue'
import Typewriter from '@/components/Typewriter.vue'

const heroAvatars = [
    { name: 'Geekertao', url: 'https://avatars.githubusercontent.com/Geekertao?v=4' },
    { name: 'oopsunix', url: 'https://avatars.githubusercontent.com/oopsunix?v=4' },
    { name: 'TBedu', url: 'https://avatars.githubusercontent.com/TBedu?v=4' }
]

const manifesto = `// hubp · 让开源资源在每一次网络请求中流动
//
// 我们相信代码是公共的，访问应该是平等的。
// 我们维护一个加速生态，让 GitHub、Docker、Hugging Face
// 在任何角落都能稳定抵达每一个开发者。
//
// 欢迎加入，无论你是贡献一个节点、写一行文档，
// 还是提交一个 issue —— 你都在让开源更近一步。
`

const values = [
    {
        icon: Heart,
        title: '公共属性',
        body: 'hubp 默认节点为公益服务。我们鼓励自建，也欢迎贡献节点回馈社区。'
    },
    {
        icon: Code2,
        title: '技术为先',
        body: '用合适的栈解决合适的问题。性能、安全、可维护是底线，不是上限。'
    },
    {
        icon: Users,
        title: '社区驱动',
        body: '节点、文档、Issue、PR，所有协作都通过 GitHub 透明进行。'
    },
    {
        icon: Globe2,
        title: '开放贡献',
        body: '所有协作都通过 GitHub Issues 与 PR 透明进行。任何人都可以提出想法、提交补丁、贡献节点。'
    }
]

const joinWays = [
    {
        icon: GitFork,
        title: '贡献一个节点',
        body: '为社区提供一个可用的 GitHub 代理节点，并接受自动测速验证。',
        cta: '查看贡献指南',
        href: 'https://github.com/hubporg/ghproxy-next/issues/new?template=contribute-node.yml'
    },
    {
        icon: Code2,
        title: '提交代码或文档',
        body: '无论 TypeScript、JavaScript 还是一行文案修改，一个 PR 都可能影响数千名开发者。',
        cta: '浏览仓库',
        href: 'https://github.com/orgs/hubporg/repositories'
    },
    {
        icon: MessageCircle,
        title: '反馈与建议',
        body: '在 Issue 中告诉我们你的使用场景与痛点。重要反馈会被直接吸收进路线图。',
        cta: '发起讨论',
        href: 'https://github.com/hubporg/site/issues'
    }
]
</script>

<template>
    <div>
        <!-- HERO：组织使命 -->
        <section class="relative overflow-hidden border-b border-ink-200 dark:border-ink-800">
            <div class="absolute inset-0 grid-bg opacity-60 dark:opacity-30" />
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-50 dark:to-ink-950" />
            <div
                class="absolute -top-32 left-1/2 -translate-x-1/2 h-[28rem] w-[48rem] pointer-events-none">
                <div
                    class="orb orb-1 h-full w-full rounded-full bg-brand-500/40 dark:bg-brand-500/30 blur-3xl" />
            </div>
            <div class="absolute top-32 right-0 h-96 w-96 pointer-events-none">
                <div
                    class="orb orb-2 h-full w-full rounded-full bg-accent/40 dark:bg-accent/30 blur-3xl" />
            </div>

            <div class="container-page relative pt-20 pb-24 sm:pt-28 sm:pb-32">
                <div class="max-w-3xl">
                    <div
                        class="inline-flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-800 bg-white/70 dark:bg-ink-1000/70 backdrop-blur px-3 py-1.5 mb-6 text-xs font-mono">
                        <span class="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-slow" />
                        <span class="text-soft">A community for open-source reach</span>
                    </div>

                    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] mb-6">
                        让开源资源
                        <br class="hidden sm:block" />
                        <span class="text-gradient">在每一次请求中</span>
                        <span class="text-gradient">自由流动</span>
                    </h1>

                    <p class="text-lg text-soft max-w-2xl leading-relaxed mb-8">
                        hubporg 是一个由开发者自发组成的开源组织。我们围绕 GitHub 与开源资源访问，
                        维护浏览器扩展、Web 加速链接转换与 Cloudflare 边缘代理，让每一个开发者——无论身处何地——都能稳定地访问开源世界。
                    </p>

                    <div class="flex flex-wrap items-center gap-3 mb-10 w-full sm:w-auto">
                        <a href="https://github.com/hubporg" target="_blank" rel="noreferrer" class="btn-primary w-full sm:w-auto justify-center">
                            <Github class="h-4 w-4" />
                            关注组织
                        </a>
                        <RouterLink to="/about" class="btn-secondary w-full sm:w-auto justify-center">
                            了解 hubp
                            <ArrowRight class="h-4 w-4" />
                        </RouterLink>
                        <a href="https://github.akams.cn" target="_blank" rel="noreferrer" class="btn-ghost w-full sm:w-auto justify-center">
                            <Zap class="h-4 w-4" />
                            立即使用 →
                        </a>
                    </div>

                    <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm">
                        <div class="flex -space-x-2">
                        <div v-for="(c, i) in heroAvatars" :key="i"
                            class="h-8 w-8 rounded-full ring-2 ring-white dark:ring-ink-950 bg-gradient-to-br from-brand-400 to-accent flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                            <img v-if="c.url" :src="c.url" :alt="c.name" class="h-full w-full object-cover"
                                @error="($event.target as HTMLImageElement).style.display = 'none'" />
                            <span v-else>{{ c.name.charAt(0).toUpperCase() }}</span>
                        </div>
                    </div>
                        <span class="text-soft">
                            已有 <span class="font-semibold text-ink-900 dark:text-ink-50">3+</span>
                            核心维护者与
                            <span class="font-semibold text-ink-900 dark:text-ink-50">50+</span>
                            社区贡献节点
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <!-- MANIFESTO：组织宣言 -->
        <section class="container-page py-16 sm:py-20">
            <div class="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 items-start">
                <div class="lg:col-span-2 min-w-0">
                    <p class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                        宣言 / MANIFESTO
                    </p>
                    <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                        我们为什么存在
                    </h2>
                    <p class="text-soft leading-relaxed break-words">
                        开源代码属于全人类，但当前下载它的速度与稳定性并不均衡。hubporg 想用工程师的方式，把这种差距抹平。
                    </p>
                </div>
                <div class="lg:col-span-3 min-w-0">
                    <CodeBlock language="typescript" label="hubp/manifesto.ts" :code="manifesto" />
                    <div class="mt-4 flex items-center gap-2 text-sm font-mono text-soft">
                        <span class="text-ink-400">🚀</span>
                        <Typewriter text="Let's SpeedUP!!!" :speed="65" />
                    </div>
                </div>
            </div>
        </section>

        <!-- VALUES：价值观 -->
        <section class="border-y border-ink-200 dark:border-ink-800 bg-ink-100/40 dark:bg-ink-1000/40">
            <div class="container-page py-16 sm:py-20">
                <div class="max-w-2xl mb-12">
                    <p class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                        价值观 / VALUES
                    </p>
                    <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
                        四个坚持
                    </h2>
                    <p class="text-soft leading-relaxed">
                        这些不是营销话术，而是当我们面临取舍时实际会用的判断标准。
                    </p>
                </div>
                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <article v-for="v in values" :key="v.title" class="card p-6">
                        <component :is="v.icon" class="h-5 w-5 text-brand-500 mb-3" />
                        <h3 class="font-semibold mb-2">{{ v.title }}</h3>
                        <p class="text-sm text-soft leading-relaxed">{{ v.body }}</p>
                    </article>
                </div>
            </div>
        </section>

        <!-- WHAT WE BUILD：hubporg 三个对外产品 -->
        <section class="container-page py-16 sm:py-20">
            <div class="grid lg:grid-cols-12 gap-8 items-start">
                <div class="lg:col-span-5">
                    <p class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                        实践 / WHAT WE BUILD
                    </p>
                    <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                        把理念变成可用的工具
                    </h2>
                    <p class="text-soft leading-relaxed mb-6">
                        hubporg 目前维护三个公开产品：浏览器内加速、Web 加速链接转换、Cloudflare 边缘代理。它们可以独立使用，也可以组合起来。
                    </p>
                    <RouterLink to="/projects" class="btn-secondary">
                        查看项目
                        <ArrowRight class="h-4 w-4" />
                    </RouterLink>
                </div>

                <div class="lg:col-span-7 space-y-3">
                    <RouterLink to="/projects"
                        class="card p-5 flex items-center gap-4 hover:border-purple-400/60 dark:hover:border-purple-500/60 transition-colors group">
                        <div
                            class="h-12 w-12 rounded-md bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-white flex-shrink-0">
                            <Sparkles class="h-5 w-5" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                                <h3 class="font-semibold truncate min-w-0">ghproxy-extension</h3>
                                <span class="text-[10px] font-mono text-soft whitespace-nowrap">JavaScript · MIT</span>
                            </div>
                            <p class="text-sm text-soft line-clamp-2">
                                智能 GitHub 下载加速浏览器扩展，兼容 IDM，302 重定向
                            </p>
                        </div>
                        <ArrowRight
                            class="h-4 w-4 text-soft group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                    </RouterLink>

                    <RouterLink to="/projects"
                        class="card p-5 flex items-center gap-4 hover:border-accent/60 transition-colors group">
                        <div
                            class="h-12 w-12 rounded-md bg-gradient-to-br from-accent to-emerald-300 flex items-center justify-center text-white flex-shrink-0">
                            <Globe2 class="h-5 w-5" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                                <h3 class="font-semibold truncate min-w-0">ghproxy-next</h3>
                                <span class="text-[10px] font-mono text-soft whitespace-nowrap">Next.js · GPL-3.0</span>
                            </div>
                            <p class="text-sm text-soft line-clamp-2">
                                即用型 GitHub 代理 Web 加速链接转换，节点测速与 Releases 列表
                            </p>
                        </div>
                        <ArrowRight
                            class="h-4 w-4 text-soft group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                    </RouterLink>

                    <RouterLink to="/projects"
                        class="card p-5 flex items-center gap-4 hover:border-orange-400/60 dark:hover:border-orange-500/60 transition-colors group">
                        <div
                            class="h-12 w-12 rounded-md bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white flex-shrink-0">
                            <Zap class="h-5 w-5" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                                <h3 class="font-semibold truncate min-w-0">CF-GitHub-Proxy</h3>
                                <span class="text-[10px] font-mono text-soft whitespace-nowrap">Cloudflare Workers · MIT</span>
                            </div>
                            <p class="text-sm text-soft line-clamp-2">
                                零服务器部署的 GitHub 镜像代理，Cloudflare Workers / Snippets
                            </p>
                        </div>
                        <ArrowRight
                            class="h-4 w-4 text-soft group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                    </RouterLink>
                </div>
            </div>
        </section>

        <!-- JOIN：如何加入 -->
        <section
            class="border-t border-ink-200 dark:border-ink-800 bg-gradient-to-b from-ink-100/40 to-transparent dark:from-ink-1000/40">
            <div class="container-page py-16 sm:py-20">
                <div class="max-w-2xl mb-12">
                    <p class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                        参与 / JOIN
                    </p>
                    <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
                        三种方式成为 hubp 一员
                    </h2>
                    <p class="text-soft leading-relaxed">
                        没有门槛，没有形式要求。你能做的任何一件小事，都在让开源更近一步。
                    </p>
                </div>

                <div class="grid gap-5 md:grid-cols-3">
                    <article v-for="(w, i) in joinWays" :key="i" class="card p-6 flex flex-col">
                        <component :is="w.icon" class="h-5 w-5 text-brand-500 mb-4" />
                        <h3 class="font-semibold mb-2">{{ w.title }}</h3>
                        <p class="text-sm text-soft leading-relaxed mb-5 flex-1">
                            {{ w.body }}
                        </p>
                        <a :href="w.href" target="_blank" rel="noreferrer"
                            class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:gap-2.5 transition-all">
                            {{ w.cta }}
                            <ArrowRight class="h-3.5 w-3.5" />
                        </a>
                    </article>
                </div>
            </div>
        </section>

        <!-- STATS：组织指标 -->
        <section class="container-page py-12 sm:py-16">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="card p-5">
                    <p class="font-mono text-3xl font-semibold text-brand-600 dark:text-brand-400">
                        3
                    </p>
                    <p class="mt-1 text-sm font-medium">活跃仓库</p>
                    <p class="mt-0.5 text-xs text-soft">核心 / Web / 扩展</p>
                </div>
                <div class="card p-5">
                    <p class="font-mono text-3xl font-semibold text-brand-600 dark:text-brand-400">
                        50+
                    </p>
                    <p class="mt-1 text-sm font-medium">社区节点</p>
                    <p class="mt-0.5 text-xs text-soft">默认 / 贡献 / 测绘</p>
                </div>
                <div class="card p-5">
                    <p class="font-mono text-3xl font-semibold text-brand-600 dark:text-brand-400">
                        3 种
                    </p>
                    <p class="mt-1 text-sm font-medium">开源协议</p>
                    <p class="mt-0.5 text-xs text-soft">MIT / GPL-3.0</p>
                </div>
                <div class="card p-5">
                    <p class="font-mono text-3xl font-semibold text-accent">100%</p>
                    <p class="mt-1 text-sm font-medium">公益属性</p>
                    <p class="mt-0.5 text-xs text-soft">默认节点免费开放</p>
                </div>
            </div>
        </section>

        <!-- DOCS / CTA -->
        <section class="container-page py-12 sm:py-16">
            <div class="card relative overflow-hidden p-8 sm:p-12 grid sm:grid-cols-2 gap-6 items-center">
                <div class="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-accent/10" />
                <div class="relative">
                    <BookOpen class="h-5 w-5 text-brand-500 mb-3" />
                    <h2 class="text-2xl font-semibold tracking-tight mb-2">
                        想了解我们怎么工作？
                    </h2>
                    <p class="text-soft">
                        从架构到部署，从协议到节点贡献，文档会告诉你一切。
                    </p>
                </div>
                <div class="relative flex flex-wrap gap-3 sm:justify-end">
                    <RouterLink to="/accelerate" class="btn-primary">
                        <Zap class="h-4 w-4" />
                        快速开始
                    </RouterLink>
                    <RouterLink to="/nodes" class="btn-secondary">
                        <Star class="h-4 w-4" />
                        查看节点
                    </RouterLink>
                </div>
            </div>
        </section>
    </div>
</template>
