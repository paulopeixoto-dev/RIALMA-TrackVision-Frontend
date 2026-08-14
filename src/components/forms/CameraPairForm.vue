<script setup lang="ts">
import { computed } from 'vue'
import type { FieldErrors } from '@/types/api'
import type { Camera, CameraPairInput, EdgeNode, Location } from '@/types/admin'

const props = defineProps<{
  modelValue: CameraPairInput
  locations: Location[]
  edgeNodes: EdgeNode[]
  cameras: Camera[]
  errors: FieldErrors
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CameraPairInput]
  submit: []
  cancel: []
}>()

const locationOptions = computed(() => props.locations.map((location) => ({ label: location.name, value: location.id })))

const edgeNodeOptions = computed(() =>
  props.edgeNodes
    .filter((edgeNode) => !props.modelValue.location_id || edgeNode.location?.id === props.modelValue.location_id)
    .map((edgeNode) => ({ label: edgeNode.name, value: edgeNode.id })),
)

function belongsToSelectedScope(camera: Camera): boolean {
  const matchesLocation = !props.modelValue.location_id || camera.location?.id === props.modelValue.location_id
  const matchesEdgeNode = !props.modelValue.edge_node_id || camera.edge_node?.id === props.modelValue.edge_node_id
  return camera.is_active && matchesLocation && matchesEdgeNode
}

const lprCameraOptions = computed(() =>
  props.cameras
    .filter((camera) => camera.type === 'lpr' && belongsToSelectedScope(camera))
    .map((camera) => ({ label: camera.name, value: camera.id })),
)

const supportCameraOptions = computed(() =>
  [
    { label: 'Sem apoio', value: null },
    ...props.cameras
      .filter((camera) => camera.type === 'support' && belongsToSelectedScope(camera))
      .map((camera) => ({ label: camera.name, value: camera.id })),
  ],
)

function updateField<K extends keyof CameraPairInput>(key: K, value: CameraPairInput[K]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function optionalCameraId(value: unknown): number | null {
  return value === null || value === undefined || value === '' ? null : Number(value)
}
</script>

<template>
  <form
    class="entity-form"
    @submit.prevent="$emit('submit')"
  >
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
    <VaSelect
      class="base-field"
      :error="Boolean(errors.lpr_camera_id?.[0])"
      :error-messages="errors.lpr_camera_id?.[0] ?? ''"
      label="Camera LPR"
      :model-value="modelValue.lpr_camera_id"
      name="lpr_camera_id"
      :options="lprCameraOptions"
      placeholder="Selecione"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('lpr_camera_id', Number($event))"
    />
    <VaSelect
      class="base-field"
      :error="Boolean(errors.support_camera_id?.[0])"
      :error-messages="errors.support_camera_id?.[0] ?? ''"
      clearable
      label="Camera de apoio"
      :model-value="modelValue.support_camera_id"
      name="support_camera_id"
      :options="supportCameraOptions"
      placeholder="Opcional"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('support_camera_id', optionalCameraId($event))"
    />
    <VaSelect
      class="base-field"
      :error="Boolean(errors.direction?.[0])"
      :error-messages="errors.direction?.[0] ?? ''"
      label="Direcao"
      :model-value="modelValue.direction"
      name="direction"
      :options="[
        { label: 'Ida', value: 'outbound' },
        { label: 'Volta', value: 'inbound' },
        { label: 'Indefinida', value: 'unknown' },
      ]"
      placeholder="Selecione"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('direction', $event as CameraPairInput['direction'])"
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
