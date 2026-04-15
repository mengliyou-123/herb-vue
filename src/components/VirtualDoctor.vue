<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { diagnosisStreamService } from '@/api/ai.js'
import { ElMessage } from 'element-plus'

const props = defineProps({
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const isCalling = ref(false)
const isSpeaking = ref(false)
const isListening = ref(false)
const messages = ref([])
const currentText = ref('')
const userInput = ref('')
const recognition = ref(null)
const synthesis = window.speechSynthesis
const utterance = ref(null)
const doctorMood = ref('neutral')
const lipSyncActive = ref(false)
const canvasRef = ref(null)
const callStartTime = ref(Date.now())
const isReady = ref(false)
let animationId = null
let ctx = null
let time = 0
let mouseX = 0
let mouseY = 0
let blinkTimer = 0
let isBlinking = false
let breathOffset = 0
let nodOffset = 0
let particles = []
let herbParticles = []

const quickQuestions = [
  '最近总是失眠多梦怎么办',
  '感冒咳嗽有好的中药方子吗',
  '胃痛腹胀应该怎么调理',
  '手脚冰凉是什么原因',
  '疲劳乏力如何用中药调理'
]

onMounted(() => {
  initSpeechRecognition()
  document.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  if (recognition.value) recognition.value.stop()
  if (synthesis.speaking) synthesis.cancel()
  if (animationId) cancelAnimationFrame(animationId)
  document.removeEventListener('mousemove', handleMouseMove)
})

const handleMouseMove = (e) => {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (rect) {
    mouseX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2))
    mouseY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2))
  }
}

const initCanvas = () => {
  nextTick(() => {
    setTimeout(() => {
      if (!canvasRef.value) return
      ctx = canvasRef.value.getContext('2d', { alpha: false })
      if (ctx) {
        initParticles()
        initHerbParticles()
        isReady.value = true
        startRenderLoop()
      }
    }, 50)
  })
}

const startRenderLoop = () => {
  const loop = () => {
    time += 0.016
    blinkTimer += 0.016
    breathOffset = Math.sin(time * 1.2) * 3
    nodOffset = doctorMood.value === 'speaking' ? Math.sin(time * 3) * 2 : Math.sin(time * 0.5) * 1
    
    if (blinkTimer > 3 + Math.random() * 2) {
      isBlinking = true
      blinkTimer = 0
      setTimeout(() => { isBlinking = false }, 150)
    }
    
    draw()
    animationId = requestAnimationFrame(loop)
  }
  loop()
}

// ==================== 粒子系统 ====================
const initParticles = () => {
  particles = []
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: Math.random() * 420, y: Math.random() * 520,
      vx: (Math.random() - 0.5) * 0.3, vy: -(Math.random() * 0.4 + 0.1),
      size: Math.random() * 2.5 + 0.5, opacity: Math.random() * 0.4 + 0.1,
      char: ['✦', '✧', '◈', '❋'][Math.floor(Math.random() * 4)]
    })
  }
}

const initHerbParticles = () => {
  herbParticles = []
  const herbs = ['🌿', '🍃', '🌱', '☘️']
  for (let i = 0; i < 8; i++) {
    herbParticles.push({
      x: Math.random() * 420, y: Math.random() * 520,
      vx: (Math.random() - 0.5) * 0.2, vy: -(Math.random() * 0.3 + 0.05),
      size: Math.random() * 10 + 8, opacity: Math.random() * 0.15 + 0.05,
      char: herbs[Math.floor(Math.random() * herbs.length)],
      rot: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 0.5
    })
  }
}

const updateParticles = () => {
  const update = (list, w = 420, h = 520) => {
    list.forEach(p => {
      p.x += p.vx; p.y += p.vy
      if (p.rot !== undefined) p.rot += p.rotSpeed
      if (p.y < -20) { p.y = h + 10; p.x = Math.random() * w }
      if (p.x < -20) p.x = w + 10
      if (p.x > w + 20) p.x = -10
    })
  }
  update(particles)
  update(herbParticles)
}

// ==================== 主绘制函数 ====================
const draw = () => {
  if (!ctx || !canvasRef.value) return
  const W = canvasRef.value.width
  const H = canvasRef.value.height
  const cx = W / 2
  const cy = H / 2 - 10

  ctx.clearRect(0, 0, W, H)
  drawBackground(W, H, cx, cy)
  updateParticles()
  drawParticleLayer(W, H)

  ctx.save()
  ctx.translate(cx, cy + breathOffset + nodOffset)
  
  const headTiltX = mouseX * 0.04
  const headTiltY = mouseY * 0.03
  ctx.transform(1, headTiltY * 0.08, headTiltX * 0.05, 1, 0, 0)

  drawBody()
  drawNeck()
  drawEars()
  drawHead()
  drawHairBack()
  drawFace()
  drawHairFront()
  drawBeard()
  drawHat()
  
  ctx.restore()
  drawDecorations(W, H)
  drawVignette(W, H)
}

// ==================== 背景 ====================
const drawBackground = (W, H, cx, cy) => {
  const bg = ctx.createRadialGradient(cx, cy - 40, 30, cx, cy, 320)
  bg.addColorStop(0, '#FFF8E7')
  bg.addColorStop(0.4, '#F5E6CC')
  bg.addColorStop(0.8, '#E8D4B0')
  bg.addColorStop(1, '#D4C4A0')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const glow = isSpeaking.value ? 0.18 : 0.08
  const glowColor = isSpeaking.value ? '74, 222, 128' : '212, 175, 55'
  const g = ctx.createRadialGradient(cx, cy - 60, 0, cx, cy - 60, 220)
  g.addColorStop(0, `rgba(${glowColor}, ${glow})`)
  g.addColorStop(1, `rgba(${glowColor}, 0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  
  if (isListening.value) {
    const lg = ctx.createRadialGradient(cx, cy - 60, 0, cx, cy - 60, 200)
    lg.addColorStop(0, 'rgba(59, 130, 246, 0.12)')
    lg.addColorStop(1, 'rgba(59, 130, 246, 0)')
    ctx.fillStyle = lg
    ctx.fillRect(0, 0, W, H)
  }
}

const drawParticleLayer = (W, H) => {
  particles.forEach(p => {
    ctx.save()
    ctx.globalAlpha = p.opacity
    ctx.fillStyle = '#D4AF37'
    ctx.font = `${p.size * 3}px serif`
    ctx.textAlign = 'center'
    ctx.fillText(p.char, p.x, p.y)
    ctx.restore()
  })
  herbParticles.forEach(p => {
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate((p.rot || 0) * Math.PI / 180)
    ctx.globalAlpha = p.opacity
    ctx.font = `${p.size}px serif`
    ctx.textAlign = 'center'
    ctx.fillText(p.char, 0, 0)
    ctx.restore()
  })
}

const drawVignette = (W, H) => {
  const v = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.75)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(0,0,0,0.06)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, W, H)
}

// ==================== 身体（长衫）====================
const drawBody = () => {
  const g = ctx.createLinearGradient(-80, 30, 80, 200)
  g.addColorStop(0, '#7B3F19')
  g.addColorStop(0.3, '#8B4513')
  g.addColorStop(0.6, '#A0522D')
  g.addColorStop(1, '#6B3410')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(-80, 30)
  ctx.quadraticCurveTo(-90, 120, -65, 200)
  ctx.lineTo(65, 200)
  ctx.quadraticCurveTo(90, 120, 80, 30)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#DAA520'
  ctx.lineWidth = 1.5
  ctx.setLineDash([6, 4])
  ctx.beginPath(); ctx.moveTo(0, 35); ctx.lineTo(0, 195); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-30, 40); ctx.lineTo(-30, 190); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(30, 40); ctx.lineTo(30, 190); ctx.stroke()
  ctx.setLineDash([])

  ctx.strokeStyle = '#DAA520'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 20, 42, 0.1, Math.PI - 0.1)
  ctx.stroke()

  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 16px "KaiTi", "STKaiti", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('悬壶济世', 0, 100)

  const sleeveG = ctx.createLinearGradient(-110, 60, -60, 100)
  sleeveG.addColorStop(0, '#8B4513')
  sleeveG.addColorStop(1, '#6B3410')
  ctx.fillStyle = sleeveG
  ctx.beginPath()
  ctx.moveTo(-80, 40)
  ctx.quadraticCurveTo(-120, 70, -105, 110)
  ctx.quadraticCurveTo(-90, 100, -80, 80)
  ctx.closePath()
  ctx.fill()
  
  ctx.fillStyle = sleeveG
  ctx.beginPath()
  ctx.moveTo(80, 40)
  ctx.quadraticCurveTo(120, 70, 105, 110)
  ctx.quadraticCurveTo(90, 100, 80, 80)
  ctx.closePath()
  ctx.fill()
}

const drawNeck = () => {
  const ng = ctx.createLinearGradient(-20, -10, 20, 30)
  ng.addColorStop(0, '#F5E0C8')
  ng.addColorStop(1, '#E8D0B0')
  ctx.fillStyle = ng
  ctx.beginPath()
  ctx.moveTo(-22, -10)
  ctx.lineTo(-18, 35)
  ctx.lineTo(18, 35)
  ctx.lineTo(22, -10)
  ctx.closePath()
  ctx.fill()
}

const drawEars = () => {
  [-95, 95].forEach(x => {
    const eg = ctx.createRadialGradient(x, -5, 2, x, -5, 18)
    eg.addColorStop(0, '#F5E0C8')
    eg.addColorStop(1, '#E0C8A8')
    ctx.fillStyle = eg
    ctx.beginPath()
    ctx.ellipse(x, -5, 14, 22, x < 0 ? -0.15 : 0.15, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(180,150,120,0.3)'
    ctx.lineWidth = 1
    ctx.stroke()
  })
}

// ==================== 头部 ====================
const drawHead = () => {
  const hg = ctx.createRadialGradient(-15, -20, 10, 0, 0, 105)
  hg.addColorStop(0, '#FFF5E6')
  hg.addColorStop(0.6, '#F5E0C8')
  hg.addColorStop(1, '#E0C8A8')
  ctx.fillStyle = hg
  ctx.beginPath()
  ctx.ellipse(0, 0, 98, 105, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(180,150,120,0.2)'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

// ==================== 面部 ====================
const drawFace = () => {
  drawEyebrows()
  drawEyes()
  drawNose()
  drawMouth()
  drawWrinkles()
  drawBlush()
}

const drawEyebrows = () => {
  ctx.strokeStyle = '#999'
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'
  
  const liftY = doctorMood.value === 'listening' ? -3 : 0
  
  ctx.beginPath()
  ctx.moveTo(-52, -28 + liftY)
  ctx.quadraticCurveTo(-35, -38 + liftY, -18, -28 + liftY)
  ctx.stroke()
  
  ctx.beginPath()
  ctx.moveTo(18, -28 + liftY)
  ctx.quadraticCurveTo(35, -38 + liftY, 52, -28 + liftY)
  ctx.stroke()
}

const drawEyes = () => {
  const eyeX = 34
  const eyeY = -8
  const pupilDx = mouseX * 5
  const pupilDy = mouseY * 3

  if (isBlinking) {
    ctx.strokeStyle = '#4A3728'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(-eyeX - 12, eyeY); ctx.lineTo(-eyeX + 12, eyeY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(eyeX - 12, eyeY); ctx.lineTo(eyeX + 12, eyeY); ctx.stroke()
    return
  }

  [-eyeX, eyeX].forEach(x => {
    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    ctx.ellipse(x, eyeY, 15, 12, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(100,80,60,0.3)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = '#3A2518'
    ctx.beginPath()
    ctx.arc(x + pupilDx, eyeY + pupilDy, 7, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#1A0A00'
    ctx.beginPath()
    ctx.arc(x + pupilDx, eyeY + pupilDy, 3.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#FFF'
    ctx.beginPath()
    ctx.arc(x + pupilDx + 2.5, eyeY + pupilDy - 2.5, 2.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + pupilDx - 1, eyeY + pupilDy + 1.5, 1, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.strokeStyle = 'rgba(80,60,40,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(-eyeX - 16, eyeY - 14); ctx.lineTo(-eyeX + 16, eyeY - 14); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(eyeX - 16, eyeY - 14); ctx.lineTo(eyeX + 16, eyeY - 14); ctx.stroke()
}

const drawNose = () => {
  ctx.strokeStyle = '#C4A77D'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-2, 8)
  ctx.quadraticCurveTo(-4, 28, -8, 34)
  ctx.quadraticCurveTo(0, 38, 8, 34)
  ctx.stroke()
  
  ctx.fillStyle = 'rgba(200,170,130,0.2)'
  ctx.beginPath()
  ctx.ellipse(-6, 35, 5, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(6, 35, 5, 3, 0, 0, Math.PI * 2)
  ctx.fill()
}

const drawMouth = () => {
  const lipOpen = lipSyncActive.value ? (Math.sin(time * 14) * 5 + 6) : 2
  const lipY = 52
  const smileWidth = doctorMood.value === 'speaking' ? 0 : 3

  ctx.fillStyle = '#C4847C'
  ctx.beginPath()
  ctx.moveTo(-22, lipY)
  ctx.quadraticCurveTo(-5, lipY - 8 - lipOpen + smileWidth, 0, lipY - 6 - lipOpen + smileWidth)
  ctx.quadraticCurveTo(5, lipY - 8 - lipOpen + smileWidth, 22, lipY)
  ctx.quadraticCurveTo(5, lipY - 1, 0, lipY - 2)
  ctx.quadraticCurveTo(-5, lipY - 1, -22, lipY)
  ctx.fill()

  if (lipOpen > 4) {
    ctx.fillStyle = '#6B3030'
    ctx.beginPath()
    ctx.ellipse(0, lipY + 1, 14, lipOpen * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = 'rgba(180,80,80,0.3)'
    ctx.beginPath()
    ctx.ellipse(0, lipY + lipOpen * 0.3, 10, 3, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#B47068'
  ctx.beginPath()
  ctx.moveTo(-22, lipY + 4)
  ctx.quadraticCurveTo(-5, lipY + 12 + lipOpen, 0, lipY + 10 + lipOpen)
  ctx.quadraticCurveTo(5, lipY + 12 + lipOpen, 22, lipY + 4)
  ctx.quadraticCurveTo(5, lipY + 7, 0, lipY + 8)
  ctx.quadraticCurveTo(-5, lipY + 7, -22, lipY + 4)
  ctx.fill()

  ctx.strokeStyle = 'rgba(160,120,100,0.25)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(0, lipY - 14)
  ctx.lineTo(0, lipY - 6 - lipOpen)
  ctx.stroke()
}

const drawWrinkles = () => {
  ctx.strokeStyle = 'rgba(160,140,120,0.15)'
  ctx.lineWidth = 1
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 16 - 5, -58)
    ctx.quadraticCurveTo(i * 16, -64, i * 16 + 5, -58)
    ctx.stroke()
  }
  [-60, 60].forEach(x => {
    ctx.beginPath()
    ctx.moveTo(x - 8, -14)
    ctx.lineTo(x - 14, -6)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x - 6, -10)
    ctx.lineTo(x - 12, -2)
    ctx.stroke()
  })
  
  ctx.strokeStyle = 'rgba(160,140,120,0.1)'
  ctx.lineWidth = 0.8
  ctx.beginPath(); ctx.moveTo(-30, 42); ctx.quadraticCurveTo(-20, 46, -10, 43); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(10, 43); ctx.quadraticCurveTo(20, 46, 30, 42); ctx.stroke()
}

const drawBlush = () => {
  [-62, 62].forEach(x => {
    const bg = ctx.createRadialGradient(x, 22, 0, x, 22, 22)
    bg.addColorStop(0, 'rgba(255,160,160,0.12)')
    bg.addColorStop(1, 'rgba(255,160,160,0)')
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.arc(x, 22, 22, 0, Math.PI * 2)
    ctx.fill()
  })
}

// ==================== 头发 ====================
const drawHairBack = () => {
  ctx.fillStyle = '#D8D8D8'
  ctx.beginPath()
  ctx.ellipse(0, -90, 85, 55, 0, Math.PI, 0, true)
  ctx.fill()
  
  ctx.fillStyle = '#C8C8C8'
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 18, -90)
    ctx.quadraticCurveTo(i * 22, -140, i * 14, -160)
    ctx.quadraticCurveTo(i * 8, -148, i * 18, -90)
    ctx.fill()
  }
}

const drawHairFront = () => {
  ctx.fillStyle = '#E0E0E0'
  ctx.beginPath()
  ctx.moveTo(-85, -60)
  ctx.quadraticCurveTo(-90, -90, -60, -105)
  ctx.quadraticCurveTo(-30, -120, 0, -115)
  ctx.quadraticCurveTo(30, -120, 60, -105)
  ctx.quadraticCurveTo(90, -90, 85, -60)
  ctx.quadraticCurveTo(70, -80, 40, -90)
  ctx.quadraticCurveTo(10, -98, -10, -95)
  ctx.quadraticCurveTo(-40, -90, -70, -75)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#CCC'
  ctx.lineWidth = 0.8
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath()
    ctx.moveTo(i * 20, -95)
    ctx.quadraticCurveTo(i * 22, -80, i * 18, -65)
    ctx.stroke()
  }
}

// ==================== 胡须 ====================
const drawBeard = () => {
  const bg = ctx.createLinearGradient(0, 50, 0, 170)
  bg.addColorStop(0, '#E8E8E8')
  bg.addColorStop(1, '#D0D0D0')
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.moveTo(-55, 48)
  ctx.quadraticCurveTo(-70, 90, -50, 135)
  ctx.quadraticCurveTo(-25, 168, 0, 175)
  ctx.quadraticCurveTo(25, 168, 50, 135)
  ctx.quadraticCurveTo(70, 90, 55, 48)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgba(200,200,200,0.6)'
  ctx.lineWidth = 0.8
  for (let row = 0; row < 8; row++) {
    for (let col = -4; col <= 4; col++) {
      const sx = col * 11
      const sy = 55 + row * 15
      const wave = Math.sin(time * 2 + col * 0.5 + row * 0.3) * 2
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.quadraticCurveTo(sx + wave, sy + 12, sx + wave * 0.5, sy + 22)
      ctx.stroke()
    }
  }

  ctx.fillStyle = '#D8D8D8'
  ctx.beginPath()
  ctx.moveTo(-8, 60)
  ctx.quadraticCurveTo(-12, 80, -6, 90)
  ctx.quadraticCurveTo(0, 85, 6, 90)
  ctx.quadraticCurveTo(12, 80, 8, 60)
  ctx.closePath()
  ctx.fill()
}

// ==================== 帽子 ====================
const drawHat = () => {
  const hg = ctx.createLinearGradient(-70, -160, 70, -110)
  hg.addColorStop(0, '#2C1810')
  hg.addColorStop(0.5, '#3D2317')
  hg.addColorStop(1, '#2C1810')
  ctx.fillStyle = hg
  ctx.beginPath()
  ctx.ellipse(0, -108, 72, 18, 0, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.beginPath()
  ctx.moveTo(-60, -110)
  ctx.quadraticCurveTo(-65, -155, -30, -165)
  ctx.quadraticCurveTo(0, -172, 30, -165)
  ctx.quadraticCurveTo(65, -155, 60, -110)
  ctx.closePath()
  ctx.fill()
  
  ctx.strokeStyle = '#DAA520'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.ellipse(0, -110, 72, 18, 0, 0, Math.PI * 2)
  ctx.stroke()
  
  ctx.fillStyle = '#DAA520'
  ctx.beginPath()
  ctx.arc(0, -165, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#B8860B'
  ctx.lineWidth = 1
  ctx.stroke()
}

// ==================== 装饰 ====================
const drawDecorations = (W, H) => {
  ctx.save()
  ctx.globalAlpha = 0.06
  ctx.font = '42px serif'
  ctx.fillStyle = '#D4AF37'
  ctx.textAlign = 'center'
  
  ctx.save()
  ctx.translate(40, 70)
  ctx.rotate(time * 0.15)
  ctx.fillText('☯', 0, 0)
  ctx.restore()
  
  ctx.save()
  ctx.translate(W - 40, H - 70)
  ctx.rotate(-time * 0.15)
  ctx.fillText('☯', 0, 0)
  ctx.restore()
  
  ctx.font = '30px serif'
  ctx.fillText('☰', W - 45, 65)
  ctx.fillText('☷', 45, H - 55)
  ctx.fillText('☵', W - 45, H - 55)
  ctx.fillText('☲', 45, 65)
  ctx.restore()
}

// ==================== 语音识别 ====================
const initSpeechRecognition = () => {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition.value = new SR()
    recognition.value.continuous = false
    recognition.value.interimResults = true
    recognition.value.lang = 'zh-CN'
    recognition.value.onstart = () => { isListening.value = true; doctorMood.value = 'listening' }
    recognition.value.onresult = (e) => {
      let t = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) t += e.results[i][0].transcript
      }
      if (t) { userInput.value = t; sendMessage() }
    }
    recognition.value.onerror = (e) => {
      isListening.value = false; doctorMood.value = 'neutral'
      if (e.error === 'no-speech') ElMessage.warning('没有检测到语音，请重试')
    }
    recognition.value.onend = () => {
      isListening.value = false
      setTimeout(() => { if (doctorMood.value === 'listening') doctorMood.value = 'neutral' }, 500)
    }
  }
}

// ==================== 对话功能 ====================
const startCall = () => {
  isCalling.value = true
  callStartTime.value = Date.now()
  messages.value = []
  initCanvas()
  addMessage('doctor', '您好，老朽行医数十载，愿为阁下答疑解惑。无论是中草药知识、病症分析，还是养生调理，皆可询问。')
  speak('您好，老朽行医数十载，愿为阁下答疑解惑。无论是中草药知识、病症分析，还是养生调理，皆可询问。')
}

const endCall = () => {
  isCalling.value = false
  if (synthesis.speaking) synthesis.cancel()
  if (recognition.value && isListening.value) recognition.value.stop()
  isSpeaking.value = false; isListening.value = false
  lipSyncActive.value = false; doctorMood.value = 'neutral'
  if (animationId) { cancelAnimationFrame(animationId); animationId = null }
  emit('close')
}

const startListening = () => {
  if (recognition.value && !isListening.value && !isSpeaking.value) {
    try { recognition.value.start() } catch (e) { console.error(e) }
  }
}

const stopListening = () => {
  if (recognition.value && isListening.value) recognition.value.stop()
}

const sendMessage = async () => {
  const text = userInput.value.trim()
  if (!text || isSpeaking.value) return
  addMessage('user', text)
  userInput.value = ''
  doctorMood.value = 'thinking'
  isSpeaking.value = true
  try {
    let full = ''
    await diagnosisStreamService(text,
      (chunk) => { full += chunk; currentText.value = full },
      () => { addMessage('doctor', full); currentText.value = ''; speak(full); doctorMood.value = 'speaking' },
      () => { const fb = getFallback(text); addMessage('doctor', fb); currentText.value = ''; speak(fb); doctorMood.value = 'speaking' }
    )
  } catch {
    const fb = getFallback(text); addMessage('doctor', fb); currentText.value = ''; speak(fb); doctorMood.value = 'speaking'
  }
}

const addMessage = (type, content) => {
  messages.value.push({ type, content, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) })
  nextTick(() => { const el = document.querySelector('.chat-msgs'); if (el) el.scrollTop = el.scrollHeight })
}

const speak = (text) => {
  if (!synthesis) return
  if (synthesis.speaking) synthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'zh-CN'; u.rate = 0.88; u.pitch = 0.85; u.volume = 1
  const v = synthesis.getVoices().find(v => v.lang.includes('zh'))
  if (v) u.voice = v
  u.onstart = () => { isSpeaking.value = true; lipSyncActive.value = true; doctorMood.value = 'speaking' }
  u.onend = () => { isSpeaking.value = false; lipSyncActive.value = false; doctorMood.value = 'neutral' }
  u.onerror = () => { isSpeaking.value = false; lipSyncActive.value = false; doctorMood.value = 'neutral' }
  synthesis.speak(u)
}

const stopSpeaking = () => {
  if (synthesis.speaking) synthesis.cancel()
  isSpeaking.value = false; lipSyncActive.value = false; doctorMood.value = 'neutral'
}

const getFallback = (q) => {
  const l = q.toLowerCase()
  if (l.includes('感冒') || l.includes('发热') || l.includes('咳嗽'))
    return '感冒乃外感六淫之邪所致，分风寒、风热两型。风寒者恶寒重、发热轻、无汗头痛，宜用荆防败毒散；风热者发热重、微恶风、咽喉肿痛，宜用银翘散。多饮温水，注意休息，若症状持续，当及时就医。'
  if (l.includes('失眠') || l.includes('睡眠'))
    return '失眠中医称"不寐"，多因心脾两虚、阴虚火旺、肝郁化火所致。酸枣仁汤可养心安神，归脾汤可补益心脾。日常当规律作息，睡前温水泡脚，按摩涌泉穴，皆有助入眠。'
  if (l.includes('胃痛') || l.includes('腹胀') || l.includes('消化'))
    return '脾胃为后天之本，胃痛腹胀多因饮食不节、情志不畅。辨证有胃寒、胃热、食积、肝气犯胃等型。保和丸消食导滞，逍遥丸疏肝理气。饮食宜清淡，少食生冷油腻，保持心情舒畅。'
  if (l.includes('中药') || l.includes('草药'))
    return '中药讲究四气五味、升降浮沉、归经。人参大补元气，黄芪益气固表，当归补血活血，陈皮理气健脾，茯苓健脾利湿。用药需辨证论治，注意配伍禁忌，宜在专业医师指导下使用。'
  return '中医强调整体观念与辨证论治，需结合舌象、脉象、体质综合分析。请详述您的症状，老朽当尽力为您分析。亦建议至正规医疗机构就诊，以获更准确的诊断与治疗。'
}

const formatMessage = (t) => {
  if (!t) return ''
  let s = String(t)
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*(.*?)\*/g, '<strong>$1</strong>')
  s = s.replace(/^(\d+)\.\s+/gm, '<strong>$1.</strong> ')
  s = s.replace(/^-\s+/gm, '• ')
  s = s.replace(/\n+/g, '<br>')
  return s
}

watch(() => props.show, (v) => { if (v && !isCalling.value) startCall() })
</script>

<template>
  <div class="vd-modal" v-if="show">
    <div class="vd-overlay" @click="endCall"></div>
    <div class="vd-container">
      <div class="vd-header">
        <div class="vd-header-left">
          <div class="vd-status" :class="{ active: isCalling }">
            <span class="vd-pulse"></span>
            <span>{{ isCalling ? '视频问诊中' : '连接中...' }}</span>
          </div>
          <div class="vd-timer" v-if="isCalling">⏱ {{ Math.floor((Date.now() - callStartTime) / 1000) }}s</div>
        </div>
        <button class="vd-end-btn" @click="endCall">📞 结束问诊</button>
      </div>

      <div class="vd-body">
        <div class="vd-video">
          <div class="vd-canvas-wrap">
            <canvas ref="canvasRef" width="420" height="520" class="vd-canvas" :class="{ speaking: isSpeaking, listening: isListening }"></canvas>
            <div class="vd-mood-badge" :class="doctorMood">
              <span v-if="doctorMood==='speaking'">🌊 讲解中</span>
              <span v-else-if="doctorMood==='listening'">👂 聆听中</span>
              <span v-else-if="doctorMood==='thinking'">💭 思考中</span>
              <span v-else>✨ 等待提问</span>
            </div>
            <div class="vd-glow" :class="{ active: isSpeaking }"></div>
            <div class="vd-hint" v-if="!isSpeaking && !isListening && isReady">移动鼠标互动</div>
          </div>
          <div class="vd-doctor-info">
            <div class="vd-avatar"><div class="vd-avatar-ring"></div><span>👨‍⚕️</span></div>
            <div class="vd-info-text">
              <h3>老中医</h3>
            </div>
            <div class="vd-signal"><span></span><span></span><span></span><span></span></div>
          </div>
        </div>

        <div class="vd-chat">
          <div class="vd-chat-head">
            <h3>💬 智能对话 <span class="vd-msg-count">{{ messages.length }}</span></h3>
            <button class="vd-clear" @click="messages = []">🗑️</button>
          </div>
          <div class="chat-msgs">
            <div v-for="(m, i) in messages" :key="i" :class="['vd-msg', m.type]">
              <div class="vd-msg-avatar">{{ m.type === 'doctor' ? '👨‍⚕️' : '👤' }}</div>
              <div class="vd-msg-body">
                <div class="vd-msg-head">
                  <span class="vd-msg-name">{{ m.type === 'doctor' ? '中医顾问' : '我' }}</span>
                  <span class="vd-msg-time">{{ m.time }}</span>
                </div>
                <div class="vd-msg-text" v-html="formatMessage(m.content)"></div>
              </div>
            </div>
            <div v-if="currentText" class="vd-msg doctor vd-typing">
              <div class="vd-msg-avatar">👨‍⚕️</div>
              <div class="vd-msg-body">
                <div class="vd-dots"><span></span><span></span><span></span></div>
                <div class="vd-typing-text">{{ currentText.substring(0, 80) }}<span class="vd-cursor">|</span></div>
              </div>
            </div>
          </div>
          <div class="vd-quick" v-if="!isSpeaking && !isListening">
            <span>⚡ 快捷提问</span>
            <button v-for="(q, i) in quickQuestions" :key="i" @click="userInput = q; sendMessage()">{{ q }}</button>
          </div>
          <div class="vd-input">
            <el-input v-model="userInput" type="textarea" :rows="2" placeholder="输入问题或点击麦克风语音输入..." @keyup.enter.exact="sendMessage()" :disabled="isSpeaking || isListening" />
            <div class="vd-input-btns">
              <button class="vd-mic" :class="{ listening: isListening }" @click="isListening ? stopListening() : startListening()" :disabled="isSpeaking">
                <template v-if="isListening"><span class="vd-wave"></span><span class="vd-wave"></span><span class="vd-wave"></span></template>
                <template v-else>🎤</template>
              </button>
              <button class="vd-send" @click="sendMessage()" :disabled="!userInput.trim() || isSpeaking || isListening">➤ 发送</button>
              <button v-if="isSpeaking" class="vd-stop" @click="stopSpeaking()">⏹ 停止</button>
            </div>
          </div>
        </div>
      </div>

      <div class="vd-footer">
        <div class="vd-ctrls">
          <button :class="['vd-ctrl', { active: isListening }]" @click="isListening ? stopListening() : startListening()" :disabled="isSpeaking">🎤 {{ isListening ? '录音中' : '麦克风' }}</button>
          <button :class="['vd-ctrl', { muted: isSpeaking }]" @click="isSpeaking ? stopSpeaking() : null" :disabled="!isSpeaking">🔊 {{ isSpeaking ? '静音' : '扬声器' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vd-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}
.vd-overlay{position:absolute;inset:0;background:rgba(240,237,232,.65);backdrop-filter:blur(12px)}
.vd-container{position:relative;width:95%;max-width:1200px;height:90vh;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.08);display:flex;flex-direction:column;border:1px solid rgba(0,0,0,.06)}
.vd-header{background:#fff;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f0eeeb}
.vd-header-left{display:flex;align-items:center;gap:16px}
.vd-status{display:flex;align-items:center;gap:8px;color:#8c8578;font-size:13px}
.vd-status.active{color:#2D5016}
.vd-pulse{width:10px;height:10px;border-radius:50%;background:#4ade80;animation:vd-p 2s infinite}
@keyframes vd-p{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}
.vd-timer{color:#8c8578;font-size:13px;font-variant-numeric:tabular-nums}
.vd-end-btn{background:#C14443;color:#fff;border:none;padding:10px 24px;border-radius:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;transition:all .3s;font-size:13px}
.vd-end-btn:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(193,68,67,.2)}
.vd-body{flex:1;display:flex;overflow:hidden}
.vd-video{flex:0 0 440px;background:#FAFAF8;display:flex;flex-direction:column;border-right:1px solid #f0eeeb}
.vd-canvas-wrap{flex:1;position:relative;display:flex;align-items:center;justify-content:center;padding:16px;overflow:hidden;background:linear-gradient(180deg,#FAFAF8 0%,#F5F3EF 100%)}
.vd-canvas{border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.04);transition:all .4s;cursor:move}
.vd-canvas.speaking{box-shadow:0 2px 12px rgba(0,0,0,.06),0 0 16px rgba(45,80,22,.1)}
.vd-canvas.listening{box-shadow:0 2px 12px rgba(0,0,0,.06),0 0 16px rgba(59,130,246,.08)}
.vd-mood-badge{position:absolute;top:28px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.92);color:#6B5D4D;padding:7px 18px;border-radius:20px;font-size:12px;font-weight:600;backdrop-filter:blur(10px);border:1px solid rgba(0,0,0,.06);transition:all .3s;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.vd-mood-badge.speaking{background:rgba(45,80,22,.92);color:#fff;border-color:rgba(74,124,44,.3)}
.vd-mood-badge.listening{background:rgba(59,130,246,.92);color:#fff;border-color:rgba(96,165,250,.3)}
.vd-mood-badge.thinking{background:rgba(193,68,67,.92);color:#fff;border-color:rgba(232,90,89,.3)}
.vd-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(212,175,55,.05) 0%,transparent 70%);pointer-events:none;opacity:.5;transition:all .5s}
.vd-glow.active{background:radial-gradient(circle,rgba(45,80,22,.06) 0%,transparent 70%);opacity:1;animation:vd-gp 2s ease-in-out infinite}
@keyframes vd-gp{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.15)}}
.vd-hint{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.88);color:#8c8578;padding:5px 14px;border-radius:14px;font-size:11px;backdrop-filter:blur(6px);border:1px solid rgba(0,0,0,.05);animation:vd-hf 3s ease-in-out infinite}
@keyframes vd-hf{0%,100%{opacity:.8}50%{opacity:.4}}
.vd-doctor-info{padding:12px 20px;background:#fff;display:flex;align-items:center;gap:12px;border-top:1px solid #f0eeeb}
.vd-avatar{position:relative;width:42px;height:42px;display:flex;align-items:center;justify-content:center;font-size:22px}
.vd-avatar-ring{position:absolute;inset:-3px;border-radius:50%;background:linear-gradient(135deg,#6B4423,#A67C52);animation:vd-ar 3s linear infinite}
@keyframes vd-ar{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.vd-avatar span{position:relative;z-index:1}
.vd-info-text h3{color:#2C2416;font-size:14px;margin:0;font-weight:700}
.vd-info-text p{color:#8c8578;font-size:11px;margin:0}
.vd-signal{margin-left:auto;display:flex;gap:2px;align-items:flex-end;height:14px}
.vd-signal span{width:3px;background:#2D5016;border-radius:1px}
.vd-signal span:nth-child(1){height:4px}
.vd-signal span:nth-child(2){height:7px}
.vd-signal span:nth-child(3){height:11px}
.vd-signal span:nth-child(4){height:14px}
.vd-chat{flex:1;display:flex;flex-direction:column;background:#fff}
.vd-chat-head{padding:14px 22px;background:#FAFAF8;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f0eeeb}
.vd-chat-head h3{color:#2C2416;font-size:15px;margin:0;display:flex;align-items:center;gap:8px;font-weight:700}
.vd-msg-count{font-size:11px;color:#8c8578;background:#f5f3ef;padding:2px 8px;border-radius:10px}
.vd-clear{background:#f5f3ef;border:1px solid rgba(0,0,0,.06);color:#8c8578;padding:6px 12px;border-radius:8px;cursor:pointer;transition:all .2s;font-size:13px}
.vd-clear:hover{background:rgba(193,68,67,.06);color:#C14443;border-color:rgba(193,68,67,.12)}
.chat-msgs{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:14px;background:#fff}
.chat-msgs::-webkit-scrollbar{width:5px}
.chat-msgs::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1);border-radius:3px}
.vd-msg{display:flex;gap:10px;max-width:88%;animation:vd-si .3s ease}
.vd-msg.user{align-self:flex-end;flex-direction:row-reverse}
@keyframes vd-si{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.vd-msg-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.vd-msg.doctor .vd-msg-avatar{background:linear-gradient(135deg,#6B4423,#A67C52)}
.vd-msg.user .vd-msg-avatar{background:linear-gradient(135deg,#3b82f6,#2563eb)}
.vd-msg-body{flex:1;min-width:0}
.vd-msg-head{display:flex;justify-content:space-between;margin-bottom:4px}
.vd-msg-name{font-size:12px;font-weight:600;color:#6B4423}
.vd-msg.user .vd-msg-name{color:#3b82f6}
.vd-msg-time{font-size:10px;color:#b5aea5}
.vd-msg-text{background:#F7F5F2;padding:10px 14px;border-radius:14px;color:#2C2416;line-height:1.65;font-size:13px;word-break:break-word;border:1px solid rgba(0,0,0,.04)}
.vd-msg.user .vd-msg-text{background:linear-gradient(135deg,#3b82f6,#2563eb);border-color:transparent;color:#fff}
.vd-msg-text :deep(strong){color:#6B4423;font-weight:700}
.vd-msg.user .vd-msg-text :deep(strong){color:#fff}
.vd-dots{display:flex;gap:5px;margin-bottom:8px;padding:6px 0}
.vd-dots span{width:7px;height:7px;border-radius:50%;background:#6B4423;animation:vd-db 1.4s ease-in-out infinite}
.vd-dots span:nth-child(2){animation-delay:.2s}
.vd-dots span:nth-child(3){animation-delay:.4s}
@keyframes vd-db{0%,80%,100%{transform:scale(.5);opacity:.3}40%{transform:scale(1);opacity:1}}
.vd-typing-text{font-size:12px;color:#8c8578;line-height:1.5;max-height:50px;overflow:hidden}
.vd-cursor{color:#2D5016;font-weight:700;animation:vd-cb 1s step-end infinite}
@keyframes vd-cb{0%,100%{opacity:1}50%{opacity:0}}
.vd-quick{padding:10px 18px;background:#FAFAF8;border-top:1px solid #f0eeeb;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.vd-quick span{color:#6B4423;font-size:12px;font-weight:600}
.vd-quick button{background:#f5f3ef;border:1px solid rgba(0,0,0,.06);color:#6B4423;padding:5px 12px;border-radius:14px;font-size:11px;cursor:pointer;transition:all .2s}
.vd-quick button:hover{background:#6B4423;color:#fff;border-color:#6B4423;transform:translateY(-1px)}
.vd-input{padding:14px 18px;background:#FAFAF8;border-top:1px solid #f0eeeb}
.vd-input :deep(.el-textarea__inner){background:#fff;border:1.5px solid #e8e5e0;color:#2C2416;border-radius:12px;resize:none;font-size:13px}
.vd-input :deep(.el-textarea__inner):focus{border-color:#6B4423;box-shadow:0 0 0 2px rgba(107,68,35,.06)}
.vd-input :deep(.el-textarea__inner)::placeholder{color:#b5aea5}
.vd-input-btns{display:flex;justify-content:flex-end;gap:8px;margin-top:10px;align-items:center}
.vd-mic{width:42px;height:42px;border-radius:50%;background:rgba(59,130,246,.06);border:1.5px solid rgba(59,130,246,.15);color:#3b82f6;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s;font-size:18px}
.vd-mic:hover:not(:disabled){background:rgba(59,130,246,.1);transform:scale(1.05)}
.vd-mic.listening{background:rgba(193,68,67,.06);border-color:rgba(193,68,67,.2);color:#C14443;animation:vd-mp 1.5s infinite}
.vd-mic:disabled{opacity:.4;cursor:not-allowed}
@keyframes vd-mp{0%,100%{box-shadow:0 0 0 0 rgba(193,68,67,.15)}50%{box-shadow:0 0 0 10px rgba(193,68,67,0)}}
.vd-wave{display:inline-block;width:3px;height:14px;background:#C14443;border-radius:2px;margin:0 2px;animation:vd-wa .8s ease-in-out infinite}
.vd-wave:nth-child(2){animation-delay:.15s;height:18px}
.vd-wave:nth-child(3){animation-delay:.3s;height:12px}
@keyframes vd-wa{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.4)}}
.vd-send{background:#6B4423;border:none;color:#fff;padding:10px 24px;border-radius:12px;font-weight:700;cursor:pointer;transition:all .3s;font-size:13px}
.vd-send:hover:not(:disabled){background:#8B5E3C;transform:translateY(-2px);box-shadow:0 4px 12px rgba(107,68,35,.15)}
.vd-send:disabled{opacity:.4;cursor:not-allowed}
.vd-stop{background:rgba(193,68,67,.06);border:1px solid rgba(193,68,67,.12);color:#C14443;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px}
.vd-stop:hover{background:rgba(193,68,67,.1)}
.vd-footer{background:#fff;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f0eeeb}
.vd-ctrls{display:flex;gap:10px}
.vd-ctrl{background:#f5f3ef;border:1px solid rgba(0,0,0,.06);color:#6B5D4D;padding:8px 18px;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:12px;transition:all .2s}
.vd-ctrl:hover:not(:disabled){background:#eae7e2;color:#2C2416}
.vd-ctrl.active{background:rgba(59,130,246,.06);border-color:rgba(59,130,246,.15);color:#3b82f6}
.vd-ctrl.muted{background:rgba(193,68,67,.06);border-color:rgba(193,68,67,.12);color:#C14443}
.vd-ctrl:disabled{opacity:.3;cursor:not-allowed}
</style>
