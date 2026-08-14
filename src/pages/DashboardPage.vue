<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const modules = computed(() => [
  {
    label: 'Usuarios',
    route: 'users',
    permission: 'users.manage',
    description: 'Controle de acesso administrativo',
  },
  {
    label: 'Veiculos',
    route: 'vehicles',
    permission: 'vehicles.manage',
    description: 'Cadastro de caminhoes monitorados',
  },
  {
    label: 'Locais e cameras',
    route: 'locations',
    permission: 'cameras.manage',
    description: 'Topologia de portarias e equipamentos',
  },
].filter((module) => authStore.can(module.permission)))
</script>

<template>
  <section class="page-section">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          Operacao
        </p>
        <h1>Dashboard</h1>
      </div>
    </header>

    <VaCard class="content-panel">
      <VaCardContent class="content-panel__body">
        <p class="muted">
          Acesse os cadastros administrativos permitidos para sua sessao.
        </p>
        <div
          class="module-grid"
          data-test="dashboard-module-grid"
        >
          <RouterLink
            v-for="module in modules"
            :key="module.route"
            class="module-card"
            :to="{ name: module.route }"
          >
            <span>{{ module.label }}</span>
            <small>{{ module.description }}</small>
          </RouterLink>
        </div>
      </VaCardContent>
    </VaCard>
  </section>
</template>
