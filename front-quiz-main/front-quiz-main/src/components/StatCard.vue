<template>
  <div class="bg-gray-50 p-3 rounded-lg text-center shadow-sm">
    <p class="text-sm text-gray-500 truncate">{{ title }}</p>
    <p class="text-xl font-semibold text-gray-800">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
}>()
</script>