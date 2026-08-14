<script setup lang="ts">
import type { FieldErrors } from '@/types/api'
import type { VehicleInput } from '@/types/admin'

const props = defineProps<{
  modelValue: VehicleInput
  errors: FieldErrors
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: VehicleInput]
  submit: []
  cancel: []
}>()

function updateField<K extends keyof VehicleInput>(key: K, value: VehicleInput[K]): void {
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
      :error="Boolean(errors.plate?.[0])"
      :error-messages="errors.plate?.[0] ?? ''"
      label="Placa"
      :model-value="modelValue.plate"
      name="plate"
      @update:model-value="updateField('plate', $event)"
    />
    <VaInput
      class="base-field"
      :error="Boolean(errors.fleet_code?.[0])"
      :error-messages="errors.fleet_code?.[0] ?? ''"
      label="Codigo de frota"
      :model-value="modelValue.fleet_code"
      name="fleet_code"
      @update:model-value="updateField('fleet_code', $event)"
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
