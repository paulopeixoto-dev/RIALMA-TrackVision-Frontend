<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'info' | 'success' | 'warning' | 'error'
  }>(),
  {
    variant: 'info',
  },
)

const colorByVariant = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'danger',
} as const
</script>

<template>
  <VaAlert
    class="base-alert"
    :color="colorByVariant[props.variant]"
    role="status"
  >
    <slot />
  </VaAlert>
</template>
