<template>
  <div class="search-panel">
    <el-input
      v-model="searchValue"
      :placeholder="placeholder"
      :style="{ width: inputWidth }"
      @keyup.enter="handleSearch"
    />
    <el-button
      type="primary"
      :style="{ backgroundColor: buttonColor, borderColor: buttonColor }"
      @click="handleSearch"
    >
      搜索
    </el-button>
    <el-button @click="handleReset">重置</el-button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入搜索关键词'
  },
  inputWidth: {
    type: String,
    default: '300px'
  },
  buttonColor: {
    type: String,
    default: '#8B4513'
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'reset'])

const searchValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  searchValue.value = newVal
})

const handleSearch = () => {
  emit('update:modelValue', searchValue.value)
  emit('search', searchValue.value)
}

const handleReset = () => {
  searchValue.value = ''
  emit('update:modelValue', '')
  emit('reset')
}
</script>

<style scoped>
.search-panel {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
