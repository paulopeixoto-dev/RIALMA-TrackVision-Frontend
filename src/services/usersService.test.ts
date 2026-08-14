import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usersService } from './usersService'

describe('usersService', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('creates, updates, resets password and deactivates admin users', async () => {
    localStorage.setItem('trackvision.token', 'token')

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ data: { id: 1, name: 'Paulo' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { id: 1, name: 'Paulo Admin' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { id: 1, name: 'Paulo Admin' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
      })

    vi.stubGlobal('fetch', fetchMock)

    await expect(usersService.create({
      name: 'Paulo',
      email: 'paulo@example.com',
      password: 'secret123',
      password_confirmation: 'secret123',
      is_active: true,
      roles: ['super_admin'],
    })).resolves.toMatchObject({ id: 1, name: 'Paulo' })

    await expect(usersService.update(
      { id: 1, name: 'Paulo', email: 'paulo@example.com', is_active: true, roles: ['super_admin'] },
      {
        name: 'Paulo Admin',
        email: 'paulo@example.com',
        is_active: true,
        roles: ['super_admin'],
      },
    )).resolves.toMatchObject({ id: 1, name: 'Paulo Admin' })

    await usersService.resetPassword(
      { id: 1, name: 'Paulo Admin', email: 'paulo@example.com', is_active: true, roles: ['super_admin'] },
      { password: 'newsecret123', password_confirmation: 'newsecret123' },
    )
    await usersService.deactivate({
      id: 1,
      name: 'Paulo Admin',
      email: 'paulo@example.com',
      is_active: true,
      roles: ['super_admin'],
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8000/api/v1/admin/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Paulo',
          email: 'paulo@example.com',
          password: 'secret123',
          password_confirmation: 'secret123',
          is_active: true,
          roles: ['super_admin'],
        }),
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8000/api/v1/admin/users/1',
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://localhost:8000/api/v1/admin/users/1/password',
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      'http://localhost:8000/api/v1/admin/users/1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
