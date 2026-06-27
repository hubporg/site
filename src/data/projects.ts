export interface Project {
    id: string
    name: string
    repo: string
    url: string
    category: 'extension' | 'frontend' | 'cf-proxy' | 'core'
    tagline: string
    description: string
    stack: string[]
    license: string
  language?: { name: string; percent: number; color: string }
    features: string[]
    highlights?: { label: string; value: string }[]
    releasedAt?: string
}

// 节点列表与测速逻辑在 NodesView 中运行时从 hubp.tbedu.top/nodes.json 拉取

export const projects: Project[] = [
    {
        id: 'ghproxy-extension',
        name: 'ghproxy-extension',
        repo: 'hubporg/ghproxy-extension',
        url: 'https://github.com/hubporg/ghproxy-extension',
        category: 'extension',
        tagline: '智能 GitHub 下载加速浏览器扩展',
        description:
            '智能识别用户地理位置与下载场景，通过 302 重定向自动选择最优节点，兼容 IDM 等下载工具，覆盖 Chrome / Edge / Firefox。',
        stack: ['JavaScript 69.7%', 'HTML 26.7%', 'PowerShell'],
        license: 'MIT',
        language: { name: 'JavaScript', percent: 69.7, color: '#f1e05a' },
        features: [
            '智能加速：自动选择最优代理节点',
            '地理检测：仅对大陆地区启用加速',
            '302 重定向：兼容 IDM 等下载工具',
            '节点测速 + 2 小时缓存最优节点',
            '全局 / 域名级加速偏好设置',
            '右键菜单快速复制加速链接'
        ],
        highlights: [
            { label: '兼容', value: 'IDM / 浏览器内置下载' },
            { label: '支持', value: 'Chrome / Edge / FF' },
            { label: '商店上架', value: 'Edge / Firefox' },
            { label: '许可证', value: 'MIT' }
        ],
        releasedAt: '2026-06'
    },
    {
        id: 'ghproxy-next',
        name: 'ghproxy-next',
        repo: 'hubporg/ghproxy-next',
        url: 'https://github.com/hubporg/ghproxy-next',
        category: 'frontend',
        tagline: '即用型 GitHub 代理 Web 加速链接转换',
        description:
            '基于 Next.js 16、React 19、Tailwind CSS 4 与 TypeScript 重构的 GitHub 代理网站，提供节点选择、测速、Releases 列表等即用功能。',
        stack: ['Next.js 16', 'React 19', 'TypeScript 97.9%', 'Tailwind CSS 4'],
        license: 'GPL-3.0',
        language: { name: 'TypeScript', percent: 97.9, color: '#3178c6' },
        features: [
            '节点测速：默认 / 贡献 / 测绘多档来源',
            'Releases / Archive / Gist / Raw 加速',
            '反馈统计与留言',
            'SEO 与 Open Graph 完整元数据',
            '基于 Issues 的节点贡献工作流',
            '响应式：桌面 / 平板 / 移动端'
        ],
        highlights: [
            { label: '线上地址', value: 'github.akams.cn' },
            { label: '语言占比', value: 'TS 97.9%' },
            { label: '框架', value: 'Next.js 16' },
            { label: 'UI', value: 'Tailwind 4' }
        ],
        releasedAt: '2025-12'
    },
    {
        id: 'cf-github-proxy',
        name: 'CF-GitHub-Proxy',
        repo: 'hubporg/CF-GitHub-Proxy',
        url: 'https://github.com/hubporg/CF-GitHub-Proxy',
        category: 'cf-proxy',
        tagline: 'Cloudflare Workers 上的 GitHub 镜像代理',
        description:
            '基于 Cloudflare Workers / Snippets 构建的 GitHub 镜像代理工具，无需服务器即可部署。中转 GitHub 项目请求，解决访问限制与加速问题。',
        stack: ['JavaScript', 'Cloudflare Workers', 'Snippets'],
        license: 'MIT',
        language: { name: 'JavaScript', percent: 100, color: '#f1e05a' },
        features: [
            '零服务器：纯 Cloudflare Workers 部署',
            '中继 GitHub：raw / releases / archive / clone',
            '可作为 Snippets 直接挂到自有域名',
            '无需 Docker，无需维护基础设施',
            '边缘节点覆盖全球，延迟低',
            '最低运行成本，公益项目友好'
        ],
        highlights: [
            { label: '运行平台', value: 'Cloudflare' },
            { label: '部署成本', value: '零基础设施' },
            { label: '代码', value: '100% JS' },
            { label: '协议', value: 'GitHub 全量' }
        ],
        releasedAt: '2025-02'
    }
]

// 节点列表改由 NodesView 运行时从 hubp.tbedu.top/nodes.json 拉取 + 测速
