import { computed, onMounted, ref } from 'vue'

/**
 * 全站公告。
 *
 * 数据源：https://hubp.tbedu.top/announcements.json
 * 结构：
 * {
 *   "items": [
 *     {
 *       "id": "2026-11-08-node-maintenance",
 *       "level": "warning",            // info | warning | critical（默认 info）
 *       "title": "部分节点维护中",
 *       "content": "……",               // 可选，一行摘要
 *       "link": "https://…",           // 可选，只允许 http(s)
 *       "linkText": "查看详情",         // 可选
 *       "target": "both",              // 可选：site 仅官网 / extension 仅扩展 / both 两者（默认）
 *       "startAt": "2026-11-08T00:00:00+08:00",  // 可选
 *       "endAt": "2026-11-10T00:00:00+08:00",    // 可选，过期自动隐藏
 *       "dismissible": true            // 可选，默认 true
 *     }
 *   ]
 * }
 *
 * 取第一条生效且未被关闭的公告展示；关闭记录存在 localStorage，
 * 换 id 就会重新出现。任何网络/格式问题都静默降级，不影响页面。
 */

export type AnnouncementLevel = 'info' | 'warning' | 'critical'
export type AnnouncementTarget = 'site' | 'extension' | 'both'

export interface Announcement {
    id: string
    level: AnnouncementLevel
    title: string
    content?: string
    link?: string
    linkText?: string
    target: AnnouncementTarget
    startAt?: number
    endAt?: number
    dismissible: boolean
}

const SOURCE = 'https://hubp.tbedu.top/announcements.json'
const DISMISS_KEY = 'hubp:announcements:dismissed'
const MAX_ITEMS = 20

const items = ref<Announcement[]>([])
const dismissed = ref<string[]>([])
const loading = ref(false)
let started = false

function readDismissed(): string[] {
    try {
        const raw = localStorage.getItem(DISMISS_KEY)
        const arr = raw ? (JSON.parse(raw) as unknown) : []
        return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string').slice(-50) : []
    } catch {
        return []
    }
}

function parseLevel(value: unknown): AnnouncementLevel {
    return value === 'warning' || value === 'critical' ? value : 'info'
}

function parseText(value: unknown, max: number): string | undefined {
    if (typeof value !== 'string') return undefined
    const text = value.trim()
    return text && text.length <= max ? text : undefined
}

function parseLink(value: unknown): string | undefined {
    if (typeof value !== 'string' || value.length > 2048) return undefined
    return /^https?:\/\//i.test(value) ? value : undefined
}

function parseDate(value: unknown): number | undefined {
    if (typeof value !== 'string') return undefined
    const time = Date.parse(value)
    return Number.isFinite(time) ? time : undefined
}

function sanitize(raw: unknown): Announcement | null {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    const id = typeof r.id === 'string' ? r.id.trim() : ''
    const title = typeof r.title === 'string' ? r.title.trim() : ''
    if (!id || !title || id.length > 120 || title.length > 200) return null
    return {
        id,
        level: parseLevel(r.level),
        title,
        content: parseText(r.content, 500),
        link: parseLink(r.link),
        linkText: parseText(r.linkText, 40),
        target: r.target === 'site' || r.target === 'extension' ? r.target : 'both',
        startAt: parseDate(r.startAt),
        endAt: parseDate(r.endAt),
        dismissible: r.dismissible !== false
    }
}

function isActive(a: Announcement, now: number): boolean {
    if (a.startAt && a.startAt > now) return false
    if (a.endAt && a.endAt < now) return false
    return true
}

const current = computed(() => {
    const now = Date.now()
    return (
        items.value.find(
            (a) => a.target !== 'extension' && isActive(a, now) && !dismissed.value.includes(a.id)
        ) ?? null
    )
})

async function load() {
    if (started) return
    started = true
    loading.value = true
    try {
        const res = await fetch(`${SOURCE}?t=${Date.now()}`, { cache: 'no-cache' })
        if (!res.ok) return
        const json = (await res.json()) as { items?: unknown }
        const list = Array.isArray(json?.items) ? json.items : []
        items.value = list
            .map(sanitize)
            .filter((a): a is Announcement => a !== null)
            .sort((a, b) => (b.startAt ?? 0) - (a.startAt ?? 0))
            .slice(0, MAX_ITEMS)
    } catch {
        /* 公告不可用不影响页面 */
    } finally {
        loading.value = false
    }
}

function dismiss(id: string) {
    if (dismissed.value.includes(id)) return
    dismissed.value = [...dismissed.value, id].slice(-50)
    try {
        localStorage.setItem(DISMISS_KEY, JSON.stringify(dismissed.value))
    } catch {
        /* quota exceeded / disabled */
    }
}

export function useAnnouncements() {
    if (!started) {
        dismissed.value = readDismissed()
        onMounted(load)
    }
    return { current, loading, dismiss }
}
