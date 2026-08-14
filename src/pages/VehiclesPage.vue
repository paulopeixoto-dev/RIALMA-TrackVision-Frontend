<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseTable from '@/components/base/BaseTable.vue'
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
      <BaseButton @click="openCreate">
        Novo veiculo
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
          empty-text="Nenhum veiculo encontrado."
          :loading="loading"
          :rows="vehicles"
        >
          <template #row="{ row }">
            <td>{{ vehicleFrom(row).plate }}</td>
            <td>{{ vehicleFrom(row).plate_normalized }}</td>
            <td>{{ vehicleFrom(row).fleet_code ?? '-' }}</td>
            <td>{{ vehicleFrom(row).is_active ? 'Ativo' : 'Inativo' }}</td>
            <td>
              <div class="row-actions">
                <BaseButton
                  type="button"
                  variant="secondary"
                  @click="openEdit(vehicleFrom(row))"
                >
                  Editar
                </BaseButton>
                <BaseButton
                  type="button"
                  variant="danger"
                  @click="deleteVehicle(vehicleFrom(row))"
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
      :title="editingVehicle ? 'Editar veiculo' : 'Novo veiculo'"
      @close="closeModal"
    >
      <VehicleForm
        v-model="form"
        :errors="fieldErrors"
        :submitting="submitting"
        @cancel="closeModal"
        @submit="saveVehicle"
      />
    </BaseModal>
  </section>
</template>
