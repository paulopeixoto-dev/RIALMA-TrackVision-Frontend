<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import CameraForm from '@/components/forms/CameraForm.vue'
import { ApiError } from '@/services/apiClient'
import { camerasService } from '@/services/camerasService'
import { edgeNodesService } from '@/services/edgeNodesService'
import { locationsService } from '@/services/locationsService'
import type { FieldErrors } from '@/types/api'
import type { Camera, CameraInput, EdgeNode, Location } from '@/types/admin'

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'type', label: 'Tipo' },
  { key: 'location', label: 'Local' },
  { key: 'edge_node', label: 'Edge node' },
  { key: 'host', label: 'Host' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Acoes' },
]

const emptyForm: CameraInput = {
  location_id: 0,
  edge_node_id: 0,
  name: '',
  type: 'lpr',
  vendor: 'intelbras',
  host: '',
  port: 80,
  channel: 1,
  username: null,
  password: '',
  is_active: true,
}

const cameras = ref<Camera[]>([])
const locations = ref<Location[]>([])
const edgeNodes = ref<EdgeNode[]>([])
const loading = ref(true)
const submitting = ref(false)
const modalOpen = ref(false)
const editingCamera = ref<Camera | null>(null)
const form = ref<CameraInput>({ ...emptyForm })
const fieldErrors = ref<FieldErrors>({})
const error = ref('')
const success = ref('')

function cameraFrom(row: unknown): Camera {
  return row as Camera
}

function payload(input: CameraInput): CameraInput {
  const next: CameraInput = {
    ...input,
    name: input.name.trim(),
    host: input.host.trim(),
    username: input.username?.trim() || null,
  }

  if (!next.password) {
    delete next.password
  }

  return next
}

async function loadData(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const [camerasResponse, locationsResponse, edgeNodesResponse] = await Promise.all([
      camerasService.list(),
      locationsService.list(),
      edgeNodesService.list(),
    ])
    cameras.value = camerasResponse.data
    locations.value = locationsResponse.data
    edgeNodes.value = edgeNodesResponse.data
  } catch {
    error.value = 'Nao foi possivel carregar cameras.'
  } finally {
    loading.value = false
  }
}

function openCreate(): void {
  editingCamera.value = null
  form.value = {
    ...emptyForm,
    location_id: locations.value[0]?.id ?? 0,
    edge_node_id: edgeNodes.value[0]?.id ?? 0,
  }
  fieldErrors.value = {}
  modalOpen.value = true
}

function openEdit(camera: Camera): void {
  editingCamera.value = camera
  form.value = {
    location_id: camera.location?.id ?? 0,
    edge_node_id: camera.edge_node?.id ?? 0,
    name: camera.name,
    type: camera.type,
    vendor: camera.vendor,
    host: camera.host,
    port: camera.port,
    channel: camera.channel,
    username: camera.username,
    password: '',
    is_active: camera.is_active,
  }
  fieldErrors.value = {}
  modalOpen.value = true
}

function closeModal(): void {
  modalOpen.value = false
}

async function saveCamera(): Promise<void> {
  submitting.value = true
  fieldErrors.value = {}

  try {
    if (editingCamera.value) {
      await camerasService.update(editingCamera.value, payload(form.value))
      success.value = 'Camera atualizada.'
    } else {
      await camerasService.create(payload(form.value))
      success.value = 'Camera criada.'
    }

    closeModal()
    await loadData()
  } catch (apiError) {
    if (apiError instanceof ApiError) {
      fieldErrors.value = apiError.errors
      error.value = apiError.message
    } else {
      error.value = 'Nao foi possivel salvar a camera.'
    }
  } finally {
    submitting.value = false
  }
}

async function deleteCamera(camera: Camera): Promise<void> {
  if (!window.confirm(`Remover camera ${camera.name}?`)) {
    return
  }

  await camerasService.remove(camera)
  success.value = 'Camera removida.'
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <section class="page-section">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          Cadastro
        </p>
        <h1>Cameras</h1>
      </div>
      <VaButton
        class="base-button"
        @click="openCreate"
      >
        Nova camera
      </VaButton>
    </header>

    <BaseAlert
      v-if="error"
      variant="error"
    >
      {{ error }}
    </BaseAlert>
    <BaseAlert
      v-if="success"
      variant="success"
    >
      {{ success }}
    </BaseAlert>

    <VaCard class="content-panel">
      <VaCardContent class="content-panel__body">
        <BaseTable
          :columns="columns"
          empty-text="Nenhuma camera encontrada."
          :loading="loading"
          :rows="cameras"
        >
          <template #row="{ row }">
            <td>{{ cameraFrom(row).name }}</td>
            <td>{{ cameraFrom(row).type }}</td>
            <td>{{ cameraFrom(row).location?.name ?? '-' }}</td>
            <td>{{ cameraFrom(row).edge_node?.name ?? '-' }}</td>
            <td>{{ cameraFrom(row).host }}:{{ cameraFrom(row).port }}</td>
            <td>{{ cameraFrom(row).is_active ? 'Ativa' : 'Inativa' }}</td>
            <td>
              <div class="row-actions">
                <VaButton
                  class="base-button"
                  color="secondary"
                  type="button"
                  @click="openEdit(cameraFrom(row))"
                >
                  Editar
                </VaButton>
                <VaButton
                  class="base-button"
                  color="danger"
                  type="button"
                  @click="deleteCamera(cameraFrom(row))"
                >
                  Remover
                </VaButton>
              </div>
            </td>
          </template>
        </BaseTable>
      </VaCardContent>
    </VaCard>

    <BaseModal
      :open="modalOpen"
      :title="editingCamera ? 'Editar camera' : 'Nova camera'"
      @close="closeModal"
    >
      <CameraForm
        v-model="form"
        :edge-nodes="edgeNodes"
        :errors="fieldErrors"
        :locations="locations"
        :submitting="submitting"
        @cancel="closeModal"
        @submit="saveCamera"
      />
    </BaseModal>
  </section>
</template>
