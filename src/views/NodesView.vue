<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
    Activity,
    Server,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Loader2,
    RefreshCw,
    Clock
} from 'lucide-vue-next'

interface RemoteNode {
    name: string
    url: string
    ping: number | null
    status: 'pending' | 'ok' | 'warn' | 'fail'
}

interface CacheItem {
    url: string
    ping: number | null
    status: 'ok' | 'warn' | 'fail'
}

interface Cache {
    t: number
    items: CacheItem[]
}

const NODES_JSON = 'https://hubp.tbedu.top/nodes.json'
const TEST_ICON =
    'https://raw.githubusercontent.com/hubporg/ghproxy-extension/refs/heads/main/icons/icon128.png'
const CACHE_KEY = 'hubp:nodes-cache'
const TTL_MS = 5 * 60 * 60 * 1000

const nodes = ref<RemoteNode[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const testing = ref(false)
const lastSync = ref<Date | null>(null)
const nowTick = ref(0)
const source = ref<'cache' | 'fresh' | null>(null)

let tickTimer: number | undefined

function normalizeUrl(name: string): string {
    const trimmed = name.trim().replace(/\/+$/, '')
    if (!trimmed) return ''
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    return `https://${trimmed}`
}

function readCache(): Cache | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null
        const c = JSON.parse(raw) as Cache
        if (!c || typeof c.t !== 'number' || !Array.isArray(c.items)) return null
        return c
    } catch {
        return null
    }
}

function writeCache(items: RemoteNode[]): void {
    const cache: Cache = {
        t: Date.now(),
        items: items
            .filter((n) => n.status !== 'pending')
            .map((n) => ({ url: n.url, ping: n.ping, status: n.status as CacheItem['status'] }))
    }
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch {
        /* quota exceeded / disabled */
    }
}

function isCacheFresh(c: Cache | null): c is Cache {
    return c !== null && Date.now() - c.t < TTL_MS
}

async function measure(node: RemoteNode) {
    const target = `${node.url}/${TEST_ICON}`
    const t0 = performance.now()
    try {
        const controller = new AbortController()
        const timeout = window.setTimeout(() => controller.abort(), 6000)
        await fetch(target, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store',
            signal: controller.signal
        })
        window.clearTimeout(timeout)
        const ms = Math.round(performance.now() - t0)
        node.ping = ms
        node.status = ms < 800 ? 'ok' : ms < 2000 ? 'warn' : 'ok'
    } catch {
        node.ping = null
        node.status = 'fail'
    }
}

async function runTests() {
    if (testing.value) return
    testing.value = true
    for (const n of nodes.value) {
        n.ping = null
        n.status = 'pending'
    }
    const concurrency = 6
    let idx = 0
    const workers = Array.from({ length: concurrency }, async () => {
        while (idx < nodes.value.length) {
            const cur = idx++
            if (nodes.value[cur]) await measure(nodes.value[cur])
        }
    })
    await Promise.all(workers)
    testing.value = false
    lastSync.value = new Date()
    writeCache(nodes.value)
}

async function loadNodes(): Promise<string[]> {
    const res = await fetch(NODES_JSON, { cache: 'no-cache' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json()) as { data?: string[] }
    return Array.isArray(json?.data) ? json.data : []
}

function applyCacheTo(list: string[], cache: Cache): RemoteNode[] {
    return list
        .filter((s) => typeof s === 'string' && s.trim().length > 0)
        .map((name) => {
            const url = normalizeUrl(name)
            const hit = cache.items.find((c) => c.url === url)
            return {
                name: name.trim(),
                url,
                ping: hit?.ping ?? null,
                status: (hit?.status ?? 'pending') as RemoteNode['status']
            }
        })
}

function applyFreshTo(list: string[]): RemoteNode[] {
    return list
        .filter((s) => typeof s === 'string' && s.trim().length > 0)
        .map((name) => ({
            name: name.trim(),
            url: normalizeUrl(name),
            ping: null,
            status: 'pending' as const
        }))
}

async function loadAndTest(force = false) {
    loading.value = true
    error.value = null
    try {
        const list = await loadNodes()
        const cache = readCache()
        const fresh = !force && isCacheFresh(cache)

        if (fresh) {
            nodes.value = applyCacheTo(list, cache)
            lastSync.value = new Date(cache.t)
            source.value = 'cache'
        } else {
            nodes.value = applyFreshTo(list)
            if (nodes.value.length === 0) {
                error.value = '远端节点列表为空'
            } else {
                await runTests()
                source.value = 'fresh'
            }
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : '加载失败'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadAndTest(false)
    tickTimer = window.setInterval(() => {
        nowTick.value++
    }, 1000)
})

onUnmounted(() => {
    if (tickTimer) window.clearInterval(tickTimer)
})

const sortedNodes = computed(() => {
    return [...nodes.value].sort((a, b) => {
        const av = a.ping ?? Number.POSITIVE_INFINITY
        const bv = b.ping ?? Number.POSITIVE_INFINITY
        return av - bv
    })
})

const stats = computed(() => {
    const total = nodes.value.length
    const ok = nodes.value.filter((n) => n.status === 'ok').length
    const warn = nodes.value.filter((n) => n.status === 'warn').length
    const fail = nodes.value.filter((n) => n.status === 'fail').length
    const pending = nodes.value.filter((n) => n.status === 'pending').length
    return { total, ok, warn, fail, pending }
})

const nextTestAt = computed(() => {
    void nowTick.value
    if (!lastSync.value) return null
    return new Date(lastSync.value.getTime() + TTL_MS)
})

const remainingMs = computed(() => {
    void nowTick.value
    if (!nextTestAt.value) return 0
    return Math.max(0, nextTestAt.value.getTime() - Date.now())
})

const canRetest = computed(() => remainingMs.value === 0 && !loading.value && !testing.value)

function statusIcon(s: RemoteNode['status']) {
    if (s === 'ok') return CheckCircle2
    if (s === 'warn') return AlertTriangle
    if (s === 'fail') return XCircle
    return Loader2
}

function statusColor(s: RemoteNode['status']) {
    if (s === 'ok') return 'text-accent'
    if (s === 'warn') return 'text-amber-500'
    if (s === 'fail') return 'text-red-500'
    return 'text-ink-400'
}

function isSpinning(s: RemoteNode['status']) {
    return s === 'pending'
}

function formatSync(d: Date | null) {
    if (!d) return '—'
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatRemaining(ms: number): string {
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${h}:${pad(m)}:${pad(s)}`
}

function onRetestClick() {
    if (!canRetest.value) return
    loadAndTest(true)
}
</script>

<template>
    <div>
        <section
            class="border-b border-ink-200 dark:border-ink-800 bg-gradient-to-b from-ink-100/40 to-transparent dark:from-ink-1000/40">
            <div class="container-page py-16 sm:py-20">
                <p class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                    节点 / NODES
                </p>
                <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
                    节点实时测速
                </h1>
                <p class="text-soft max-w-2xl leading-relaxed">
                    从 <a href="https://hubp.tbedu.top/nodes.json" target="_blank" rel="noreferrer"
                        class="text-brand-600 dark:text-brand-400 hover:underline">hubp.tbedu.top</a>
                    拉取节点列表，并行通过拼接
                    <code class="font-mono text-xs">icon128.png</code>
                    测速。结果按延迟升序排序。
                </p>
            </div>
        </section>

        <section class="container-page py-10">
            <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div class="flex items-center gap-2 text-xs text-soft font-mono flex-wrap">
                    <Activity class="h-3.5 w-3.5" />
                    数据源：
                    <code class="text-ink-700 dark:text-ink-300">hubp.tbedu.top/nodes.json</code>
                    <span v-if="lastSync" class="ml-1">· 同步于 {{ formatSync(lastSync) }}</span>
                    <span v-if="source === 'cache'" class="ml-1 text-accent">· 缓存</span>
                    <span v-else-if="source === 'fresh'" class="ml-1 text-brand-500">· 实时</span>
                </div>
                <button class="btn-secondary h-9 px-3 text-sm" :disabled="!canRetest" @click="onRetestClick">
                    <RefreshCw
                        :class="['h-3.5 w-3.5', (loading || testing) && 'animate-spin']" />
                    <span v-if="!canRetest && remainingMs > 0" class="flex items-center gap-1.5">
                        <Clock class="h-3 w-3" />
                        {{ formatRemaining(remainingMs) }}
                    </span>
                    <span v-else>重新测速</span>
                </button>
            </div>

            <p v-if="source === 'cache'" class="text-xs text-soft mb-4 flex items-center gap-2 font-mono">
                <Clock class="h-3.5 w-3.5" />
                5h 缓存命中，避免频繁测速。下次可重新测速：
                <span class="text-ink-700 dark:text-ink-300">{{ formatSync(nextTestAt) }}</span>
            </p>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                <div class="card p-4">
                    <div class="flex items-center gap-2 text-soft text-xs font-mono mb-1">
                        <Server class="h-3.5 w-3.5" />
                        节点总数
                    </div>
                    <p class="text-2xl font-semibold">{{ stats.total }}</p>
                </div>
                <div class="card p-4">
                    <div class="flex items-center gap-2 text-accent text-xs font-mono mb-1">
                        <CheckCircle2 class="h-3.5 w-3.5" />
                        可用
                    </div>
                    <p class="text-2xl font-semibold">{{ stats.ok }}</p>
                </div>
                <div class="card p-4">
                    <div class="flex items-center gap-2 text-amber-500 text-xs font-mono mb-1">
                        <AlertTriangle class="h-3.5 w-3.5" />
                        较慢
                    </div>
                    <p class="text-2xl font-semibold">{{ stats.warn }}</p>
                </div>
                <div class="card p-4">
                    <div class="flex items-center gap-2 text-red-500 text-xs font-mono mb-1">
                        <XCircle class="h-3.5 w-3.5" />
                        失败
                    </div>
                    <p class="text-2xl font-semibold">{{ stats.fail }}</p>
                </div>
                <div class="card p-4">
                    <div class="flex items-center gap-2 text-soft text-xs font-mono mb-1">
                        <Loader2 class="h-3.5 w-3.5" />
                        测速中
                    </div>
                    <p class="text-2xl font-semibold">{{ stats.pending }}</p>
                </div>
            </div>

            <div v-if="loading" class="card p-12 text-center text-soft text-sm">
                <Loader2 class="h-5 w-5 mx-auto mb-3 animate-spin" />
                正在拉取节点列表…
            </div>

            <div v-else-if="error" class="card p-6 text-center">
                <p class="text-red-500 mb-3">加载失败：{{ error }}</p>
                <button class="btn-secondary" @click="loadAndTest(false)">
                    <RefreshCw class="h-3.5 w-3.5" />
                    重试
                </button>
            </div>

            <div v-else class="card overflow-hidden">
                <div
                    class="grid grid-cols-12 px-3 sm:px-4 py-2.5 text-xs font-mono text-soft border-b border-ink-200 dark:border-ink-800 bg-ink-50/40 dark:bg-ink-1000/40">
                    <div class="col-span-1 sm:col-span-1">#</div>
                    <div class="col-span-7 sm:col-span-9 min-w-0">节点</div>
                    <div class="col-span-4 sm:col-span-2 text-right whitespace-nowrap">延迟 / ms</div>
                </div>
                <ul class="divide-y divide-ink-200 dark:divide-ink-800">
                    <li v-for="(n, i) in sortedNodes" :key="n.url"
                        class="grid grid-cols-12 items-center px-3 sm:px-4 py-2.5 text-sm hover:bg-ink-50/60 dark:hover:bg-ink-1000/60 transition-colors gap-2">
                        <div class="col-span-1 sm:col-span-1 font-mono text-xs text-soft">
                            {{ i + 1 }}
                        </div>
                        <div class="col-span-7 sm:col-span-9 font-mono text-[11px] sm:text-sm min-w-0 truncate" :title="n.name">
                            {{ n.name }}
                        </div>
                        <div class="col-span-4 sm:col-span-2 flex items-center justify-end gap-1 font-mono text-[11px] sm:text-xs whitespace-nowrap"
                            :class="statusColor(n.status)">
                            <component :is="statusIcon(n.status)"
                                :class="['h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0', isSpinning(n.status) && 'animate-spin']" />
                            <span v-if="n.ping !== null">{{ n.ping }} ms</span>
                            <span v-else-if="n.status === 'fail'">超时</span>
                            <span v-else>—</span>
                        </div>
                    </li>
                </ul>
            </div>

            <p class="text-xs text-soft mt-4 flex items-center gap-2">
                <Activity class="h-3.5 w-3.5" />
                测速通过 HEAD 请求拼接
                <code class="font-mono text-[11px]">icon128.png</code>
                完成。结果在 localStorage 缓存 5 小时。可能受 CORS / 浏览器缓存影响，数字仅供参考。
            </p>
        </section>
    </div>
</template>
