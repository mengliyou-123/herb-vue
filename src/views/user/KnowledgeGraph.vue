<template>
  <div class="knowledge-graph-container">
    <div class="graph-header">
      <div class="header-left">
        <div class="title-decoration"></div>
        <div class="title-group">
          <h2 class="graph-title">中医药知识图谱</h2>
          <span class="graph-subtitle">中药·方剂·中成药·病症·归经·功效 智能关联网络</span>
        </div>
      </div>
      <div class="header-actions">
        <el-tooltip content="类别筛选" placement="bottom">
          <el-button @click="showFilterPanel = !showFilterPanel" class="action-btn filter-btn">
            <el-badge :value="activeCategories.size < categoryColors.length ? categoryColors.length - activeCategories.size : 0" :hidden="activeCategories.size === categoryColors.length" :max="99">
              <el-icon><Filter /></el-icon>
            </el-badge>
          </el-button>
        </el-tooltip>
        <el-tooltip content="重置视图" placement="bottom">
          <el-button :icon="Aim" @click="resetView" class="action-btn" />
        </el-tooltip>
        <el-tooltip content="刷新图谱" placement="bottom">
          <el-button type="primary" :icon="Refresh" @click="loadGraphData" :loading="loading" class="action-btn primary-btn">
            刷新图谱
          </el-button>
        </el-tooltip>
        <el-tooltip content="导出图片" placement="bottom">
          <el-button :icon="Download" @click="exportGraph" class="action-btn" />
        </el-tooltip>
        <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏查看'" placement="bottom">
          <el-button :icon="isFullscreen ? Close : FullScreen" @click="toggleFullscreen" class="action-btn" />
        </el-tooltip>
      </div>
    </div>

    <div class="filter-panel" :class="{ show: showFilterPanel }">
      <div class="filter-header">
        <span>节点类别筛选</span>
        <el-button link type="primary" size="small" @click="toggleAllCategories">全选/全不选</el-button>
      </div>
      <div class="filter-items">
        <div 
          class="filter-item" 
          v-for="cat in categoryColors" 
          :key="cat.name"
          @click="toggleCategory(cat.name)"
        >
          <span class="filter-checkbox" :class="{ checked: activeCategories.has(cat.name) }">
            <el-icon v-if="activeCategories.has(cat.name)"><Check /></el-icon>
          </span>
          <span class="filter-dot" :style="{ background: cat.gradient }"></span>
          <span class="filter-name">{{ cat.name }}</span>
          <span class="filter-count">{{ getCategoryCount(cat.name) }}</span>
        </div>
      </div>
      <div class="filter-legend">
        <div class="legend-title">关系类型</div>
        <div class="relation-legend">
          <div v-for="rel in relationColors" :key="rel.type" class="relation-item">
            <span class="relation-line" :style="{ background: rel.color }"></span>
            <span>{{ rel.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="graph-main">
      <div v-if="loading" class="custom-loading">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring r2"></div>
          <div class="spinner-ring r3"></div>
          <p>正在构建中医药知识网络...</p>
        </div>
      </div>
      <div ref="graphRef" class="graph-chart" :class="{ 'fullscreen-mode': isFullscreen }"></div>

      <div class="bg-decoration">
        <div class="bg-circle c1"></div>
        <div class="bg-circle c2"></div>
        <div class="bg-circle c3"></div>
      </div>

      <div class="floating-search">
        <div class="search-wrapper">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索中药、方剂、病症..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
            @clear="clearSearch"
            @focus="showSearchPanel = true"
            class="search-input"
            size="large"
          />
          <transition name="slide-fade">
            <div class="search-results" v-if="showSearchPanel && searchResults.length > 0">
              <div class="search-results-header">
                <span>找到 <strong>{{ searchResults.length }}</strong> 个相关节点</span>
                <button class="search-close" @click="showSearchPanel = false">
                  <el-icon><Close /></el-icon>
                </button>
              </div>
              <div class="search-results-list">
                <div 
                  class="search-result-item" 
                  v-for="node in searchResults" 
                  :key="node.id"
                  @click="focusOnNode(node)"
                >
                  <span class="result-icon" :style="{ background: getCategoryConfig(node.category)?.gradient }">
                    <el-icon :size="14"><component :is="getCategoryIcon(node.category)" /></el-icon>
                  </span>
                  <div class="result-info">
                  <span class="result-name" v-html="highlightKeyword(node.name)"></span>
                  <span class="result-meta">
                      <el-tag size="small" :color="getCategoryConfig(node.category)?.color" effect="dark" style="border: none; margin-right: 6px;">{{ node.category }}</el-tag>
                      <span>{{ getNodeConnections(node.name) }} 个关联</span>
                    </span>
                  </div>
                  <button 
                    v-if="node.category === '中药' || node.category === '方剂' || node.category === '中成药'"
                    class="result-goto" 
                    @click="goToDetail($event, node)"
                    title="查看详情"
                  >
                    <el-icon><ArrowRight /></el-icon>
                  </button>
                </div>
              </div>
            </div>
          </transition>
          <transition name="slide-fade">
            <div class="search-no-result" v-if="searchKeyword.trim() && searchResults.length === 0 && showSearchPanel">
              <el-icon :size="32" color="#ccc"><Search /></el-icon>
              <p>未找到"{{ searchKeyword }}"相关节点</p>
              <span>试试搜索中药名、方剂名或病症</span>
            </div>
          </transition>
        </div>
      </div>

      <div class="floating-minimap" v-if="!isFullscreen">
        <div class="minimap-header">
          <span>导航</span>
        </div>
        <div ref="minimapRef" class="minimap-chart"></div>
      </div>

      <div class="floating-stats">
        <div class="stat-card" v-for="(stat, index) in stats" :key="index">
          <div class="stat-icon" :style="{ background: stat.bgGradient }">
            <el-icon :size="22" :color="stat.color"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <div class="graph-controls">
        <el-button circle :icon="ZoomIn" @click="zoomIn" size="small" />
        <el-button circle :icon="ZoomOut" @click="zoomOut" size="small" />
        <el-divider direction="horizontal" style="margin: 4px 0;" />
        <el-tooltip content="滚轮缩放 · 拖拽移动 · 点击查看详情 · 双击居中" placement="left">
          <el-button circle :icon="QuestionFilled" size="small" type="info" plain />
        </el-tooltip>
      </div>
    </div>

    <transition name="panel-slide">
      <div class="node-detail-panel" v-if="selectedNode && detailPanelVisible">
        <div class="panel-header" :style="{ background: getCategoryConfig(selectedNode.category)?.gradient }">
          <button class="panel-close" @click="detailPanelVisible = false">
            <el-icon><Close /></el-icon>
          </button>
          <div class="panel-header-content">
            <div class="node-icon" :style="{ background: 'rgba(255,255,255,0.25)' }">
              <el-icon :size="32" color="#fff"><component :is="getCategoryIcon(selectedNode.category)" /></el-icon>
            </div>
            <div class="node-title-group">
              <h3 class="node-name">{{ selectedNode.name }}</h3>
              <el-tag size="default" effect="dark" :color="getCategoryConfig(selectedNode.category)?.color" style="border: none;">
                {{ selectedNode.category }}
              </el-tag>
            </div>
          </div>
        </div>
        <div class="panel-body">
          <div class="detail-section" v-if="selectedNode.description">
            <div class="section-title">
              <el-icon><Document /></el-icon>
              <span>描述信息</span>
            </div>
            <p class="section-content">{{ selectedNode.description }}</p>
          </div>

          <div class="detail-section">
            <div class="section-title">
              <el-icon><Connection /></el-icon>
              <span>关联节点 ({{ getNodeConnections(selectedNode.name) }})</span>
            </div>
            <div class="related-list">
              <div 
                v-for="(node, idx) in getRelatedNodes(selectedNode.name)" 
                :key="idx"
                class="related-node-card"
                @click="navigateToNode(node)"
              >
                <span class="related-dot" :style="{ background: getCategoryConfig(node.category)?.gradient }"></span>
                <div class="related-info">
                  <span class="related-name">{{ node.name }}</span>
                  <span class="related-cat">{{ node.category }}</span>
                </div>
                <el-icon class="related-arrow"><ArrowRight /></el-icon>
              </div>
            </div>
          </div>

          <div class="panel-actions" v-if="canGoToDetail(selectedNode)">
            <el-button type="primary" size="large" class="goto-detail-btn" @click="goToDetailFromPanel">
              <el-icon><Link /></el-icon>
              查看{{ selectedNode.category }}详情
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { knowledgeGraphService } from '@/api/graph'
import { useRouter } from 'vue-router'
import { 
  Refresh, Download, Search, Close, ZoomIn, ZoomOut, 
  Aim, Filter, Check, FullScreen, ArrowRight, QuestionFilled,
  Orange, HotWater, FirstAidKit, Connection, Link, Document,
  Cherry, MagicStick, Guide, Compass, Sunny
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

const graphRef = ref(null)
const minimapRef = ref(null)
const loading = ref(false)
const detailPanelVisible = ref(false)
const selectedNode = ref(null)
const searchKeyword = ref('')
const searchResults = ref([])
const showSearchPanel = ref(false)
const showFilterPanel = ref(false)
const isFullscreen = ref(false)
let chartInstance = null
let minimapInstance = null
let currentZoom = 0.7
let currentCenter = null
let isFirstRender = true
let resizeObserver = null

const categoryColors = [
  { name: '中药', color: '#5470c6', gradient: 'linear-gradient(135deg, #5470c6, #7b94e0)', icon: 'Orange' },
  { name: '方剂', color: '#91cc75', gradient: 'linear-gradient(135deg, #7ab661, #91cc75)', icon: 'HotWater' },
  { name: '中成药', color: '#3ba272', gradient: 'linear-gradient(135deg, #2d8a5f, #3ba272)', icon: 'MagicStick' },
  { name: '病症', color: '#ee6666', gradient: 'linear-gradient(135deg, #d94e4e, #ee6666)', icon: 'FirstAidKit' },
  { name: '证候', color: '#fac858', gradient: 'linear-gradient(135deg, #f0b52e, #fac858)', icon: 'Compass' },
  { name: '归经', color: '#9a60b4', gradient: 'linear-gradient(135deg, #83499e, #9a60b4)', icon: 'Guide' },
  { name: '功效', color: '#73c0de', gradient: 'linear-gradient(135deg, #4dadd4, #73c0de)', icon: 'Cherry' },
  { name: '药性', color: '#fc8452', gradient: 'linear-gradient(135deg, #f06530, #fc8452)', icon: 'Sunny' },
  { name: '药味', color: '#ea7ccc', gradient: 'linear-gradient(135deg, #e058b5, #ea7ccc)', icon: 'Cherry' }
]

const relationColors = [
  { type: 'herb-efficacy', name: '中药-功效', color: '#73c0de' },
  { type: 'herb-meridian', name: '中药-归经', color: '#9a60b4' },
  { type: 'herb-disease', name: '中药-病症', color: '#ee6666' },
  { type: 'herb-property', name: '中药-药性', color: '#fc8452' },
  { type: 'herb-flavor', name: '中药-药味', color: '#ea7ccc' },
  { type: 'pre-disease', name: '方剂-病症', color: '#ee6666' },
  { type: 'pre-syndrome', name: '方剂-证候', color: '#fac858' },
  { type: 'pre-herb', name: '方剂-中药', color: '#91cc75' },
  { type: 'pcm-herb', name: '中成药-中药', color: '#3ba272' }
]

const activeCategories = ref(new Set(categoryColors.map(c => c.name)))

const stats = ref([
  { label: '节点总数', value: 0, icon: Connection, color: '#5470c6', bgGradient: 'linear-gradient(135deg, rgba(84,112,198,0.15), rgba(84,112,198,0.05))' },
  { label: '关联关系', value: 0, icon: Link, color: '#91cc75', bgGradient: 'linear-gradient(135deg, rgba(145,204,117,0.15), rgba(145,204,117,0.05))' },
  { label: '中药·方剂·成药', value: 0, icon: Orange, color: '#ee6666', bgGradient: 'linear-gradient(135deg, rgba(238,102,102,0.15), rgba(238,102,102,0.05))' },
  { label: '病症·证候', value: 0, icon: FirstAidKit, color: '#73c0de', bgGradient: 'linear-gradient(135deg, rgba(115,192,222,0.15), rgba(115,192,222,0.05))' }
])

const graphData = ref({
  nodes: [],
  links: [],
  categories: []
})

const filteredNodes = computed(() => {
  return graphData.value.nodes.filter(n => activeCategories.value.has(n.category))
})

const filteredLinks = computed(() => {
  const nodeIds = new Set(filteredNodes.value.map(n => n.id))
  return graphData.value.links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target))
})

const getCategoryConfig = (category) => {
  return categoryColors.find(c => c.name === category)
}

const getCategoryIcon = (category) => {
  const config = getCategoryConfig(category)
  return config?.icon || 'Connection'
}

const getRelationColor = (relationType) => {
  const rel = relationColors.find(r => r.type === relationType)
  return rel?.color || '#c0c4cc'
}

const getCategoryCount = (category) => {
  return graphData.value.nodes.filter(n => n.category === category).length
}

const toggleCategory = (name) => {
  if (activeCategories.value.has(name)) {
    if (activeCategories.value.size > 1) {
      activeCategories.value.delete(name)
    }
  } else {
    activeCategories.value.add(name)
  }
  activeCategories.value = new Set(activeCategories.value)
  nextTick(() => updateChart())
}

const toggleAllCategories = () => {
  if (activeCategories.value.size === categoryColors.length) {
    activeCategories.value = new Set([categoryColors[0].name])
  } else {
    activeCategories.value = new Set(categoryColors.map(c => c.name))
  }
  nextTick(() => updateChart())
}

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    searchResults.value = []
    showSearchPanel.value = false
    return
  }
  
  const kw = keyword.toLowerCase()
  searchResults.value = filteredNodes.value.filter(n => 
    n.name.toLowerCase().includes(kw) || 
    (n.category && n.category.toLowerCase().includes(kw)) ||
    (n.description && n.description.toLowerCase().includes(kw))
  ).slice(0, 15)
  
  showSearchPanel.value = searchResults.value.length > 0
}

const highlightKeyword = (text) => {
  const kw = searchKeyword.value.trim()
  if (!kw) return text
  const regex = new RegExp(`(${kw})`, 'gi')
  return text.replace(regex, '<span style="color: #5470c6; font-weight: 700;">$1</span>')
}

const focusOnNode = (node) => {
  if (!chartInstance) return
  showSearchPanel.value = false
  
  const nodeIndex = filteredNodes.value.findIndex(n => n.id === node.id)
  if (nodeIndex === -1) return
  
  chartInstance.dispatchAction({ type: 'downplay', seriesIndex: 0 })
  chartInstance.dispatchAction({ type: 'unfocusNodeAdjacency', seriesIndex: 0 })
  
  setTimeout(() => {
    chartInstance.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: nodeIndex
    })
    chartInstance.dispatchAction({
      type: 'focusNodeAdjacency',
      seriesIndex: 0,
      dataIndex: nodeIndex
    })
    
    chartInstance.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: nodeIndex
    })
  }, 50)
  
  selectedNode.value = node
  detailPanelVisible.value = true
  
  setTimeout(() => {
    const option = chartInstance.getOption()
    if (option && option.series && option.series[0]) {
      const pos = findNodePosition(node.id)
      if (pos) {
        chartInstance.dispatchAction({
          type: 'graphRoam',
          zoom: 1.2,
          originX: pos[0],
          originY: pos[1]
        })
      }
    }
  }, 100)
}

const navigateToNode = (node) => {
  const foundNode = filteredNodes.value.find(n => n.id === node.id)
  if (foundNode) {
    focusOnNode(foundNode)
  }
}

const findNodePosition = (nodeId) => {
  if (!chartInstance) return null
  const model = chartInstance.getModel()
  const series = model.getSeriesByIndex(0)
  if (!series) return null
  const data = series.getData()
  const dataIndex = filteredNodes.value.findIndex(n => n.id === nodeId)
  if (dataIndex === -1) return null
  const itemLayout = data.getItemLayout(dataIndex)
  return itemLayout ? [itemLayout[0], itemLayout[1]] : null
}

const clearSearch = () => {
  searchKeyword.value = ''
  searchResults.value = []
  showSearchPanel.value = false
  
  if (chartInstance) {
    chartInstance.dispatchAction({ type: 'downplay', seriesIndex: 0 })
    chartInstance.dispatchAction({ type: 'unfocusNodeAdjacency', seriesIndex: 0 })
  }
}

const canGoToDetail = (node) => {
  return ['中药', '方剂', '中成药'].includes(node.category)
}

const goToDetail = (event, node) => {
  event.stopPropagation()
  navigateToDetailPage(node)
}

const goToDetailFromPanel = () => {
  if (selectedNode.value) {
    navigateToDetailPage(selectedNode.value)
  }
}

const navigateToDetailPage = (node) => {
  if (!node.dbId && node.dbId !== 0) {
    ElMessage.warning('暂无该节点的详情页面')
    return
  }
  
  switch (node.category) {
    case '中药':
      router.push({ path: '/user/herbDetail', query: { id: node.dbId } })
      break
    case '方剂':
      router.push({ path: '/user/preDetail', query: { id: node.dbId } })
      break
    case '中成药':
      ElMessage.info('中成药详情页面开发中')
      break
    default:
      ElMessage.info('该类型节点暂无详情页面')
  }
}

const getNodeConnections = (nodeName) => {
  const node = graphData.value.nodes.find(n => n.name === nodeName)
  if (!node) return 0
  const nodeId = node.id
  return graphData.value.links.filter(
    link => link.source == nodeId || link.target == nodeId
  ).length
}

const getRelatedNodes = (nodeName) => {
  const node = graphData.value.nodes.find(n => n.name === nodeName)
  if (!node) return []
  const nodeId = node.id
  const related = []
  const seen = new Set()
  
  const links = graphData.value.links.filter(
    link => link.source == nodeId || link.target == nodeId
  )
  
  links.forEach(link => {
    const relatedId = link.source == nodeId ? link.target : link.source
    const relatedNode = graphData.value.nodes.find(n => n.id == relatedId)
    if (relatedNode && !seen.has(relatedNode.id) && activeCategories.value.has(relatedNode.category)) {
      related.push(relatedNode)
      seen.add(relatedNode.id)
    }
  })
  
  return related
}

const initChart = () => {
  if (!graphRef.value) return
  
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  
  const container = graphRef.value
  const initAndRender = () => {
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      setTimeout(initAndRender, 50)
      return
    }
    
    chartInstance = echarts.init(container, null, { renderer: 'canvas' })
    
    resizeObserver = new ResizeObserver(() => {
      if (chartInstance) {
        chartInstance.resize()
      }
    })
    resizeObserver.observe(container)
    
    updateChart()
    
    chartInstance.on('click', function(params) {
      showSearchPanel.value = false
      if (params.dataType === 'node') {
        selectedNode.value = params.data
        detailPanelVisible.value = true
      }
    })
    
    chartInstance.on('dblclick', function(params) {
      if (params.dataType === 'node') {
        focusOnNode(params.data)
      }
    })
    
    chartInstance.on('graphroam', function(params) {
      try {
        const opt = chartInstance.getOption()
        if (opt && opt.series && opt.series[0]) {
          currentZoom = opt.series[0].zoom || currentZoom
          currentCenter = opt.series[0].center || currentCenter
        }
      } catch(e) {}
      if (minimapInstance) {
        updateMinimap()
      }
    })
  }
  
  setTimeout(initAndRender, 100)
}

const updateChart = () => {
  if (!chartInstance) return
  
  const nodes = filteredNodes.value
  const links = filteredLinks.value
  
  if (nodes.length === 0) {
    chartInstance.clear()
    return
  }

  const useZoom = isFirstRender ? 0.7 : currentZoom
  const useCenter = isFirstRender ? null : currentCenter
  isFirstRender = false
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      triggerOn: 'mousemove|click',
      enterable: false,
      showDelay: 0,
      hideDelay: 80,
      transitionDuration: 0.15,
      confine: true,
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: 'rgba(84, 112, 198, 0.2)',
      borderWidth: 1,
      padding: [14, 18],
      textStyle: { color: '#333' },
      extraCssText: 'box-shadow: 0 8px 32px rgba(0,0,0,0.12); border-radius: 12px; pointer-events: none;',
      formatter: function(params) {
        if (params.dataType === 'node') {
          const config = getCategoryConfig(params.data.category)
          const connections = getNodeConnections(params.name)
          return `
            <div style="min-width: 220px; user-select: none;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">
                <span style="width: 12px; height: 12px; border-radius: 50%; background: ${config?.color || '#5470c6'}; box-shadow: 0 0 8px ${config?.color || '#5470c6'}50; display: inline-block;"></span>
                <strong style="font-size: 16px; color: #1a1a1a;">${params.name}</strong>
              </div>
              <div style="font-size: 13px; color: #666; line-height: 1.8;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <span style="background: ${config?.gradient || '#5470c6'}; color: #fff; padding: 2px 10px; border-radius: 10px; font-size: 11px;">${params.data.category}</span>
                </div>
                ${params.data.description ? `<div style="margin-top: 6px; color: #555;">${params.data.description}</div>` : ''}
                <div style="margin-top: 8px; display: flex; gap: 16px; padding-top: 8px; border-top: 1px dashed #eee;">
                  <span><strong style="color: ${config?.color || '#5470c6'};">${connections}</strong> 个关联</span>
                </div>
              </div>
              <div style="margin-top: 10px; font-size: 11px; color: #999; text-align: center;">双击节点聚焦 · 单击查看详情</div>
            </div>
          `
        } else if (params.dataType === 'edge') {
          const relColor = getRelationColor(params.data.relationType)
          return `
            <div style="padding: 4px 0; user-select: none;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="color: #5470c6; font-size: 14px;">${params.data.sourceName || getNodeNameById(params.data.source)}</strong>
                <span style="display: flex; align-items: center; gap: 4px; color: ${relColor}; font-size: 12px; font-weight: 500;">
                  <span style="width: 20px; height: 2px; background: ${relColor}; display: inline-block;"></span>
                  ${params.data.relation}
                  <span style="width: 20px; height: 2px; background: ${relColor}; display: inline-block;"></span>
                </span>
                <strong style="color: #91cc75; font-size: 14px;">${params.data.targetName || getNodeNameById(params.data.target)}</strong>
              </div>
            </div>
          `
        }
      }
    },
    animation: true,
    animationDuration: 800,
    animationDurationUpdate: 300,
    animationEasing: 'cubicOut',
    animationEasingUpdate: 'cubicOut',
    series: [
      {
        type: 'graph',
        layout: 'force',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        force: {
          initLayout: 'circular',
          repulsion: 400,
          gravity: 0.1,
          edgeLength: [90, 200],
          layoutAnimation: true,
          friction: 0.6
        },
        data: nodes.map((node, idx) => {
          const config = getCategoryConfig(node.category)
          const size = node.symbolSize || 35
          return {
            id: node.id,
            name: node.name,
            category: node.category,
            description: node.description,
            dbId: node.dbId,
            image: node.image,
            value: node.value || 1,
            symbolSize: size,
            fixed: false,
            itemStyle: {
              color: {
                type: 'radial',
                x: 0.5, y: 0.5, r: 0.5,
                colorStops: [
                  { offset: 0, color: lightenColor(config?.color || '#5470c6', 30) },
                  { offset: 1, color: config?.color || '#5470c6' }
                ]
              },
              shadowBlur: 18,
              shadowColor: (config?.color || '#5470c6') + '50',
              borderColor: '#ffffff',
              borderWidth: 2.5,
              shadowOffsetX: 0,
              shadowOffsetY: 4
            },
            label: {
              show: size > 30,
              position: 'right',
              formatter: '{b}',
              fontSize: size > 40 ? 13 : size > 32 ? 11 : 10,
              color: '#444',
              fontWeight: size > 40 ? 600 : 400,
              distance: 8,
              textBorderColor: '#fff',
              textBorderWidth: 3,
              textShadowColor: 'rgba(255,255,255,0.9)',
              textShadowBlur: 4
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 30,
                shadowColor: (config?.color || '#5470c6') + '80',
                borderWidth: 3,
                borderColor: '#fff'
              },
              label: {
                fontSize: size > 40 ? 15 : 13,
                fontWeight: 700,
                color: config?.color || '#5470c6'
              }
            }
          }
        }),
        links: links.map(link => {
          const relColor = getRelationColor(link.relationType)
          const sourceNode = nodes.find(n => n.id === link.source)
          const targetNode = nodes.find(n => n.id === link.target)
          return {
            source: link.source,
            target: link.target,
            relation: link.relation,
            relationType: link.relationType,
            sourceName: sourceNode?.name,
            targetName: targetNode?.name,
            lineStyle: {
              width: 1.2,
              curveness: 0.25,
              color: relColor + '50',
              opacity: 0.5,
              shadowBlur: 4,
              shadowColor: relColor + '20'
            },
            emphasis: {
              lineStyle: {
                width: 2.5,
                opacity: 0.95,
                color: relColor,
                curveness: 0.25,
                shadowBlur: 10,
                shadowColor: relColor + '60'
              }
            }
          }
        }),
        categories: categoryColors.filter(c => activeCategories.value.has(c.name)).map(c => ({ name: c.name })),
        roam: true,
        draggable: true,
        scaleLimit: { min: 0.1, max: 5 },
        zoom: useZoom,
        center: useCenter,
        focusNodeAdjacency: true,
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 6],
        emphasis: {
          focus: 'adjacency',
          scale: true,
          lineStyle: { width: 2.5 }
        },
        blur: {
          itemStyle: { opacity: 0.15 },
          lineStyle: { opacity: 0.08 },
          label: { opacity: 0.2 }
        },
        lineStyle: { curveness: 0.25 }
      }
    ]
  }
  
  chartInstance.setOption(option, { notMerge: true, lazyUpdate: false })
  
  nextTick(() => {
    initMinimap()
  })
}

const getNodeNameById = (id) => {
  const node = graphData.value.nodes.find(n => n.id == id)
  return node?.name || ''
}

const lightenColor = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, (num >> 8 & 0x00FF) + amt)
  const B = Math.min(255, (num & 0x0000FF) + amt)
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

const initMinimap = () => {
  if (!minimapRef.value) return
  
  if (minimapInstance) {
    minimapInstance.dispose()
  }
  
  minimapInstance = echarts.init(minimapRef.value)
  
  const nodes = filteredNodes.value
  const links = filteredLinks.value
  
  const miniOption = {
    backgroundColor: 'rgba(255,255,255,0.9)',
    series: [{
      type: 'graph',
      layout: 'force',
      force: { repulsion: 80, gravity: 0.1, edgeLength: 20 },
      animation: false,
      silent: true,
      data: nodes.map(n => ({
        id: n.id,
        name: n.name,
        category: n.category,
        symbolSize: 3,
        itemStyle: { color: getCategoryConfig(n.category)?.color || '#5470c6' }
      })),
      links: links.map(l => ({
        source: l.source,
        target: l.target,
        lineStyle: { color: '#ddd', width: 0.5, opacity: 0.5 }
      })),
      label: { show: false },
      roam: false
    }]
  }
  
  minimapInstance.setOption(miniOption)
}

const updateMinimap = () => {
  if (!minimapInstance || !chartInstance) return
}

const getCurrentZoomAndCenter = () => {
  if (!chartInstance) return { zoom: 0.7, center: null }
  const opt = chartInstance.getOption()
  const s = opt && opt.series && opt.series[0]
  return { zoom: s?.zoom || 0.7, center: s?.center || null }
}

const zoomIn = () => {
  if (!chartInstance) return
  const { zoom, center } = getCurrentZoomAndCenter()
  const newZoom = Math.min(zoom * 1.25, 5)
  chartInstance.dispatchAction({
    type: 'graphRoam',
    zoom: newZoom / zoom,
    originX: chartInstance.getWidth() / 2,
    originY: chartInstance.getHeight() / 2
  })
}

const zoomOut = () => {
  if (!chartInstance) return
  const { zoom, center } = getCurrentZoomAndCenter()
  const newZoom = Math.max(zoom / 1.25, 0.1)
  chartInstance.dispatchAction({
    type: 'graphRoam',
    zoom: newZoom / zoom,
    originX: chartInstance.getWidth() / 2,
    originY: chartInstance.getHeight() / 2
  })
}

const resetView = () => {
  currentZoom = 0.7
  if (chartInstance) {
    detailPanelVisible.value = false
    selectedNode.value = null
    searchKeyword.value = ''
    searchResults.value = []
    showSearchPanel.value = false
    chartInstance.dispatchAction({ type: 'restore' })
    chartInstance.dispatchAction({ type: 'downplay', seriesIndex: 0 })
    chartInstance.dispatchAction({ type: 'unfocusNodeAdjacency', seriesIndex: 0 })
    chartInstance.setOption({
      series: [{
        zoom: 0.7,
        center: null
      }]
    })
  }
}

const toggleFullscreen = () => {
  const container = document.querySelector('.knowledge-graph-container')
  if (!document.fullscreenElement) {
    container?.requestFullscreen?.()
    isFullscreen.value = true
  } else {
    document.exitFullscreen?.()
    isFullscreen.value = false
  }
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
  if (minimapInstance) {
    minimapInstance.resize()
  }
}

const loadGraphData = async () => {
  loading.value = true
  try {
    const res = await knowledgeGraphService.getGraphData()
    graphData.value = res.data
    
    isFirstRender = true
    currentZoom = 0.7
    currentCenter = null
    
    const herbCount = res.data.nodes.filter(n => n.category === '中药').length
    const preCount = res.data.nodes.filter(n => n.category === '方剂').length
    const pcmCount = res.data.nodes.filter(n => n.category === '中成药').length
    const diseaseCount = res.data.nodes.filter(n => n.category === '病症').length
    const linkCount = res.data.links.length
    const nodeCount = res.data.nodes.length
    
    stats.value = [
      { label: '节点总数', value: nodeCount, icon: Connection, color: '#5470c6', bgGradient: 'linear-gradient(135deg, rgba(84,112,198,0.15), rgba(84,112,198,0.05))' },
      { label: '关联关系', value: linkCount, icon: Link, color: '#91cc75', bgGradient: 'linear-gradient(135deg, rgba(145,204,117,0.15), rgba(145,204,117,0.05))' },
      { label: '中药·方剂·成药', value: herbCount + preCount + pcmCount, icon: Orange, color: '#ee6666', bgGradient: 'linear-gradient(135deg, rgba(238,102,102,0.15), rgba(238,102,102,0.05))' },
      { label: '病症·证候', value: diseaseCount + res.data.nodes.filter(n => n.category === '证候').length, icon: FirstAidKit, color: '#73c0de', bgGradient: 'linear-gradient(135deg, rgba(115,192,222,0.15), rgba(115,192,222,0.05))' }
    ]
    
    activeCategories.value = new Set(categoryColors.map(c => c.name))
    
    await nextTick()
    initChart()
    
    ElMessage.success(`知识图谱加载成功！共 ${nodeCount} 个节点，${linkCount} 条关联`)
  } catch (error) {
    ElMessage.error('加载知识图谱失败，请稍后重试')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const exportGraph = () => {
  if (chartInstance) {
    const url = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#f8fafc'
    })
    const a = document.createElement('a')
    a.href = url
    a.download = `中医药知识图谱_${new Date().toLocaleDateString()}.png`
    a.click()
    ElMessage.success('图谱图片已导出')
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
  setTimeout(handleResize, 100)
}

document.addEventListener('fullscreenchange', handleFullscreenChange)

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadGraphData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  if (minimapInstance) {
    minimapInstance.dispose()
    minimapInstance = null
  }
})
</script>

<style lang="scss" scoped>
.knowledge-graph-container {
  height: calc(100vh - 112px);
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f5f0 50%, #faf5f0 100%);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);

  &.fullscreen-mode {
    height: 100vh;
    border-radius: 0;
  }

  .graph-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 28px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0,0,0,0.04);
    flex-shrink: 0;
    z-index: 20;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .title-decoration {
        width: 4px;
        height: 44px;
        background: linear-gradient(180deg, #5470c6, #91cc75, #ee6666);
        border-radius: 4px;
      }

      .title-group {
        .graph-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 4px 0;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #2c3e50, #5470c6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .graph-subtitle {
          font-size: 12px;
          color: #8892a6;
          letter-spacing: 1px;
        }
      }
    }

    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;

      .action-btn {
        border-radius: 10px;
        padding: 10px 18px;
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(0,0,0,0.06);
        background: rgba(255,255,255,0.9);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          border-color: rgba(84,112,198,0.2);
        }

        &.primary-btn {
          background: linear-gradient(135deg, #5470c6, #7b94e0);
          border: none;
          color: #fff;
          
          &:hover {
            box-shadow: 0 6px 20px rgba(84,112,198,0.35);
          }
        }

        &.filter-btn {
          position: relative;
        }
      }
    }
  }

  .filter-panel {
    position: absolute;
    top: 80px;
    right: 20px;
    width: 220px;
    background: rgba(255,255,255,0.98);
    backdrop-filter: blur(20px);
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    z-index: 15;
    padding: 16px;
    transform: translateX(120%);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;

    &.show {
      transform: translateX(0);
      opacity: 1;
      pointer-events: auto;
    }

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }

    .filter-items {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .filter-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #f5f7fa;
        }

        .filter-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: #fff;
          font-size: 12px;

          &.checked {
            background: linear-gradient(135deg, #5470c6, #7b94e0);
            border-color: #5470c6;
          }
        }

        .filter-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .filter-name {
          flex: 1;
          font-size: 13px;
          color: #555;
        }

        .filter-count {
          font-size: 11px;
          color: #999;
          background: #f5f7fa;
          padding: 2px 8px;
          border-radius: 10px;
        }
      }
    }

    .filter-legend {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid #f0f0f0;

      .legend-title {
        font-size: 12px;
        color: #999;
        margin-bottom: 8px;
      }

      .relation-legend {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px 8px;

        .relation-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #888;

          .relation-line {
            width: 16px;
            height: 3px;
            border-radius: 2px;
            flex-shrink: 0;
          }
        }
      }
    }
  }

  .graph-main {
    flex: 1;
    position: relative;
    overflow: hidden;

    .custom-loading {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(4px);
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;

      .loading-spinner {
        text-align: center;
        pointer-events: none;

        p {
          margin-top: 20px;
          color: #5470c6;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 1px;
        }

        .spinner-ring {
          display: inline-block;
          width: 48px;
          height: 48px;
          border: 3px solid rgba(84, 112, 198, 0.15);
          border-top-color: #5470c6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          position: relative;

          &.r2 {
            position: absolute;
            width: 36px;
            height: 36px;
            border-top-color: #91cc75;
            animation: spin 1.5s linear infinite reverse;
            top: 6px;
            left: 6px;
          }

          &.r3 {
            position: absolute;
            width: 24px;
            height: 24px;
            border-top-color: #ee6666;
            animation: spin 0.8s linear infinite;
            top: 12px;
            left: 12px;
          }
        }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    }

    .graph-chart {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      touch-action: none;
    }

    .bg-decoration {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;

      .bg-circle {
        position: absolute;
        border-radius: 50%;
        filter: blur(60px);
        opacity: 0.4;

        &.c1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(84,112,198,0.15), transparent);
          top: -100px;
          left: -100px;
          animation: float 20s ease-in-out infinite;
        }

        &.c2 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(145,204,117,0.12), transparent);
          bottom: -80px;
          right: -80px;
          animation: float 25s ease-in-out infinite reverse;
        }

        &.c3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(238,102,102,0.1), transparent);
          top: 40%;
          left: 50%;
          animation: float 22s ease-in-out infinite;
        }
      }
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0); }
      33% { transform: translate(30px, -20px); }
      66% { transform: translate(-20px, 20px); }
    }

    .floating-search {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 360px;
      z-index: 10;
      pointer-events: none;
      display: flex;
      justify-content: center;

      .search-wrapper {
        position: relative;
        pointer-events: auto;
        width: 360px;
        max-width: 100%;

        .search-input {
          :deep(.el-input__wrapper) {
            border-radius: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 1px solid rgba(255,255,255,0.8);
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(20px);
            padding: 4px 16px;
            height: 48px;

            &:focus-within {
              border-color: #5470c6;
              box-shadow: 0 6px 24px rgba(84,112,198,0.2);
            }
          }
        }

        .search-results {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: rgba(255,255,255,0.99);
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          backdrop-filter: blur(20px);
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.04);
          max-height: 420px;
          pointer-events: auto;

          .search-results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 18px;
            border-bottom: 1px solid #f5f5f5;
            font-size: 13px;
            color: #666;
            background: linear-gradient(135deg, #fafbfc, #f5f7fa);

            strong { color: #5470c6; font-weight: 700; }

            .search-close {
              background: #f0f0f0;
              border: none;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              color: #999;
              transition: all 0.2s;

              &:hover {
                background: #e0e0e0;
                color: #333;
              }
            }
          }

          .search-results-list {
            max-height: 360px;
            overflow-y: auto;
            padding: 8px;

            &::-webkit-scrollbar { width: 5px; }
            &::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }

            .search-result-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 14px;
              border-radius: 12px;
              cursor: pointer;
              transition: all 0.25s;

              &:hover {
                background: linear-gradient(135deg, #f5f7ff, #f0f8ff);
                transform: translateX(4px);
              }

              .result-icon {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                flex-shrink: 0;
              }

              .result-info {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 4px;

                .result-name {
                  font-size: 14px;
                  font-weight: 600;
                  color: #222;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }

                .result-meta {
                  font-size: 11px;
                  color: #888;
                  display: flex;
                  align-items: center;
                }
              }

              .result-goto {
                background: linear-gradient(135deg, #5470c6, #7b94e0);
                border: none;
                color: #fff;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
                flex-shrink: 0;

                &:hover {
                  transform: scale(1.1);
                  box-shadow: 0 4px 12px rgba(84,112,198,0.35);
                }
              }
            }
          }
        }

        .search-no-result {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: rgba(255,255,255,0.98);
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          padding: 32px;
          text-align: center;
          pointer-events: auto;

          p { margin: 12px 0 6px; font-size: 14px; color: #666; font-weight: 500; }
          span { font-size: 12px; color: #aaa; }
        }
      }
    }

    .slide-fade-enter-active,
    .slide-fade-leave-active {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .slide-fade-enter-from,
    .slide-fade-leave-to {
      opacity: 0;
      transform: translateY(-12px);
    }

    .floating-minimap {
      position: absolute;
      bottom: 100px;
      right: 20px;
      width: 160px;
      height: 120px;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      z-index: 8;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.04);
      pointer-events: auto;

      .minimap-header {
        padding: 8px 12px;
        font-size: 11px;
        color: #999;
        font-weight: 500;
        border-bottom: 1px solid #f5f5f5;
        background: #fafbfc;
      }

      .minimap-chart {
        width: 100%;
        height: calc(100% - 30px);
      }
    }

    .floating-stats {
      position: absolute;
      bottom: 20px;
      left: 20px;
      display: flex;
      gap: 12px;
      z-index: 8;
      pointer-events: none;

      .stat-card {
        background: rgba(255,255,255,0.95);
        backdrop-filter: blur(10px);
        border-radius: 14px;
        padding: 14px 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        border: 1px solid rgba(255,255,255,0.8);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          display: flex;
          flex-direction: column;

          .stat-value {
            font-size: 22px;
            font-weight: 700;
            line-height: 1.2;
          }

          .stat-label {
            font-size: 11px;
            color: #999;
            margin-top: 2px;
          }
        }
      }
    }

    .graph-controls {
      position: absolute;
      right: 20px;
      top: 80px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      z-index: 8;
      pointer-events: auto;
    }
  }

  .node-detail-panel {
    position: absolute;
    top: 0;
    right: 0;
    width: 340px;
    height: 100%;
    background: #fff;
    z-index: 25;
    box-shadow: -8px 0 32px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    pointer-events: auto;

    .panel-header {
      padding: 28px 24px 24px;
      position: relative;
      color: #fff;

      .panel-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(255,255,255,0.2);
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:hover {
          background: rgba(255,255,255,0.35);
          transform: rotate(90deg);
        }
      }

      .panel-header-content {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-top: 12px;

        .node-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .node-title-group {
          flex: 1;

          .node-name {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 8px 0;
          }
        }
      }
    }

    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }

      .detail-section {
        margin-bottom: 24px;

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;

          .el-icon { color: #5470c6; }
        }

        .section-content {
          font-size: 13px;
          color: #666;
          line-height: 1.8;
          margin: 0;
          padding: 12px;
          background: #fafbfc;
          border-radius: 10px;
        }
      }

      .related-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 300px;
        overflow-y: auto;

        &::-webkit-scrollbar { width: 3px; }
        &::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }

        .related-node-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #fafbfc;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;

          &:hover {
            background: #f0f5ff;
            border-color: rgba(84,112,198,0.15);
            transform: translateX(4px);
          }

          .related-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .related-info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;

            .related-name {
              font-size: 13px;
              font-weight: 600;
              color: #333;
            }

            .related-cat {
              font-size: 11px;
              color: #999;
            }
          }

          .related-arrow {
            color: #ccc;
            transition: all 0.2s;
          }

          &:hover .related-arrow {
            color: #5470c6;
            transform: translateX(4px);
          }
        }
      }

      .panel-actions {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;

        .goto-detail-btn {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          background: linear-gradient(135deg, #5470c6, #7b94e0);
          border: none;
          gap: 8px;
        }
      }
    }
  }

  .panel-slide-enter-active,
  .panel-slide-leave-active {
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .panel-slide-enter-from,
  .panel-slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@media (max-width: 1200px) {
  .knowledge-graph-container {
    .floating-stats {
      flex-wrap: wrap;
      gap: 8px !important;
      
      .stat-card {
        padding: 10px 14px !important;
        
        .stat-icon { width: 36px !important; height: 36px !important; }
        .stat-value { font-size: 18px !important; }
      }
    }

    .floating-minimap { display: none; }
  }
}

@media (max-width: 768px) {
  .knowledge-graph-container {
    height: calc(100vh - 100px);
    border-radius: 0;

    .graph-header {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 12px;
      padding: 12px 16px !important;

      .header-actions {
        width: 100%;
        flex-wrap: wrap;
      }
    }

    .floating-search {
      width: calc(100% - 32px) !important;
      left: 16px !important;
      right: 16px !important;
      transform: none !important;
    }

    .floating-stats {
      display: none !important;
    }

    .graph-controls { display: none; }

    .filter-panel {
      top: 140px !important;
      right: 10px !important;
      width: 200px !important;
    }

    .node-detail-panel {
      width: 100% !important;
    }
  }
}
</style>
