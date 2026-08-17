<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CameraRecordingSourceForm from '@/components/forms/CameraRecordingSourceForm.vue'
import RecordingDeviceForm from '@/components/forms/RecordingDeviceForm.vue'
import { ApiError } from '@/services/apiClient'
import { cameraRecordingSourcesService } from '@/services/cameraRecordingSourcesService'
import { camerasService } from '@/services/camerasService'
import { edgeNodesService } from '@/services/edgeNodesService'
import { locationsService } from '@/services/locationsService'
import { recordingDevicesService } from '@/services/recordingDevicesService'
import type { FieldErrors } from '@/types/api'
import type { Camera, CameraRecordingSource, CameraRecordingSourceInput, EdgeNode, Location, RecordingDevice, RecordingDeviceInput } from '@/types/admin'

const deviceColumns = [
  { key: 'name', label: 'Nome' },
  { key: 'location', label: 'Local' },
  { key: 'edge_node', label: 'Edge node' },
  { key: 'host', label: 'Host' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Acoes' },
]

const sourceColumns = [
  { key: 'camera', label: 'Camera de apoio' },
  { key: 'recording_device', label: 'Gravador/NVR' },
  { key: 'channel', label: 'Canal' },
  { key: 'stream', label: 'Stream' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Acoes' },
]

const emptyDeviceForm: RecordingDeviceInput = {
  location_id: 0,
  edge_node_id: 0,
  name: '',
  vendor: 'intelbras',
  protocol: 'http',
  host: '',
  port: 80,
  username: null,
  password: '',
  auth_type: 'digest',
  is_active: true,
}

const emptySourceForm: CameraRecordingSourceInput = {
  camera_id: 0,
  recording_device_id: 0,
  channel: 1,
  stream: 'main',
  target_offset_seconds: 2,
  search_window_seconds: 5,
  is_active: true,
}

const devices = ref<RecordingDevice[]>([])
const selectableRecordingDevices = ref<RecordingDevice[]>([])
const sources = ref<CameraRecordingSource[]>([])
const cameras = ref<Camera[]>([])
const locations = ref<Location[]>([])
const edgeNodes = ref<EdgeNode[]>([])
const selectedLocationId = ref<number | null>(null)
const loading = ref(true)
const devicesCurrentPage = ref(1)
const devicesLastPage = ref(1)
const sourcesCurrentPage = ref(1)
const sourcesLastPage = ref(1)
const submittingDevice = ref(false)
const submittingSource = ref(false)
const deviceModalOpen = ref(false)
const sourceModalOpen = ref(false)
const editingDevice = ref<RecordingDevice | null>(null)
const editingSource = ref<CameraRecordingSource | null>(null)
const pendingRemovalSource = ref<CameraRecordingSource | null>(null)
const deviceForm = ref<RecordingDeviceInput>({ ...emptyDeviceForm })
const sourceForm = ref<CameraRecordingSourceInput>({ ...emptySourceForm })
const deviceErrors = ref<FieldErrors>({})
const sourceErrors = ref<FieldErrors>({})
const error = ref('')
const success = ref('')

const locationOptions = computed(() => [
  { label: 'Todos os locais', value: null },
  ...locations.value.map((location) => ({ label: location.name, value: location.id })),
])
const filteredDevices = computed(() => selectedLocationId.value === null
  ? devices.value
  : devices.value.filter((device) => device.location?.id === selectedLocationId.value))

function deviceFrom(row: unknown): RecordingDevice {
  return row as RecordingDevice
}

function sourceFrom(row: unknown): CameraRecordingSource {
  return row as CameraRecordingSource
}

function paginationValue(meta: Record<string, unknown> | undefined, key: string, fallback: number): number {
  const value = meta?.[key]
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback
}

function applyDevicesResponse(response: Awaited<ReturnType<typeof recordingDevicesService.list>>, fallbackPage: number): void {
  devices.value = response.data
  devicesCurrentPage.value = paginationValue(response.meta, 'current_page', fallbackPage)
  devicesLastPage.value = paginationValue(response.meta, 'last_page', 1)
}

function applySourcesResponse(response: Awaited<ReturnType<typeof cameraRecordingSourcesService.list>>, fallbackPage: number): void {
  sources.value = response.data
  sourcesCurrentPage.value = paginationValue(response.meta, 'current_page', fallbackPage)
  sourcesLastPage.value = paginationValue(response.meta, 'last_page', 1)
}

async function loadData(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const [devicesResponse, sourcesResponse, camerasResponse, locationsResponse, edgeNodesResponse] = await Promise.all([
      recordingDevicesService.list(devicesCurrentPage.value),
      cameraRecordingSourcesService.list(sourcesCurrentPage.value),
      camerasService.list(),
      locationsService.list(),
      edgeNodesService.list(),
    ])
    const devicesLastPageFromResponse = paginationValue(devicesResponse.meta, 'last_page', 1)
    const sourcesLastPageFromResponse = paginationValue(sourcesResponse.meta, 'last_page', 1)

    if (devicesCurrentPage.value > devicesLastPageFromResponse) {
      await loadDevices(devicesLastPageFromResponse)
    } else {
      applyDevicesResponse(devicesResponse, devicesCurrentPage.value)
    }

    if (sourcesCurrentPage.value > sourcesLastPageFromResponse) {
      await loadSources(sourcesLastPageFromResponse)
    } else {
      applySourcesResponse(sourcesResponse, sourcesCurrentPage.value)
    }
    cameras.value = camerasResponse.data
    locations.value = locationsResponse.data
    edgeNodes.value = edgeNodesResponse.data
  } catch {
    error.value = 'Nao foi possivel carregar gravadores e mapeamentos.'
  } finally {
    loading.value = false
  }
}

async function loadDevices(page: number): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = await recordingDevicesService.list(page)
    const lastPage = paginationValue(response.meta, 'last_page', 1)
    if (page > lastPage) {
      await loadDevices(lastPage)
      return
    }

    applyDevicesResponse(response, page)
  } catch {
    error.value = 'Nao foi possivel carregar gravadores/NVRs.'
  } finally {
    loading.value = false
  }
}

async function loadSources(page: number): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = await cameraRecordingSourcesService.list(page)
    const lastPage = paginationValue(response.meta, 'last_page', 1)
    if (page > lastPage) {
      await loadSources(lastPage)
      return
    }

    applySourcesResponse(response, page)
  } catch {
    error.value = 'Nao foi possivel carregar mapeamentos.'
  } finally {
    loading.value = false
  }
}

function previousDevicesPage(): void {
  if (devicesCurrentPage.value > 1) {
    void loadDevices(devicesCurrentPage.value - 1)
  }
}

function nextDevicesPage(): void {
  if (devicesCurrentPage.value < devicesLastPage.value) {
    void loadDevices(devicesCurrentPage.value + 1)
  }
}

function previousSourcesPage(): void {
  if (sourcesCurrentPage.value > 1) {
    void loadSources(sourcesCurrentPage.value - 1)
  }
}

function nextSourcesPage(): void {
  if (sourcesCurrentPage.value < sourcesLastPage.value) {
    void loadSources(sourcesCurrentPage.value + 1)
  }
}

async function loadSelectableRecordingDevices(): Promise<void> {
  const firstPage = await recordingDevicesService.list(1)
  const lastPage = paginationValue(firstPage.meta, 'last_page', 1)
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(lastPage - 1, 0) }, (_, index) => recordingDevicesService.list(index + 2)),
  )
  const devicesById = new Map<number, RecordingDevice>()

  ;[firstPage, ...remainingPages].flatMap((page) => page.data).forEach((device) => devicesById.set(device.id, device))
  selectableRecordingDevices.value = [...devicesById.values()]
}

function openCreateDevice(): void {
  editingDevice.value = null
  deviceForm.value = {
    ...emptyDeviceForm,
    location_id: locations.value[0]?.id ?? 0,
    edge_node_id: edgeNodes.value[0]?.id ?? 0,
  }
  deviceErrors.value = {}
  deviceModalOpen.value = true
}

function openEditDevice(device: RecordingDevice): void {
  editingDevice.value = device
  deviceForm.value = {
    location_id: device.location?.id ?? 0,
    edge_node_id: device.edge_node?.id ?? 0,
    name: device.name,
    vendor: device.vendor,
    protocol: device.protocol,
    host: device.host,
    port: device.port,
    username: device.username,
    password: '',
    auth_type: device.auth_type,
    is_active: device.is_active,
  }
  deviceErrors.value = {}
  deviceModalOpen.value = true
}

function closeDeviceModal(): void {
  deviceModalOpen.value = false
}

async function saveDevice(input: RecordingDeviceInput): Promise<void> {
  submittingDevice.value = true
  deviceErrors.value = {}

  try {
    if (editingDevice.value) {
      await recordingDevicesService.update(editingDevice.value, input)
      success.value = 'Gravador/NVR atualizado.'
    } else {
      await recordingDevicesService.create(input)
      success.value = 'Gravador/NVR criado.'
    }
    closeDeviceModal()
    await loadData()
  } catch (apiError) {
    if (apiError instanceof ApiError) {
      deviceErrors.value = apiError.errors
      error.value = apiError.message
    } else {
      error.value = 'Nao foi possivel salvar o gravador/NVR.'
    }
  } finally {
    submittingDevice.value = false
  }
}

async function deactivateDevice(device: RecordingDevice): Promise<void> {
  const input: RecordingDeviceInput = {
    location_id: device.location?.id ?? 0,
    edge_node_id: device.edge_node?.id ?? 0,
    name: device.name,
    vendor: device.vendor,
    protocol: device.protocol,
    host: device.host,
    port: device.port,
    username: device.username,
    auth_type: device.auth_type,
    is_active: !device.is_active,
  }

  try {
    await recordingDevicesService.update(device, input)
    success.value = input.is_active ? 'Gravador/NVR ativado.' : 'Gravador/NVR desativado.'
    await loadData()
  } catch {
    error.value = 'Nao foi possivel atualizar o status do gravador/NVR.'
  }
}

async function openCreateSource(): Promise<void> {
  editingSource.value = null
  sourceForm.value = {
    ...emptySourceForm,
    camera_id: cameras.value.find((camera) => camera.type === 'support' && camera.is_active)?.id ?? 0,
    recording_device_id: 0,
  }
  sourceErrors.value = {}

  try {
    await loadSelectableRecordingDevices()
    sourceForm.value = {
      ...sourceForm.value,
      recording_device_id: selectableRecordingDevices.value.find((device) => device.is_active)?.id ?? 0,
    }
    sourceModalOpen.value = true
  } catch {
    error.value = 'Nao foi possivel carregar gravadores/NVRs para o mapeamento.'
  }
}

async function openEditSource(source: CameraRecordingSource): Promise<void> {
  editingSource.value = source
  sourceForm.value = {
    camera_id: source.camera?.id ?? 0,
    recording_device_id: source.recording_device?.id ?? 0,
    channel: source.channel,
    stream: source.stream,
    target_offset_seconds: source.target_offset_seconds,
    search_window_seconds: source.search_window_seconds,
    is_active: source.is_active,
  }
  sourceErrors.value = {}

  try {
    await loadSelectableRecordingDevices()
    sourceModalOpen.value = true
  } catch {
    error.value = 'Nao foi possivel carregar gravadores/NVRs para o mapeamento.'
  }
}

function closeSourceModal(): void {
  sourceModalOpen.value = false
}

async function saveSource(): Promise<void> {
  submittingSource.value = true
  sourceErrors.value = {}

  try {
    if (editingSource.value) {
      await cameraRecordingSourcesService.update(editingSource.value, sourceForm.value)
      success.value = 'Mapeamento atualizado.'
    } else {
      await cameraRecordingSourcesService.create(sourceForm.value)
      success.value = 'Mapeamento criado.'
    }
    closeSourceModal()
    await loadData()
  } catch (apiError) {
    if (apiError instanceof ApiError) {
      sourceErrors.value = apiError.errors
      error.value = apiError.message
    } else {
      error.value = 'Nao foi possivel salvar o mapeamento.'
    }
  } finally {
    submittingSource.value = false
  }
}

function openRemoveSource(source: CameraRecordingSource): void {
  pendingRemovalSource.value = source
}

function closeRemoveSourceModal(): void {
  pendingRemovalSource.value = null
}

async function removeSource(): Promise<void> {
  const source = pendingRemovalSource.value
  if (!source) return

  try {
    await cameraRecordingSourcesService.remove(source)
    success.value = 'Mapeamento removido.'
    closeRemoveSourceModal()
    await loadData()
  } catch {
    error.value = 'Nao foi possivel remover o mapeamento.'
  }
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
        <h1>Gravadores/NVRs</h1>
      </div>
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
      <VaCardContent class="content-panel__body recording-devices__toolbar">
        <VaSelect
          v-model="selectedLocationId"
          class="base-field recording-devices__filter"
          label="Local"
          :options="locationOptions"
          text-by="label"
          track-by="value"
          value-by="value"
        />
        <div class="row-actions">
          <VaButton
            class="base-button"
            data-test="create-recording-device"
            @click="openCreateDevice"
          >
            Novo gravador/NVR
          </VaButton>
          <VaButton
            class="base-button"
            color="secondary"
            data-test="create-recording-source"
            @click="openCreateSource"
          >
            Novo mapeamento
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard class="content-panel">
      <VaCardContent class="content-panel__body">
        <VaDataTable
          class="base-table"
          :columns="deviceColumns"
          hoverable
          :items="filteredDevices"
          items-track-by="id"
          :loading="loading"
          no-data-html="Nenhum gravador/NVR encontrado."
        >
          <template #cell(name)="{ rowData }">
            {{ deviceFrom(rowData).name }}
          </template>
          <template #cell(location)="{ rowData }">
            {{ deviceFrom(rowData).location?.name ?? '-' }}
          </template>
          <template #cell(edge_node)="{ rowData }">
            {{ deviceFrom(rowData).edge_node?.name ?? '-' }}
          </template>
          <template #cell(host)="{ rowData }">
            {{ deviceFrom(rowData).protocol }}://{{ deviceFrom(rowData).host }}:{{ deviceFrom(rowData).port }}
          </template>
          <template #cell(is_active)="{ rowData }">
            {{ deviceFrom(rowData).is_active ? 'Ativo' : 'Inativo' }}
          </template>
          <template #cell(actions)="{ rowData }">
            <div class="row-actions">
              <VaButton
                class="base-button"
                color="secondary"
                type="button"
                @click="openEditDevice(deviceFrom(rowData))"
              >
                Editar
              </VaButton>
              <VaButton
                class="base-button"
                :color="deviceFrom(rowData).is_active ? 'danger' : 'success'"
                type="button"
                @click="deactivateDevice(deviceFrom(rowData))"
              >
                {{ deviceFrom(rowData).is_active ? 'Desativar' : 'Ativar' }}
              </VaButton>
            </div>
          </template>
        </VaDataTable>
        <div
          v-if="devicesLastPage > 1"
          class="pagination-row"
        >
          <VaButton
            class="base-button"
            color="secondary"
            data-test="devices-previous-page"
            type="button"
            :disabled="loading || devicesCurrentPage === 1"
            @click="previousDevicesPage"
          >
            Anterior
          </VaButton>
          <span class="muted">Pagina {{ devicesCurrentPage }} de {{ devicesLastPage }}</span>
          <VaButton
            class="base-button"
            color="secondary"
            data-test="devices-next-page"
            type="button"
            :disabled="loading || devicesCurrentPage === devicesLastPage"
            @click="nextDevicesPage"
          >
            Proxima
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaCard class="content-panel">
      <VaCardContent class="content-panel__body">
        <VaDataTable
          class="base-table"
          :columns="sourceColumns"
          hoverable
          :items="sources"
          items-track-by="id"
          :loading="loading"
          no-data-html="Nenhum mapeamento encontrado."
        >
          <template #cell(camera)="{ rowData }">
            {{ sourceFrom(rowData).camera?.name ?? '-' }}
          </template>
          <template #cell(recording_device)="{ rowData }">
            {{ sourceFrom(rowData).recording_device?.name ?? '-' }}
          </template>
          <template #cell(channel)="{ rowData }">
            {{ sourceFrom(rowData).channel }}
          </template>
          <template #cell(stream)="{ rowData }">
            {{ sourceFrom(rowData).stream }}
          </template>
          <template #cell(is_active)="{ rowData }">
            {{ sourceFrom(rowData).is_active ? 'Ativo' : 'Inativo' }}
          </template>
          <template #cell(actions)="{ rowData }">
            <div class="row-actions">
              <VaButton
                class="base-button"
                color="secondary"
                type="button"
                @click="openEditSource(sourceFrom(rowData))"
              >
                Editar
              </VaButton>
              <VaButton
                class="base-button"
                color="danger"
                type="button"
                data-test="remove-recording-source"
                @click="openRemoveSource(sourceFrom(rowData))"
              >
                Remover
              </VaButton>
            </div>
          </template>
        </VaDataTable>
        <div
          v-if="sourcesLastPage > 1"
          class="pagination-row"
        >
          <VaButton
            class="base-button"
            color="secondary"
            data-test="sources-previous-page"
            type="button"
            :disabled="loading || sourcesCurrentPage === 1"
            @click="previousSourcesPage"
          >
            Anterior
          </VaButton>
          <span class="muted">Pagina {{ sourcesCurrentPage }} de {{ sourcesLastPage }}</span>
          <VaButton
            class="base-button"
            color="secondary"
            data-test="sources-next-page"
            type="button"
            :disabled="loading || sourcesCurrentPage === sourcesLastPage"
            @click="nextSourcesPage"
          >
            Proxima
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaModal
      :model-value="deviceModalOpen"
      hide-default-actions
      max-width="760px"
      mobile-fullscreen
      @update:model-value="!$event && closeDeviceModal()"
    >
      <template #header>
        <div class="base-modal__header">
          <h2>{{ editingDevice ? 'Editar gravador/NVR' : 'Novo gravador/NVR' }}</h2>
          <VaButton
            aria-label="Fechar"
            icon="close"
            preset="plain"
            @click="closeDeviceModal"
          />
        </div>
      </template>
      <div class="base-modal__body">
        <RecordingDeviceForm
          v-model="deviceForm"
          :edge-nodes="edgeNodes"
          :errors="deviceErrors"
          :is-editing="Boolean(editingDevice)"
          :locations="locations"
          :submitting="submittingDevice"
          @cancel="closeDeviceModal"
          @submit="saveDevice"
        />
      </div>
    </VaModal>

    <VaModal
      :model-value="sourceModalOpen"
      hide-default-actions
      max-width="760px"
      mobile-fullscreen
      @update:model-value="!$event && closeSourceModal()"
    >
      <template #header>
        <div class="base-modal__header">
          <h2>{{ editingSource ? 'Editar mapeamento' : 'Novo mapeamento' }}</h2>
          <VaButton
            aria-label="Fechar"
            icon="close"
            preset="plain"
            @click="closeSourceModal"
          />
        </div>
      </template>
      <div class="base-modal__body">
        <CameraRecordingSourceForm
          v-model="sourceForm"
          :cameras="cameras"
          :errors="sourceErrors"
          :recording-devices="selectableRecordingDevices"
          :submitting="submittingSource"
          @cancel="closeSourceModal"
          @submit="saveSource"
        />
      </div>
    </VaModal>

    <VaModal
      :model-value="Boolean(pendingRemovalSource)"
      hide-default-actions
      max-width="480px"
      @update:model-value="!$event && closeRemoveSourceModal()"
    >
      <template #header>
        <div class="base-modal__header">
          <h2>Remover mapeamento</h2>
          <VaButton
            aria-label="Fechar"
            icon="close"
            preset="plain"
            @click="closeRemoveSourceModal"
          />
        </div>
      </template>
      <div class="base-modal__body">
        <p>Remover o mapeamento da camera {{ pendingRemovalSource?.camera?.name ?? '' }}?</p>
        <div class="form-actions">
          <VaButton
            class="base-button"
            color="danger"
            data-test="confirm-remove-recording-source"
            @click="removeSource"
          >
            Remover
          </VaButton>
          <VaButton
            class="base-button"
            preset="plain"
            @click="closeRemoveSourceModal"
          >
            Cancelar
          </VaButton>
        </div>
      </div>
    </VaModal>
  </section>
</template>

<style scoped>
.recording-devices__toolbar {
  align-items: end;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.recording-devices__filter {
  max-width: 18rem;
  width: 100%;
}

@media (max-width: 640px) {
  .recording-devices__toolbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
