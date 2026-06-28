// 原版 useWebglFire.js
// 改动：1) slider 固定 1.0 2) 始终 active 3) 跳过 MAX_IDLE 自动停止逻辑 4) render 开头检查 loopRunning

import { ref, onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue'
import { VERT, FRAG_SIM, FRAG_BLUR, FRAG_COMP } from './fire-shaders'

interface FBO {
  fbo: WebGLFramebuffer
  tex: WebGLTexture
}

interface Uniforms {
  [key: string]: WebGLUniformLocation | null
}

export function useWebglFire(canvasRef: Ref<HTMLCanvasElement | null>) {
  let gl: WebGL2RenderingContext | null = null
  let canvasEl: HTMLCanvasElement | null = null
  let rafId: number | null = null
  let resizeObserver: ResizeObserver | null = null
  let resizeDebounce: ReturnType<typeof setTimeout> | null = null
  let loopRunning = false
  let ultraStart: number | null = null

  let simProg: WebGLProgram | null = null
  let blurProg: WebGLProgram | null = null
  let compProg: WebGLProgram | null = null
  let vao: WebGLVertexArrayObject | null = null
  let vbo: WebGLBuffer | null = null
  let programsReady = false

  let simA: FBO | null = null
  let simB: FBO | null = null
  let blurH: FBO | null = null
  let blurV: FBO | null = null

  const U: Uniforms = {}

  const SLIDER = 1.0

  onMounted(() => nextTick(init))
  onBeforeUnmount(() => {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null }
    if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null }
    if (resizeDebounce) { clearTimeout(resizeDebounce); resizeDebounce = null }
    loopRunning = false
    destroyFBOs()
    destroyPrograms()
    if (canvasEl) canvasEl.removeEventListener('webglcontextlost', onContextLost)
    gl = null
    canvasEl = null
  })

  function onContextLost(e: Event) { e.preventDefault() }

  function init() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('webgl2', { preserveDrawingBuffer: false, antialias: false })
    if (!ctx) return
    gl = ctx
    canvasEl = canvas
    canvas.addEventListener('webglcontextlost', onContextLost)
    compilePrograms()
    if (!programsReady) return
    resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeDebounce!)
      resizeDebounce = setTimeout(resize, 80)
    })
    resizeObserver.observe(canvas)
    resize()
    ensureLoop()
  }

  function resize() {
    if (!gl || !canvasEl) return
    const rect = canvasEl.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const dpr = window.devicePixelRatio
    canvasEl.width = Math.round(rect.width * dpr)
    canvasEl.height = Math.round(rect.height * dpr)
    destroyFBOs()
    createFBOs()
  }

  function compileShader(type: number, src: string): WebGLShader | null {
    const sh = gl!.createShader(type)!
    gl!.shaderSource(sh, src)
    gl!.compileShader(sh)
    if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS)) {
      console.error(gl!.getShaderInfoLog(sh))
      gl!.deleteShader(sh)
      return null
    }
    return sh
  }

  function linkProgram(vsSrc: string, fsSrc: string): WebGLProgram | null {
    const v = compileShader(gl!.VERTEX_SHADER, vsSrc)
    const f = compileShader(gl!.FRAGMENT_SHADER, fsSrc)
    if (!v || !f) return null
    const p = gl!.createProgram()!
    gl!.attachShader(p, v)
    gl!.attachShader(p, f)
    gl!.bindAttribLocation(p, 0, 'a_pos')
    gl!.linkProgram(p)
    gl!.deleteShader(v)
    gl!.deleteShader(f)
    if (!gl!.getProgramParameter(p, gl!.LINK_STATUS)) {
      console.error(gl!.getProgramInfoLog(p))
      return null
    }
    return p
  }

  function compilePrograms() {
    if (!gl) return
    simProg = linkProgram(VERT, FRAG_SIM)
    blurProg = linkProgram(VERT, FRAG_BLUR)
    compProg = linkProgram(VERT, FRAG_COMP)
    if (!simProg || !blurProg || !compProg) return

    vao = gl.createVertexArray()!
    gl.bindVertexArray(vao)
    vbo = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    for (const [key, prog] of [
      ['u_time', simProg], ['u_slider', simProg], ['u_elapsed', simProg], ['u_back', simProg],
      ['u_dir', blurProg], ['u_ext', blurProg], ['u_tex', blurProg], ['u_res', blurProg],
      ['u_scene', compProg], ['u_glow', compProg]
    ] as const) {
      U[key] = gl.getUniformLocation(prog, key)
    }
    programsReady = true
  }

  function makeFBO(): FBO {
    const fbo = gl!.createFramebuffer()!
    const tex = gl!.createTexture()!
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo)
    gl!.bindTexture(gl!.TEXTURE_2D, tex)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, canvasEl!.width, canvasEl!.height, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0)
    gl!.clearColor(0, 0, 0, 1)
    gl!.clear(gl!.COLOR_BUFFER_BIT)
    return { fbo, tex }
  }

  function createFBOs() {
    if (!gl || !canvasEl) return
    simA = makeFBO()
    simB = makeFBO()
    blurH = makeFBO()
    blurV = makeFBO()
  }

  function destroyFBO(entry: FBO | null) {
    if (!gl || !entry) return
    gl.deleteFramebuffer(entry.fbo)
    gl.deleteTexture(entry.tex)
  }

  function destroyFBOs() {
    destroyFBO(simA); simA = null
    destroyFBO(simB); simB = null
    destroyFBO(blurH); blurH = null
    destroyFBO(blurV); blurV = null
  }

  function destroyPrograms() {
    if (!gl) return
    if (simProg) { gl.deleteProgram(simProg); simProg = null }
    if (blurProg) { gl.deleteProgram(blurProg); blurProg = null }
    if (compProg) { gl.deleteProgram(compProg); compProg = null }
    if (vao) { gl.deleteVertexArray(vao); vao = null }
    if (vbo) { gl.deleteBuffer(vbo); vbo = null }
    programsReady = false
  }

  function ensureLoop() {
    if (!simA || !simB) { resize(); if (!simA || !simB) return }
    if (loopRunning) return
    loopRunning = true
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, simA.fbo); gl!.clear(gl!.COLOR_BUFFER_BIT)
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, simB.fbo); gl!.clear(gl!.COLOR_BUFFER_BIT)
    ultraStart = performance.now()
    rafId = requestAnimationFrame(render)
  }

  function render(t: number) {
    if (!loopRunning) { rafId = null; return }
    const elapsed = (performance.now() - (ultraStart || 0)) / 1000
    gl!.viewport(0, 0, canvasEl!.width, canvasEl!.height)

    gl!.bindFramebuffer(gl!.FRAMEBUFFER, simB!.fbo); gl!.useProgram(simProg)
    gl!.uniform1f(U.u_time!, t * 0.001)
    gl!.uniform1f(U.u_slider!, SLIDER)
    gl!.uniform1f(U.u_elapsed!, elapsed)
    gl!.activeTexture(gl!.TEXTURE0); gl!.bindTexture(gl!.TEXTURE_2D, simA!.tex)
    gl!.uniform1i(U.u_back!, 0)
    gl!.drawArrays(gl!.TRIANGLES, 0, 6)

    gl!.useProgram(blurProg)
    gl!.uniform2f(U.u_res!, canvasEl!.width, canvasEl!.height)
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, blurH!.fbo)
    gl!.uniform2f(U.u_dir!, 1.0, 0.0); gl!.uniform1f(U.u_ext!, 1.0)
    gl!.bindTexture(gl!.TEXTURE_2D, simB!.tex); gl!.uniform1i(U.u_tex!, 0)
    gl!.drawArrays(gl!.TRIANGLES, 0, 6)

    gl!.bindFramebuffer(gl!.FRAMEBUFFER, blurV!.fbo)
    gl!.uniform2f(U.u_dir!, 0.0, 1.0); gl!.uniform1f(U.u_ext!, 0.0)
    gl!.bindTexture(gl!.TEXTURE_2D, blurH!.tex)
    gl!.drawArrays(gl!.TRIANGLES, 0, 6)

    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null); gl!.useProgram(compProg)
    gl!.activeTexture(gl!.TEXTURE0); gl!.bindTexture(gl!.TEXTURE_2D, simB!.tex)
    gl!.uniform1i(U.u_scene!, 0)
    gl!.activeTexture(gl!.TEXTURE1); gl!.bindTexture(gl!.TEXTURE_2D, blurV!.tex)
    gl!.uniform1i(U.u_glow!, 1)
    gl!.drawArrays(gl!.TRIANGLES, 0, 6)

    const tmp = simA; simA = simB; simB = tmp
    rafId = requestAnimationFrame(render)
  }
}
