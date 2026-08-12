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
  'update:modelValue': [value: string]
}>()

function firstError(error?: string | string[]): string {
  return Array.isArray(error) ? error[0] : (error ?? '')
}
</script>

<template>
  <label class="base-field">
    <span>{{ label }}</span>
    <select
      class="base-input"
      :name="name"
      :value="modelValue ?? ''"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">
        Selecione
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :disabled="option.disabled"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </label>
  <p
    v-if="firstError(error)"
    class="field-error"
  >
    {{ firstError(error) }}
  </p>
</template>
