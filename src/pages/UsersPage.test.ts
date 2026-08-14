import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UserForm from '@/components/forms/UserForm.vue'
import UserPasswordForm from '@/components/forms/UserPasswordForm.vue'
import { rolesService } from '@/services/rolesService'
import { usersService } from '@/services/usersService'
import UsersPage from './UsersPage.vue'

vi.mock('@/services/usersService', () => ({
  usersService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    resetPassword: vi.fn(),
    deactivate: vi.fn(),
  },
}))

vi.mock('@/services/rolesService', () => ({
  rolesService: {
    list: vi.fn(),
  },
}))

const user = {
  id: 1,
  name: 'Paulo',
  email: 'paulo@example.com',
  is_active: true,
  roles: ['super_admin'],
}

describe('UsersPage', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
    vi.mocked(usersService.list).mockResolvedValue({ data: [user] })
    vi.mocked(rolesService.list).mockResolvedValue({
      data: [
        { id: 1, name: 'super_admin', permissions: ['users.manage'] },
        { id: 2, name: 'operator', permissions: [] },
      ],
    })
  })

  it('renders users and loads roles available for assignment', async () => {
    const wrapper = mount(UsersPage, { attachTo: document.body })
    await flushPromises()

    expect(wrapper.text()).toContain('Paulo')
    expect(wrapper.text()).toContain('super_admin')
    expect(wrapper.text()).toContain('Ativo')
    expect(rolesService.list).toHaveBeenCalledOnce()
  })

  it('creates a user through the modal form', async () => {
    vi.mocked(usersService.create).mockResolvedValue({
      ...user,
      id: 2,
      name: 'Ana',
      email: 'ana@example.com',
      roles: ['operator'],
    })

    const wrapper = mount(UsersPage, { attachTo: document.body })
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === 'Novo usuario')?.trigger('click')
    wrapper.findComponent(UserForm).vm.$emit('update:modelValue', {
      name: ' Ana ',
      email: ' ana@example.com ',
      password: 'secret123',
      password_confirmation: 'secret123',
      is_active: true,
      roles: ['operator'],
    })
    wrapper.findComponent(UserForm).vm.$emit('submit')
    await flushPromises()

    expect(usersService.create).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@example.com',
      password: 'secret123',
      password_confirmation: 'secret123',
      is_active: true,
      roles: ['operator'],
    })
    expect(wrapper.text()).toContain('Usuario criado.')
  })

  it('updates, resets password and deactivates an existing user', async () => {
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
    vi.mocked(usersService.update).mockResolvedValue({ ...user, name: 'Paulo Admin' })
    vi.mocked(usersService.resetPassword).mockResolvedValue(user)
    vi.mocked(usersService.deactivate).mockResolvedValue()

    const wrapper = mount(UsersPage, { attachTo: document.body })
    await flushPromises()

    await wrapper.findAll('button').find((button) => button.text() === 'Editar')?.trigger('click')
    wrapper.findComponent(UserForm).vm.$emit('update:modelValue', {
      name: 'Paulo Admin',
      email: 'paulo@example.com',
      is_active: true,
      roles: ['super_admin', 'operator'],
    })
    wrapper.findComponent(UserForm).vm.$emit('submit')
    await flushPromises()

    expect(usersService.update).toHaveBeenCalledWith(user, {
      name: 'Paulo Admin',
      email: 'paulo@example.com',
      is_active: true,
      roles: ['super_admin', 'operator'],
    })

    await wrapper.findAll('button').find((button) => button.text() === 'Senha')?.trigger('click')
    wrapper.findComponent(UserPasswordForm).vm.$emit('update:modelValue', {
      password: 'newsecret123',
      password_confirmation: 'newsecret123',
    })
    wrapper.findComponent(UserPasswordForm).vm.$emit('submit')
    await flushPromises()

    expect(usersService.resetPassword).toHaveBeenCalledWith(user, {
      password: 'newsecret123',
      password_confirmation: 'newsecret123',
    })

    await wrapper.findAll('button').find((button) => button.text() === 'Desativar')?.trigger('click')
    await flushPromises()

    expect(usersService.deactivate).toHaveBeenCalledWith(user)
  })
})
