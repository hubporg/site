import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'hubp - 让开源资源触手可及' }
    },
    {
        path: '/projects',
        name: 'projects',
        component: () => import('@/views/ProjectsView.vue'),
        meta: { title: '项目矩阵 - hubp' }
    },
    {
        path: '/projects/extension',
        name: 'extension',
        component: () => import('@/views/ExtensionView.vue'),
        meta: { title: 'ghproxy-extension 浏览器扩展 - hubp' }
    },
    {
        path: '/projects/extension/privacy',
        name: 'extension-privacy',
        component: () => import('@/views/ExtensionPrivacy.vue'),
        meta: { title: '扩展隐私政策 - hubp' }
    },
    {
        path: '/accelerate',
        name: 'accelerate',
        component: () => import('@/views/AccelerateView.vue'),
        meta: { title: 'GitHub 加速 - hubp' }
    },
    {
        path: '/nodes',
        name: 'nodes',
        component: () => import('@/views/NodesView.vue'),
        meta: { title: '节点状态 - hubp' }
    },
    {
        path: '/about',
        name: 'about',
        component: () => import('@/views/AboutView.vue'),
        meta: { title: '关于 hubp' }
    },
    {
        path: '/privacy',
        name: 'privacy',
        component: () => import('@/views/PrivacyView.vue'),
        meta: { title: '隐私政策 - hubp' }
    },
    {
        path: '/terms',
        name: 'terms',
        component: () => import('@/views/TermsView.vue'),
        meta: { title: '服务条款 - hubp' }
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, saved) {
        return saved || { top: 0 }
    }
})

router.afterEach((to) => {
    const title = (to.meta?.title as string) || 'hubp'
    document.title = title
})
