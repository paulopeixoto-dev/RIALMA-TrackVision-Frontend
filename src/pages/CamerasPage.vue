<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
      locationsService.listAll(),
      edgeNodesService.listAll(),
    ])
    cameras.value = camerasResponse.data
    locations.value = locationsResponse
    edgeNodes.value = edgeNodesResponse
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

    <VaAlert
      v-if="error"
      color="danger"
      role="status"
    >
      {{ error }}
    </VaAlert>
    <VaAlert
      v-if="success"
      color="success"
      role="status"
    >
      {{ success }}
    </VaAlert>

    <VaCard class="content-panel">
      <VaCardContent class="content-panel__body">
        <VaDataTable
          class="base-table"
          :columns="columns"
          hoverable
          :items="cameras"
          items-track-by="id"
          :loading="loading"
          no-data-html="Nenhuma camera encontrada."
        >
          <template #cell(name)="{ rowData }">
            {{ cameraFrom(rowData).name }}
          </template>
          <template #cell(type)="{ rowData }">
            {{ cameraFrom(rowData).type }}
          </template>
          <template #cell(location)="{ rowData }">
            {{ cameraFrom(rowData).location?.name ?? '-' }}
          </template>
          <template #cell(edge_node)="{ rowData }">
            {{ cameraFrom(rowData).edge_node?.name ?? '-' }}
          </template>
          <template #cell(host)="{ rowData }">
            {{ cameraFrom(rowData).host }}:{{ cameraFrom(rowData).port }}
          </template>
          <template #cell(is_active)="{ rowData }">
            {{ cameraFrom(rowData).is_active ? 'Ativa' : 'Inativa' }}
          </template>
          <template #cell(actions)="{ rowData }">
            <div class="row-actions">
              <VaButton
                class="base-button"
                color="secondary"
                type="button"
                @click="openEdit(cameraFrom(rowData))"
              >
                Editar
              </VaButton>
              <VaButton
                class="base-button"
                color="danger"
                type="button"
                @click="deleteCamera(cameraFrom(rowData))"
              >
                Remover
              </VaButton>
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <VaModal
      :model-value="modalOpen"
      hide-default-actions
      max-width="760px"
      mobile-fullscreen
      @update:model-value="!$event && closeModal()"
    >
      <template #header>
        <div class="base-modal__header">
          <h2>{{ editingCamera ? 'Editar camera' : 'Nova camera' }}</h2>
          <VaButton
            aria-label="Fechar"
            icon="close"
            preset="plain"
            @click="closeModal"
          />
        </div>
      </template>

      <div class="base-modal__body">
        <CameraForm
          v-model="form"
          :edge-nodes="edgeNodes"
          :errors="fieldErrors"
          :locations="locations"
          :submitting="submitting"
          @cancel="closeModal"
          @submit="saveCamera"
        />
      </div>
    </VaModal>
  </section>
</template>
