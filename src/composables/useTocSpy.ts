import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 侧边目录滚动跟随。
 *
 * - 用滚动位置判断"哪个标题已经滚到顶部阈值之上"，比 IntersectionObserver 更稳定，
 *   也不会出现一屏内两个标题同时可见时高亮乱跳。
 * - `offset` 取固定导航栏高度 + 视觉留白，与 sticky 目录的 top 保持一致。
 */
export function useTocSpy(ids: string[], offset = 96) {
    const activeId = ref(ids[0] ?? '')
    let ticking = false
    // 点击目录后平滑滚动期间锁定高亮，避免沿途标题逐个闪过高亮
    let lockUntil = 0

    function measure() {
        ticking = false
        if (Date.now() < lockUntil) return

        let current = ids[0] ?? ''
        for (const id of ids) {
            const el = document.getElementById(id)
            if (!el) continue
            if (el.getBoundingClientRect().top - offset <= 0) {
                current = id
            } else {
                break
            }
        }

        // 页尾章节高度不足时永远滚不到顶部阈值，触底直接高亮最后一节
        const doc = document.documentElement
        if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
            current = ids[ids.length - 1] ?? current
        }

        activeId.value = current
    }

    function onScroll() {
        if (ticking) return
        ticking = true
        requestAnimationFrame(measure)
    }

    function jumpTo(id: string) {
        const el = document.getElementById(id)
        if (!el) return
        activeId.value = id
        lockUntil = Date.now() + 900
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    onMounted(() => {
        measure()
        requestAnimationFrame(measure)
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
    })

    return { activeId, jumpTo }
}
