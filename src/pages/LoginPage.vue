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
const passwordVisible = ref(false)
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
  <main
    class="auth-template"
    data-test="auth-template"
  >
    <section
      class="auth-template__brand"
      data-test="auth-brand-panel"
    >
      <RouterLink
        class="auth-template__brand-mark"
        :to="{ name: 'login' }"
      >
        <span>RIALMA</span>
        <strong>TrackVision</strong>
      </RouterLink>

      <div class="auth-template__copy">
        <p class="page-eyebrow">
          Controle operacional
        </p>
        <h1>Monitoramento de acessos e viagens</h1>
        <p>
          Gestao segura para veiculos, cameras, viagens e relatorios operacionais.
        </p>
      </div>

      <div class="auth-template__status">
        <span>Servidor local</span>
        <strong>Pronto para operacao offline</strong>
      </div>
    </section>

    <section class="auth-template__content">
      <VaCard class="auth-card">
        <VaCardContent class="auth-card__content">
          <VaForm
            class="auth-form"
            data-test="login-form"
            aria-labelledby="login-title"
            @submit.prevent="submitLogin"
          >
            <p class="page-eyebrow">
              Acesso administrativo
            </p>
            <h2 id="login-title">
              RIALMA TrackVision
            </h2>
            <p class="muted">
              Entre com seu usuario autorizado.
            </p>

            <VaAlert
              v-if="formError"
              color="danger"
              role="status"
            >
              {{ formError }}
            </VaAlert>

            <VaInput
              class="base-field"
              :error="Boolean(fieldErrors.email?.[0])"
              :error-messages="fieldErrors.email?.[0] ?? ''"
              autocomplete="email"
              label="Email"
              :model-value="email"
              name="email"
              type="email"
              @update:model-value="email = $event"
            />
            <div class="password-field">
              <VaInput
                class="base-field"
                :error="Boolean(fieldErrors.password?.[0])"
                :error-messages="fieldErrors.password?.[0] ?? ''"
                autocomplete="current-password"
                label="Senha"
                :model-value="password"
                name="password"
                :type="passwordVisible ? 'text' : 'password'"
                @update:model-value="password = $event"
              />
              <VaButton
                class="password-field__toggle"
                data-test="password-visibility"
                preset="plain"
                type="button"
                :aria-label="passwordVisible ? 'Ocultar senha' : 'Mostrar senha'"
                @click="passwordVisible = !passwordVisible"
              >
                {{ passwordVisible ? 'Ocultar' : 'Mostrar' }}
              </VaButton>
            </div>

            <VaButton
              class="auth-form__submit"
              :loading="isSubmitting"
              type="submit"
            >
              {{ isSubmitting ? 'Entrando...' : 'Entrar' }}
            </VaButton>
          </VaForm>
        </VaCardContent>
      </VaCard>
    </section>
  </main>
</template>
