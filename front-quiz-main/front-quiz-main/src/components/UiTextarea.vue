<template>
  <div class="space-y-1">
    <label v-if="label" class="label">{{ label }}</label>
    <textarea class="input min-h-[120px]" v-bind="$attrs" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"></textarea>
  </div>
</template>
<script setup>
defineProps({ label: String, modelValue: String })
defineEmits(['update:modelValue'])
</script>
