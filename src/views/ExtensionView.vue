<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import {
    Puzzle,
    Zap,
    Github,
    MousePointerClick,
    Network,
    Settings,
    Globe2,
    CheckCircle2,
    ArrowRight,
    Star,
    Clock,
    MapPin,
    Copy,
    ShieldCheck,
    Shield,
    RefreshCcw,
    Download,
    Server,
    Cpu,
    BookOpen,
    Code2,
    AlertCircle
} from 'lucide-vue-next'
import FireCanvas from '../components/FireCanvas.vue'
import CodeBlock from '@/components/CodeBlock.vue'

// 根据 User Agent 检测当前浏览器，返回商店安装信息
type BrowserType = 'edge' | 'firefox' | 'chrome' | 'unknown'
const browserType = computed<BrowserType>(() => {
    if (typeof navigator === 'undefined') return 'unknown'
    const ua = navigator.userAgent
    if (/Edg\//.test(ua)) return 'edge'
    if (/Firefox\//.test(ua)) return 'firefox'
    if (/Chrome\//.test(ua) || /Chromium\//.test(ua)) return 'chrome'
    return 'unknown'
})
const installTarget = computed(() => {
    switch (browserType.value) {
        case 'edge':
            return {
                name: 'Edge 扩展商店',
                href: 'https://microsoftedge.microsoft.com/addons/detail/pingkpgackfhaonibagjlibmobkhgdml',
                icon: Globe2
            }
        case 'firefox':
            return {
                name: 'Firefox 附加组件',
                href: 'https://addons.mozilla.org/addon/github-accelerator/',
                icon: Globe2
            }
        case 'chrome':
            // Chrome Web Store 链接（占位，待上架后替换）
            return {
                name: 'Chrome 应用商店',
                href: 'https://chromewebstore.google.com/detail/ghproxy-extension',
                icon: Globe2
            }
        default:
            return {
                name: '查看安装方式',
                href: '#install',
                icon: Download
            }
    }
})

interface StatsSummary {
    total_jumps: number
    total_installs: number
    installs_by_browser: Record<string, number>
    jumps_by_browser: Record<string, number>
    installs_by_version: Record<string, number>
    jumps_by_version: Record<string, number>
    last_updated: string
}

// 主源 + 备用源：主源不可用时自动降级
const PRIMARY_URL = 'https://addon-analytics.hubp.org/stats/summary'
const FALLBACK_URL = 'https://addon-analytics-hubp.tbedu.top/stats/summary'

const stats = ref<StatsSummary | null>(null)
const statsSource = ref<'primary' | 'fallback' | null>(null)
const statsLoading = ref(true)
const statsError = ref<string | null>(null)
const lastFetchedAt = ref<number>(0)
let cache: { data: StatsSummary; source: 'primary' | 'fallback'; ts: number } | null = null
const CACHE_TTL = 5 * 60 * 1000

async function fetchOnce(url: string): Promise<StatsSummary> {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
}

async function loadStats(force = false) {
    statsLoading.value = true
    statsError.value = null
    const now = Date.now()
    if (!force && cache && now - cache.ts < CACHE_TTL) {
        stats.value = cache.data
        statsSource.value = cache.source
        lastFetchedAt.value = cache.ts
        statsLoading.value = false
        return
    }
    try {
        const data = await fetchOnce(PRIMARY_URL)
        stats.value = data
        statsSource.value = 'primary'
        cache = { data, source: 'primary', ts: now }
        lastFetchedAt.value = now
    } catch (e) {
        try {
            const data = await fetchOnce(FALLBACK_URL)
            stats.value = data
            statsSource.value = 'fallback'
            cache = { data, source: 'fallback', ts: now }
            lastFetchedAt.value = now
        } catch (err) {
            statsError.value = '主源与备用源均不可用'
        }
    } finally {
        statsLoading.value = false
    }
}

onMounted(() => loadStats())

function formatNumber(n: number | undefined): string {
    const v = n ?? 0
    if (v >= 100000000) return (v / 100000000).toFixed(1) + '亿'
    if (v >= 10000) return (v / 10000).toFixed(1) + '万'
    return v.toLocaleString()
}

const latestVersion = computed(() => {
    if (!stats.value) return '...'
    const versions = Object.keys(stats.value.installs_by_version || {})
    if (!versions.length) return '...'
    // 按语义版本号排序取最大
    return versions.sort((a, b) => {
        const pa = a.split('.').map(Number)
        const pb = b.split('.').map(Number)
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
            const diff = (pa[i] || 0) - (pb[i] || 0)
            if (diff !== 0) return diff
        }
        return 0
    }).pop()!
})

const versionTop = computed(() => {
    if (!stats.value) return [] as { v: string; n: number }[]
    return Object.entries(stats.value.installs_by_version || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([v, n]) => ({ v, n }))
})

const relativeTime = ref('')
let _relTimer: ReturnType<typeof setInterval> | null = null

function updateRelativeTime() {
    if (!lastFetchedAt.value) { relativeTime.value = ''; return }
    const diff = Math.floor((Date.now() - lastFetchedAt.value) / 1000)
    if (diff < 60) relativeTime.value = `${diff} 秒前`
    else if (diff < 3600) relativeTime.value = `${Math.floor(diff / 60)} 分钟前`
    else relativeTime.value = `${Math.floor(diff / 3600)} 小时前`
}

onMounted(() => {
    _relTimer = setInterval(updateRelativeTime, 10_000)
})
onUnmounted(() => { if (_relTimer) clearInterval(_relTimer) })
// loadStats 完成后也触发一次
watch(lastFetchedAt, updateRelativeTime)

const chromiumInstalls = computed(
    () => stats.value?.installs_by_browser?.chromium ?? 0
)
const firefoxInstalls = computed(
    () => stats.value?.installs_by_browser?.firefox ?? 0
)
const chromiumJumps = computed(
    () => stats.value?.jumps_by_browser?.chromium ?? 0
)
const firefoxJumps = computed(
    () => stats.value?.jumps_by_browser?.firefox ?? 0
)

const features = [
    {
        icon: Network,
        title: '智能节点选择',
        desc: '从社区贡献节点池中测速后缓存最优节点，2 小时内复用，无需每次重新测。'
    },
    {
        icon: Zap,
        title: '302 重定向加速',
        desc: '把下载请求重定向到最快节点。原生兼容 IDM、Aria2、浏览器内置下载器。'
    },
    {
        icon: MapPin,
        title: '大陆地区专属',
        desc: '自动判断访问者地区，仅对中国大陆 IP 启用加速逻辑，海外用户无感。'
    },
    {
        icon: MousePointerClick,
        title: '右键一键复制',
        desc: '在 GitHub 文件页右键直接复制加速链接，粘贴到任何下载工具即用。'
    },
    {
        icon: Settings,
        title: '精细偏好控制',
        desc: '可设置全局启用、仅启用指定域名、或完全关闭。设置全部本地存储。'
    },
    {
        icon: ShieldCheck,
        title: '最小权限原则',
        desc: '不读取账号、Cookie、历史记录，仅在你访问 GitHub 下载页时介入。'
    }
]

const workflow = [
    { step: '01', title: '匹配下载场景', desc: '扩展监听 GitHub 文件下载链接，匹配 raw / release / archive 规则。' },
    { step: '02', title: '选择最优节点', desc: '从测速缓存中读取延迟最低的健康节点，无缓存时实时测速一次。' },
    { step: '03', title: '302 重定向', desc: '把请求重定向到 `节点/原始 URL`，由节点服务器流式回源 GitHub。' },
    { step: '04', title: '浏览器下载接管', desc: '浏览器与 IDM 接管下载，下载速度取决于节点带宽，常见 10MB/s+。' }
]

const installLinks = computed(() => {
    const all = [
        {
            name: 'Edge 扩展商店',
            short: 'Edge',
            desc: 'Microsoft 官方上架',
            icon: Globe2,
            href: 'https://microsoftedge.microsoft.com/addons/detail/pingkpgackfhaonibagjlibmobkhgdml',
            tag: 'edge' as BrowserType
        },
        {
            name: 'Firefox 附加组件',
            short: 'Firefox',
            desc: 'AMO 官方上架',
            icon: Globe2,
            href: 'https://addons.mozilla.org/addon/github-accelerator/',
            tag: 'firefox' as BrowserType
        },
        {
            name: 'GitHub Releases',
            short: 'CRX / XPI',
            desc: '开发者模式安装或自部署',
            icon: Github,
            href: 'https://github.com/hubporg/ghproxy-extension/releases',
            tag: 'unknown' as BrowserType
        }
    ]
    const bt = browserType.value
    // 当前浏览器排第一并标记推荐；Chrome 同时推 Edge（无 Chrome 商店）
    return all
        .map(l => ({
            ...l,
            primary: l.tag === bt || (bt === 'chrome' && l.tag === 'edge')
        }))
        .sort((a, b) => (a.primary === b.primary ? 0 : a.primary ? -1 : 1))
})

const faqs = [
    {
        q: '扩展会读取我的 GitHub 账号吗？',
        a: '不会。扩展只在你点击「加速下载」或启用「全局加速」时介入下载请求，不会读取账号、Cookie、Token 或浏览历史。'
    },
    {
        q: '为什么国内访问 GitHub 仍然很慢？',
        a: '扩展只对 GitHub 文件下载（raw / releases / archive / clone）生效，网页浏览速度仍取决于你的网络环境。'
    },
    {
        q: '下载到一半中断怎么办？',
        a: '支持断点续传。IDM / Aria2 会在 302 后保持与节点的长连接，节点支持 Range 即可续传。'
    },
    {
        q: '节点从哪里来？',
        a: '节点分为默认、贡献、测绘三档，由 hubporg 与社区共同维护，可在 [节点页](/nodes) 查看实时测速。'
    }
]

const copyLink = `// 浏览器扩展 - 复制加速链接
1. 在 GitHub 文件页右键 → "复制加速链接"
2. 粘贴到任何下载工具
3. 由扩展自动选择最优节点

// 也可启用"全局加速"
//   下载请求一律走扩展，零额外操作`

const devLoad = `// Chrome / Edge 开发者模式安装
1. 从 Releases 下载最新 .crx 文件
2. 将 .crx 改名为 .zip，解压到任意目录
3. 打开 chrome://extensions 开启「开发者模式」
4. 选择「加载已解压的扩展」→ 选择解压后的目录

// Firefox 安装
1. 从 Releases 下载最新 .xpi 文件
2. 打开 about:addons → 齿轮图标 → 从文件安装附加组件
3. 选择 .xpi 文件即可`
</script>

<template>
    <div>
        <!-- HERO -->
        <section
            class="relative overflow-hidden border-b border-ink-200 dark:border-ink-800">
            <div class="absolute inset-0 grid-bg opacity-60 dark:opacity-30" />
            <div
                class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-50 dark:to-ink-950" />
            <div class="absolute -top-32 left-1/2 -translate-x-1/2 h-[28rem] w-[48rem] pointer-events-none dark:hidden">
                <div
                    class="orb orb-1 h-full w-full rounded-full bg-purple-500/30 dark:bg-purple-500/20 blur-3xl" />
            </div>
            <div class="absolute top-32 right-0 h-96 w-96 pointer-events-none dark:hidden">
                <div
                    class="orb orb-2 h-full w-full rounded-full bg-pink-400/30 dark:bg-pink-400/20 blur-3xl" />
            </div>
            <div class="absolute inset-0 pointer-events-none">
                <FireCanvas />
            </div>

            <div class="container-page relative pt-20 pb-24 sm:pt-28 sm:pb-32">
                <div class="max-w-3xl relative">
                    <div class="absolute -inset-x-8 -inset-y-4 rounded-lg pointer-events-none z-0 dark:bg-gradient-to-r dark:from-ink-950/60 dark:via-ink-950/30 dark:to-transparent" />
                    <div
                        class="relative z-10 inline-flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-800 bg-white/70 dark:bg-ink-1000/70 backdrop-blur px-3 py-1.5 mb-6 text-xs font-mono">
                        <Puzzle class="h-3.5 w-3.5 text-purple-500" />
                        <span class="text-soft">浏览器扩展 / BROWSER EXTENSION</span>
                    </div>

                    <h1
                        class="relative z-10 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] mb-6">
                        ghproxy
                        <span class="text-gradient">-extension</span>
                    </h1>

                    <p class="relative z-10 text-lg text-soft max-w-2xl leading-relaxed mb-8">
                        智能 GitHub 下载加速浏览器扩展。安装即用，302 重定向兼容 IDM / Aria2，
                        自动选择最优节点，覆盖 Chrome / Edge / Firefox。
                    </p>

                    <div class="relative z-10 flex flex-wrap items-center gap-3 mb-10 w-full sm:w-auto">
                        <a :href="installTarget.href"
                            target="_blank" rel="noreferrer" class="btn-primary w-full sm:w-auto justify-center">
                            <Download class="h-4 w-4" />
                            安装到 {{ installTarget.name.replace(' 扩展商店', '').replace(' 附加组件', '').replace(' 应用商店', '') }}
                        </a>
                        <template v-if="browserType === 'edge'">
                            <a href="https://addons.mozilla.org/addon/github-accelerator/" target="_blank"
                                rel="noreferrer" class="btn-secondary w-full sm:w-auto justify-center">
                                <Download class="h-4 w-4" />
                                Firefox 版
                            </a>
                        </template>
                        <template v-else-if="browserType === 'firefox'">
                            <a href="https://microsoftedge.microsoft.com/addons/detail/pingkpgackfhaonibagjlibmobkhgdml"
                                target="_blank" rel="noreferrer" class="btn-secondary w-full sm:w-auto justify-center">
                                <Download class="h-4 w-4" />
                                Edge 版
                            </a>
                        </template>
                        <template v-else>
                            <a href="https://microsoftedge.microsoft.com/addons/detail/pingkpgackfhaonibagjlibmobkhgdml"
                                target="_blank" rel="noreferrer" class="btn-secondary w-full sm:w-auto justify-center">
                                <Download class="h-4 w-4" />
                                Edge 版
                            </a>
                            <a href="https://addons.mozilla.org/addon/github-accelerator/" target="_blank"
                                rel="noreferrer" class="btn-secondary w-full sm:w-auto justify-center">
                                <Download class="h-4 w-4" />
                                Firefox 版
                            </a>
                        </template>
                        <a href="https://github.com/hubporg/ghproxy-extension" target="_blank" rel="noreferrer"
                            class="btn-ghost w-full sm:w-auto justify-center">
                            <Github class="h-4 w-4" />
                            hubporg/ghproxy-extension
                        </a>
                    </div>

                    <div class="relative z-10 flex flex-wrap items-center gap-2 text-xs font-mono text-soft">
                        <span
                            class="px-2 py-1 rounded border border-ink-200 dark:border-ink-800">MIT</span>
                        <span
                            class="px-2 py-1 rounded border border-ink-200 dark:border-ink-800">v{{ latestVersion }}</span>
                        <span
                            class="px-2 py-1 rounded border border-ink-200 dark:border-ink-800">JavaScript
                            69.7%</span>
                        <span
                            class="px-2 py-1 rounded border border-ink-200 dark:border-ink-800">Chrome / Edge /
                            Firefox</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- STATS：实时统计 -->
        <section class="container-page py-12 sm:py-16">
            <div class="flex flex-wrap items-end justify-between gap-3 mb-6">
                <div>
                    <p
                        class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
                        实时数据 / LIVE STATS
                    </p>
                    <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight">
                        累计加速与安装
                    </h2>
                </div>
                <div class="flex items-center gap-2 text-xs font-mono text-soft">
                    <span
                        v-if="statsSource === 'primary'"
                        class="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-accent/40 text-accent bg-accent/5">
                        <Server class="h-3 w-3" /> 主源 · addon-analytics.hubp.org
                    </span>
                    <span v-else-if="statsSource === 'fallback'"
                        class="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-orange-500/40 text-orange-600 dark:text-orange-400 bg-orange-500/5">
                        <Server class="h-3 w-3" /> 备用源 · addon-analytics-hubp.tbedu.top
                    </span>
                    <button class="btn-ghost h-7 px-2 text-xs" :disabled="statsLoading"
                        @click="loadStats(true)">
                        <RefreshCcw class="h-3 w-3" :class="statsLoading && 'animate-spin'" />
                        刷新
                    </button>
                </div>
            </div>

            <div v-if="statsError"
                class="card p-4 mb-4 flex items-start gap-2 text-sm border-orange-500/40 bg-orange-500/5 text-orange-600 dark:text-orange-400">
                <AlertCircle class="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                    <p class="font-medium">统计数据暂不可用</p>
                    <p class="text-xs opacity-80 mt-0.5">
                        {{ statsError }}，已自动尝试备用源。可稍后点击「刷新」重试。
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="card p-5">
                    <div class="flex items-center gap-2 mb-2">
                        <Zap class="h-4 w-4 text-brand-500" />
                        <span class="text-xs text-soft">累计加速跳转</span>
                    </div>
                    <p class="font-mono text-2xl sm:text-3xl font-semibold text-brand-600 dark:text-brand-400">
                        <span v-if="statsLoading">—</span>
                        <span v-else>{{ formatNumber(stats?.total_jumps) }}</span>
                    </p>
                    <p class="text-xs text-soft mt-1">jumps · 含 IDM / 浏览器</p>
                </div>
                <div class="card p-5">
                    <div class="flex items-center gap-2 mb-2">
                        <Download class="h-4 w-4 text-accent" />
                        <span class="text-xs text-soft">累计安装 / 更新</span>
                    </div>
                    <p class="font-mono text-2xl sm:text-3xl font-semibold text-accent">
                        <span v-if="statsLoading">—</span>
                        <span v-else>{{ formatNumber(stats?.total_installs) }}</span>
                    </p>
                    <p class="text-xs text-soft mt-1">installs · 含自动更新</p>
                </div>
                <div class="card p-5">
                    <div class="flex items-center gap-2 mb-2">
                        <Globe2 class="h-4 w-4 text-purple-500" />
                        <span class="text-xs text-soft">Chromium 版安装</span>
                    </div>
                    <p class="font-mono text-2xl sm:text-3xl font-semibold">
                        <span v-if="statsLoading">—</span>
                        <span v-else>{{ formatNumber(chromiumInstalls) }}</span>
                    </p>
                    <p class="text-xs text-soft mt-1">Chrome / Edge 合计</p>
                </div>
                <div class="card p-5">
                    <div class="flex items-center gap-2 mb-2">
                        <Globe2 class="h-4 w-4 text-orange-500" />
                        <span class="text-xs text-soft">Firefox 版安装</span>
                    </div>
                    <p class="font-mono text-2xl sm:text-3xl font-semibold">
                        <span v-if="statsLoading">—</span>
                        <span v-else>{{ formatNumber(firefoxInstalls) }}</span>
                    </p>
                    <p class="text-xs text-soft mt-1">Firefox 合计</p>
                </div>
            </div>

            <!-- 分浏览器加速量 + 热门版本 -->
            <div class="grid lg:grid-cols-2 gap-4 mt-4">
                <div class="card p-5">
                    <div class="flex items-center gap-2 mb-3">
                        <Activity class="h-4 w-4 text-brand-500" />
                        <h3 class="text-sm font-semibold">按浏览器加速量</h3>
                    </div>
                    <ul class="space-y-2.5 text-sm">
                        <li class="flex items-center justify-between">
                            <span class="text-soft">Chromium 系</span>
                            <span class="font-mono">
                                <span v-if="statsLoading">—</span>
                                <span v-else>{{ formatNumber(chromiumJumps) }}</span>
                            </span>
                        </li>
                        <li class="flex items-center justify-between">
                            <span class="text-soft">Firefox</span>
                            <span class="font-mono">
                                <span v-if="statsLoading">—</span>
                                <span v-else>{{ formatNumber(firefoxJumps) }}</span>
                            </span>
                        </li>
                    </ul>
                </div>
                <div class="card p-5">
                    <div class="flex items-center gap-2 mb-3">
                        <Cpu class="h-4 w-4 text-accent" />
                        <h3 class="text-sm font-semibold">热门版本 Top 4</h3>
                    </div>
                    <ul v-if="versionTop.length" class="space-y-2 text-sm">
                        <li v-for="(v, i) in versionTop" :key="v.v"
                            class="flex items-center justify-between">
                            <span class="text-soft flex items-center gap-2">
                                <span
                                    class="text-[10px] font-mono w-5 text-right text-ink-400">#{{ i + 1 }}</span>
                                v{{ v.v }}
                            </span>
                            <span class="font-mono">{{ formatNumber(v.n) }}</span>
                        </li>
                    </ul>
                    <p v-else class="text-sm text-soft">
                        <span v-if="statsLoading">加载中…</span>
                        <span v-else>暂无数据</span>
                    </p>
                </div>
            </div>

            <p v-if="stats?.last_updated" class="text-xs text-soft font-mono mt-3">
                数据更新于 {{ stats.last_updated }} · 最近请求于 {{ relativeTime }}
            </p>
        </section>

        <!-- FEATURES -->
        <section
            class="border-y border-ink-200 dark:border-ink-800 bg-ink-100/40 dark:bg-ink-1000/40">
            <div class="container-page py-16 sm:py-20">
                <div class="max-w-2xl mb-12">
                    <p
                        class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                        特性 / FEATURES
                    </p>
                    <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
                        安装即用，无需配置
                    </h2>
                    <p class="text-soft leading-relaxed">
                        我们把复杂留在扩展里，把简单留给用户。安装后只需打开 GitHub 文件页，剩下的扩展自动接管。
                    </p>
                </div>
                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <article v-for="f in features" :key="f.title" class="card p-6">
                        <component :is="f.icon" class="h-5 w-5 text-brand-500 mb-3" />
                        <h3 class="font-semibold mb-2">{{ f.title }}</h3>
                        <p class="text-sm text-soft leading-relaxed">{{ f.desc }}</p>
                    </article>
                </div>
            </div>
        </section>

        <!-- WORKFLOW -->
        <section class="container-page py-16 sm:py-20">
            <div class="grid lg:grid-cols-2 gap-10 items-start">
                <div>
                    <p
                        class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                        原理 / HOW IT WORKS
                    </p>
                    <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                        四步完成一次加速
                    </h2>
                    <p class="text-soft leading-relaxed">
                        整个过程对用户透明。你看到的只是「原本几百 KB/s 的下载，突然变成 10MB/s+」。
                    </p>
                </div>
                <ol class="space-y-4">
                    <li v-for="(s, i) in workflow" :key="s.step" class="card p-5 flex gap-4">
                        <span
                            class="font-mono text-sm text-soft flex-shrink-0 w-8">{{ s.step }}</span>
                        <div>
                            <h3 class="font-semibold mb-1">{{ s.title }}</h3>
                            <p class="text-sm text-soft leading-relaxed">{{ s.desc }}</p>
                        </div>
                    </li>
                </ol>
            </div>
        </section>

        <!-- INSTALL -->
        <section class="container-page py-12 sm:py-16">
            <div class="max-w-2xl mb-8">
                <p
                    class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                    安装 / INSTALL
                </p>
                <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
                    三种安装方式
                </h2>
                <p class="text-soft leading-relaxed">
                    推荐直接通过浏览器商店安装。开发者或自部署需求可从 GitHub Releases 拉取 .crx / .xpi。
                </p>
            </div>
            <div class="grid gap-4 lg:grid-cols-3">
                <a v-for="l in installLinks" :key="l.name" :href="l.href" target="_blank" rel="noreferrer"
                    class="card p-6 flex flex-col group"
                    :class="l.primary ? 'border-brand-400/60 dark:border-brand-500/60' : ''">
                    <div class="flex items-center justify-between mb-3">
                        <component :is="l.icon" class="h-5 w-5 text-brand-500" />
                        <span v-if="l.primary"
                            class="text-[10px] font-mono px-1.5 py-0.5 rounded border border-brand-500/40 text-brand-600 dark:text-brand-400 bg-brand-500/5">推荐</span>
                    </div>
                    <h3 class="font-semibold mb-1">{{ l.name }}</h3>
                    <p class="text-sm text-soft mb-5 flex-1">{{ l.desc }}</p>
                    <span
                        class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 group-hover:gap-2.5 transition-all">
                        {{ l.short }} 商店
                        <ArrowRight class="h-3.5 w-3.5" />
                    </span>
                </a>
            </div>
        </section>

        <!-- USAGE SNIPPETS -->
        <section class="container-page py-12">
            <div class="grid lg:grid-cols-2 gap-6">
                <div>
                    <div class="flex items-center gap-2 mb-3">
                        <Copy class="h-4 w-4 text-purple-500" />
                        <h3 class="font-semibold">日常使用</h3>
                    </div>
                    <p class="text-sm text-soft mb-4">
                        在 GitHub 文件页右键即可复制加速链接，粘贴到任意下载工具即可。
                    </p>
                    <CodeBlock language="javascript" label="extension / usage" :code="copyLink" />
                </div>
                <div>
                    <div class="flex items-center gap-2 mb-3">
                        <Code2 class="h-4 w-4 text-orange-500" />
                        <h3 class="font-semibold">开发者模式安装</h3>
                    </div>
                    <p class="text-sm text-soft mb-4">
                        想自定义偏好或从源码安装？下载 Release 的 CRX/XPI 文件，解压后用「加载已解压的扩展」方式安装。
                    </p>
                    <CodeBlock language="bash" label="extension / dev" :code="devLoad" />
                </div>
            </div>
        </section>

        <!-- FAQ -->
        <section class="container-page py-12 sm:py-16">
            <div class="max-w-2xl mb-8">
                <p
                    class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                    常见问题 / FAQ
                </p>
                <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight">关于扩展</h2>
            </div>
            <div class="max-w-3xl space-y-3">
                <details v-for="(f, i) in faqs" :key="i"
                    class="card p-5 group [&[open]]:border-brand-400/60 dark:[&[open]]:border-brand-500/60">
                    <summary
                        class="flex items-center justify-between gap-4 cursor-pointer list-none">
                        <span class="font-medium text-sm sm:text-base">{{ f.q }}</span>
                        <span
                            class="text-soft text-xs font-mono group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p class="text-sm text-soft leading-relaxed mt-3">{{ f.a }}</p>
                </details>
            </div>
        </section>

        <!-- CTA -->
        <section class="container-page py-12 sm:py-16">
            <div class="card relative overflow-hidden p-8 sm:p-12 grid sm:grid-cols-2 gap-6 items-center">
                <div
                    class="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-400/10" />
                <div class="relative">
                    <Puzzle class="h-5 w-5 text-brand-500 mb-3" />
                    <h2 class="text-2xl font-semibold tracking-tight mb-2">
                        一键安装，立即加速
                    </h2>
                    <p class="text-soft">
                        直接跳转对应浏览器商店安装，最快 5 秒装好。<br />开源仓库接受 PR 与 issue。
                    </p>
                </div>
                <div class="relative flex flex-wrap gap-3 sm:justify-end">
                    <a :href="installTarget.href"
                        target="_blank" rel="noreferrer" class="btn-primary">
                        <Download class="h-4 w-4" />
                        {{ installTarget.name }}
                    </a>
                    <a href="https://github.com/hubporg/ghproxy-extension" target="_blank" rel="noreferrer"
                        class="btn-secondary">
                        <Star class="h-4 w-4" />
                        GitHub 仓库
                    </a>
                    <a href="/projects/extension/privacy"
                        class="btn-ghost text-sm">
                        <Shield class="h-4 w-4" />
                        隐私政策
                    </a>
                </div>
            </div>
        </section>
    </div>
</template>
