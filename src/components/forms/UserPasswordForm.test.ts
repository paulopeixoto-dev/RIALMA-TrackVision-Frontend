import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createVuesticTestPlugin } from '@/test/vuestic'
import type { UserPasswordInput } from '@/types/admin'
import UserPasswordForm from './UserPasswordForm.vue'

describe('UserPasswordForm', () => {
  it('emits the new password payload', async () => {
    async function syncModel(): Promise<void> {
      const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as UserPasswordInput
      await wrapper.setProps({ modelValue: emitted })
    }

    const wrapper = mount(UserPasswordForm, {
      props: {
        modelValue: {
          password: '',
          password_confirmation: '',
        },
        errors: {},
        submitting: false,
      },
      global: { plugins: [createVuesticTestPlugin()] },
    })

    await wrapper.find('input[name="password"]').setValue('newsecret123')
    await syncModel()
    await wrapper.find('input[name="password_confirmation"]').setValue('newsecret123')

    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as Record<string, string>
    expect(emitted).toEqual({
      password: 'newsecret123',
      password_confirmation: 'newsecret123',
    })
  })
})
