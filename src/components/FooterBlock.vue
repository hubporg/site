<script setup lang="ts">
import { Github, Mail, MessagesSquare } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-ink-200 dark:border-ink-800 mt-24">
    <div class="container-page py-12">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <img src="/hubp.svg" alt="hubp" class="h-8 w-8 rounded-md" width="32" height="32" />
            <span class="font-bold text-xl">hubp</span>
          </div>
          <p class="max-w-xs text-sm leading-5 text-soft">
            hubporg 是一个专注于开发者工具的技术组织，围绕开源资源访问维护浏览器扩展、Web 加速链接转换与 Cloudflare 边缘代理。
          </p>
          <ul class="flex gap-4 mt-6">
            <li>
              <a href="https://github.com/hubporg" target="_blank" rel="noreferrer"
                class="text-soft hover:text-brand-500 transition-colors" aria-label="GitHub">
                <Github class="h-5 w-5" />
              </a>
            </li>
            <li>
              <a href="https://qm.qq.com/q/JWSV7CSGEs" target="_blank" rel="noreferrer"
                class="text-soft hover:text-brand-500 transition-colors" aria-label="QQ 群">
                <MessagesSquare class="h-5 w-5" />
              </a>
            </li>
            <li>
              <a href="mailto:hubp@hubp.org" class="text-soft hover:text-brand-500 transition-colors" aria-label="Email">
                <Mail class="h-5 w-5" />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p class="font-semibold mb-4">产品</p>
          <ul class="space-y-3 text-sm">
            <li>
              <a href="https://github.com/hubporg/ghproxy-extension" target="_blank" rel="noreferrer"
                class="text-soft hover:text-brand-500 transition-colors">ghproxy-extension</a>
            </li>
            <li>
              <a href="https://github.com/hubporg/ghproxy-next" target="_blank" rel="noreferrer"
                class="text-soft hover:text-brand-500 transition-colors">ghproxy-next</a>
            </li>
            <li>
              <a href="https://github.com/hubporg/CF-GitHub-Proxy" target="_blank" rel="noreferrer"
                class="text-soft hover:text-brand-500 transition-colors">CF-GitHub-Proxy</a>
            </li>
            <li>
              <a href="https://github.akams.cn" target="_blank" rel="noreferrer"
                class="text-soft hover:text-brand-500 transition-colors">github.akams.cn</a>
            </li>
          </ul>
        </div>

        <div>
          <p class="font-semibold mb-4">资源</p>
          <ul class="space-y-3 text-sm">
            <li>
              <a href="https://github.com" target="_blank" rel="noreferrer"
                class="text-soft hover:text-brand-500 transition-colors">GitHub.com</a>
            </li>
            <li>
              <a href="https://docs.github.com" target="_blank" rel="noreferrer"
                class="text-soft hover:text-brand-500 transition-colors">GitHub Docs</a>
            </li>
            <li>
              <a href="https://hub.docker.com" target="_blank" rel="noreferrer"
                class="text-soft hover:text-brand-500 transition-colors">Docker Hub</a>
            </li>
            <li>
              <a href="https://huggingface.co" target="_blank" rel="noreferrer"
                class="text-soft hover:text-brand-500 transition-colors">Hugging Face</a>
            </li>
          </ul>
        </div>

        <div>
          <p class="font-semibold mb-4">信息</p>
          <ul class="space-y-3 text-sm">
            <li>
              <RouterLink to="/about" class="text-soft hover:text-brand-500 transition-colors">关于 hubp</RouterLink>
            </li>
            <li>
              <RouterLink to="/privacy" class="text-soft hover:text-brand-500 transition-colors">隐私政策</RouterLink>
            </li>
            <li>
              <RouterLink to="/terms" class="text-soft hover:text-brand-500 transition-colors">服务条款</RouterLink>
            </li>
            <li>
              <a href="mailto:hubp@hubp.org" class="text-soft hover:text-brand-500 transition-colors">联系我们</a>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="mt-12 pt-8 border-t border-ink-200 dark:border-ink-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-soft">
        <p>© {{ year }} hubporg · Powered by hubporg &amp; contributors.</p>
        <div class="flex flex-col sm:flex-row items-center gap-3 text-xs">
          <span>MIT · GPL-3.0</span>
        </div>
      </div>
    </div>
  </footer>
</template>
