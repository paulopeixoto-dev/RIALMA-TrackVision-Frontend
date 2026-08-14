<script setup lang="ts">
import { computed } from 'vue'
import type { FieldErrors } from '@/types/api'
import type { CameraInput, EdgeNode, Location } from '@/types/admin'

const props = defineProps<{
  modelValue: CameraInput
  locations: Location[]
  edgeNodes: EdgeNode[]
  errors: FieldErrors
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CameraInput]
  submit: []
  cancel: []
}>()

const locationOptions = computed(() => props.locations.map((location) => ({ label: location.name, value: location.id })))

const edgeNodeOptions = computed(() =>
  props.edgeNodes
    .filter((edgeNode) => !props.modelValue.location_id || edgeNode.location?.id === props.modelValue.location_id)
    .map((edgeNode) => ({ label: edgeNode.name, value: edgeNode.id })),
)

function updateField<K extends keyof CameraInput>(key: K, value: CameraInput[K]): void {
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
      :error="Boolean(errors.type?.[0])"
      :error-messages="errors.type?.[0] ?? ''"
      label="Tipo"
      :model-value="modelValue.type"
      name="type"
      :options="[
        { label: 'LPR', value: 'lpr' },
        { label: 'Apoio', value: 'support' },
      ]"
      placeholder="Selecione"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('type', $event as CameraInput['type'])"
    />
    <VaSelect
      class="base-field"
      :error="Boolean(errors.vendor?.[0])"
      :error-messages="errors.vendor?.[0] ?? ''"
      label="Fabricante"
      :model-value="modelValue.vendor"
      name="vendor"
      :options="[{ label: 'Intelbras', value: 'intelbras' }]"
      placeholder="Selecione"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('vendor', 'intelbras')"
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
      :error="Boolean(errors.channel?.[0])"
      :error-messages="errors.channel?.[0] ?? ''"
      label="Canal"
      :model-value="modelValue.channel"
      name="channel"
      type="number"
      @update:model-value="updateField('channel', $event ? Number($event) : null)"
    />
    <VaInput
      class="base-field"
      :error="Boolean(errors.username?.[0])"
      :error-messages="errors.username?.[0] ?? ''"
      label="Usuario"
      :model-value="modelValue.username"
      name="username"
      @update:model-value="updateField('username', $event || null)"
    />
    <VaInput
      class="base-field"
      :error="Boolean(errors.password?.[0])"
      :error-messages="errors.password?.[0] ?? ''"
      autocomplete="new-password"
      label="Senha"
      :model-value="modelValue.password ?? ''"
      name="password"
      type="password"
      @update:model-value="updateField('password', $event)"
    />
    <VaCheckbox
      :model-value="modelValue.is_active"
      label="Ativa"
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
