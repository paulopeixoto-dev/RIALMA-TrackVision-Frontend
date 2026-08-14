<script setup lang="ts">
import { computed } from 'vue'
import type { FieldErrors } from '@/types/api'
import type { EdgeNodeInput, Location } from '@/types/admin'

const props = defineProps<{
  modelValue: EdgeNodeInput
  locations: Location[]
  errors: FieldErrors
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: EdgeNodeInput]
  submit: []
  cancel: []
}>()

const locationOptions = computed(() =>
  props.locations.map((location) => ({
    label: location.name,
    value: location.id,
  })),
)

function updateField<K extends keyof EdgeNodeInput>(key: K, value: EdgeNodeInput[K]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <form
    class="entity-form"
    @submit.prevent="$emit('submit')"
  >
    <VaSelect
      class="base-field"
      :error="Boolean(errors.location_id?.[0])"
      :error-messages="errors.location_id?.[0] ?? ''"
      label="Local"
      :model-value="modelValue.location_id"
      name="location_id"
      :options="locationOptions"
      placeholder="Selecione"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('location_id', Number($event))"
    />
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
