<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useExtensionBridge } from '@/composables/useExtensionBridge'
import {
    Activity,
    Server,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Loader2,
    RefreshCw,
    Clock,
    Puzzle,
    CircleDashed
} from 'lucide-vue-next'

interface RemoteNode {
    name: string
    url: string
    ping: number | null
    status: 'pending' | 'idle' | 'ok' | 'warn' | 'fail'
    verified: boolean | null
    failReason?: 'timeout' | 'http' | 'type' | 'hash' | 'network'
}

interface CacheItem {
    url: string
    ping: number | null
    status: 'ok' | 'warn' | 'fail'
    verified: boolean
    failReason?: 'timeout' | 'http' | 'type' | 'hash' | 'network'
}

interface Cache {
    v?: number
    t: number
    items: CacheItem[]
}

const NODES_JSON = 'https://hubp.tbedu.top/nodes.json'
// 与扩展 background.js 的 INTEGRITY_TEST 用同一份图标与云端哈希来源
const TEST_ICON =
    'https://raw.githubusercontent.com/hubporg/ghproxy-extension/refs/heads/main/src/icons/icon128.png'
const CLOUD_ICON = 'https://hubp.tbedu.top/icons/icon128.png'
// 云端图标不可用时的兜底哈希（与扩展内置逻辑等价）
const FALLBACK_ICON_HASH = '16fc4fc9a35221e5d865d9e51861ab44f19a553178785ea130e5e383c4cfa27e'
const ICON_HASH_KEY = 'hubp:icon-hash'
const ICON_HASH_TTL = 24 * 60 * 60 * 1000
const CACHE_KEY = 'hubp:nodes-cache'
const CACHE_VERSION = 2
const TTL_MS = 2 * 60 * 60 * 1000
const TEST_TIMEOUT = 5000

const { waitForState } = useExtensionBridge()

let expectedIconHash = FALLBACK_ICON_HASH

const nodes = ref<RemoteNode[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const testing = ref(false)
const lastSync = ref<Date | null>(null)
const source = ref<'cache' | 'fresh' | 'extension' | null>(null)

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

function writeCache(items: RemoteNode[], at = Date.now()): void {
    const cache: Cache = {
        v: CACHE_VERSION,
        t: at,
        items: items
            .filter((n) => n.status === 'ok' || n.status === 'warn' || n.status === 'fail')
            .map((n) => ({
                url: n.url,
                ping: n.ping,
                status: n.status as CacheItem['status'],
                verified: n.verified === true,
                failReason: n.failReason
            }))
    }
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch {
        /* quota exceeded / disabled */
    }
}

function isCacheFresh(c: Cache | null): c is Cache {
    return c !== null && c.v === CACHE_VERSION && Date.now() - c.t < TTL_MS
}

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', buf)
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

// 期望哈希优先从云端图标现算（与扩展一致），缓存 24h；失败时用内置哈希兜底
async function resolveExpectedIconHash() {
    try {
        const raw = localStorage.getItem(ICON_HASH_KEY)
        if (raw) {
            const cached = JSON.parse(raw) as { hash?: string; t?: number }
            if (
                cached &&
                typeof cached.hash === 'string' &&
                /^[a-f0-9]{64}$/.test(cached.hash) &&
                typeof cached.t === 'number' &&
                Date.now() - cached.t < ICON_HASH_TTL
            ) {
                expectedIconHash = cached.hash
                return
            }
        }
    } catch {
        /* ignore */
    }
    try {
        const res = await fetch(`${CLOUD_ICON}?t=${Date.now()}`, { cache: 'no-cache' })
        if (!res.ok) return
        const hash = await sha256Hex(await res.arrayBuffer())
        expectedIconHash = hash
        try {
            localStorage.setItem(ICON_HASH_KEY, JSON.stringify({ hash, t: Date.now() }))
        } catch {
            /* quota exceeded / disabled */
        }
    } catch {
        /* 保持内置兜底哈希 */
    }
}

async function measure(node: RemoteNode) {
    // 探测请求带时间戳，绕开 CDN / 浏览器对同一 URL 的缓存与去重
    const sep = TEST_ICON.includes('?') ? '&' : '?'
    const target = `${node.url}/${TEST_ICON}${sep}t=${Date.now()}`
    const t0 = performance.now()
    node.verified = null
    node.failReason = undefined
    let timedOut = false
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
        timedOut = true
        controller.abort()
    }, TEST_TIMEOUT)
    try {
        const res = await fetch(target, {
            method: 'GET',
            cache: 'no-cache',
            signal: controller.signal
        })
        if (!res.ok) {
            node.ping = null
            node.status = 'fail'
            node.verified = false
            node.failReason = 'http'
            return
        }
        const contentType = res.headers.get('Content-Type') || ''
        if (!contentType.includes('image')) {
            node.ping = null
            node.status = 'fail'
            node.verified = false
            node.failReason = 'type'
            return
        }
        const hash = await sha256Hex(await res.arrayBuffer())
        const ms = Math.round(performance.now() - t0)
        node.ping = ms
        node.verified = hash === expectedIconHash
        if (!node.verified) {
            // 内容哈希对不上：可能被劫持、返回了错误页，或节点篡改
            node.status = 'fail'
            node.failReason = 'hash'
            return
        }
        node.status = ms < 800 ? 'ok' : ms < 2000 ? 'warn' : 'fail'
    } catch {
        node.ping = null
        node.status = 'fail'
        node.verified = false
        node.failReason = timedOut ? 'timeout' : 'network'
    } finally {
        window.clearTimeout(timeout)
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
                status: (hit?.status ?? 'idle') as RemoteNode['status'],
                verified: hit?.verified ?? null,
                failReason: hit?.failReason
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
            status: 'pending' as const,
            verified: null
        }))
}

// 扩展 2 小时内测过速就直接复用它的结果（扩展侧已做过 SHA-256 校验）
async function takeExtensionResult(list: string[]): Promise<{ nodes: RemoteNode[]; testedAt: Date } | null> {
    const ext = await waitForState()
    if (!ext || !ext.nodes.length || !ext.nodesTestedAt) return null
    if (Date.now() - ext.nodesTestedAt >= TTL_MS) return null

    const latencyByUrl = new Map(ext.nodes.map((n) => [normalizeUrl(n.url), n.latency]))
    let matched = 0
    const nodes: RemoteNode[] = list
        .filter((s) => typeof s === 'string' && s.trim().length > 0)
        .map((name) => {
            const url = normalizeUrl(name)
            const latency = latencyByUrl.get(url)
            if (latency === undefined) {
                return { name: name.trim(), url, ping: null, status: 'idle' as const, verified: null }
            }
            matched++
            const ms = Math.max(0, Math.round(latency))
            return {
                name: name.trim(),
                url,
                ping: ms,
                status: ms < 800 ? 'ok' : ms < 2000 ? 'warn' : ('fail' as const),
                verified: true
            }
        })
    if (!matched) return null
    return { nodes, testedAt: new Date(ext.nodesTestedAt) }
}

async function loadAndTest(force = false) {
    loading.value = true
    error.value = null
    try {
        await resolveExpectedIconHash()
        const list = await loadNodes()
        const cache = readCache()
        const fresh = !force && isCacheFresh(cache)

        if (fresh) {
            nodes.value = applyCacheTo(list, cache)
            lastSync.value = new Date(cache.t)
            source.value = 'cache'
        } else {
            const ext = force ? null : await takeExtensionResult(list)
            if (ext) {
                nodes.value = ext.nodes
                lastSync.value = ext.testedAt
                source.value = 'extension'
                writeCache(ext.nodes, ext.testedAt.getTime())
            } else {
                nodes.value = applyFreshTo(list)
                if (nodes.value.length === 0) {
                    error.value = '远端节点列表为空'
                } else {
                    await runTests()
                    source.value = 'fresh'
                }
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
    const pending = nodes.value.filter((n) => n.status === 'pending' || n.status === 'idle').length
    return { total, ok, warn, fail, pending }
})

const canRetest = computed(() => !loading.value && !testing.value)

function statusIcon(s: RemoteNode['status']) {
    if (s === 'ok') return CheckCircle2
    if (s === 'warn') return AlertTriangle
    if (s === 'fail') return XCircle
    if (s === 'idle') return CircleDashed
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

function failText(n: RemoteNode): string {
    if (n.failReason === 'hash') return '校验失败'
    if (n.failReason === 'timeout') return '超时'
    if (n.failReason === 'http' || n.failReason === 'type' || n.failReason === 'network') return '请求失败'
    return '失败'
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
                    拉取节点列表，对每个节点 GET 拉取
                    <code class="font-mono text-xs">icon128.png</code>
                    并校验内容 SHA-256 与云端图标一致，通过后按延迟升序排序。
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
                    <span v-else-if="source === 'extension'" class="ml-1 text-brand-500">· 来自扩展</span>
                    <span v-else-if="source === 'fresh'" class="ml-1 text-brand-500">· 实时</span>
                </div>
                <button class="btn-secondary h-9 px-3 text-sm" :disabled="!canRetest" @click="onRetestClick">
                    <RefreshCw
                        :class="['h-3.5 w-3.5', (loading || testing) && 'animate-spin']" />
                    <span>{{ testing ? '测速中' : '重新测速' }}</span>
                </button>
            </div>

            <p v-if="source === 'cache'" class="text-xs text-soft mb-4 flex items-center gap-2 font-mono">
                <Clock class="h-3.5 w-3.5" />
                2h 缓存命中（{{ formatSync(lastSync) }}），可直接复用；也可以随时手动重新测速。
            </p>

            <p v-if="source === 'extension'" class="text-xs text-soft mb-4 flex items-center gap-2 font-mono">
                <Puzzle class="h-3.5 w-3.5" />
                来自浏览器扩展（{{ formatSync(lastSync) }} 测速，已做内容校验），可直接复用；也可以随时手动重新测速。
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
                    <div class="flex items-center gap-2 text-emerald-500 text-xs font-mono mb-1">
                        <CheckCircle2 class="h-3.5 w-3.5" />
                        可用
                    </div>
                    <p class="text-2xl font-semibold">{{ stats.ok }}</p>
                </div>
                <div class="card p-4">
                    <div class="flex items-center gap-2 text-orange-500 text-xs font-mono mb-1">
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
                        待测
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
                            <span v-if="n.failReason">{{ failText(n) }}</span>
                            <span v-else-if="n.ping !== null">{{ n.ping }} ms</span>
                            <span v-else>—</span>
                        </div>
                    </li>
                </ul>
            </div>

            <p class="text-xs text-soft mt-4 flex items-center gap-2">
                <Activity class="h-3.5 w-3.5" />
                GET 拉取
                <code class="font-mono text-[11px]">icon128.png</code>
                并做 SHA-256 完整性校验（与扩展同逻辑），内容不一致的节点直接判失败。结果在 localStorage 缓存 2 小时。
            </p>
        </section>
    </div>
</template>
