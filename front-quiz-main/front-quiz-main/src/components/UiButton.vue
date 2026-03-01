<template>
  <button :class="classes" v-bind="$attrs"><slot /></button>
</template>
<script setup>
import { computed } from 'vue'
const props = defineProps({ variant: { type: String, default: 'primary' } })
const classes = computed(()=> {
  if(props.variant==='success') return 'btn btn-success'
  if(props.variant==='danger') return 'btn btn-danger'
  if(props.variant==='ghost') return 'btn-ghost'
  return 'btn btn-primary'
})
</script>
