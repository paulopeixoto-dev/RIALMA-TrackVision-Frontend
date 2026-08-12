import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import UsersPage from './UsersPage.vue'

vi.mock('@/services/usersService', () => ({
  usersService: {
    list: vi.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Paulo', email: 'paulo@example.com', roles: ['super_admin'] }],
    }),
  },
}))

describe('UsersPage', () => {
  it('renders users returned by the API', async () => {
    const wrapper = mount(UsersPage)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('Paulo')
    expect(wrapper.text()).toContain('super_admin')
  })
})
