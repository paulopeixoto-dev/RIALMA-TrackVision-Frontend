<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
    loading: false,
  },
)

const color = computed(() => {
  if (props.variant === 'danger') {
    return 'danger'
  }

  if (props.variant === 'secondary') {
    return 'secondary'
  }

  return 'primary'
})

const preset = computed(() => (props.variant === 'ghost' ? 'plain' : undefined))
</script>

<template>
  <VaButton
    class="base-button"
    :disabled="disabled || loading"
    :color="color"
    :loading="loading"
    :preset="preset"
    :type="type"
  >
    <slot />
  </VaButton>
</template>
