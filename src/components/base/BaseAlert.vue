<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'info' | 'success' | 'warning' | 'error'
  }>(),
  {
    variant: 'info',
  },
)
</script>

<template>
  <div
    class="base-alert"
    :class="`base-alert--${variant}`"
    role="status"
  >
    <slot />
  </div>
</template>
