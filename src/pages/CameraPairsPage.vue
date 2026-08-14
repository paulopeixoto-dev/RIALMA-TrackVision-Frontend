<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import CameraPairForm from '@/components/forms/CameraPairForm.vue'
import { ApiError } from '@/services/apiClient'
import { cameraPairsService } from '@/services/cameraPairsService'
import { camerasService } from '@/services/camerasService'
import { edgeNodesService } from '@/services/edgeNodesService'
import { locationsService } from '@/services/locationsService'
import type { FieldErrors } from '@/types/api'
import type { Camera, CameraPair, CameraPairInput, EdgeNode, Location } from '@/types/admin'

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'lpr_camera', label: 'Camera LPR' },
  { key: 'support_camera', label: 'Camera de apoio' },
  { key: 'direction', label: 'Direcao' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Acoes' },
]

const emptyForm: CameraPairInput = {
  location_id: 0,
  edge_node_id: 0,
  name: '',
  lpr_camera_id: 0,
  support_camera_id: 0,
  direction: 'unknown',
  is_active: true,
}

const cameraPairs = ref<CameraPair[]>([])
const cameras = ref<Camera[]>([])
const locations = ref<Location[]>([])
const edgeNodes = ref<EdgeNode[]>([])
const loading = ref(true)
const submitting = ref(false)
const modalOpen = ref(false)
const editingPair = ref<CameraPair | null>(null)
const form = ref<CameraPairInput>({ ...emptyForm })
const fieldErrors = ref<FieldErrors>({})
const error = ref('')
const success = ref('')

function pairFrom(row: unknown): CameraPair {
  return row as CameraPair
}

async function loadData(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const [pairsResponse, camerasResponse, locationsResponse, edgeNodesResponse] = await Promise.all([
      cameraPairsService.list(),
      camerasService.list(),
      locationsService.list(),
      edgeNodesService.list(),
    ])
    cameraPairs.value = pairsResponse.data
    cameras.value = camerasResponse.data
    locations.value = locationsResponse.data
    edgeNodes.value = edgeNodesResponse.data
  } catch {
    error.value = 'Nao foi possivel carregar pares de cameras.'
  } finally {
    loading.value = false
  }
}

function openCreate(): void {
  editingPair.value = null
  form.value = {
    ...emptyForm,
    location_id: locations.value[0]?.id ?? 0,
    edge_node_id: edgeNodes.value[0]?.id ?? 0,
  }
  fieldErrors.value = {}
  modalOpen.value = true
}

function openEdit(pair: CameraPair): void {
  editingPair.value = pair
  form.value = {
    location_id: pair.location?.id ?? 0,
    edge_node_id: pair.edge_node?.id ?? 0,
    name: pair.name,
    lpr_camera_id: pair.lpr_camera?.id ?? 0,
    support_camera_id: pair.support_camera?.id ?? 0,
    direction: pair.direction,
    is_active: pair.is_active,
  }
  fieldErrors.value = {}
  modalOpen.value = true
}

function closeModal(): void {
  modalOpen.value = false
}

async function savePair(): Promise<void> {
  submitting.value = true
  fieldErrors.value = {}

  try {
    if (editingPair.value) {
      await cameraPairsService.update(editingPair.value, form.value)
      success.value = 'Par de cameras atualizado.'
    } else {
      await cameraPairsService.create(form.value)
      success.value = 'Par de cameras criado.'
    }

    closeModal()
    await loadData()
  } catch (apiError) {
    if (apiError instanceof ApiError) {
      fieldErrors.value = apiError.errors
      error.value = apiError.message
    } else {
      error.value = 'Nao foi possivel salvar o par de cameras.'
    }
  } finally {
    submitting.value = false
  }
}

async function deletePair(pair: CameraPair): Promise<void> {
  if (!window.confirm(`Remover par ${pair.name}?`)) {
    return
  }

  await cameraPairsService.remove(pair)
  success.value = 'Par de cameras removido.'
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
        <h1>Pares de Cameras</h1>
      </div>
      <VaButton
        class="base-button"
        @click="openCreate"
      >
        Novo par
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
          empty-text="Nenhum par encontrado."
          :loading="loading"
          :rows="cameraPairs"
        >
          <template #row="{ row }">
            <td>{{ pairFrom(row).name }}</td>
            <td>{{ pairFrom(row).lpr_camera?.name ?? '-' }}</td>
            <td>{{ pairFrom(row).support_camera?.name ?? '-' }}</td>
            <td>{{ pairFrom(row).direction }}</td>
            <td>{{ pairFrom(row).is_active ? 'Ativo' : 'Inativo' }}</td>
            <td>
              <div class="row-actions">
                <VaButton
                  class="base-button"
                  color="secondary"
                  type="button"
                  @click="openEdit(pairFrom(row))"
                >
                  Editar
                </VaButton>
                <VaButton
                  class="base-button"
                  color="danger"
                  type="button"
                  @click="deletePair(pairFrom(row))"
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
      :title="editingPair ? 'Editar par' : 'Novo par'"
      @close="closeModal"
    >
      <CameraPairForm
        v-model="form"
        :cameras="cameras"
        :edge-nodes="edgeNodes"
        :errors="fieldErrors"
        :locations="locations"
        :submitting="submitting"
        @cancel="closeModal"
        @submit="savePair"
      />
    </BaseModal>
  </section>
</template>
