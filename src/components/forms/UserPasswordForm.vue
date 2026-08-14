<script setup lang="ts">
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
    <VaInput
      class="base-field"
      :error="Boolean(errors.password?.[0])"
      :error-messages="errors.password?.[0] ?? ''"
      label="Nova senha"
      :model-value="modelValue.password"
      name="password"
      type="password"
      autocomplete="new-password"
      @update:model-value="updateField('password', $event)"
    />
    <VaInput
      class="base-field"
      :error="Boolean(errors.password_confirmation?.[0])"
      :error-messages="errors.password_confirmation?.[0] ?? ''"
      label="Confirmar senha"
      :model-value="modelValue.password_confirmation"
      name="password_confirmation"
      type="password"
      autocomplete="new-password"
      @update:model-value="updateField('password_confirmation', $event)"
    />
    <div class="form-actions">
      <VaButton
        class="base-button"
        :loading="submitting"
        type="submit"
      >
        Redefinir senha
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
