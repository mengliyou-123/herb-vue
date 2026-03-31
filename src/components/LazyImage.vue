<template>
  <div class="lazy-image">
    <img
      v-if="loaded"
      :src="src"
      :alt="alt"
      :style="imageStyle"
      @error="handleError"
    />
    <div v-else class="image-placeholder" :style="placeholderStyle">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  objectFit: {
    type: String,
    default: 'cover'
  }
})

const loaded = ref(false)
const observer = ref(null)

const imageStyle = {
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  objectFit: props.objectFit
}

const placeholderStyle = {
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  backgroundColor: '#f5f5f5'
}

const loadImage = () => {
  const img = new Image()
  img.src = props.src
  img.onload = () => {
    loaded.value = true
  }
  img.onerror = () => {
    handleError()
  }
}

const handleError = () => {
  loaded.value = true
}

onMounted(() => {
  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage()
        observer.value.disconnect()
      }
    })
  }, {
    rootMargin: '50px'
  })

  const element = document.querySelector('.lazy-image')
  if (element) {
    observer.value.observe(element)
  }
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})
</script>

<style scoped>
.lazy-image {
  display: inline-block;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #8B4513;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

img {
  transition: opacity 0.3s ease-in-out;
}
</style>
