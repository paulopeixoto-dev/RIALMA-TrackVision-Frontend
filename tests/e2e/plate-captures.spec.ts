import { expect, test } from '@playwright/test'

test('validates plate captures with LPR image evidence', async ({ page }) => {
  const email = process.env.E2E_ADMIN_EMAIL
  const password = process.env.E2E_ADMIN_PASSWORD

  if (!email || !password) {
    test.skip(true, 'E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required.')
    return
  }

  await page.goto('/login?redirect=/trips')
  await page.waitForTimeout(1000)

  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.waitForTimeout(500)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.waitForTimeout(500)

  const tripsResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/v1/admin/trips') && response.request().method() === 'GET',
  )

  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page).toHaveURL(/\/trips/)
  await expect(page.getByRole('heading', { name: 'Viagens' })).toBeVisible()
  const tripsResponse = await tripsResponsePromise
  const tripsPayload = await tripsResponse.json()
  console.info('plate-captures-api', {
    status: tripsResponse.status(),
    count: Array.isArray(tripsPayload.data) ? tripsPayload.data.length : null,
    firstPlate: tripsPayload.data?.[0]?.vehicle?.plate ?? null,
  })
  await page.waitForTimeout(1200)

  await expect(page.getByText('Nenhuma viagem encontrada.')).toHaveCount(0)

  const reviewButton = page.getByRole('button', { name: 'Revisar' }).first()
  await expect(reviewButton).toBeVisible()
  await page.waitForTimeout(1000)
  await reviewButton.click()

  await expect(page.getByText('LPR', { exact: true }).last()).toBeVisible()
  const lprImage = page.locator('img[alt="Imagem LPR da viagem"]').first()
  await expect(lprImage).toBeVisible()
  await expect
    .poll(async () => lprImage.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))
    .toBe(true)

  await page.waitForTimeout(3000)
})
