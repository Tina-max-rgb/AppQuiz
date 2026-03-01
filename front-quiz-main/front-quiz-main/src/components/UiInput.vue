<template>
  <div class="space-y-1">
    <label v-if="label" class="label">{{ label }}</label>
    <input class="input" v-bind="$attrs" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
  </div>
</template>
<script setup>
defineProps({ label: String, modelValue: [String, Number] })
defineEmits(['update:modelValue'])
</script>
