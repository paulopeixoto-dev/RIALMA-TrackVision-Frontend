<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { ApiError } from '@/services/apiClient'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const formError = ref('')
const fieldErrors = ref<Record<string, string[]>>({})

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' ? redirect : '/dashboard'
})

async function submitLogin(): Promise<void> {
  formError.value = ''
  fieldErrors.value = {}
  isSubmitting.value = true

  try {
    await authStore.login({ email: email.value, password: password.value })
    await router.push(redirectPath.value)
  } catch (error) {
    if (error instanceof ApiError) {
      fieldErrors.value = error.errors
      formError.value = error.isUnauthorized ? 'Credenciais invalidas.' : error.message
      return
    }

    formError.value = 'Nao foi possivel acessar o sistema.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="login-shell">
    <form
      class="login-panel"
      aria-labelledby="login-title"
      @submit.prevent="submitLogin"
    >
      <VaCard>
        <VaCardContent class="login-panel__content">
          <p class="page-eyebrow">
            Controle operacional
          </p>
          <h1 id="login-title">
            RIALMA TrackVision
          </h1>
          <p class="muted">
            Acesso administrativo
          </p>

          <BaseAlert
            v-if="formError"
            variant="error"
          >
            {{ formError }}
          </BaseAlert>

          <BaseInput
            :error="fieldErrors.email"
            autocomplete="email"
            label="Email"
            :model-value="email"
            name="email"
            type="email"
            @update:model-value="email = $event"
          />
          <BaseInput
            :error="fieldErrors.password"
            autocomplete="current-password"
            label="Senha"
            :model-value="password"
            name="password"
            type="password"
            @update:model-value="password = $event"
          />

          <BaseButton
            :loading="isSubmitting"
            type="submit"
          >
            {{ isSubmitting ? 'Entrando...' : 'Entrar' }}
          </BaseButton>
        </VaCardContent>
      </VaCard>
    </form>
  </main>
</template>
