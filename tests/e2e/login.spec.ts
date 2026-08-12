import { expect, test } from '@playwright/test'

test('shows login screen', async ({ page }) => {
  await page.goto('/login')

  await expect(page.getByRole('heading', { name: 'RIALMA TrackVision' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Senha')).toBeVisible()
})
