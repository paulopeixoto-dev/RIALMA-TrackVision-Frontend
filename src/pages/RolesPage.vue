<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { rolesService } from '@/services/rolesService'
import type { Role } from '@/types/admin'

const columns = [
  { key: 'name', label: 'Role' },
  { key: 'permissions', label: 'Permissoes' },
]

const roles = ref<Role[]>([])
const loading = ref(true)
const error = ref('')

async function loadRoles(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = await rolesService.list()
    roles.value = response.data
  } catch {
    error.value = 'Nao foi possivel carregar roles.'
  } finally {
    loading.value = false
  }
}

onMounted(loadRoles)
</script>

<template>
  <section class="page-section">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          Seguranca
        </p>
        <h1>Roles</h1>
      </div>
    </header>

    <VaAlert
      v-if="error"
      color="danger"
      role="status"
    >
      {{ error }}
    </VaAlert>

    <VaCard class="content-panel">
      <VaCardContent class="content-panel__body">
        <VaDataTable
          class="base-table"
          :columns="columns"
          hoverable
          :items="roles"
          items-track-by="id"
          :loading="loading"
          no-data-html="Nenhuma role encontrada."
        >
          <template #cell(name)="{ rowData }">
            {{ (rowData as Role).name }}
          </template>
          <template #cell(permissions)="{ rowData }">
            {{ (rowData as Role).permissions?.join(', ') || '-' }}
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </section>
</template>
