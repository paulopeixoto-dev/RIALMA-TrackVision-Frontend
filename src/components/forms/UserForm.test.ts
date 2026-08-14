import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { UserFormInput } from '@/types/admin'
import UserForm from './UserForm.vue'

describe('UserForm', () => {
  it('emits user data with selected roles', async () => {
    async function syncModel(): Promise<void> {
      const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as UserFormInput
      await wrapper.setProps({ modelValue: emitted })
    }

    const wrapper = mount(UserForm, {
      props: {
        mode: 'create',
        modelValue: {
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
          is_active: true,
          roles: [],
        },
        roles: [
          { id: 1, name: 'super_admin', permissions: ['users.manage'] },
          { id: 2, name: 'operator', permissions: [] },
        ],
        errors: {},
        submitting: false,
      },
    })

    await wrapper.find('input[name="name"]').setValue('Paulo')
    await syncModel()
    await wrapper.find('input[name="email"]').setValue('paulo@example.com')
    await syncModel()
    await wrapper.find('input[name="password"]').setValue('secret123')
    await syncModel()
    await wrapper.find('input[name="password_confirmation"]').setValue('secret123')
    await syncModel()
    await wrapper.find('input[value="operator"]').setValue(true)

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, unknown>
    expect(emitted).toMatchObject({
      name: 'Paulo',
      email: 'paulo@example.com',
      password: 'secret123',
      password_confirmation: 'secret123',
      is_active: true,
      roles: ['operator'],
    })
  })

  it('does not render password fields when editing a user', () => {
    const wrapper = mount(UserForm, {
      props: {
        mode: 'edit',
        modelValue: {
          name: 'Paulo',
          email: 'paulo@example.com',
          is_active: true,
          roles: ['super_admin'],
        },
        roles: [{ id: 1, name: 'super_admin', permissions: ['users.manage'] }],
        errors: {},
        submitting: false,
      },
    })

    expect(wrapper.find('input[name="password"]').exists()).toBe(false)
    expect(wrapper.find<HTMLInputElement>('input[value="super_admin"]').element.checked).toBe(true)
  })
})
