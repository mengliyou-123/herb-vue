<template>
  <div class="knowledge-graph-container">
    <div class="graph-header">
      <div class="header-left">
        <h2 class="graph-title">中医药知识图谱</h2>
        <span class="graph-subtitle">中药 - 方剂 - 病症 - 穴位关联网络</span>
      </div>
      <div class="header-actions">
        <el-button 
          type="primary" 
          :icon="Refresh" 
          @click="loadGraphData"
          :loading="loading"
          class="action-btn"
        >
          刷新图谱
        </el-button>
        <el-button 
          :icon="Download" 
          @click="exportGraph"
          class="action-btn"
        >
          导出图谱
        </el-button>
      </div>
    </div>

    <div class="graph-main" v-loading="loading" element-loading-text="正在加载知识图谱...">
      <div ref="graphRef" class="graph-chart"></div>

      <div class="floating-legend">
        <div class="legend-title">图例说明</div>
        <div class="legend-items">
          <div class="legend-item" v-for="(category, index) in categoryColors" :key="index">
            <span class="legend-dot" :style="{ backgroundColor: category.color }"></span>
            <span class="legend-text">{{ category.name }}</span>
          </div>
        </div>
        <div class="legend-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>滚轮缩放，拖拽移动节点</span>
        </div>
      </div>

      <div class="floating-stats">
        <div class="stat-card" v-for="(stat, index) in stats" :key="index">
          <div class="stat-icon" :style="{ backgroundColor: stat.color }">
            <el-icon :size="20"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="detailVisible"
      :title="selectedNode?.name"
      width="500px"
      class="node-detail-dialog"
    >
      <div class="node-detail" v-if="selectedNode">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="节点类型">
            <el-tag :color="getNodeColor(selectedNode.category)" effect="dark">
              {{ selectedNode.category }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述信息">
            {{ selectedNode.description || '暂无描述' }}
          </el-descriptions-item>
          <el-descriptions-item label="关联数量">
            {{ getNodeConnections(selectedNode.name) }} 个关联节点
          </el-descriptions-item>
        </el-descriptions>

        <div class="related-nodes" v-if="getRelatedNodes(selectedNode.name).length > 0">
          <h4 class="related-title">关联节点</h4>
          <div class="related-list">
            <el-tag 
              v-for="(node, index) in getRelatedNodes(selectedNode.name)" 
              :key="index"
              class="related-tag"
              :color="getNodeColor(node.category)"
              effect="dark"
            >
              {{ node.name }} ({{ node.category }})
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { knowledgeGraphService } from '@/api/graph'
import { 
  Refresh, 
  Download, 
  InfoFilled,
  Orange,
  HotWater,
  FirstAidKit,
  Link,
  Connection
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const graphRef = ref(null)
const loading = ref(false)
const detailVisible = ref(false)
const selectedNode = ref(null)
let chartInstance = null

const categoryColors = [
  { name: '中药', color: '#5470c6' },
  { name: '方剂', color: '#91cc75' },
  { name: '病症', color: '#fac858' },
  { name: '归经', color: '#ee6666' },
  { name: '功效', color: '#73c0de' }
]

const stats = ref([
  { label: '中药', value: 0, icon: 'Orange', color: 'rgba(84, 112, 198, 0.15)' },
  { label: '方剂', value: 0, icon: 'HotWater', color: 'rgba(145, 204, 117, 0.15)' },
  { label: '病症', value: 0, icon: 'FirstAidKit', color: 'rgba(250, 200, 88, 0.15)' },
  { label: '关联关系', value: 0, icon: 'Connection', color: 'rgba(238, 102, 102, 0.15)' }
])

const graphData = ref({
  nodes: [],
  links: [],
  categories: []
})

const getNodeColor = (category) => {
  const found = categoryColors.find(c => c.name === category)
  return found ? found.color : '#5470c6'
}

const getNodeConnections = (nodeName) => {
  return graphData.value.links.filter(
    link => link.source === nodeName || link.target === nodeName
  ).length
}

const getRelatedNodes = (nodeName) => {
  const related = []
  const links = graphData.value.links.filter(
    link => link.source === nodeName || link.target === nodeName
  )
  
  links.forEach(link => {
    const relatedName = link.source === nodeName ? link.target : link.source
    const node = graphData.value.nodes.find(n => n.name === relatedName)
    if (node && !related.find(r => r.name === node.name)) {
      related.push(node)
    }
  })
  
  return related.slice(0, 10)
}

const initChart = () => {
  if (!graphRef.value) return
  
  chartInstance = echarts.init(graphRef.value)
  
  const option = {
    tooltip: {
      show: true,
      showDelay: 200,
      hideDelay: 200,
      formatter: function(params) {
        if (params.dataType === 'node') {
          return `
            <div style="padding: 10px; min-width: 200px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${getNodeColor(params.data.category)}; display: inline-block;"></span>
                <strong style="font-size: 14px; color: #333;">${params.name}</strong>
              </div>
              <div style="font-size: 12px; color: #666; line-height: 1.6;">
                <div>类型: <span style="color: #333; font-weight: 500;">${params.data.category}</span></div>
                <div>描述: <span style="color: #333;">${params.data.description || '暂无'}</span></div>
                <div>关联: <span style="color: #333; font-weight: 500;">${getNodeConnections(params.name)} 个</span></div>
              </div>
            </div>
          `
        } else if (params.dataType === 'edge') {
          return `
            <div style="padding: 8px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <strong style="color: #5470c6;">${params.data.source}</strong> 
                <span style="color: #999; font-size: 12px;">→</span> 
                <strong style="color: #91cc75;">${params.data.target}</strong>
              </div>
              <div style="margin-top: 4px; font-size: 12px; color: #999;">
                关系: <span style="color: #333; font-weight: 500;">${params.data.relation}</span>
              </div>
            </div>
          `
        }
      },
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.12); border-radius: 6px;'
    },
    legend: {
      show: false
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        force: {
          repulsion: 450,
          gravity: 0.08,
          edgeLength: [120, 280],
          layoutAnimation: true,
          friction: 0.4
        },
        data: graphData.value.nodes.map(node => ({
          id: node.id,
          name: node.name,
          category: node.category,
          description: node.description,
          symbolSize: getNodeSize(node.category),
          itemStyle: {
            color: getNodeColor(node.category),
            shadowBlur: 15,
            shadowColor: getNodeColor(node.category) + '66',
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
            fontSize: node.category === '中药' || node.category === '方剂' ? 13 : 11,
            color: '#555',
            fontWeight: node.category === '中药' || node.category === '方剂' ? 'bold' : 'normal'
          }
        })),
        links: graphData.value.links.map(link => ({
          source: link.source,
          target: link.target,
          relation: link.relation,
          lineStyle: {
            width: 1.5,
            curveness: 0.3,
            color: '#c0c4cc',
            opacity: 0.6
          },
          label: {
            show: false
          }
        })),
        categories: categoryColors.map(c => ({ name: c.name })),
        roam: true,
        draggable: true,
        focusNodeAdjacency: true,
        animation: true,
        animationDuration: 1500,
        animationEasingUpdate: 'cubicOut',
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 2.5,
            opacity: 0.9,
            color: '#5470c6'
          },
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowOffsetY: 0
          }
        },
        blurStyle: {
          itemStyle: {
            opacity: 0.3
          },
          label: {
            show: false
          }
        },
        lineStyle: {
          curveness: 0.3
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
  
  chartInstance.on('click', function(params) {
    if (params.dataType === 'node') {
      selectedNode.value = params.data
      detailVisible.value = true
    }
  })
  
  window.addEventListener('resize', handleResize)
}

const getNodeSize = (category) => {
  const sizeMap = {
    '中药': 45,
    '方剂': 40,
    '病症': 35,
    '归经': 30,
    '功效': 30
  }
  return sizeMap[category] || 30
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

const loadGraphData = async () => {
  loading.value = true
  try {
    const res = await knowledgeGraphService.getGraphData()
    graphData.value = res.data
    
    const herbCount = res.data.nodes.filter(n => n.category === '中药').length
    const preCount = res.data.nodes.filter(n => n.category === '方剂').length
    const diseaseCount = res.data.nodes.filter(n => n.category === '病症').length
    const linkCount = res.data.links.length
    
    stats.value = [
      { label: '中药', value: herbCount, icon: 'Orange', color: 'rgba(84, 112, 198, 0.15)' },
      { label: '方剂', value: preCount, icon: 'HotWater', color: 'rgba(145, 204, 117, 0.15)' },
      { label: '病症', value: diseaseCount, icon: 'FirstAidKit', color: 'rgba(250, 200, 88, 0.15)' },
      { label: '关联关系', value: linkCount, icon: 'Connection', color: 'rgba(238, 102, 102, 0.15)' }
    ]
    
    if (chartInstance) {
      chartInstance.dispose()
    }
    initChart()
    
    ElMessage.success('知识图谱加载成功')
  } catch (error) {
    ElMessage.error('加载知识图谱失败')
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
      backgroundColor: '#fff'
    })
    const a = document.createElement('a')
    a.href = url
    a.download = '中医药知识图谱.png'
    a.click()
    ElMessage.success('图谱已导出')
  }
}

onMounted(() => {
  loadGraphData()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.knowledge-graph-container {
  height: calc(100vh - 112px);
  display: flex;
  flex-direction: column;
  background: #fafafa;
  border-radius: 12px;
  overflow: hidden;

  .graph-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 28px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    flex-shrink: 0;
    z-index: 10;

    .header-left {
      .graph-title {
        font-size: 20px;
        font-weight: 700;
        color: #333;
        margin: 0 0 4px 0;
        letter-spacing: 1px;
      }

      .graph-subtitle {
        font-size: 12px;
        color: #999;
        letter-spacing: 0.5px;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;

      .action-btn {
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
        transition: all 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }

  .graph-main {
    flex: 1;
    position: relative;
    background: #fff;
    overflow: hidden;

    .graph-chart {
      width: 100%;
      height: 100%;
    }

    .floating-legend {
      position: absolute;
      top: 16px;
      left: 16px;
      width: 180px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(8px);
      z-index: 5;

      .legend-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
      }

      .legend-items {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: #fafafa;
          border-radius: 6px;
          transition: all 0.2s;

          &:hover {
            background: #f0f0f0;
            transform: translateX(4px);
          }

          .legend-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .legend-text {
            font-size: 12px;
            color: #666;
          }
        }
      }

      .legend-tip {
        margin-top: 12px;
        padding: 8px;
        background: #e8f4f8;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #666;

        .el-icon {
          color: #1890ff;
        }
      }
    }

    .floating-stats {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      z-index: 5;

      .stat-card {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 12px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(8px);
        transition: all 0.3s;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .stat-info {
          display: flex;
          flex-direction: column;

          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #333;
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
  }
}

.node-detail-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #f0f0f0;
    padding: 20px 24px;
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  .node-detail {
    .related-nodes {
      margin-top: 20px;

      .related-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin: 0 0 12px 0;
      }

      .related-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .related-tag {
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            transform: translateY(-2px);
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .graph-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;

    .header-actions {
      width: 100%;
      justify-content: flex-start;
    }
  }

  .floating-legend {
    width: 150px !important;
    padding: 12px !important;
  }

  .floating-stats {
    flex-direction: column !important;
    bottom: 16px !important;
    left: 16px !important;
    transform: none !important;
    gap: 8px !important;
  }
}
</style>
