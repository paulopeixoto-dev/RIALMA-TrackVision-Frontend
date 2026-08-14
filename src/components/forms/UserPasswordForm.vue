<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import type { FieldErrors } from '@/types/api'
import type { UserPasswordInput } from '@/types/admin'

const props = defineProps<{
  modelValue: UserPasswordInput
  errors: FieldErrors
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UserPasswordInput]
  submit: []
  cancel: []
}>()

function updateField<K extends keyof UserPasswordInput>(key: K, value: UserPasswordInput[K]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <form
    class="entity-form"
    @submit.prevent="$emit('submit')"
  >
    <BaseInput
      :error="errors.password"
      label="Nova senha"
      :model-value="modelValue.password"
      name="password"
      type="password"
      autocomplete="new-password"
      @update:model-value="updateField('password', $event)"
    />
    <BaseInput
      :error="errors.password_confirmation"
      label="Confirmar senha"
      :model-value="modelValue.password_confirmation"
      name="password_confirmation"
      type="password"
      autocomplete="new-password"
      @update:model-value="updateField('password_confirmation', $event)"
    />
    <div class="form-actions">
      <BaseButton
        :loading="submitting"
        type="submit"
      >
        Redefinir senha
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
