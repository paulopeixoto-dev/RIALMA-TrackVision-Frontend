<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string | number | null
    label: string
    name?: string
    type?: string
    error?: string | string[]
    autocomplete?: string
  }>(),
  {
    name: undefined,
    type: 'text',
    error: undefined,
    autocomplete: undefined,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()

function firstError(error?: string | string[]): string {
  return Array.isArray(error) ? error[0] : (error ?? '')
}
</script>

<template>
  <label class="base-field">
    <span>{{ label }}</span>
    <input
      class="base-input"
      :autocomplete="autocomplete"
      :name="name"
      :type="type"
      :value="modelValue ?? ''"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </label>
  <p
    v-if="firstError(error)"
    class="field-error"
  >
    {{ firstError(error) }}
  </p>
</template>
