<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
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
    <BaseSelect
      :error="errors.location_id"
      label="Local"
      :model-value="modelValue.location_id"
      name="location_id"
      :options="locationOptions"
      @update:model-value="updateField('location_id', Number($event))"
    />
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
