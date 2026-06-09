<script setup lang="ts">
import { Github, Heart, Code2, Users, MessagesSquare, Mail } from 'lucide-vue-next'

interface Milestone {
    date: string
    title: string
    body: string
    ongoing?: boolean
}

interface Contributor {
    name: string
    role: string
    url: string
    avatar: string
    bg?: 'white' | 'gradient'
}

const milestones: Milestone[] = [
    {
        date: '持续',
        title: '社区节点扩张',
        body: '社区贡献节点已覆盖默认、贡献、测绘三类，名单不断扩充。',
        ongoing: true
    },
    {
        date: '2026-06',
        title: 'ghproxy-extension v1.0.7',
        body: '添加隐私政策弹窗与匿名统计支持；CRX3 浏览器扩展打包脚本就绪。'
    },
    {
        date: '2026-04',
        title: 'ghproxy-extension v1.0',
        body: '智能 GitHub 下载加速浏览器扩展首发，覆盖 Chrome / Edge / Firefox'
    },
    {
        date: '2025-12',
        title: 'ghproxy-next 启动重构',
        body: '基于 Next.js 16、React 19、Tailwind CSS 4 与 TypeScript 重构 GitHub 代理 Web 加速链接转换。'
    },
    {
        date: '2025-02',
        title: 'CF-GitHub-Proxy 上线',
        body: '基于 Cloudflare Workers / Snippets 的 GitHub 镜像代理工具发布，零服务器即可部署。'
    }
]

const contributors: Contributor[] = [
    {
        name: 'Geekertao',
        role: 'ghproxy-extension 维护者',
        url: 'https://github.com/Geekertao',
        avatar: 'https://avatars.githubusercontent.com/Geekertao?v=4'
    },
    {
        name: 'oopsunix',
        role: 'ghproxy-next 维护者',
        url: 'https://github.com/oopsunix',
        avatar: 'https://avatars.githubusercontent.com/oopsunix?v=4'
    },
    {
        name: 'TBedu',
        role: '',
        url: 'https://github.com/TBedu',
        avatar: 'https://avatars.githubusercontent.com/TBedu?v=4'
    },
    {
        name: '社区贡献者',
        role: '节点 / 文档 / 测试',
        url: 'https://github.com/hubporg',
        avatar: '/hubp.svg',
        bg: 'white' as const
    },
    {
        name: '欢迎你',
        role: '加入 hubporg，共建开源',
        url: 'https://github.com/orgs/hubporg/repositories',
        avatar: ''
    }
]

const values = [
    {
        icon: Code2,
        title: '技术为先',
        body: '我们相信基础设施应该用最合适的栈构建，性能、安全、可维护是底线，不是上限。'
    },
    {
        icon: Heart,
        title: '公益属性',
        body: 'hubp 默认节点为公益服务。我们鼓励自建，也欢迎贡献节点。'
    },
    {
        icon: Users,
        title: '社区驱动',
        body: '节点贡献、文档改进、问题反馈都通过 GitHub Issues 透明协作。'
    }
]
</script>

<template>
    <div>
        <section
            class="border-b border-ink-200 dark:border-ink-800 bg-gradient-to-b from-ink-100/40 to-transparent dark:from-ink-1000/40">
            <div class="container-page py-16 sm:py-20">
                <p class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                    关于 / ABOUT
                </p>
                <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
                    hubp 是一个组织，也是一种态度
                </h1>
                <p class="text-soft max-w-2xl leading-relaxed">
                    我们坚信开源资源应该被自由访问。当 GitHub 在某些地区慢得像拨号上网，我们就动手写一个更快的代理。
                </p>
            </div>
        </section>

        <section class="container-page py-12">
            <div class="grid sm:grid-cols-3 gap-4">
                <article v-for="v in values" :key="v.title" class="card p-6">
                    <component :is="v.icon" class="h-5 w-5 text-brand-500 mb-3" />
                    <h3 class="font-semibold mb-2">{{ v.title }}</h3>
                    <p class="text-sm text-soft leading-relaxed">{{ v.body }}</p>
                </article>
            </div>
        </section>

        <section class="container-page py-8">
            <h2 class="text-2xl font-semibold tracking-tight mb-6">时间轴</h2>
            <ol class="relative border-l border-ink-200 dark:border-ink-800 ml-2 space-y-8">
                <li v-for="m in milestones" :key="m.title + m.date" class="pl-6 relative">
                    <span
                        :class="['absolute -left-1.5 top-1.5 h-3 w-3 rounded-full ring-4 ring-ink-50 dark:ring-ink-950',
                            m.ongoing
                                ? 'bg-accent animate-pulse-slow'
                                : 'bg-brand-500']" />
                    <p class="font-mono text-xs text-soft mb-1">
                        <span v-if="m.ongoing" class="inline-flex items-center gap-1 text-accent">
                            <span class="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-slow" />
                            ONGOING
                        </span>
                        <span v-else>{{ m.date }}</span>
                    </p>
                    <h3 class="font-semibold mb-1">{{ m.title }}</h3>
                    <p class="text-sm text-soft">{{ m.body }}</p>
                </li>
            </ol>
        </section>

        <section id="contributors" class="container-page py-12">
            <h2 class="text-2xl font-semibold tracking-tight mb-6">核心贡献者</h2>
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <a v-for="c in contributors" :key="c.name" :href="c.url" target="_blank" rel="noreferrer"
                    class="card p-5 flex items-center gap-3 hover:border-brand-400/60 dark:hover:border-brand-500/60 transition-colors">
                    <div
                        class="h-10 w-10 rounded-full flex items-center justify-center font-semibold overflow-hidden flex-shrink-0"
                        :class="{
                            'bg-white ring-1 ring-ink-200 dark:ring-ink-800': c.bg === 'white',
                            'bg-gradient-to-br from-brand-500 to-accent text-white': c.bg === 'gradient',
                            'bg-transparent': !c.bg && c.avatar
                        }">
                        <img v-if="c.avatar" :src="c.avatar" :alt="c.name" class="h-full w-full object-cover"
                            @error="($event.target as HTMLImageElement).style.display = 'none'" />
                        <span v-else>{{ c.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div>
                        <p class="font-medium">{{ c.name }}</p>
                        <p class="text-xs text-soft">{{ c.role }}</p>
                    </div>
                </a>
            </div>
        </section>

        <section id="community" class="container-page py-12">
            <h2 class="text-2xl font-semibold tracking-tight mb-6">社区准则</h2>
            <ul class="space-y-3 text-soft text-sm leading-relaxed max-w-3xl">
                <li>· 节点贡献需保证稳定可用，且不得用于非法目的。</li>
                <li>· 欢迎提交 Issue 与 PR，描述清晰、复现步骤完整者优先。</li>
                <li>· 公益节点请勿滥用，避免高并发压测。</li>
                <li>· 讨论请保持友善，技术问题优先在 GitHub Discussions 中沉淀。</li>
            </ul>
        </section>

        <section id="contact" class="container-page py-12">
            <div class="card p-8 text-center">
                <h2 class="text-2xl font-semibold tracking-tight mb-3">联系我们</h2>
                <p class="text-soft max-w-xl mx-auto mb-6">
                    合作、安全报告、节点申请等可通过以下渠道找到我们。
                </p>
                <div class="flex flex-wrap justify-center gap-3">
                    <a href="https://github.com/hubporg" target="_blank" rel="noreferrer" class="btn-primary">
                        <Github class="h-4 w-4" />
                        GitHub
                    </a>
                    <a href="https://qm.qq.com/q/JWSV7CSGEs" target="_blank" rel="noreferrer" class="btn-secondary">
                        <MessagesSquare class="h-4 w-4" />
                        QQ 群
                    </a>
                    <a href="mailto:hubp@hubp.org" class="btn-secondary">
                        <Mail class="h-4 w-4" />
                        hubp@hubp.org
                    </a>
                </div>
            </div>
        </section>
    </div>
</template>
