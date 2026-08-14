<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import LocationForm from '@/components/forms/LocationForm.vue'
import { ApiError } from '@/services/apiClient'
import { locationsService } from '@/services/locationsService'
import type { FieldErrors } from '@/types/api'
import type { Location, LocationInput } from '@/types/admin'

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'description', label: 'Descricao' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Acoes' },
]

const emptyForm: LocationInput = {
  name: '',
  description: null,
  is_active: true,
}

const locations = ref<Location[]>([])
const loading = ref(true)
const submitting = ref(false)
const modalOpen = ref(false)
const editingLocation = ref<Location | null>(null)
const form = ref<LocationInput>({ ...emptyForm })
const fieldErrors = ref<FieldErrors>({})
const error = ref('')
const success = ref('')

function locationFrom(row: unknown): Location {
  return row as Location
}

async function loadLocations(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = await locationsService.list()
    locations.value = response.data
  } catch {
    error.value = 'Nao foi possivel carregar locais.'
  } finally {
    loading.value = false
  }
}

function openCreate(): void {
  editingLocation.value = null
  form.value = { ...emptyForm }
  fieldErrors.value = {}
  modalOpen.value = true
}

function openEdit(location: Location): void {
  editingLocation.value = location
  form.value = {
    name: location.name,
    description: location.description,
    is_active: location.is_active,
  }
  fieldErrors.value = {}
  modalOpen.value = true
}

function closeModal(): void {
  modalOpen.value = false
}

async function saveLocation(): Promise<void> {
  submitting.value = true
  fieldErrors.value = {}

  try {
    if (editingLocation.value) {
      await locationsService.update(editingLocation.value, form.value)
      success.value = 'Local atualizado.'
    } else {
      await locationsService.create(form.value)
      success.value = 'Local criado.'
    }

    closeModal()
    await loadLocations()
  } catch (apiError) {
    if (apiError instanceof ApiError) {
      fieldErrors.value = apiError.errors
      error.value = apiError.message
    } else {
      error.value = 'Nao foi possivel salvar o local.'
    }
  } finally {
    submitting.value = false
  }
}

async function deleteLocation(location: Location): Promise<void> {
  if (!window.confirm(`Remover local ${location.name}?`)) {
    return
  }

  await locationsService.remove(location)
  success.value = 'Local removido.'
  await loadLocations()
}

onMounted(loadLocations)
</script>

<template>
  <section class="page-section">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          Cadastro
        </p>
        <h1>Locais</h1>
      </div>
      <VaButton
        class="base-button"
        @click="openCreate"
      >
        Novo local
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
          empty-text="Nenhum local encontrado."
          :loading="loading"
          :rows="locations"
        >
          <template #row="{ row }">
            <td>{{ locationFrom(row).name }}</td>
            <td>{{ locationFrom(row).description ?? '-' }}</td>
            <td>{{ locationFrom(row).is_active ? 'Ativo' : 'Inativo' }}</td>
            <td>
              <div class="row-actions">
                <VaButton
                  class="base-button"
                  color="secondary"
                  type="button"
                  @click="openEdit(locationFrom(row))"
                >
                  Editar
                </VaButton>
                <VaButton
                  class="base-button"
                  color="danger"
                  type="button"
                  @click="deleteLocation(locationFrom(row))"
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
      :title="editingLocation ? 'Editar local' : 'Novo local'"
      @close="closeModal"
    >
      <LocationForm
        v-model="form"
        :errors="fieldErrors"
        :submitting="submitting"
        @cancel="closeModal"
        @submit="saveLocation"
      />
    </BaseModal>
  </section>
</template>
