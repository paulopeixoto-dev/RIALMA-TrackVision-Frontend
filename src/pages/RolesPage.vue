<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseTable from '@/components/base/BaseTable.vue'
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

    <BaseAlert
      v-if="error"
      variant="error"
    >
      {{ error }}
    </BaseAlert>

    <BaseTable
      :columns="columns"
      empty-text="Nenhuma role encontrada."
      :loading="loading"
      :rows="roles"
    >
      <template #row="{ row }">
        <td>{{ (row as Role).name }}</td>
        <td>{{ (row as Role).permissions?.join(', ') || '-' }}</td>
      </template>
    </BaseTable>
  </section>
</template>
