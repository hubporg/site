<script setup lang="ts">
import { ref } from 'vue'
import { FileText, Zap, ShieldCheck, AlertTriangle, Copyright, GitFork, XCircle, Server, RefreshCw, ScrollText, Bell, Mail, List, ChevronDown } from 'lucide-vue-next'

const toc = [
    { id: 'intro', label: '引言', icon: FileText },
    { id: 'desc', label: '服务描述', icon: Zap },
    { id: 'eligibility', label: '适用条件', icon: ShieldCheck },
    { id: 'rules', label: '使用规则', icon: AlertTriangle },
    { id: 'ip', label: '知识产权', icon: Copyright },
    { id: 'contrib', label: '用户贡献', icon: GitFork },
    { id: 'disclaimer', label: '免责声明', icon: XCircle },
    { id: 'liability', label: '责任限制', icon: ShieldCheck },
    { id: 'third', label: '第三方与节点', icon: Server },
    { id: 'change', label: '服务变更与终止', icon: RefreshCw },
    { id: 'law', label: '适用法律', icon: ScrollText },
    { id: 'update', label: '条款变更', icon: Bell },
    { id: 'contact', label: '联系我们', icon: Mail }
]

const mobileTocOpen = ref(false)

function jump(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    mobileTocOpen.value = false
}
</script>

<template>
    <div>
        <section
            class="border-b border-ink-200 dark:border-ink-800 bg-gradient-to-b from-ink-100/40 to-transparent dark:from-ink-1000/40">
            <div class="container-page py-16 sm:py-20">
                <p class="text-xs font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                    法律 / TERMS
                </p>
                <h1 class="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
                    服务条款
                </h1>
                <p class="text-soft max-w-2xl leading-relaxed">
                    你使用 hubp 旗下服务前请阅读以下条款。继续使用即视为同意。
                </p>
                <p class="text-xs text-soft font-mono mt-4">
                    最后更新：2026-06-08
                </p>
            </div>
        </section>

        <section class="container-page py-10">
            <div class="grid lg:grid-cols-[260px_1fr] gap-10">
                <aside>
                    <div class="lg:hidden mb-6 card overflow-hidden">
                        <button
                            class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
                            @click="mobileTocOpen = !mobileTocOpen"
                            :aria-expanded="mobileTocOpen">
                            <span class="flex items-center gap-2">
                                <List class="h-4 w-4 text-brand-500" />
                                目录
                            </span>
                            <ChevronDown
                                :class="['h-4 w-4 text-soft transition-transform', mobileTocOpen && 'rotate-180']" />
                        </button>
                        <ul v-if="mobileTocOpen" class="border-t border-ink-200 dark:border-ink-800 py-2">
                            <li v-for="t in toc" :key="t.id">
                                <button @click="jump(t.id)"
                                    class="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-soft hover:text-brand-500 hover:bg-ink-100/40 dark:hover:bg-ink-1000/40 transition-colors">
                                    <component :is="t.icon" class="h-3.5 w-3.5 flex-shrink-0" />
                                    {{ t.label }}
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div class="hidden lg:block">
                        <div class="sticky top-24">
                            <p class="text-[10px] font-mono uppercase tracking-wider text-soft mb-3">
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
                    </div>
                </aside>

                <article class="max-w-3xl space-y-10">
                    <div
                        class="card border-l-4 border-amber-500 bg-amber-50/40 dark:bg-amber-500/5 p-4 text-sm text-soft">
                        <p>
                            <span
                                class="inline-block px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-semibold rounded mr-2">提示</span>
                            hubporg 不隶属于 GitHub。GitHub 是 GitHub, Inc. 的注册商标。本服务仅作为开源资源访问的辅助工具，所有被代理的文件版权归原作者所有。
                        </p>
                    </div>

                    <section id="intro">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">1. 引言</h2>
                        <p class="text-soft leading-relaxed">
                            欢迎使用 hubporg（"hubp"）提供的服务。本条款是你（"用户"）与 hubporg 之间关于使用 hubp.org 官方网站、ghproxy-extension 浏览器扩展、ghproxy-next Web 加速与 CF-GitHub-Proxy 自部署模板的协议。
                        </p>
                        <p class="text-soft leading-relaxed mt-3">
                            使用我们的服务即表示你已阅读、理解并同意本条款。如不同意，请立即停止使用并卸载相关扩展。
                        </p>
                    </section>

                    <section id="desc">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">2. 服务描述</h2>
                        <p class="text-soft leading-relaxed">hubp 提供以下能力（统称"服务"）：</p>
                        <ul class="list-disc pl-5 text-soft space-y-1 mt-2">
                            <li><span class="font-medium text-ink-800 dark:text-ink-200">GitHub 资源访问加速</span>：代理 raw.githubusercontent.com、codeload.github.com、objects.githubusercontent.com 等域名的下载请求</li>
                            <li><span class="font-medium text-ink-800 dark:text-ink-200">浏览器扩展介入</span>：在 GitHub 下载页或 Releases 页面，按你的偏好自动重定向到代理节点</li>
                            <li><span class="font-medium text-ink-800 dark:text-ink-200">节点测速</span>：聚合社区贡献节点，公开测速结果供参考</li>
                            <li><span class="font-medium text-ink-800 dark:text-ink-200">自部署模板</span>：CF-GitHub-Proxy 源码供你部署到你自己的 Cloudflare 账户</li>
                        </ul>
                        <p class="text-soft leading-relaxed mt-3">
                            服务以"现状"提供，不承诺任何特定级别的可用性、速度或永久可用。
                        </p>
                    </section>

                    <section id="eligibility">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">3. 适用条件</h2>
                        <p class="text-soft leading-relaxed">
                            你应保证：
                        </p>
                        <ul class="list-disc pl-5 text-soft space-y-1 mt-2">
                            <li>具备使用本服务所必需的民事行为能力</li>
                            <li>使用本服务不违反你所在司法辖区的法律法规</li>
                            <li>不会将服务用于下载你不被授权访问的、违反所在地区出口管制或版权法律的内容</li>
                        </ul>
                    </section>

                    <section id="rules">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">4. 使用规则</h2>
                        <p class="text-soft leading-relaxed">使用服务时，你不得从事以下行为：</p>
                        <ul class="list-disc pl-5 text-soft space-y-1 mt-2">
                            <li>对 hubp 基础设施发起攻击、扫描、DDoS、绕过限流</li>
                            <li>将 hubp 用作任何违法活动的工具或跳板</li>
                            <li>批量下载 GitHub 内容用于商业转售（除非你获得了原作者授权）</li>
                            <li>伪造 User-Agent、Referer 等头部以规避审计</li>
                            <li>反向工程、篡改或试图破解浏览器扩展的签名/打包</li>
                        </ul>
                    </section>

                    <section id="ip">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">5. 知识产权</h2>
                        <p class="text-soft leading-relaxed">
                            hubporg 自研项目（hubp 官网源码、ghproxy-extension 源码、ghproxy-next 源码、CF-GitHub-Proxy 源码）按各自仓库的 LICENSE 文件发布（主要为 MIT / GPL-3.0）。在遵守对应协议的前提下，你可以自由使用、修改、分发。
                        </p>
                        <p class="text-soft leading-relaxed mt-3">
                            你通过服务下载的所有 GitHub 资源，其版权归原作者所有，hubporg 不主张任何权利。请尊重原作者的许可证。
                        </p>
                    </section>

                    <section id="contrib">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">6. 用户贡献</h2>
                        <p class="text-soft leading-relaxed">
                            当你通过 GitHub Issues / PR 提交节点、文档、代码或反馈时：
                        </p>
                        <ul class="list-disc pl-5 text-soft space-y-1 mt-2">
                            <li>你确认你拥有所提交内容的合法权利</li>
                            <li>你授予 hubporg 以非独家、免版税的方式在服务中使用、修改、再发布该内容的许可</li>
                            <li>hubporg 保留在认为不合适时拒绝或下架内容的权利</li>
                        </ul>
                    </section>

                    <section id="disclaimer">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">7. 免责声明</h2>
                        <div
                            class="card border-l-4 border-red-500 bg-red-50/40 dark:bg-red-500/5 p-4 text-sm text-soft">
                            <p>
                                服务按"现状"和"可获得"原则提供。在法律允许的最大范围内，hubporg 不对以下情形作任何明示或暗示的保证：
                            </p>
                            <ul class="list-disc pl-5 space-y-1 mt-2">
                                <li>服务的不间断、无错误或绝对安全</li>
                                <li>通过服务获取的任何内容的准确性、合法性、可用性</li>
                                <li>因节点下线、网络中断、源站限流导致的下载失败</li>
                                <li>因浏览器、操作系统、网络环境差异造成的体验差异</li>
                            </ul>
                        </div>
                    </section>

                    <section id="liability">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">8. 责任限制</h2>
                        <p class="text-soft leading-relaxed">
                            在适用法律允许的最大范围内，因使用或无法使用本服务而造成的任何间接、偶然、特殊、惩罚性或衍生性损失，hubporg 概不负责。
                        </p>
                        <p class="text-soft leading-relaxed mt-3">
                            如本服务对你造成了直接损失，hubporg 承担的累计责任不超过你为使用本服务而向我们支付的金额（如有；本服务为公益免费，故责任上限为 0）。
                        </p>
                    </section>

                    <section id="third">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">9. 第三方与节点</h2>
                        <p class="text-soft leading-relaxed">
                            节点列表中"贡献"与"测绘"档位由社区贡献者运维。hubporg 对贡献节点的内容、稳定性、安全性不作担保。点击该类节点意味着你信任该贡献者，请自行评估风险。
                        </p>
                        <p class="text-soft leading-relaxed mt-3">
                            CF-GitHub-Proxy 是源码模板，自部署后由你自行负责运维与安全配置，与 hubporg 无关。
                        </p>
                    </section>

                    <section id="change">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">10. 服务变更与终止</h2>
                        <p class="text-soft leading-relaxed">
                            我们保留随时修改、暂停或终止任何服务（或其中任何部分）的权利，无需事先通知。
                            这包括但不限于：节点下线、产品弃置、域名变更。重大变更我们会通过 GitHub Releases 公告。
                        </p>
                    </section>

                    <section id="law">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">11. 适用法律</h2>
                        <p class="text-soft leading-relaxed">
                            本条款的解释、效力及争议解决均适用中华人民共和国法律（为本条款之目的，不考虑其法律冲突规则）。
                            如本条款的任何条款被有管辖权的人民法院认定为无效，其余条款仍具完整效力。
                        </p>
                    </section>

                    <section id="update">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">12. 条款变更</h2>
                        <p class="text-soft leading-relaxed">
                            我们可能根据服务演进或法律变化更新本条款。更新后会以页面顶部"最后更新"日期标识。
                            继续使用服务即视为接受更新后的条款。
                        </p>
                    </section>

                    <section id="contact">
                        <h2 class="text-2xl font-semibold tracking-tight mb-3">13. 联系我们</h2>
                        <p class="text-soft leading-relaxed">如对本条款有疑问或建议：</p>
                        <ul class="list-disc pl-5 text-soft space-y-1 mt-2">
                            <li>邮箱：<a href="mailto:hubp@hubp.org" class="text-brand-600 dark:text-brand-400 hover:underline">hubp@hubp.org</a></li>
                            <li>GitHub Issues：<a href="https://github.com/hubporg/site/issues" target="_blank" rel="noreferrer" class="text-brand-600 dark:text-brand-400 hover:underline">hubporg/site</a></li>
                            <li>QQ 群：<a href="https://qm.qq.com/q/JWSV7CSGEs" target="_blank" rel="noreferrer" class="text-brand-600 dark:text-brand-400 hover:underline">有求必应</a></li>
                        </ul>
                    </section>

                    <p class="text-xs text-soft font-mono pt-6 border-t border-ink-200 dark:border-ink-800">
                        © hubporg · 本条款仅适用于 hubporg 运营的服务，不构成法律意见。
                    </p>
                </article>
            </div>
        </section>
    </div>
</template>
