<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseInput from '@/components/base/BaseInput.vue'
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
  props.cameras
    .filter((camera) => camera.type === 'support' && belongsToSelectedScope(camera))
    .map((camera) => ({ label: camera.name, value: camera.id })),
)

function updateField<K extends keyof CameraPairInput>(key: K, value: CameraPairInput[K]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
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
      @update:model-value="updateField('name', $event)"
    />
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
    <BaseSelect
      :error="errors.lpr_camera_id"
      label="Camera LPR"
      :model-value="modelValue.lpr_camera_id"
      name="lpr_camera_id"
      :options="lprCameraOptions"
      @update:model-value="updateField('lpr_camera_id', Number($event))"
    />
    <BaseSelect
      :error="errors.support_camera_id"
      label="Camera de apoio"
      :model-value="modelValue.support_camera_id"
      name="support_camera_id"
      :options="supportCameraOptions"
      @update:model-value="updateField('support_camera_id', Number($event))"
    />
    <BaseSelect
      :error="errors.direction"
      label="Direcao"
      :model-value="modelValue.direction"
      name="direction"
      :options="[
        { label: 'Ida', value: 'outbound' },
        { label: 'Volta', value: 'inbound' },
        { label: 'Indefinida', value: 'unknown' },
      ]"
      @update:model-value="updateField('direction', $event as CameraPairInput['direction'])"
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
