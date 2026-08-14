<script setup lang="ts">
export interface BaseSelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

withDefaults(
  defineProps<{
    modelValue: string | number | null
    label: string
    name?: string
    options: BaseSelectOption[]
    error?: string | string[]
  }>(),
  {
    name: undefined,
    error: undefined,
  },
)

defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function firstError(error?: string | string[]): string {
  return Array.isArray(error) ? error[0] : (error ?? '')
}
</script>

<template>
  <VaSelect
    class="base-field"
    :error="Boolean(firstError(error))"
    :error-messages="firstError(error)"
    :label="label"
    :model-value="modelValue ?? ''"
    :name="name"
    :options="options"
    placeholder="Selecione"
    text-by="label"
    track-by="value"
    value-by="value"
    @update:model-value="$emit('update:modelValue', $event as string | number)"
  />
</template>
