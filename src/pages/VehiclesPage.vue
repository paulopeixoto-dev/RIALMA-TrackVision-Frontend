<script setup lang="ts">
import { onMounted, ref } from 'vue'
import VehicleForm from '@/components/forms/VehicleForm.vue'
import { ApiError } from '@/services/apiClient'
import { vehiclesService } from '@/services/vehiclesService'
import type { FieldErrors } from '@/types/api'
import type { Vehicle, VehicleInput } from '@/types/admin'

const columns = [
  { key: 'plate', label: 'Placa' },
  { key: 'plate_normalized', label: 'Placa normalizada' },
  { key: 'fleet_code', label: 'Frota' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Acoes' },
]

const emptyForm: VehicleInput = {
  plate: '',
  fleet_code: null,
  description: null,
  is_active: true,
}

const vehicles = ref<Vehicle[]>([])
const loading = ref(true)
const submitting = ref(false)
const modalOpen = ref(false)
const editingVehicle = ref<Vehicle | null>(null)
const form = ref<VehicleInput>({ ...emptyForm })
const fieldErrors = ref<FieldErrors>({})
const error = ref('')
const success = ref('')

function vehicleFrom(row: unknown): Vehicle {
  return row as Vehicle
}

function normalizeInput(input: VehicleInput): VehicleInput {
  return {
    plate: input.plate.trim(),
    fleet_code: input.fleet_code?.trim() || null,
    description: input.description?.trim() || null,
    is_active: input.is_active,
  }
}

async function loadVehicles(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = await vehiclesService.list()
    vehicles.value = response.data
  } catch {
    error.value = 'Nao foi possivel carregar veiculos.'
  } finally {
    loading.value = false
  }
}

function openCreate(): void {
  editingVehicle.value = null
  form.value = { ...emptyForm }
  fieldErrors.value = {}
  modalOpen.value = true
}

function openEdit(vehicle: Vehicle): void {
  editingVehicle.value = vehicle
  form.value = {
    plate: vehicle.plate,
    fleet_code: vehicle.fleet_code,
    description: vehicle.description,
    is_active: vehicle.is_active,
  }
  fieldErrors.value = {}
  modalOpen.value = true
}

function closeModal(): void {
  modalOpen.value = false
  submitting.value = false
}

async function saveVehicle(): Promise<void> {
  submitting.value = true
  fieldErrors.value = {}
  success.value = ''

  try {
    if (editingVehicle.value) {
      await vehiclesService.update(editingVehicle.value, normalizeInput(form.value))
      success.value = 'Veiculo atualizado.'
    } else {
      await vehiclesService.create(normalizeInput(form.value))
      success.value = 'Veiculo criado.'
    }

    closeModal()
    await loadVehicles()
  } catch (apiError) {
    if (apiError instanceof ApiError) {
      fieldErrors.value = apiError.errors
      error.value = apiError.message
    } else {
      error.value = 'Nao foi possivel salvar o veiculo.'
    }
  } finally {
    submitting.value = false
  }
}

async function deleteVehicle(vehicle: Vehicle): Promise<void> {
  if (!window.confirm(`Remover veiculo ${vehicle.plate}?`)) {
    return
  }

  await vehiclesService.remove(vehicle)
  success.value = 'Veiculo removido.'
  await loadVehicles()
}

onMounted(loadVehicles)
</script>

<template>
  <section class="page-section">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          Cadastro
        </p>
        <h1>Veiculos</h1>
      </div>
      <VaButton
        class="base-button"
        @click="openCreate"
      >
        Novo veiculo
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
          :items="vehicles"
          items-track-by="id"
          :loading="loading"
          no-data-html="Nenhum veiculo encontrado."
        >
          <template #cell(plate)="{ rowData }">
            {{ vehicleFrom(rowData).plate }}
          </template>
          <template #cell(plate_normalized)="{ rowData }">
            {{ vehicleFrom(rowData).plate_normalized }}
          </template>
          <template #cell(fleet_code)="{ rowData }">
            {{ vehicleFrom(rowData).fleet_code ?? '-' }}
          </template>
          <template #cell(is_active)="{ rowData }">
            {{ vehicleFrom(rowData).is_active ? 'Ativo' : 'Inativo' }}
          </template>
          <template #cell(actions)="{ rowData }">
            <div class="row-actions">
              <VaButton
                class="base-button"
                color="secondary"
                type="button"
                @click="openEdit(vehicleFrom(rowData))"
              >
                Editar
              </VaButton>
              <VaButton
                class="base-button"
                color="danger"
                type="button"
                @click="deleteVehicle(vehicleFrom(rowData))"
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
          <h2>{{ editingVehicle ? 'Editar veiculo' : 'Novo veiculo' }}</h2>
          <VaButton
            aria-label="Fechar"
            icon="close"
            preset="plain"
            @click="closeModal"
          />
        </div>
      </template>

      <div class="base-modal__body">
        <VehicleForm
          v-model="form"
          :errors="fieldErrors"
          :submitting="submitting"
          @cancel="closeModal"
          @submit="saveVehicle"
        />
      </div>
    </VaModal>
  </section>
</template>
