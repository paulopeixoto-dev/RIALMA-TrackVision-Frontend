<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
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
    <BaseInput
      :error="errors.plate"
      label="Placa"
      :model-value="modelValue.plate"
      name="plate"
      @update:model-value="updateField('plate', $event)"
    />
    <BaseInput
      :error="errors.fleet_code"
      label="Codigo de frota"
      :model-value="modelValue.fleet_code"
      name="fleet_code"
      @update:model-value="updateField('fleet_code', $event)"
    />
    <BaseInput
      :error="errors.description"
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
