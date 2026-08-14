<script setup lang="ts">
import type { FieldErrors } from '@/types/api'
import type { LocationInput } from '@/types/admin'

const props = defineProps<{
  modelValue: LocationInput
  errors: FieldErrors
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: LocationInput]
  submit: []
  cancel: []
}>()

function updateField<K extends keyof LocationInput>(key: K, value: LocationInput[K]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <form
    class="entity-form"
    @submit.prevent="$emit('submit')"
  >
    <VaInput
      class="base-field"
      :error="Boolean(errors.name?.[0])"
      :error-messages="errors.name?.[0] ?? ''"
      label="Nome"
      :model-value="modelValue.name"
      name="name"
      @update:model-value="updateField('name', $event)"
    />
    <VaInput
      class="base-field"
      :error="Boolean(errors.description?.[0])"
      :error-messages="errors.description?.[0] ?? ''"
      label="Descricao"
      :model-value="modelValue.description"
      name="description"
      @update:model-value="updateField('description', $event)"
    />
    <VaCheckbox
      :model-value="modelValue.is_active"
      label="Ativo"
      name="is_active"
      @update:model-value="updateField('is_active', Boolean($event))"
    />
    <div class="form-actions">
      <VaButton
        class="base-button"
        :loading="submitting"
        type="submit"
      >
        Salvar
      </VaButton>
      <VaButton
        class="base-button"
        preset="plain"
        type="button"
        @click="$emit('cancel')"
      >
        Cancelar
      </VaButton>
    </div>
  </form>
</template>
