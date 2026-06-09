<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'
import {
  Puzzle,
  Globe2,
  Github,
  Check,
  ArrowRight,
  Terminal,
  Cloud
} from 'lucide-vue-next'

const webSnippet = `// 直接访问 https://github.akams.cn
// 1. 选择一个测速较好的节点
// 2. 把 GitHub URL 粘贴进去
// 3. 获得加速下载链接`

const cfSnippet = `// 在 Cloudflare Workers 中部署
// 1. fork hubporg/CF-GitHub-Proxy
// 2. 部署到 Cloudflare Workers
// 3. 把 *.your-domain.com 路由到该 Worker

// 也可以作为 Snippets 挂到自有域名
// 路径前缀：/github/`

const extensionSnippet = `// ghproxy-extension 浏览器扩展
// 1. 访问 Edge / Firefox 商店安装
// 2. 打开 GitHub 文件下载，扩展自动介入
// 3. 通过 302 重定向走最快节点

// 也支持全局偏好：
//   - 全局：所有 GitHub 下载都加速`

const acceleratedItems = [
  { name: 'GitHub Raw', desc: 'raw.githubusercontent.com 文件' },
  { name: 'GitHub Releases', desc: '二进制与源码压缩包' },
  { name: 'GitHub Archive', desc: 'codeload / ZIP / tarball' },
  { name: 'GitHub Clone', desc: 'git clone 通过代理中转' }
]
</script>

<template>
  <div>
    <section
      class="border-b border-ink-200 dark:border-ink-800 bg-gradient-to-b from-ink-100/40 to-transparent dark:from-ink-1000/40">
      <div class="container-page py-16 sm:py-20">
        <p class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
          加速 / ACCELERATE
        </p>
        <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          三种方式加速 GitHub
        </h1>
        <p class="text-soft max-w-2xl leading-relaxed">
          无论你只是想偶尔下载一个 Release，还是天天 clone 仓库，hubporg 都提供对应的入口。
        </p>
      </div>
    </section>

    <!-- 支持的协议 -->
    <section class="container-page py-10">
      <div class="card p-6">
        <div class="flex items-center gap-2 mb-4">
          <Github class="h-4 w-4 text-brand-500" />
          <h3 class="font-semibold">加速范围</h3>
        </div>
        <ul class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <li v-for="a in acceleratedItems" :key="a.name" class="flex items-start gap-2">
            <Check class="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p class="text-sm font-medium">{{ a.name }}</p>
              <p class="text-xs text-soft">{{ a.desc }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- 三种方式 -->
    <section class="container-page py-8">
      <div class="grid gap-5 lg:grid-cols-3">
        <article class="card p-6 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <Puzzle class="h-5 w-5 text-purple-500" />
            <span
              class="text-[10px] font-mono px-1.5 py-0.5 rounded border border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/5">最省心</span>
          </div>
          <h3 class="font-semibold mb-2">浏览器扩展</h3>
          <p class="text-sm text-soft mb-4">
            安装 ghproxy-extension，打开 GitHub 下载即自动加速。302 重定向兼容 IDM，无需任何配置。
          </p>
          <ul class="space-y-2 text-sm text-soft mb-5 flex-1">
            <li class="flex items-start gap-2">
              <Check class="h-3.5 w-3.5 text-accent mt-1" />
              自动选最快节点，2 小时缓存
            </li>
            <li class="flex items-start gap-2">
              <Check class="h-3.5 w-3.5 text-accent mt-1" />
              Chrome / Edge / Firefox 全覆盖
            </li>
            <li class="flex items-start gap-2">
              <Check class="h-3.5 w-3.5 text-accent mt-1" />
              全局偏好可切换
            </li>
          </ul>
          <a href="https://github.com/hubporg/ghproxy-extension" target="_blank" rel="noreferrer"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400">
            查看仓库 <ArrowRight class="h-3.5 w-3.5" />
          </a>
        </article>

        <article class="card p-6 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <Globe2 class="h-5 w-5 text-accent" />
            <span
              class="text-[10px] font-mono px-1.5 py-0.5 rounded border border-accent/40 text-accent bg-accent/5">即开即用</span>
          </div>
          <h3 class="font-semibold mb-2">Web 控制台</h3>
          <p class="text-sm text-soft mb-4">
            访问 github.akams.cn 即可使用。粘贴 GitHub URL，自带节点测速，复制加速链接。
          </p>
          <ul class="space-y-2 text-sm text-soft mb-5 flex-1">
            <li class="flex items-start gap-2">
              <Check class="h-3.5 w-3.5 text-accent mt-1" />
              默认 / 贡献 / 测绘多档节点
            </li>
            <li class="flex items-start gap-2">
              <Check class="h-3.5 w-3.5 text-accent mt-1" />
              Releases / Archive / Gist / Raw
            </li>
            <li class="flex items-start gap-2">
              <Check class="h-3.5 w-3.5 text-accent mt-1" />
              基于 Issues 的节点贡献工作流
            </li>
          </ul>
          <a href="https://github.akams.cn" target="_blank" rel="noreferrer"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400">
            立即访问 <ArrowRight class="h-3.5 w-3.5" />
          </a>
        </article>

        <article class="card p-6 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <Cloud class="h-5 w-5 text-orange-500" />
            <span
              class="text-[10px] font-mono px-1.5 py-0.5 rounded border border-orange-500/40 text-orange-600 dark:text-orange-400 bg-orange-500/5">自部署</span>
          </div>
          <h3 class="font-semibold mb-2">Cloudflare 边缘代理</h3>
          <p class="text-sm text-soft mb-4">
            fork CF-GitHub-Proxy 到自己的 Cloudflare Workers，零服务器即可拥有自己的 GitHub 镜像。
          </p>
          <ul class="space-y-2 text-sm text-soft mb-5 flex-1">
            <li class="flex items-start gap-2">
              <Check class="h-3.5 w-3.5 text-accent mt-1" />
              全球边缘节点，低延迟
            </li>
            <li class="flex items-start gap-2">
              <Check class="h-3.5 w-3.5 text-accent mt-1" />
              最低运行成本
            </li>
            <li class="flex items-start gap-2">
              <Check class="h-3.5 w-3.5 text-accent mt-1" />
              可挂载 Snippets 到自有域名
            </li>
          </ul>
          <a href="https://github.com/hubporg/CF-GitHub-Proxy" target="_blank" rel="noreferrer"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400">
            查看仓库 <ArrowRight class="h-3.5 w-3.5" />
          </a>
        </article>
      </div>
    </section>

    <!-- 代码片段 -->
    <section class="container-page py-8">
      <div class="grid lg:grid-cols-2 gap-6">
        <div>
          <div class="flex items-center gap-2 mb-3">
            <Terminal class="h-4 w-4 text-accent" />
            <h3 class="font-semibold">通过 Web 控制台</h3>
          </div>
          <p class="text-sm text-soft mb-4">
            最简单的零安装方式。打开 github.akams.cn，粘贴 GitHub URL 即可获得加速链接。
          </p>
          <CodeBlock language="bash" label="web" :code="webSnippet" />
        </div>

        <div>
          <div class="flex items-center gap-2 mb-3">
            <Cloud class="h-4 w-4 text-orange-500" />
            <h3 class="font-semibold">部署自己的 CF-GitHub-Proxy</h3>
          </div>
          <p class="text-sm text-soft mb-4">
            想拥有自己的镜像？把 CF-GitHub-Proxy 部署到 Cloudflare Workers，零服务器成本。
          </p>
          <CodeBlock language="javascript" label="worker / index.js" :code="cfSnippet" />
        </div>
      </div>
    </section>

    <section class="container-page py-8">
      <div>
        <div class="flex items-center gap-2 mb-3">
          <Puzzle class="h-4 w-4 text-purple-500" />
          <h3 class="font-semibold">浏览器扩展使用方式</h3>
        </div>
        <p class="text-sm text-soft mb-4">
          安装后无需任何额外操作，扩展会在 GitHub 下载场景自动介入。也可在偏好面板精细控制。
        </p>
        <CodeBlock language="javascript" label="extension" :code="extensionSnippet" />
      </div>
    </section>
  </div>
</template>
