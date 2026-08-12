<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
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
    <BaseInput
      :error="errors.name"
      label="Nome"
      :model-value="modelValue.name"
      name="name"
      @update:model-value="updateField('name', $event)"
    />
    <BaseInput
      :error="errors.description"
      label="Descricao"
      :model-value="modelValue.description"
      name="description"
      @update:model-value="updateField('description', $event)"
    />
    <label class="checkbox-field">
      <input
        :checked="modelValue.is_active"
        name="is_active"
        type="checkbox"
        @change="updateField('is_active', ($event.target as HTMLInputElement).checked)"
      >
      <span>Ativo</span>
    </label>
    <div class="form-actions">
      <BaseButton
        :loading="submitting"
        type="submit"
      >
        Salvar
      </BaseButton>
      <BaseButton
        type="button"
        variant="ghost"
        @click="$emit('cancel')"
      >
        Cancelar
      </BaseButton>
    </div>
  </form>
</template>
