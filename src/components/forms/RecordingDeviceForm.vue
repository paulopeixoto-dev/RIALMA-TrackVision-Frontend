<script setup lang="ts">
import { computed } from 'vue'
import type { FieldErrors } from '@/types/api'
import type { EdgeNode, Location, RecordingDeviceInput } from '@/types/admin'

const props = defineProps<{
  modelValue: RecordingDeviceInput
  locations: Location[]
  edgeNodes: EdgeNode[]
  errors: FieldErrors
  submitting: boolean
  isEditing: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: RecordingDeviceInput]
  submit: [value: RecordingDeviceInput]
  cancel: []
}>()

const locationOptions = computed(() => props.locations.map((location) => ({ label: location.name, value: location.id })))
const edgeNodeOptions = computed(() => props.edgeNodes
  .filter((edgeNode) => !props.modelValue.location_id || edgeNode.location?.id === props.modelValue.location_id)
  .map((edgeNode) => ({ label: edgeNode.name, value: edgeNode.id })))

function updateField<K extends keyof RecordingDeviceInput>(key: K, value: RecordingDeviceInput[K]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function payloadFromForm(): RecordingDeviceInput {
  const payload = { ...props.modelValue }
  if (props.isEditing && !payload.password?.trim()) {
    delete payload.password
  }
  return payload
}

function submitForm(): void {
  emit('submit', payloadFromForm())
}
</script>

<template>
  <VaForm
    class="entity-form"
    data-test="recording-device-form"
    @submit.prevent="submitForm"
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
    <VaSelect
      class="base-field"
      :error="Boolean(errors.edge_node_id?.[0])"
      :error-messages="errors.edge_node_id?.[0] ?? ''"
      label="Edge node"
      :model-value="modelValue.edge_node_id"
      name="edge_node_id"
      :options="edgeNodeOptions"
      placeholder="Selecione"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('edge_node_id', Number($event))"
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
    <VaSelect
      class="base-field"
      :error="Boolean(errors.vendor?.[0])"
      :error-messages="errors.vendor?.[0] ?? ''"
      label="Fabricante"
      :model-value="modelValue.vendor"
      name="vendor"
      :options="[{ label: 'Intelbras', value: 'intelbras' }]"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('vendor', 'intelbras')"
    />
    <VaSelect
      class="base-field"
      :error="Boolean(errors.protocol?.[0])"
      :error-messages="errors.protocol?.[0] ?? ''"
      label="Protocolo"
      :model-value="modelValue.protocol"
      name="protocol"
      :options="[{ label: 'HTTP', value: 'http' }, { label: 'HTTPS', value: 'https' }]"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('protocol', $event as RecordingDeviceInput['protocol'])"
    />
    <VaInput
      class="base-field"
      :error="Boolean(errors.host?.[0])"
      :error-messages="errors.host?.[0] ?? ''"
      label="Host"
      :model-value="modelValue.host"
      name="host"
      @update:model-value="updateField('host', $event)"
    />
    <VaInput
      class="base-field"
      :error="Boolean(errors.port?.[0])"
      :error-messages="errors.port?.[0] ?? ''"
      label="Porta"
      :model-value="modelValue.port"
      name="port"
      type="number"
      @update:model-value="updateField('port', Number($event))"
    />
    <VaInput
      class="base-field"
      :error="Boolean(errors.username?.[0])"
      :error-messages="errors.username?.[0] ?? ''"
      label="Usuario"
      :model-value="modelValue.username ?? ''"
      name="username"
      @update:model-value="updateField('username', $event || null)"
    />
    <VaInput
      class="base-field"
      :error="Boolean(errors.password?.[0])"
      :error-messages="errors.password?.[0] ?? ''"
      autocomplete="new-password"
      :label="isEditing ? 'Nova senha (opcional)' : 'Senha'"
      :model-value="modelValue.password ?? ''"
      name="password"
      type="password"
      @update:model-value="updateField('password', $event)"
    />
    <VaSelect
      class="base-field"
      :error="Boolean(errors.auth_type?.[0])"
      :error-messages="errors.auth_type?.[0] ?? ''"
      label="Autenticacao"
      :model-value="modelValue.auth_type"
      name="auth_type"
      :options="[{ label: 'Digest', value: 'digest' }, { label: 'Basic', value: 'basic' }, { label: 'Nenhuma', value: 'none' }]"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('auth_type', $event as RecordingDeviceInput['auth_type'])"
    />
    <VaSwitch
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
  </VaForm>
</template>
