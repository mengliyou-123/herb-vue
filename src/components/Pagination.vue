<template>
  <el-pagination
    :current-page="currentPage"
    :page-size="pageSize"
    :page-sizes="pageSizes"
    :total="total"
    :layout="layout"
    :background="background"
    @update:current-page="handleCurrentChange"
    @update:page-size="handleSizeChange"
  />
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  },
  pageSizes: {
    type: Array,
    default: () => [5, 10, 20, 30]
  },
  layout: {
    type: String,
    default: 'jumper, total, sizes, prev, pager, next'
  },
  background: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:currentPage', 'update:pageSize', 'change'])

const handleSizeChange = (size) => {
  emit('update:pageSize', size)
  emit('change', { page: props.currentPage, size })
}

const handleCurrentChange = (page) => {
  emit('update:currentPage', page)
  emit('change', { page, size: props.pageSize })
}
</script>

<style scoped>
.el-pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
