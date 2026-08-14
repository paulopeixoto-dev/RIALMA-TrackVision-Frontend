<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseTable from '@/components/base/BaseTable.vue'
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
      <BaseButton @click="openCreate">
        Novo edge node
      </BaseButton>
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
          empty-text="Nenhum edge node encontrado."
          :loading="loading"
          :rows="edgeNodes"
        >
          <template #row="{ row }">
            <td>{{ edgeNodeFrom(row).name }}</td>
            <td>{{ edgeNodeFrom(row).location?.name ?? '-' }}</td>
            <td>{{ edgeNodeFrom(row).status }}</td>
            <td>{{ edgeNodeFrom(row).last_seen_at ?? '-' }}</td>
            <td>{{ edgeNodeFrom(row).is_active ? 'Ativo' : 'Inativo' }}</td>
            <td>
              <div class="row-actions">
                <BaseButton
                  type="button"
                  variant="secondary"
                  @click="openEdit(edgeNodeFrom(row))"
                >
                  Editar
                </BaseButton>
                <BaseButton
                  type="button"
                  variant="danger"
                  @click="deleteEdgeNode(edgeNodeFrom(row))"
                >
                  Remover
                </BaseButton>
              </div>
            </td>
          </template>
        </BaseTable>
      </VaCardContent>
    </VaCard>

    <BaseModal
      :open="modalOpen"
      :title="editingEdgeNode ? 'Editar edge node' : 'Novo edge node'"
      @close="closeModal"
    >
      <EdgeNodeForm
        v-model="form"
        :errors="fieldErrors"
        :locations="locations"
        :submitting="submitting"
        @cancel="closeModal"
        @submit="saveEdgeNode"
      />
    </BaseModal>
  </section>
</template>
