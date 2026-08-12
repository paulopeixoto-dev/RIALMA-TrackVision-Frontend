<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

const modules = computed(() => [
  { label: 'Usuarios', route: 'users', permission: 'users.manage' },
  { label: 'Veiculos', route: 'vehicles', permission: 'vehicles.manage' },
  { label: 'Locais e cameras', route: 'locations', permission: 'cameras.manage' },
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

    <div class="content-panel">
      <p class="muted">
        Acesse os cadastros administrativos permitidos para sua sessao.
      </p>
      <div class="module-grid">
        <RouterLink
          v-for="module in modules"
          :key="module.route"
          class="module-link"
          :to="{ name: module.route }"
        >
          {{ module.label }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>
