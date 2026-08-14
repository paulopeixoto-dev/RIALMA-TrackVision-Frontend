<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { permissionsService } from '@/services/permissionsService'
import type { Permission } from '@/types/admin'

const columns = [
  { key: 'name', label: 'Permissao' },
]

const permissions = ref<Permission[]>([])
const loading = ref(true)
const error = ref('')

async function loadPermissions(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = await permissionsService.list()
    permissions.value = response.data
  } catch {
    error.value = 'Nao foi possivel carregar permissoes.'
  } finally {
    loading.value = false
  }
}

onMounted(loadPermissions)
</script>

<template>
  <section class="page-section">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          Seguranca
        </p>
        <h1>Permissoes</h1>
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
          :items="permissions"
          items-track-by="id"
          :loading="loading"
          no-data-html="Nenhuma permissao encontrada."
        >
          <template #cell(name)="{ rowData }">
            {{ (rowData as Permission).name }}
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>
  </section>
</template>
