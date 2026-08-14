<script setup lang="ts">
import { LogOut, Menu } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()
const emit = defineEmits<{
  'toggle-sidebar': []
}>()

async function logout(): Promise<void> {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <VaNavbar
    class="topbar"
    data-test="admin-topbar"
  >
    <template #left>
      <div class="topbar__left">
        <BaseButton
          data-test="sidebar-toggle"
          type="button"
          variant="ghost"
          title="Alternar menu"
          @click="emit('toggle-sidebar')"
        >
          <Menu
            :size="18"
            aria-hidden="true"
          />
        </BaseButton>
        <div>
          <p class="topbar__eyebrow">
            Painel administrativo
          </p>
          <strong>Operacao TrackVision</strong>
        </div>
      </div>
    </template>

    <template #right>
      <div class="topbar__right">
        <div class="topbar__user">
          <span>{{ authStore.user?.name ? authStore.user.name : 'Operador' }}</span>
          <small>{{ authStore.user?.email ? authStore.user.email : 'Sessao ativa' }}</small>
        </div>
        <BaseButton
          data-test="logout-button"
          type="button"
          variant="secondary"
          title="Sair"
          @click="logout"
        >
          <LogOut
            :size="18"
            aria-hidden="true"
          />
          <span>Sair</span>
        </BaseButton>
      </div>
    </template>
  </VaNavbar>
</template>
