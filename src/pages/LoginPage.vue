<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
      <p>Controle operacional</p>
      <h1 id="login-title">
        RIALMA TrackVision
      </h1>
      <p>Acesso administrativo</p>

      <p
        v-if="formError"
        class="form-error"
        role="alert"
      >
        {{ formError }}
      </p>

      <label class="field">
        <span>Email</span>
        <input
          v-model="email"
          autocomplete="email"
          name="email"
          type="email"
        >
      </label>
      <p
        v-if="fieldErrors.email"
        class="field-error"
      >
        {{ fieldErrors.email[0] }}
      </p>

      <label class="field">
        <span>Senha</span>
        <input
          v-model="password"
          autocomplete="current-password"
          name="password"
          type="password"
        >
      </label>
      <p
        v-if="fieldErrors.password"
        class="field-error"
      >
        {{ fieldErrors.password[0] }}
      </p>

      <button
        :disabled="isSubmitting"
        type="submit"
      >
        {{ isSubmitting ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </main>
</template>
