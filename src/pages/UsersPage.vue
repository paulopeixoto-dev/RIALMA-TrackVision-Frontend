<script setup lang="ts">
import { onMounted, ref } from 'vue'
import UserForm from '@/components/forms/UserForm.vue'
import UserPasswordForm from '@/components/forms/UserPasswordForm.vue'
import { ApiError } from '@/services/apiClient'
import { rolesService } from '@/services/rolesService'
import { usersService } from '@/services/usersService'
import type { FieldErrors } from '@/types/api'
import type { CreateUserInput, Role, UpdateUserInput, UserFormInput, UserPasswordInput } from '@/types/admin'
import type { User } from '@/types/auth'

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'is_active', label: 'Status' },
  { key: 'roles', label: 'Roles' },
  { key: 'actions', label: 'Acoes' },
]

const emptyUserForm: UserFormInput = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  is_active: true,
  roles: [],
}

const emptyPasswordForm: UserPasswordInput = {
  password: '',
  password_confirmation: '',
}

const users = ref<User[]>([])
const roles = ref<Role[]>([])
const loading = ref(true)
const submitting = ref(false)
const userModalOpen = ref(false)
const passwordModalOpen = ref(false)
const editingUser = ref<User | null>(null)
const passwordUser = ref<User | null>(null)
const userForm = ref<UserFormInput>({ ...emptyUserForm })
const passwordForm = ref<UserPasswordInput>({ ...emptyPasswordForm })
const fieldErrors = ref<FieldErrors>({})
const passwordFieldErrors = ref<FieldErrors>({})
const error = ref('')
const success = ref('')

function userFrom(row: unknown): User {
  return row as User
}

function rolesFor(user: User): string {
  return user.roles?.join(', ') || '-'
}

function normalizeUserInput(input: UserFormInput): UpdateUserInput {
  return {
    name: input.name.trim(),
    email: input.email.trim(),
    is_active: input.is_active,
    roles: input.roles,
  }
}

function createInput(input: UserFormInput): CreateUserInput {
  return {
    ...normalizeUserInput(input),
    password: input.password ?? '',
    password_confirmation: input.password_confirmation ?? '',
  }
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

async function loadRoles(): Promise<void> {
  try {
    const response = await rolesService.list()
    roles.value = response.data
  } catch {
    error.value = 'Nao foi possivel carregar roles.'
  }
}

function openCreate(): void {
  editingUser.value = null
  userForm.value = { ...emptyUserForm }
  fieldErrors.value = {}
  userModalOpen.value = true
}

function openEdit(user: User): void {
  editingUser.value = user
  userForm.value = {
    name: user.name,
    email: user.email,
    is_active: user.is_active,
    roles: user.roles ?? [],
  }
  fieldErrors.value = {}
  userModalOpen.value = true
}

function openPassword(user: User): void {
  passwordUser.value = user
  passwordForm.value = { ...emptyPasswordForm }
  passwordFieldErrors.value = {}
  passwordModalOpen.value = true
}

function closeUserModal(): void {
  userModalOpen.value = false
  submitting.value = false
}

function closePasswordModal(): void {
  passwordModalOpen.value = false
  submitting.value = false
}

async function saveUser(): Promise<void> {
  submitting.value = true
  fieldErrors.value = {}
  error.value = ''
  success.value = ''

  try {
    if (editingUser.value) {
      await usersService.update(editingUser.value, normalizeUserInput(userForm.value))
      success.value = 'Usuario atualizado.'
    } else {
      await usersService.create(createInput(userForm.value))
      success.value = 'Usuario criado.'
    }

    closeUserModal()
    await loadUsers()
  } catch (apiError) {
    if (apiError instanceof ApiError) {
      fieldErrors.value = apiError.errors
      error.value = apiError.message
    } else {
      error.value = 'Nao foi possivel salvar o usuario.'
    }
  } finally {
    submitting.value = false
  }
}

async function savePassword(): Promise<void> {
  if (!passwordUser.value) {
    return
  }

  submitting.value = true
  passwordFieldErrors.value = {}
  error.value = ''
  success.value = ''

  try {
    await usersService.resetPassword(passwordUser.value, passwordForm.value)
    success.value = 'Senha redefinida.'
    closePasswordModal()
  } catch (apiError) {
    if (apiError instanceof ApiError) {
      passwordFieldErrors.value = apiError.errors
      error.value = apiError.message
    } else {
      error.value = 'Nao foi possivel redefinir a senha.'
    }
  } finally {
    submitting.value = false
  }
}

async function deactivateUser(user: User): Promise<void> {
  if (!window.confirm(`Desativar usuario ${user.name}?`)) {
    return
  }

  error.value = ''
  success.value = ''

  try {
    await usersService.deactivate(user)
    success.value = 'Usuario desativado.'
    await loadUsers()
  } catch {
    error.value = 'Nao foi possivel desativar o usuario.'
  }
}

onMounted(async () => {
  await Promise.all([loadUsers(), loadRoles()])
})
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
      <VaButton
        class="base-button"
        @click="openCreate"
      >
        Novo usuario
      </VaButton>
    </header>

    <VaAlert
      v-if="error"
      color="danger"
      role="status"
    >
      {{ error }}
    </VaAlert>
    <VaAlert
      v-if="success"
      color="success"
      role="status"
    >
      {{ success }}
    </VaAlert>

    <VaCard class="content-panel">
      <VaCardContent class="content-panel__body">
        <VaDataTable
          class="base-table"
          :columns="columns"
          hoverable
          :items="users"
          items-track-by="id"
          :loading="loading"
          no-data-html="Nenhum usuario encontrado."
        >
          <template #cell(name)="{ rowData }">
            {{ userFrom(rowData).name }}
          </template>
          <template #cell(email)="{ rowData }">
            {{ userFrom(rowData).email }}
          </template>
          <template #cell(is_active)="{ rowData }">
            {{ userFrom(rowData).is_active ? 'Ativo' : 'Inativo' }}
          </template>
          <template #cell(roles)="{ rowData }">
            {{ rolesFor(userFrom(rowData)) }}
          </template>
          <template #cell(actions)="{ rowData }">
            <div class="row-actions">
              <VaButton
                class="base-button"
                color="secondary"
                type="button"
                @click="openEdit(userFrom(rowData))"
              >
                Editar
              </VaButton>
              <VaButton
                class="base-button"
                color="secondary"
                type="button"
                @click="openPassword(userFrom(rowData))"
              >
                Senha
              </VaButton>
              <VaButton
                class="base-button"
                color="danger"
                type="button"
                @click="deactivateUser(userFrom(rowData))"
              >
                Desativar
              </VaButton>
            </div>
          </template>
        </VaDataTable>
      </VaCardContent>
    </VaCard>

    <VaModal
      :model-value="userModalOpen"
      hide-default-actions
      max-width="760px"
      mobile-fullscreen
      @update:model-value="!$event && closeUserModal()"
    >
      <template #header>
        <div class="base-modal__header">
          <h2>{{ editingUser ? 'Editar usuario' : 'Novo usuario' }}</h2>
          <VaButton
            aria-label="Fechar"
            icon="close"
            preset="plain"
            @click="closeUserModal"
          />
        </div>
      </template>

      <div class="base-modal__body">
        <UserForm
          v-model="userForm"
          :errors="fieldErrors"
          :mode="editingUser ? 'edit' : 'create'"
          :roles="roles"
          :submitting="submitting"
          @cancel="closeUserModal"
          @submit="saveUser"
        />
      </div>
    </VaModal>

    <VaModal
      :model-value="passwordModalOpen"
      hide-default-actions
      max-width="760px"
      mobile-fullscreen
      @update:model-value="!$event && closePasswordModal()"
    >
      <template #header>
        <div class="base-modal__header">
          <h2>Redefinir senha</h2>
          <VaButton
            aria-label="Fechar"
            icon="close"
            preset="plain"
            @click="closePasswordModal"
          />
        </div>
      </template>

      <div class="base-modal__body">
        <UserPasswordForm
          v-model="passwordForm"
          :errors="passwordFieldErrors"
          :submitting="submitting"
          @cancel="closePasswordModal"
          @submit="savePassword"
        />
      </div>
    </VaModal>
  </section>
</template>
