<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { TrendingUp, Loader2, AlertCircle, TriangleAlert } from 'lucide-vue-next'

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
// 判定疑似刷量时的绝对门槛：跳转和安装的量级差一个数量级
const ANOMALY_ABS_FLOOR: Record<Metric, number> = { jumps: 3000, installs: 1000 }
const ANOMALY_RATIO = 6
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

function median(values: number[]) {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = sorted.length >> 1
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// 疑似刷量检测：接口返回的是累计快照，先差分出每日新增，再和此前 7 天的日增中位数比较
const anomaly = computed(() => {
    const values = rows.value.map((r) => r.total)
    if (values.length < 9) return null
    const deltas: number[] = []
    for (let i = 1; i < values.length; i++) deltas.push(values[i] - values[i - 1])
    const floor = ANOMALY_ABS_FLOOR[metric.value]
    let latest: { date: string; delta: number; baseline: number; ratio: number } | null = null
    for (let i = 7; i < deltas.length; i++) {
        const baseline = median(deltas.slice(i - 7, i))
        const delta = deltas[i]
        // 绝对增量够大，且远超近期常态，才判为疑似刷量
        if (delta >= floor && delta >= baseline * ANOMALY_RATIO) {
            latest = {
                date: records.value[i + 1].date,
                delta,
                baseline,
                ratio: delta / Math.max(1, baseline)
            }
        }
    }
    return latest
})

const anomalyText = computed(() => {
    const a = anomaly.value
    if (!a) return null
    return {
        date: a.date,
        label: metrics.find((m) => m.key === metric.value)?.label ?? '',
        delta: Math.round(a.delta).toLocaleString(),
        ratio: a.ratio >= 10 ? String(Math.round(a.ratio)) : a.ratio.toFixed(1)
    }
})

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

// 提示框跟随指针：水平跟手、垂直自动躲到折线另一侧，避免固定位置挡住折线
const tipEl = ref<HTMLDivElement | null>(null)
const tipPos = ref<{ left: number; top: number; below: boolean; touch: boolean } | null>(null)
// 记录当前朝向，折线中点附近加一点迟滞，避免指针微动时提示框上下抖动
let lastBelow: boolean | null = null

function onMove(e: PointerEvent) {
    const n = records.value.length
    const svg = e.currentTarget as SVGSVGElement
    const rect = svg.getBoundingClientRect()
    if (n < 2 || rect.width === 0 || rect.height === 0) return

    const xs = ((e.clientX - rect.left) * W) / rect.width
    const ratio = (xs - PAD.left) / plotW
    const i = Math.round(ratio * (n - 1))
    hoverIndex.value = Math.min(n - 1, Math.max(0, i))

    // 指针在图表内的归一化位置（0~1），用于提示框定位
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    const pointerY = y * H

    // 折线整体在指针上方就把提示框放到下方，反之放上方
    const ys = display.value.map((s) => yAt(s.values[i] ?? 0))
    const lineMid = ys.length ? (Math.min(...ys) + Math.max(...ys)) / 2 : pointerY
    let below: boolean
    if (lastBelow === null || Math.abs(pointerY - lineMid) > 12) {
        below = lineMid < pointerY
    } else {
        below = lastBelow
    }

    // 贴近上下边界时反向，避免提示框超出图表
    const tipH = tipEl.value?.offsetHeight ?? 96
    const spaceAbove = y * rect.height
    const spaceBelow = (1 - y) * rect.height
    if (below && spaceBelow < tipH + 16) below = false
    if (!below && spaceAbove < tipH + 16) below = true

    // 触屏优先放在手指上方，手指本身会挡住指针位置
    const touch = e.pointerType === 'touch'
    if (touch && spaceAbove >= tipH + 16) below = false

    lastBelow = below
    tipPos.value = { left: x * 100, top: y * 100, below, touch }
}

function onLeave() {
    hoverIndex.value = null
    tipPos.value = null
    lastBelow = null
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
            <svg :viewBox="`0 0 ${W} ${H}`" data-chart-svg class="w-full h-auto text-ink-200 dark:text-ink-800"
                @pointermove="onMove" @pointerdown="onMove" @pointerleave="onLeave">
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

            <div v-if="hover && tipPos" ref="tipEl" data-chart-tooltip
                class="pointer-events-none absolute z-10 rounded-lg border border-ink-200 dark:border-ink-800 bg-white/95 dark:bg-ink-950/95 backdrop-blur px-3 py-2 text-xs shadow-soft"
                :style="{
                    left: `clamp(104px, ${tipPos.left}%, calc(100% - 104px))`,
                    top: `${tipPos.top}%`,
                    transform: `translate(-50%, ${tipPos.below ? '12px' : tipPos.touch ? 'calc(-100% - 40px)' : 'calc(-100% - 12px)'})`
                }">
                <p class="font-mono text-soft mb-1">{{ hover.date }}</p>
                <p v-for="p in hover.points" :key="'tip-' + p.key" class="font-mono flex items-center gap-1.5">
                    <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: p.color }" />
                    {{ p.label }} {{ p.value.toLocaleString() }}
                </p>
            </div>
        </div>

        <div v-if="anomalyText" data-chart-anomaly
            class="mt-3 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            <TriangleAlert class="h-3.5 w-3.5 mt-[1px] flex-shrink-0" />
            <p class="leading-relaxed">
                疑似接口被刷量：{{ anomalyText.date }}「{{ anomalyText.label }}」单日新增 <span class="font-mono">{{ anomalyText.delta }}</span>，约为近期常态的 {{ anomalyText.ratio }} 倍，折线趋势仅供参考。
            </p>
        </div>

        <p class="text-xs text-soft mt-3 font-mono">
            数据源 hubp.tbedu.top/last60days.json · 每日累计快照 · 本地缓存 1 小时
        </p>
    </div>
</template>
