<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import { usersService } from '@/services/usersService'
import type { User } from '@/types/auth'

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'roles', label: 'Roles' },
]

const users = ref<User[]>([])
const loading = ref(true)
const error = ref('')

function rolesFor(user: User): string {
  return user.roles?.join(', ') || '-'
}

async function loadUsers(): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = await usersService.list()
    users.value = response.data
  } catch {
    error.value = 'Nao foi possivel carregar usuarios.'
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <section class="page-section">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          Seguranca
        </p>
        <h1>Usuarios</h1>
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
      empty-text="Nenhum usuario encontrado."
      :loading="loading"
      :rows="users"
    >
      <template #row="{ row }">
        <td>{{ (row as User).name }}</td>
        <td>{{ (row as User).email }}</td>
        <td>{{ rolesFor(row as User) }}</td>
      </template>
    </BaseTable>
  </section>
</template>
