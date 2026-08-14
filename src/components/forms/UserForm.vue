<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import type { FieldErrors } from '@/types/api'
import type { Role, UserFormInput } from '@/types/admin'

const props = defineProps<{
  mode: 'create' | 'edit'
  modelValue: UserFormInput
  roles: Role[]
  errors: FieldErrors
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UserFormInput]
  submit: []
  cancel: []
}>()

function updateField<K extends keyof UserFormInput>(key: K, value: UserFormInput[K]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function roleChecked(roleName: string): boolean {
  return props.modelValue.roles.includes(roleName)
}

function updateRole(roleName: string, checked: boolean): void {
  const roles = new Set(props.modelValue.roles)

  if (checked) {
    roles.add(roleName)
  } else {
    roles.delete(roleName)
  }

  updateField('roles', Array.from(roles))
}

function roleErrors(): string[] | undefined {
  return props.errors.roles ?? props.errors['roles.0']
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
      autocomplete="name"
      @update:model-value="updateField('name', $event)"
    />
    <BaseInput
      :error="errors.email"
      label="Email"
      :model-value="modelValue.email"
      name="email"
      type="email"
      autocomplete="email"
      @update:model-value="updateField('email', $event)"
    />
    <template v-if="mode === 'create'">
      <BaseInput
        :error="errors.password"
        label="Senha"
        :model-value="modelValue.password ?? ''"
        name="password"
        type="password"
        autocomplete="new-password"
        @update:model-value="updateField('password', $event)"
      />
      <BaseInput
        :error="errors.password_confirmation"
        label="Confirmar senha"
        :model-value="modelValue.password_confirmation ?? ''"
        name="password_confirmation"
        type="password"
        autocomplete="new-password"
        @update:model-value="updateField('password_confirmation', $event)"
      />
    </template>
    <label class="checkbox-field">
      <input
        :checked="modelValue.is_active"
        name="is_active"
        type="checkbox"
        @change="updateField('is_active', ($event.target as HTMLInputElement).checked)"
      >
      <span>Ativo</span>
    </label>

    <fieldset class="checkbox-group">
      <legend>Roles</legend>
      <label
        v-for="role in roles"
        :key="role.id"
        class="checkbox-field"
      >
        <input
          :checked="roleChecked(role.name)"
          name="roles"
          type="checkbox"
          :value="role.name"
          @change="updateRole(role.name, ($event.target as HTMLInputElement).checked)"
        >
        <span>{{ role.name }}</span>
      </label>
      <p
        v-if="roleErrors()?.[0]"
        class="field-error"
      >
        {{ roleErrors()?.[0] }}
      </p>
    </fieldset>

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
