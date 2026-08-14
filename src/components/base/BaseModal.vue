<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <VaModal
    class="base-modal"
    :model-value="open"
    hide-default-actions
    max-width="760px"
    mobile-fullscreen
    @update:model-value="!$event && emit('close')"
  >
    <template #header>
      <div class="base-modal__header">
        <h2>{{ title }}</h2>
        <VaButton
          aria-label="Fechar"
          icon="close"
          preset="plain"
          @click="emit('close')"
        />
      </div>
    </template>

    <div class="base-modal__body">
      <slot />
    </div>
  </VaModal>
</template>
