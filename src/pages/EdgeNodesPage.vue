<script setup lang="ts">
import { onMounted, ref } from 'vue'
import EdgeNodeForm from '@/components/forms/EdgeNodeForm.vue'
import { ApiError } from '@/services/apiClient'
import { edgeNodesService } from '@/services/edgeNodesService'
import { locationsService } from '@/services/locationsService'
import type { FieldErrors } from '@/types/api'
import type { EdgeNode, EdgeNodeInput, Location } from '@/types/admin'

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'location', label: 'Local' },
  { key: 'status', label: 'Status' },
  { key: 'last_seen_at', label: 'Ultimo heartbeat' },
  { key: 'is_active', label: 'Ativo' },
  { key: 'actions', label: 'Acoes' },
]

const emptyForm: EdgeNodeInput = {
  location_id: 0,
  name: '',
  description: null,
  is_active: true,
}

const edgeNodes = ref<EdgeNode[]>([])
const locations = ref<Location[]>([])
const loading = ref(true)
const submitting = ref(false)
const modalOpen = ref(false)
const editingEdgeNode = ref<EdgeNode | null>(null)
const form = ref<EdgeNodeInput>({ ...emptyForm })
const fieldErrors = ref<FieldErrors>({})
const error = ref('')
const success = ref('')

function edgeNodeFrom(row: unknown): EdgeNode {
  return row as EdgeNode
}

async function loadData(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const [nodesResponse, locationsResponse] = await Promise.all([
      edgeNodesService.list(),
      locationsService.list(),
    ])
    edgeNodes.value = nodesResponse.data
    locations.value = locationsResponse.data
  } catch {
    error.value = 'Nao foi possivel carregar edge nodes.'
  } finally {
    loading.value = false
  }
}

function openCreate(): void {
  editingEdgeNode.value = null
  form.value = { ...emptyForm, location_id: locations.value[0]?.id ?? 0 }
  fieldErrors.value = {}
  modalOpen.value = true
}

function openEdit(edgeNode: EdgeNode): void {
  editingEdgeNode.value = edgeNode
  form.value = {
    location_id: edgeNode.location?.id ?? 0,
    name: edgeNode.name,
    description: edgeNode.description,
    is_active: edgeNode.is_active,
  }
  fieldErrors.value = {}
  modalOpen.value = true
}

function closeModal(): void {
  modalOpen.value = false
}

async function saveEdgeNode(): Promise<void> {
  submitting.value = true
  fieldErrors.value = {}

  try {
    if (editingEdgeNode.value) {
      await edgeNodesService.update(editingEdgeNode.value, form.value)
      success.value = 'Edge node atualizado.'
    } else {
      await edgeNodesService.create(form.value)
      success.value = 'Edge node criado.'
    }

    closeModal()
    await loadData()
  } catch (apiError) {
    if (apiError instanceof ApiError) {
      fieldErrors.value = apiError.errors
      error.value = apiError.message
    } else {
      error.value = 'Nao foi possivel salvar o edge node.'
    }
  } finally {
    submitting.value = false
  }
}

async function deleteEdgeNode(edgeNode: EdgeNode): Promise<void> {
  if (!window.confirm(`Remover edge node ${edgeNode.name}?`)) {
    return
  }

  await edgeNodesService.remove(edgeNode)
  success.value = 'Edge node removido.'
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
        <h1>Edge Nodes</h1>
      </div>
      <VaButton
        class="base-button"
        @click="openCreate"
      >
        Novo edge node
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
          :items="edgeNodes"
          items-track-by="id"
          :loading="loading"
          no-data-html="Nenhum edge node encontrado."
        >
          <template #cell(name)="{ rowData }">
            {{ edgeNodeFrom(rowData).name }}
          </template>
          <template #cell(location)="{ rowData }">
            {{ edgeNodeFrom(rowData).location?.name ?? '-' }}
          </template>
          <template #cell(status)="{ rowData }">
            {{ edgeNodeFrom(rowData).status }}
          </template>
          <template #cell(last_seen_at)="{ rowData }">
            {{ edgeNodeFrom(rowData).last_seen_at ?? '-' }}
          </template>
          <template #cell(is_active)="{ rowData }">
            {{ edgeNodeFrom(rowData).is_active ? 'Ativo' : 'Inativo' }}
          </template>
          <template #cell(actions)="{ rowData }">
            <div class="row-actions">
              <VaButton
                class="base-button"
                color="secondary"
                type="button"
                @click="openEdit(edgeNodeFrom(rowData))"
              >
                Editar
              </VaButton>
              <VaButton
                class="base-button"
                color="danger"
                type="button"
                @click="deleteEdgeNode(edgeNodeFrom(rowData))"
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
          <h2>{{ editingEdgeNode ? 'Editar edge node' : 'Novo edge node' }}</h2>
          <VaButton
            aria-label="Fechar"
            icon="close"
            preset="plain"
            @click="closeModal"
          />
        </div>
      </template>

      <div class="base-modal__body">
        <EdgeNodeForm
          v-model="form"
          :errors="fieldErrors"
          :locations="locations"
          :submitting="submitting"
          @cancel="closeModal"
          @submit="saveEdgeNode"
        />
      </div>
    </VaModal>
  </section>
</template>
