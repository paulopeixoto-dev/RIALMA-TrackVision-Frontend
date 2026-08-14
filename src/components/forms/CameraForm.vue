<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
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
    <BaseSelect
      :error="errors.location_id"
      label="Local"
      :model-value="modelValue.location_id"
      name="location_id"
      :options="locationOptions"
      @update:model-value="updateField('location_id', Number($event))"
    />
    <BaseSelect
      :error="errors.edge_node_id"
      label="Edge node"
      :model-value="modelValue.edge_node_id"
      name="edge_node_id"
      :options="edgeNodeOptions"
      @update:model-value="updateField('edge_node_id', Number($event))"
    />
    <BaseInput
      :error="errors.name"
      label="Nome"
      :model-value="modelValue.name"
      name="name"
      @update:model-value="updateField('name', $event)"
    />
    <BaseSelect
      :error="errors.type"
      label="Tipo"
      :model-value="modelValue.type"
      name="type"
      :options="[
        { label: 'LPR', value: 'lpr' },
        { label: 'Apoio', value: 'support' },
      ]"
      @update:model-value="updateField('type', $event as CameraInput['type'])"
    />
    <BaseSelect
      :error="errors.vendor"
      label="Fabricante"
      :model-value="modelValue.vendor"
      name="vendor"
      :options="[{ label: 'Intelbras', value: 'intelbras' }]"
      @update:model-value="updateField('vendor', 'intelbras')"
    />
    <BaseInput
      :error="errors.host"
      label="Host"
      :model-value="modelValue.host"
      name="host"
      @update:model-value="updateField('host', $event)"
    />
    <BaseInput
      :error="errors.port"
      label="Porta"
      :model-value="modelValue.port"
      name="port"
      type="number"
      @update:model-value="updateField('port', Number($event))"
    />
    <BaseInput
      :error="errors.channel"
      label="Canal"
      :model-value="modelValue.channel"
      name="channel"
      type="number"
      @update:model-value="updateField('channel', $event ? Number($event) : null)"
    />
    <BaseInput
      :error="errors.username"
      label="Usuario"
      :model-value="modelValue.username"
      name="username"
      @update:model-value="updateField('username', $event || null)"
    />
    <BaseInput
      :error="errors.password"
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
