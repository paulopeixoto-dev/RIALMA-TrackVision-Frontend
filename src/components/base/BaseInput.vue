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

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function firstError(error?: string | string[]): string {
  return Array.isArray(error) ? error[0] : (error ?? '')
}
</script>

<template>
  <VaInput
    class="base-field"
    :autocomplete="autocomplete"
    :error="Boolean(firstError(error))"
    :error-messages="firstError(error)"
    :label="label"
    :model-value="modelValue ?? ''"
    :name="name"
    :type="type"
    @update:model-value="emit('update:modelValue', String($event))"
  />
</template>
