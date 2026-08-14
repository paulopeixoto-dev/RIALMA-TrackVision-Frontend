<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
          :items="locations"
          items-track-by="id"
          :loading="loading"
          no-data-html="Nenhum local encontrado."
        >
          <template #cell(name)="{ rowData }">
            {{ locationFrom(rowData).name }}
          </template>
          <template #cell(description)="{ rowData }">
            {{ locationFrom(rowData).description ?? '-' }}
          </template>
          <template #cell(is_active)="{ rowData }">
            {{ locationFrom(rowData).is_active ? 'Ativo' : 'Inativo' }}
          </template>
          <template #cell(actions)="{ rowData }">
            <div class="row-actions">
              <VaButton
                class="base-button"
                color="secondary"
                type="button"
                @click="openEdit(locationFrom(rowData))"
              >
                Editar
              </VaButton>
              <VaButton
                class="base-button"
                color="danger"
                type="button"
                @click="deleteLocation(locationFrom(rowData))"
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
          <h2>{{ editingLocation ? 'Editar local' : 'Novo local' }}</h2>
          <VaButton
            aria-label="Fechar"
            icon="close"
            preset="plain"
            @click="closeModal"
          />
        </div>
      </template>

      <div class="base-modal__body">
        <LocationForm
          v-model="form"
          :errors="fieldErrors"
          :submitting="submitting"
          @cancel="closeModal"
          @submit="saveLocation"
        />
      </div>
    </VaModal>
  </section>
</template>
