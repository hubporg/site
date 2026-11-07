import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 浏览器扩展 ↔ 网站桥接。
 *
 * 扩展的 content script 在 www.hubp.org 页面里通过 window.postMessage 广播
 * 自己的本地状态（节点测速结果、计数），网站只读、不回写，也不上传。
 * 协议：{ __ghAccelSite: true, type: 'state', payload }
 */

export interface ExtensionNode {
    url: string
    latency: number
}

export interface ExtensionState {
    version: string
    privacyAccepted: boolean
    nodes: ExtensionNode[]
    nodesTestedAt: number | null
    bestNode: { url: string; latency: number; timestamp: number } | null
    counts: { jumps: number; installs: number }
}

const NETWORK_TIMEOUT = 900

function isValidUrl(value: unknown): value is string {
    return typeof value === 'string' && value.length < 2048 && /^https?:\/\//i.test(value)
}

function parseState(payload: unknown): ExtensionState | null {
    if (!payload || typeof payload !== 'object') return null
    const p = payload as Record<string, unknown>
    const rawNodes = Array.isArray(p.nodes) ? p.nodes : []
    const nodes: ExtensionNode[] = []
    for (const item of rawNodes.slice(0, 500)) {
        if (!item || typeof item !== 'object') continue
        const n = item as Record<string, unknown>
        if (!isValidUrl(n.url) || typeof n.latency !== 'number' || !Number.isFinite(n.latency)) continue
        nodes.push({ url: n.url, latency: Math.max(0, Math.round(n.latency)) })
    }
    const best = p.bestNode && typeof p.bestNode === 'object' ? (p.bestNode as Record<string, unknown>) : null
    const counts = p.counts && typeof p.counts === 'object' ? (p.counts as Record<string, unknown>) : {}
    return {
        version: typeof p.version === 'string' ? p.version.slice(0, 24) : '',
        privacyAccepted: p.privacyAccepted === true,
        nodes,
        nodesTestedAt:
            typeof p.nodesTestedAt === 'number' && p.nodesTestedAt > 0 ? p.nodesTestedAt : null,
        bestNode:
            best && isValidUrl(best.url) && typeof best.latency === 'number'
                ? {
                      url: best.url,
                      latency: Math.round(best.latency),
                      timestamp: typeof best.timestamp === 'number' ? best.timestamp : 0
                  }
                : null,
        counts: {
            jumps: Math.max(0, Math.floor(Number(counts.jumps) || 0)),
            installs: Math.max(0, Math.floor(Number(counts.installs) || 0))
        }
    }
}

export function useExtensionBridge() {
    const state = ref<ExtensionState | null>(null)
    let retryTimer: number | undefined

    function request() {
        try {
            window.postMessage({ __ghAccelSite: true, type: 'request' }, window.location.origin)
        } catch {
            /* ignore */
        }
    }

    function onMessage(event: MessageEvent) {
        if (event.source !== window) return
        const data = event.data as Record<string, unknown> | null
        if (!data || data.__ghAccelSite !== true) return
        if (data.type === 'state') {
            const next = parseState(data.payload)
            if (next) state.value = next
        }
    }

    onMounted(() => {
        window.addEventListener('message', onMessage)
        request()
        // content script 在 document_idle 注入，可能晚于页面挂载
        retryTimer = window.setTimeout(request, 700)
    })

    onUnmounted(() => {
        window.removeEventListener('message', onMessage)
        if (retryTimer) window.clearTimeout(retryTimer)
    })

    /** 等扩展响应一小段时间（首次访问时页面脚本通常晚于页面挂载注入） */
    function waitForState(timeout = NETWORK_TIMEOUT): Promise<ExtensionState | null> {
        if (state.value) return Promise.resolve(state.value)
        return new Promise((resolve) => {
            const started = Date.now()
            const tick = () => {
                if (state.value) return resolve(state.value)
                if (Date.now() - started >= timeout) return resolve(null)
                window.setTimeout(tick, 80)
            }
            tick()
        })
    }

    return { state, waitForState }
}
