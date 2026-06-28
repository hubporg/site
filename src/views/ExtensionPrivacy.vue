<script setup lang="ts">
import { Shield, ArrowLeft, ExternalLink, AlertTriangle, CheckCircle, Info, Database, Globe, Code } from 'lucide-vue-next'
</script>

<template>
    <div>
        <section class="relative overflow-hidden border-b border-ink-200 dark:border-ink-800">
            <div class="absolute inset-0 grid-bg opacity-60 dark:opacity-30" />
            <div
                class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-50 dark:to-ink-950" />
            <div class="container-page relative pt-20 pb-16 sm:pt-28 sm:pb-20">
                <a href="/projects/extension"
                    class="inline-flex items-center gap-1.5 text-sm text-soft hover:text-primary transition-colors mb-6">
                    <ArrowLeft class="h-3.5 w-3.5" />
                    返回扩展详情
                </a>
                <div class="flex items-center gap-3 mb-4">
                    <div
                        class="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
                        <Shield class="h-5 w-5" />
                    </div>
                    <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
                        隐私政策
                    </h1>
                </div>
                <p class="text-soft max-w-2xl">
                    ghproxy-extension 隐私政策与数据使用说明
                </p>
            </div>
        </section>

        <section class="container-page py-12 sm:py-16 space-y-10">
            <div class="max-w-3xl space-y-10">
                <!-- 欢迎 -->
                <div>
                    <h2 class="text-xl font-semibold mb-3">欢迎使用</h2>
                    <p class="text-soft leading-relaxed">
                        GitHub Accelerator 是一款智能 GitHub 下载加速器，通过智能代理节点选择和 302
                        重定向，为您提供快速的 GitHub 资源下载体验。在使用本扩展之前，请仔细阅读以下隐私政策。
                    </p>
                </div>

                <!-- 数据收集 -->
                <div>
                    <h2 class="text-xl font-semibold mb-3">数据收集说明</h2>
                    <div
                        class="card p-4 border-l-4 border-l-primary bg-primary/5 text-sm mb-4">
                        本扩展<strong>不会收集、存储或传输</strong>任何个人信息、浏览历史、凭证或敏感数据。不使用任何
                        Cookie 或第三方跟踪技术。
                    </div>

                    <p class="text-soft text-sm mb-3">扩展仅在本地浏览器存储中保存以下数据：</p>

                    <div class="card overflow-hidden">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-ink-200 dark:border-ink-800">
                                    <th class="text-left p-3 font-semibold">数据项</th>
                                    <th class="text-left p-3 font-semibold">存储方式</th>
                                    <th class="text-left p-3 font-semibold">用途</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b border-ink-100 dark:border-ink-900">
                                    <td class="p-3 text-soft">最优代理节点缓存</td>
                                    <td class="p-3 text-soft">本地存储</td>
                                    <td class="p-3 text-soft">缓存最优代理节点，2小时过期，避免重复测速</td>
                                </tr>
                                <tr class="border-b border-ink-100 dark:border-ink-900">
                                    <td class="p-3 text-soft">代理节点列表</td>
                                    <td class="p-3 text-soft">本地存储</td>
                                    <td class="p-3 text-soft">缓存可用代理节点列表及延迟结果</td>
                                </tr>
                                <tr class="border-b border-ink-100 dark:border-ink-900">
                                    <td class="p-3 text-soft">始终加速开关</td>
                                    <td class="p-3 text-soft">本地存储</td>
                                    <td class="p-3 text-soft">用户偏好设置，自动跳转不显示选择页面</td>
                                </tr>
                                <tr class="border-b border-ink-100 dark:border-ink-900">
                                    <td class="p-3 text-soft">会话临时禁用标记</td>
                                    <td class="p-3 text-soft">本地存储</td>
                                    <td class="p-3 text-soft">临时跳过当前会话的拦截</td>
                                </tr>
                                <tr>
                                    <td class="p-3 text-soft">域名级偏好设置</td>
                                    <td class="p-3 text-soft">本地存储</td>
                                    <td class="p-3 text-soft">用户设置的每域名加速/直连偏好</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 匿名统计 -->
                <div>
                    <h2 class="text-xl font-semibold mb-3">匿名统计功能</h2>
                    <div
                        class="card p-4 border-l-4 border-l-emerald-500 bg-emerald-500/5 text-sm mb-4">
                        <div class="flex items-start gap-2">
                            <Info class="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span>本扩展已内置匿名使用统计功能，用于帮助我们了解扩展的使用情况并向社区展示服务成果。统计数据在本地累积后批量上报。</span>
                        </div>
                    </div>

                    <div class="card overflow-hidden mb-4">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-ink-200 dark:border-ink-800">
                                    <th class="text-left p-3 font-semibold">统计项</th>
                                    <th class="text-left p-3 font-semibold">说明</th>
                                    <th class="text-left p-3 font-semibold">是否匿名</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b border-ink-100 dark:border-ink-900">
                                    <td class="p-3 text-soft">累计加速跳转次数</td>
                                    <td class="p-3 text-soft">加速重定向被触发的总次数</td>
                                    <td class="p-3 text-emerald-600 dark:text-emerald-400">是，仅聚合数字</td>
                                </tr>
                                <tr class="border-b border-ink-100 dark:border-ink-900">
                                    <td class="p-3 text-soft">累计安装/更新次数</td>
                                    <td class="p-3 text-soft">扩展被安装或更新的总次数</td>
                                    <td class="p-3 text-emerald-600 dark:text-emerald-400">是，仅聚合数字</td>
                                </tr>
                                <tr class="border-b border-ink-100 dark:border-ink-900">
                                    <td class="p-3 text-soft">浏览器类型</td>
                                    <td class="p-3 text-soft">Chromium 或 Firefox</td>
                                    <td class="p-3 text-emerald-600 dark:text-emerald-400">是，仅分类标识</td>
                                </tr>
                                <tr>
                                    <td class="p-3 text-soft">扩展版本号</td>
                                    <td class="p-3 text-soft">当前扩展版本</td>
                                    <td class="p-3 text-emerald-600 dark:text-emerald-400">是，仅版本号</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div
                        class="card p-4 border-l-4 border-l-amber-500 bg-amber-500/5 text-sm">
                        <div class="flex items-start gap-2">
                            <AlertTriangle class="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                                <p class="font-semibold mb-1">我们绝对不会收集：</p>
                                <ul class="text-soft space-y-0.5 list-disc list-inside">
                                    <li>任何个人信息（姓名、邮箱、IP 地址等）</li>
                                    <li>浏览历史或访问的 URL</li>
                                    <li>下载的文件名或文件内容</li>
                                    <li>浏览器书签、密码或任何敏感数据</li>
                                    <li>任何可追溯到个人的标识符</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <p class="text-soft text-sm mt-4">
                        统计数据仅用于了解扩展使用情况以及对外展示（如「累计加速突破 X
                        次」）。数据会在本地累积后批量提交至服务器进行汇总，但绝不会传输任何个人身份信息。
                    </p>
                </div>

                <!-- 网络请求 -->
                <div>
                    <h2 class="text-xl font-semibold mb-3">网络请求说明</h2>
                    <p class="text-soft text-sm mb-3">扩展会向以下地址发起网络请求：</p>

                    <div class="card overflow-hidden">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-ink-200 dark:border-ink-800">
                                    <th class="text-left p-3 font-semibold">目标地址</th>
                                    <th class="text-left p-3 font-semibold">发送数据</th>
                                    <th class="text-left p-3 font-semibold">用途</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b border-ink-100 dark:border-ink-900">
                                    <td class="p-3 text-soft font-mono text-xs">hubp.tbedu.top</td>
                                    <td class="p-3 text-soft">无</td>
                                    <td class="p-3 text-soft">获取可用代理节点列表</td>
                                </tr>
                                <tr class="border-b border-ink-100 dark:border-ink-900">
                                    <td class="p-3 text-soft font-mono text-xs">api.ipapi.is / api.ip.sb</td>
                                    <td class="p-3 text-soft">无</td>
                                    <td class="p-3 text-soft">检测地理位置（判断是否需要加速）</td>
                                </tr>
                                <tr class="border-b border-ink-100 dark:border-ink-900">
                                    <td class="p-3 text-soft font-mono text-xs">代理节点（如 gh.llkk.cc）</td>
                                    <td class="p-3 text-soft">无</td>
                                    <td class="p-3 text-soft">测速，下载测试资源</td>
                                </tr>
                                <tr class="border-b border-ink-100 dark:border-ink-900">
                                    <td class="p-3 text-soft font-mono text-xs">addon-analytics.hubp.org</td>
                                    <td class="p-3 text-soft">匿名聚合计数</td>
                                    <td class="p-3 text-soft">提交匿名统计数据用于汇总</td>
                                </tr>
                                <tr>
                                    <td class="p-3 text-soft font-mono text-xs">addon-analytics-hubp.tbedu.top</td>
                                    <td class="p-3 text-soft">匿名聚合计数</td>
                                    <td class="p-3 text-soft">备用统计地址（主源不可用时使用）</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 开源 -->
                <div>
                    <h2 class="text-xl font-semibold mb-3">开源与联系方式</h2>
                    <p class="text-soft text-sm mb-2">
                        本扩展完全开源，您可以随时审查源代码以验证本隐私政策的执行情况：
                    </p>
                    <a href="https://github.com/hubporg/ghproxy-extension" target="_blank"
                        rel="noreferrer"
                        class="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
                        <Code class="h-3.5 w-3.5" />
                        hubporg/ghproxy-extension
                        <ExternalLink class="h-3 w-3" />
                    </a>
                </div>
            </div>
        </section>
    </div>
</template>
