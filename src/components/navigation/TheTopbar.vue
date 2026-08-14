<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

async function logout(): Promise<void> {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <header class="topbar">
    <div>
      <p class="topbar__eyebrow">
        Painel administrativo
      </p>
      <strong>{{ authStore.user?.name ?? 'Operador' }}</strong>
    </div>
    <BaseButton
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
  </header>
</template>
