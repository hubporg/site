<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { TrendingUp, Loader2, AlertCircle } from 'lucide-vue-next'

interface BrowserCount {
    chromium?: number
    firefox?: number
}

interface DayRecord {
    date: string
    data: {
        total_jumps: number
        total_installs: number
        jumps_by_browser?: BrowserCount
        installs_by_browser?: BrowserCount
        jumps_by_version?: Record<string, number>
        installs_by_version?: Record<string, number>
    }
}

interface Payload {
    records: DayRecord[]
}

type Metric = 'jumps' | 'installs'
type Dimension = 'browser' | 'version'

interface Row {
    total: number
    chromium: number
    firefox: number
    byVersion: Record<string, number>
}

interface Series {
    key: string
    label: string
    color: string
    values: number[]
}

interface AnimSeries extends Series {
    opacity: number
}

const URL = 'https://hubp.tbedu.top/last60days.json'
const CACHE_KEY = 'hubp:last60days'
const TTL_MS = 60 * 60 * 1000
const DUR = 650

const TOTAL_COLOR = '#3B82F6'
const VERSION_COLORS = ['#8B5CF6', '#06B6D4', '#F97316', '#EC4899', '#14B8A6', '#EAB308']

const metrics: { key: Metric; label: string }[] = [
    { key: 'jumps', label: '加速跳转' },
    { key: 'installs', label: '安装更新' }
]
const dimensions: { key: Dimension; label: string }[] = [
    { key: 'browser', label: '按浏览器' },
    { key: 'version', label: '按版本' }
]

const records = ref<DayRecord[]>([])
const metric = ref<Metric>('jumps')
const dimension = ref<Dimension>('browser')
const loading = ref(true)
const error = ref<string | null>(null)
const hoverIndex = ref<number | null>(null)

function readCache(): { t: number; records: DayRecord[] } | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null
        const c = JSON.parse(raw) as { t: number; records: DayRecord[] }
        if (!c || typeof c.t !== 'number' || !Array.isArray(c.records)) return null
        return c
    } catch {
        return null
    }
}

async function load() {
    loading.value = true
    error.value = null
    try {
        const cached = readCache()
        if (cached && Date.now() - cached.t < TTL_MS) {
            records.value = cached.records
            return
        }
        const res = await fetch(URL, { cache: 'no-cache' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as Payload
        const list = Array.isArray(json.records) ? json.records : []
        records.value = list
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), records: list }))
        } catch {
            /* quota exceeded / disabled */
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : '加载失败'
    } finally {
        loading.value = false
    }
}

onMounted(load)

const rows = computed<Row[]>(() =>
    records.value.map((r) => {
        if (metric.value === 'jumps') {
            return {
                total: r.data.total_jumps ?? 0,
                chromium: r.data.jumps_by_browser?.chromium ?? 0,
                firefox: r.data.jumps_by_browser?.firefox ?? 0,
                byVersion: r.data.jumps_by_version ?? {}
            }
        }
        return {
            total: r.data.total_installs ?? 0,
            chromium: r.data.installs_by_browser?.chromium ?? 0,
            firefox: r.data.installs_by_browser?.firefox ?? 0,
            byVersion: r.data.installs_by_version ?? {}
        }
    })
)

function compareSemver(a: string, b: string) {
    const pa = a.split('.').map(Number)
    const pb = b.split('.').map(Number)
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const diff = (pa[i] || 0) - (pb[i] || 0)
        if (diff !== 0) return diff
    }
    return 0
}

const versions = computed(() => {
    const set = new Set<string>()
    for (const r of rows.value) {
        for (const v of Object.keys(r.byVersion)) set.add(v)
    }
    return [...set].sort(compareSemver)
})

const series = computed<Series[]>(() => {
    const list: Series[] = [
        { key: 'total', label: '合计', color: TOTAL_COLOR, values: rows.value.map((r) => r.total) }
    ]
    if (dimension.value === 'browser') {
        list.push(
            { key: 'chromium', label: 'Chromium', color: '#A855F7', values: rows.value.map((r) => r.chromium) },
            { key: 'firefox', label: 'Firefox', color: '#F97316', values: rows.value.map((r) => r.firefox) }
        )
    } else {
        versions.value.forEach((v, i) => {
            list.push({
                key: 'v' + v,
                label: 'v' + v,
                color: VERSION_COLORS[i % VERSION_COLORS.length],
                values: rows.value.map((r) => r.byVersion[v] ?? 0)
            })
        })
    }
    return list
})

const maxYTarget = computed(() => Math.max(1, ...series.value.flatMap((s) => s.values)))

// 动画渲染态：切换指标/维度时在数值间插值，形成上下浮动过渡
const display = ref<AnimSeries[]>([])
const displayMaxY = ref(1)
let raf = 0

const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)

function animateTo(target: Series[], targetMax: number) {
    cancelAnimationFrame(raf)
    const prev = new Map(display.value.map((s) => [s.key, s]))
    const targetKeys = new Set(target.map((s) => s.key))

    const items = target.map((t) => {
        const cur = prev.get(t.key)
        return {
            key: t.key,
            label: t.label,
            color: t.color,
            fromValues: cur ? cur.values.slice() : t.values.slice(),
            toValues: t.values.slice(),
            fromOpacity: cur ? cur.opacity : 0,
            toOpacity: 1
        }
    })
    for (const cur of display.value) {
        if (!targetKeys.has(cur.key)) {
            items.push({
                key: cur.key,
                label: cur.label,
                color: cur.color,
                fromValues: cur.values.slice(),
                toValues: cur.values.slice(),
                fromOpacity: cur.opacity,
                toOpacity: 0
            })
        }
    }

    const first = display.value.length === 0
    const fromMax = first ? targetMax : displayMaxY.value
    const start = performance.now()

    const step = (now: number) => {
        const p = Math.min(1, (now - start) / DUR)
        const e = easeInOut(p)
        displayMaxY.value = fromMax + (targetMax - fromMax) * e
        display.value = items.map((it) => ({
            key: it.key,
            label: it.label,
            color: it.color,
            opacity: it.fromOpacity + (it.toOpacity - it.fromOpacity) * e,
            values: it.fromValues.map((v, i) => v + (it.toValues[i] - v) * e)
        }))
        if (p < 1) {
            raf = requestAnimationFrame(step)
        } else {
            display.value = items
                .filter((it) => it.toOpacity > 0)
                .map((it) => ({
                    key: it.key,
                    label: it.label,
                    color: it.color,
                    opacity: it.toOpacity,
                    values: it.toValues
                }))
            displayMaxY.value = targetMax
        }
    }
    raf = requestAnimationFrame(step)
}

watch(series, (next) => animateTo(next, maxYTarget.value))

onUnmounted(() => cancelAnimationFrame(raf))

const W = 760
const H = 260
const PAD = { top: 18, right: 20, bottom: 30, left: 56 }
const plotW = W - PAD.left - PAD.right
const plotH = H - PAD.top - PAD.bottom

function xAt(i: number, n: number) {
    return PAD.left + (n <= 1 ? 0 : (i * plotW) / (n - 1))
}

function yAt(v: number) {
    return PAD.top + plotH * (1 - v / displayMaxY.value)
}

function linePath(values: number[]) {
    const n = values.length
    if (!n) return ''
    return values
        .map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i, n).toFixed(1)} ${yAt(v).toFixed(1)}`)
        .join(' ')
}

function compact(n: number) {
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k'
    return String(Math.round(n))
}

function shortDate(d: string) {
    const parts = d.split('-')
    return parts.length === 3 ? `${parts[1]}/${parts[2]}` : d
}

const gridLines = computed(() => {
    const lines: { y: number; label: string }[] = []
    for (let i = 0; i <= 4; i++) {
        lines.push({
            y: PAD.top + (plotH * i) / 4,
            label: compact(displayMaxY.value * (1 - i / 4))
        })
    }
    return lines
})

const xLabels = computed(() => {
    const n = records.value.length
    if (!n) return []
    const idxs = [0, Math.round((n - 1) / 4), Math.round((n - 1) / 2), Math.round((3 * (n - 1)) / 4), n - 1]
    return [...new Set(idxs)].map((i) => ({ x: xAt(i, n), label: shortDate(records.value[i].date) }))
})

const hover = computed(() => {
    const i = hoverIndex.value
    if (i === null || !records.value[i]) return null
    return {
        x: xAt(i, records.value.length),
        date: records.value[i].date,
        points: display.value.map((s) => ({
            key: s.key,
            label: s.label,
            color: s.color,
            value: Math.round(s.values[i] ?? 0),
            y: yAt(s.values[i] ?? 0)
        }))
    }
})

const tooltipLeft = computed(() => {
    if (!hover.value) return '0%'
    const pct = (hover.value.x / W) * 100
    return `${Math.min(92, Math.max(8, pct))}%`
})

function onMove(e: MouseEvent) {
    const n = records.value.length
    if (n < 2) return
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
    const xs = ((e.clientX - rect.left) * W) / rect.width
    const ratio = (xs - PAD.left) / plotW
    const i = Math.round(ratio * (n - 1))
    hoverIndex.value = Math.min(n - 1, Math.max(0, i))
}
</script>

<template>
    <div class="card p-5">
        <div class="flex flex-wrap items-center gap-2 mb-3">
            <div class="flex items-center gap-2 mr-auto">
                <TrendingUp class="h-4 w-4 text-brand-500" />
                <h3 class="text-sm font-semibold">近 60 天增长趋势</h3>
            </div>
            <div class="flex items-center gap-1 rounded-md border border-ink-200 dark:border-ink-800 p-0.5 text-xs">
                <button v-for="m in metrics" :key="m.key" class="px-2.5 py-1 rounded transition-colors"
                    :class="metric === m.key
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'text-soft hover:text-ink-900 dark:hover:text-ink-100'"
                    @click="metric = m.key">
                    {{ m.label }}
                </button>
            </div>
            <div class="flex items-center gap-1 rounded-md border border-ink-200 dark:border-ink-800 p-0.5 text-xs">
                <button v-for="d in dimensions" :key="d.key" class="px-2.5 py-1 rounded transition-colors"
                    :class="dimension === d.key
                        ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                        : 'text-soft hover:text-ink-900 dark:hover:text-ink-100'"
                    @click="dimension = d.key">
                    {{ d.label }}
                </button>
            </div>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-xs font-mono text-soft mb-3">
            <span v-for="s in series" :key="s.key" class="inline-flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: s.color }" />
                {{ s.label }} {{ (s.values.at(-1) ?? 0).toLocaleString() }}
            </span>
        </div>

        <div v-if="loading" class="h-[220px] flex items-center justify-center text-soft text-sm gap-2">
            <Loader2 class="h-4 w-4 animate-spin" />
            正在加载趋势数据…
        </div>
        <div v-else-if="error" class="h-[220px] flex items-center justify-center text-soft text-sm gap-2">
            <AlertCircle class="h-4 w-4 text-orange-500" />
            趋势数据暂不可用（{{ error }}）
        </div>

        <div v-else class="relative">
            <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto text-ink-200 dark:text-ink-800"
                @mousemove="onMove" @mouseleave="hoverIndex = null">
                <g>
                    <line v-for="(g, i) in gridLines" :key="'grid' + i" :x1="PAD.left" :x2="W - PAD.right"
                        :y1="g.y" :y2="g.y" stroke="currentColor" stroke-width="1" />
                </g>

                <g class="fill-ink-400 font-mono" font-size="10">
                    <text v-for="(g, i) in gridLines" :key="'yl' + i" :x="PAD.left - 8" :y="g.y + 3"
                        text-anchor="end">{{ g.label }}</text>
                </g>

                <path v-for="s in display" :key="'line-' + s.key" :d="linePath(s.values)" fill="none"
                    :stroke="s.color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"
                    :style="{ opacity: s.opacity }" vector-effect="non-scaling-stroke" />

                <g class="fill-ink-400 font-mono" font-size="10">
                    <text v-for="(l, i) in xLabels" :key="'xl' + i" :x="l.x" :y="H - 10"
                        text-anchor="middle">{{ l.label }}</text>
                </g>

                <g v-if="hover">
                    <line :x1="hover.x" :x2="hover.x" :y1="PAD.top" :y2="PAD.top + plotH" stroke="currentColor"
                        stroke-width="1" stroke-dasharray="3 3" />
                    <circle v-for="p in hover.points" :key="'dot-' + p.key" :cx="hover.x" :cy="p.y" r="3.5"
                        :fill="p.color" :style="{ opacity: p.value === 0 ? 0.35 : 1 }" />
                </g>
            </svg>

            <div v-if="hover"
                class="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-ink-200 dark:border-ink-800 bg-white/95 dark:bg-ink-950/95 backdrop-blur px-3 py-2 text-xs shadow-soft"
                :style="{ left: tooltipLeft }">
                <p class="font-mono text-soft mb-1">{{ hover.date }}</p>
                <p v-for="p in hover.points" :key="'tip-' + p.key" class="font-mono flex items-center gap-1.5">
                    <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: p.color }" />
                    {{ p.label }} {{ p.value.toLocaleString() }}
                </p>
            </div>
        </div>

        <p class="text-xs text-soft mt-3 font-mono">
            数据源 hubp.tbedu.top/last60days.json · 每日累计快照 · 本地缓存 1 小时
        </p>
    </div>
</template>
