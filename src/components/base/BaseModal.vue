<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal-backdrop"
      role="presentation"
      @click.self="$emit('close')"
    >
      <section
        class="base-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`${title}-modal-title`"
      >
        <header class="base-modal__header">
          <h2 :id="`${title}-modal-title`">
            {{ title }}
          </h2>
          <button
            class="icon-button"
            type="button"
            aria-label="Fechar"
            @click="$emit('close')"
          >
            x
          </button>
        </header>
        <div class="base-modal__body">
          <slot />
        </div>
      </section>
    </div>
  </Teleport>
</template>
