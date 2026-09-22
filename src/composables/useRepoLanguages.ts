import { ref, computed, onMounted, toValue, type MaybeRefOrGetter } from 'vue'

export interface LanguageSegment {
    name: string
    percent: number
    color: string
}

interface CacheEntry {
    t: number
    data: Record<string, number>
}

const TTL_MS = 60 * 60 * 1000
const CACHE_PREFIX = 'hubp:repo-langs:'
const API_BASE = 'https://api.github.com/repos'

const LANGUAGE_COLORS: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Vue: '#41b883',
    Svelte: '#ff3e00',
    Python: '#3572A5',
    PowerShell: '#012456',
    Shell: '#89e051',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    JSON: '#292929',
    YAML: '#cb171e',
    Markdown: '#083fa1',
    Dockerfile: '#384d54',
    Makefile: '#427819'
}

const FALLBACK_COLOR = '#8b949e'

function colorFor(name: string): string {
    return LANGUAGE_COLORS[name] ?? FALLBACK_COLOR
}

const inflight = new Map<string, Promise<Record<string, number>>>()

function readCache(repo: string): CacheEntry | null {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + repo)
        if (!raw) return null
        const c = JSON.parse(raw) as CacheEntry
        if (!c || typeof c.t !== 'number' || typeof c.data !== 'object' || c.data === null) {
            return null
        }
        return c
    } catch {
        return null
    }
}

function writeCache(repo: string, data: Record<string, number>): void {
    try {
        localStorage.setItem(CACHE_PREFIX + repo, JSON.stringify({ t: Date.now(), data }))
    } catch {
        /* quota exceeded / disabled */
    }
}

async function fetchLanguages(repo: string): Promise<Record<string, number>> {
    const cached = readCache(repo)
    if (cached && Date.now() - cached.t < TTL_MS) return cached.data

    const existing = inflight.get(repo)
    if (existing) return existing

    const task = (async () => {
        const res = await fetch(`${API_BASE}/${repo}/languages`, {
            headers: { Accept: 'application/vnd.github+json' }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as Record<string, number>
        writeCache(repo, data)
        return data
    })()

    inflight.set(repo, task)
    try {
        return await task
    } finally {
        inflight.delete(repo)
    }
}

export function useRepoLanguages(repo: MaybeRefOrGetter<string>) {
    const data = ref<Record<string, number> | null>(null)
    const loading = ref(true)
    const error = ref<string | null>(null)

    async function load() {
        loading.value = true
        error.value = null
        try {
            data.value = await fetchLanguages(toValue(repo))
        } catch (e) {
            error.value = e instanceof Error ? e.message : '加载失败'
        } finally {
            loading.value = false
        }
    }

    onMounted(load)

    const segments = computed<LanguageSegment[]>(() => {
        const d = data.value
        if (!d) return []
        const total = Object.values(d).reduce((a, b) => a + b, 0)
        if (!total) return []
        return Object.entries(d)
            .map(([name, bytes]) => ({
                name,
                percent: Math.round((bytes / total) * 1000) / 10,
                color: colorFor(name)
            }))
            .sort((a, b) => b.percent - a.percent)
    })

    return { data, loading, error, segments, reload: load }
}
