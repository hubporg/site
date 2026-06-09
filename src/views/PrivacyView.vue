<script setup lang="ts">
import { Shield, FileText, Cookie, Server, Database, Lock, UserX, UserCheck, Bell, Mail } from 'lucide-vue-next'

const toc = [
    { id: 'intro', label: '引言', icon: FileText },
    { id: 'scope', label: '适用范围', icon: Shield },
    { id: 'collect', label: '收集的信息', icon: Database },
    { id: 'use', label: '信息使用方式', icon: FileText },
    { id: 'cookie', label: 'Cookie 与本地存储', icon: Cookie },
    { id: 'third', label: '第三方服务', icon: Server },
    { id: 'security', label: '数据存储与安全', icon: Lock },
    { id: 'minor', label: '未成年人', icon: UserX },
    { id: 'rights', label: '您的权利', icon: UserCheck },
    { id: 'change', label: '政策变更', icon: Bell },
    { id: 'contact', label: '联系我们', icon: Mail }
]

function jump(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
    <div>
        <section
            class="border-b border-ink-200 dark:border-ink-800 bg-gradient-to-b from-ink-100/40 to-transparent dark:from-ink-1000/40">
            <div class="container-page py-16 sm:py-20">
                <p class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                    法律 / PRIVACY
                </p>
                <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
                    隐私政策
                </h1>
                <p class="text-soft max-w-2xl leading-relaxed">
                    我们尽量只收集能让你正常用上 hubp 的最少信息；本文件解释我们收什么、怎么用、怎么保护，以及你能怎么处置。
                </p>
                <p class="text-xs text-soft font-mono mt-4">
                    最后更新：2026-06-08
                </p>
            </div>
        </section>

        <section class="container-page py-10">
            <div class="grid lg:grid-cols-[260px_1fr] gap-10">
                <!-- 目录 -->
                <aside class="hidden lg:block">
                    <div class="sticky top-24">
                        <p
                            class="text-[10px] font-mono uppercase tracking-wider text-soft mb-3">
                            目录
                        </p>
                        <ul class="space-y-1">
                            <li v-for="t in toc" :key="t.id">
                                <button @click="jump(t.id)"
                                    class="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-soft hover:text-brand-500 hover:bg-ink-100/40 dark:hover:bg-ink-1000/40 transition-colors">
                                    <component :is="t.icon" class="h-3.5 w-3.5 flex-shrink-0" />
                                    {{ t.label }}
                                </button>
                            </li>
                        </ul>
                    </div>
                </aside>

                <!-- 正文 -->
                <article class="prose-hubp max-w-3xl space-y-10">
                    <section id="intro">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">1. 引言</h2>
                        <p class="text-soft leading-relaxed">
                            hubporg（"我们"）是一个由开发者自发组成的开源组织，运营 hubp.org 组织站、ghproxy-extension 浏览器扩展、ghproxy-next Web 加速，以及发布 CF-GitHub-Proxy 自部署模板。
                            本政策适用于上述产品/服务（统称"服务"），说明我们如何处理你与我们的服务交互时产生的信息。
                        </p>
                        <p class="text-soft leading-relaxed mt-3">
                            我们重视"少即是多"：除明确列出项外，hubp 不会要求你注册、不会上传你的账号信息，也不会把数据用于商业化分发。
                        </p>
                    </section>

                    <section id="scope">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">2. 适用范围</h2>
                        <p class="text-soft leading-relaxed">
                            本政策适用于：
                        </p>
                        <ul class="list-disc pl-5 text-soft space-y-1 mt-2">
                            <li>hubp.org 官方网站（含各子页面）</li>
                            <li>ghproxy-extension 浏览器扩展（Chrome / Edge / Firefox）</li>
                            <li>ghproxy-next 提供的 github.akams.cn 节点测速与加速链接转换</li>
                            <li>CF-GitHub-Proxy 在你自行部署后的运行过程（hubporg 本身不收集）</li>
                        </ul>
                        <p class="text-soft leading-relaxed mt-3">
                            不适用于：通过我们的服务跳转到的第三方站点或节点。这些站点由各自的运营者负责，适用其各自政策。
                        </p>
                    </section>

                    <section id="collect">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">3. 收集的信息</h2>

                        <h3 class="text-lg font-semibold mt-6 mb-2">3.1 你主动提供的信息</h3>
                        <p class="text-soft leading-relaxed">
                            hubp 的大部分服务无需登录。你在使用过程中可以主动提交的内容仅限于：
                        </p>
                        <ul class="list-disc pl-5 text-soft space-y-1 mt-2">
                            <li>在 GitHub Issues 中提交的问题、反馈、节点贡献信息（含 GitHub 公开身份）</li>
                            <li>通过 <code class="font-mono text-xs">mailto:hubp@hubp.org</code> 发送给我们的邮件</li>
                        </ul>

                        <h3 class="text-lg font-semibold mt-6 mb-2">3.2 自动收集的信息</h3>
                        <div class="card p-4 mt-2 text-sm text-soft">
                            <p class="font-medium text-ink-800 dark:text-ink-200 mb-2">
                                当你使用各服务时，我们可能自动接收：
                            </p>
                            <ul class="list-disc pl-5 space-y-1">
                                <li>请求的 GitHub 文件 URL（仅用于完成代理转发，不持久化）</li>
                                <li>访问时间、HTTP 状态码、响应字节数（用于流量与异常统计）</li>
                                <li>浏览器 User-Agent、Referer、客户端 IP（用于安全审计与限流）</li>
                                <li>节点测速结果（latency、状态，仅在节点列表页）</li>
                            </ul>
                        </div>

                        <h3 class="text-lg font-semibold mt-6 mb-2">3.3 浏览器扩展特有</h3>
                        <p class="text-soft leading-relaxed">
                            ghproxy-extension 仅在你点击下载加速按钮或启用"全局加速"时介入。
                            扩展不会读取你的 GitHub 账号、token、cookie、浏览历史。
                            扩展可能在本地存储：节点缓存（URL → 延迟）、用户偏好（启用域名、刷新间隔）。这些数据仅存于浏览器本地。
                        </p>
                    </section>

                    <section id="use">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">4. 信息使用方式</h2>
                        <ul class="list-disc pl-5 text-soft space-y-1">
                            <li><span class="font-medium text-ink-800 dark:text-ink-200">完成代理转发</span>：把你请求的 GitHub 文件从源站拉回并返回给你</li>
                            <li><span class="font-medium text-ink-800 dark:text-ink-200">节点测速</span>：在你访问节点列表页时计算每个节点的延迟与可用性</li>
                            <li><span class="font-medium text-ink-800 dark:text-ink-200">安全防护</span>：限流、识别滥用、应对攻击</li>
                            <li><span class="font-medium text-ink-800 dark:text-ink-200">服务改进</span>：根据聚合数据优化节点分布与缓存策略（聚合到不可识别个体的级别）</li>
                        </ul>
                        <p class="text-soft leading-relaxed mt-3">
                            我们不会：
                        </p>
                        <ul class="list-disc pl-5 text-soft space-y-1">
                            <li>将你的访问记录出售给第三方</li>
                            <li>基于你的下载行为投放定向广告</li>
                            <li>要求你提供 GitHub 账号密码或 token</li>
                        </ul>
                    </section>

                    <section id="cookie">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">5. Cookie 与本地存储</h2>
                        <p class="text-soft leading-relaxed">
                            hubp.org 官方网站不使用任何追踪 Cookie，不接入任何第三方分析（无 GA / Sentry）。
                            本地存储（localStorage）仅用于：
                        </p>
                        <ul class="list-disc pl-5 text-soft space-y-1 mt-2">
                            <li>主题偏好（亮/暗）</li>
                            <li>节点测速结果缓存（5 小时 TTL，防止频繁测速）</li>
                        </ul>
                        <p class="text-soft leading-relaxed mt-3">
                            浏览器扩展本身的 localStorage 由扩展代码管理，详见其仓库 README。
                        </p>
                    </section>

                    <section id="third">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">6. 第三方服务</h2>
                        <p class="text-soft leading-relaxed">服务在以下情形会涉及第三方：</p>
                        <ul class="list-disc pl-5 text-soft space-y-1 mt-2">
                            <li><span class="font-medium text-ink-800 dark:text-ink-200">GitHub 源站</span>：所有代理请求的最终源，由 GitHub, Inc. 运营</li>
                            <li><span class="font-medium text-ink-800 dark:text-ink-200">Cloudflare</span>：CF-GitHub-Proxy 自部署时使用，hubporg 自身不收集数据</li>
                            <li><span class="font-medium text-ink-800 dark:text-ink-200">贡献节点</span>：节点列表中的"贡献"与"测绘"档位由社区贡献者运维，hubporg 不对其行为负责</li>
                        </ul>
                    </section>

                    <section id="security">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">7. 数据存储与安全</h2>
                        <p class="text-soft leading-relaxed">
                            代理转发的过程是流式转发：你的请求不写入磁盘。节点测速结果以聚合形式保留。
                            我们使用业内常见的访问控制、最小权限原则与限流策略保护基础设施。
                        </p>
                        <p class="text-soft leading-relaxed mt-3">
                            尽管如此，没有任何系统是 100% 安全的。如发生数据安全事件，我们会在合理时间内通过本页面或 GitHub Releases 公告。
                        </p>
                    </section>

                    <section id="minor">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">8. 未成年人</h2>
                        <p class="text-soft leading-relaxed">
                            本服务面向一般开发者群体，不针对 14 岁以下未成年人设计。我们不会故意收集未成年人的个人信息。
                            如监护人发现未成年人在未告知的情况下向我们提交了信息，请通过下方邮箱联系我们，我们将尽快删除。
                        </p>
                    </section>

                    <section id="rights">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">9. 您的权利</h2>
                        <p class="text-soft leading-relaxed">你对自己的信息享有以下权利：</p>
                        <ul class="list-disc pl-5 text-soft space-y-1 mt-2">
                            <li>访问与复制我们在服务中留存的与你相关的数据</li>
                            <li>要求更正或删除</li>
                            <li>撤回此前授予的同意</li>
                            <li>关闭浏览器扩展 / 清除其本地存储，立即停止介入</li>
                        </ul>
                        <p class="text-soft leading-relaxed mt-3">
                            行使上述权利，请通过 <code class="font-mono text-xs">hubp@hubp.org</code> 与我们联系。我们会在 15 个工作日内回复。
                        </p>
                    </section>

                    <section id="change">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">10. 政策变更</h2>
                        <p class="text-soft leading-relaxed">
                            我们可能会根据服务演进或法律变化更新本政策。重大变更会通过 GitHub Releases 与官网公告栏提示。
                            继续使用服务即视为接受更新后的政策。
                        </p>
                    </section>

                    <section id="contact">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">11. 联系我们</h2>
                        <p class="text-soft leading-relaxed">如对本政策有疑问、意见或投诉，可通过以下方式联系我们：</p>
                        <ul class="list-disc pl-5 text-soft space-y-1 mt-2">
                            <li>邮箱：<a href="mailto:hubp@hubp.org" class="text-brand-600 dark:text-brand-400 hover:underline">hubp@hubp.org</a></li>
                            <li>GitHub Issues：<a href="https://github.com/hubporg/site/issues" target="_blank" rel="noreferrer" class="text-brand-600 dark:text-brand-400 hover:underline">hubporg/site</a></li>
                            <li>QQ 群：<a href="https://qm.qq.com/q/JWSV7CSGEs" target="_blank" rel="noreferrer" class="text-brand-600 dark:text-brand-400 hover:underline">有求必应</a></li>
                        </ul>
                    </section>

                    <p class="text-xs text-soft font-mono pt-6 border-t border-ink-200 dark:border-ink-800">
                        © hubporg · 本政策仅适用于 hubporg 运营的服务，不构成法律意见。
                    </p>
                </article>
            </div>
        </section>
    </div>
</template>
