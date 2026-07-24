import { expect, test } from '@playwright/test';

test('main route namespaces resolve through working shells', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/golden land restaurant/i).first()).toBeVisible();

  await page.goto('/auth/login');
  await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible();

  for (const path of ['/customer', '/admin', '/partner', '/kitchen', '/rider']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/auth\/login/);
  }

  await page.goto('/not-found');
  await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
});


