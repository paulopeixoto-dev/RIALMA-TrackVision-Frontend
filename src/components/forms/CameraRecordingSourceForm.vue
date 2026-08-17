<script setup lang="ts">
import { computed } from 'vue'
import type { FieldErrors } from '@/types/api'
import type { Camera, CameraRecordingSourceInput, RecordingDevice } from '@/types/admin'

const props = defineProps<{
  modelValue: CameraRecordingSourceInput
  cameras: Camera[]
  recordingDevices: RecordingDevice[]
  errors: FieldErrors
  submitting: boolean
  cameraImmutable?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CameraRecordingSourceInput]
  submit: []
  cancel: []
}>()

const cameraOptions = computed(() => props.cameras.filter((camera) => camera.type === 'support' && camera.is_active).map((camera) => ({ label: camera.name, value: camera.id })))
const recordingDeviceOptions = computed(() => props.recordingDevices
  .filter((device) => device.is_active || device.id === props.modelValue.recording_device_id)
  .map((device) => ({ label: device.name, value: device.id })))

function updateField<K extends keyof CameraRecordingSourceInput>(key: K, value: CameraRecordingSourceInput[K]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <VaForm
    class="entity-form"
    @submit.prevent="$emit('submit')"
  >
    <VaSelect
      class="base-field"
      :error="Boolean(errors.camera_id?.[0])"
      :error-messages="errors.camera_id?.[0] ?? ''"
      label="Camera de apoio"
      :model-value="modelValue.camera_id"
      name="camera_id"
      :disabled="cameraImmutable"
      :options="cameraOptions"
      placeholder="Selecione"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('camera_id', Number($event))"
    />
    <VaSelect
      class="base-field"
      :error="Boolean(errors.recording_device_id?.[0])"
      :error-messages="errors.recording_device_id?.[0] ?? ''"
      label="Gravador/NVR"
      :model-value="modelValue.recording_device_id"
      name="recording_device_id"
      :options="recordingDeviceOptions"
      placeholder="Selecione"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('recording_device_id', Number($event))"
    />
    <VaInput
      class="base-field"
      :error="Boolean(errors.channel?.[0])"
      :error-messages="errors.channel?.[0] ?? ''"
      label="Canal"
      :model-value="modelValue.channel"
      name="channel"
      type="number"
      @update:model-value="updateField('channel', Number($event))"
    />
    <VaSelect
      class="base-field"
      :error="Boolean(errors.stream?.[0])"
      :error-messages="errors.stream?.[0] ?? ''"
      label="Stream"
      :model-value="modelValue.stream"
      name="stream"
      :options="[{ label: 'Principal', value: 'main' }, { label: 'Secundario', value: 'sub' }]"
      text-by="label"
      track-by="value"
      value-by="value"
      @update:model-value="updateField('stream', $event as CameraRecordingSourceInput['stream'])"
    />
    <VaInput
      class="base-field"
      :error="Boolean(errors.target_offset_seconds?.[0])"
      :error-messages="errors.target_offset_seconds?.[0] ?? ''"
      label="Ajuste de horario (segundos)"
      :model-value="modelValue.target_offset_seconds"
      name="target_offset_seconds"
      type="number"
      @update:model-value="updateField('target_offset_seconds', Number($event))"
    />
    <VaInput
      class="base-field"
      :error="Boolean(errors.search_window_seconds?.[0])"
      :error-messages="errors.search_window_seconds?.[0] ?? ''"
      label="Janela de busca (segundos)"
      :model-value="modelValue.search_window_seconds"
      name="search_window_seconds"
      type="number"
      @update:model-value="updateField('search_window_seconds', Number($event))"
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
