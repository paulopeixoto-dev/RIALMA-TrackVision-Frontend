<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseTable from '@/components/base/BaseTable.vue'
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

    <BaseAlert
      v-if="error"
      variant="error"
    >
      {{ error }}
    </BaseAlert>

    <VaCard class="content-panel">
      <VaCardContent class="content-panel__body">
        <BaseTable
          :columns="columns"
          empty-text="Nenhuma permissao encontrada."
          :loading="loading"
          :rows="permissions"
        >
          <template #row="{ row }">
            <td>{{ (row as Permission).name }}</td>
          </template>
        </BaseTable>
      </VaCardContent>
    </VaCard>
  </section>
</template>
