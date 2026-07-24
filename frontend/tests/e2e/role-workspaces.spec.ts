import { expect, test } from '@playwright/test';

const roles = [
  { button: 'Platform Admin', url: /\/admin$/, text: /platform performance|latest products/i },
  { button: 'Restaurant Owner', url: /\/(partner|restaurant)$/, text: /owner dashboard|restaurant profile/i },
  { button: 'Kitchen Staff', url: /\/kitchen$/, text: /kitchen queue/i },
  { button: 'Delivery Rider', url: /\/rider$/, text: /current delivery stack|delivery rider/i },
  { button: 'Customer', url: /\/customer\/dashboard$/, text: /your account overview/i },
];

async function loginAs(page: import('@playwright/test').Page, roleButton: string) {
  await page.goto('/auth/login');
  await page.getByRole('button', { name: roleButton }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
}

test.describe('role workspaces', () => {
  for (const role of roles) {
    test(role.button + ' can sign in and open the correct workspace', async ({ page }) => {
      await loginAs(page, role.button);
      await expect(page).toHaveURL(role.url);
      await expect(page.getByText(role.text).first()).toBeVisible();
    });
  }

  test('kitchen and rider operational pages are reachable after login', async ({ page }) => {
    await loginAs(page, 'Kitchen Staff');
    await expect(page).toHaveURL(/\/kitchen$/);
    await expect(page.getByRole('heading', { name: /kitchen queue/i })).toBeVisible();

    await page.evaluate(() => localStorage.clear());
    await loginAs(page, 'Delivery Rider');
    await page.goto('/rider/deliveries');
    await expect(page.getByRole('heading', { name: /update trip progress/i })).toBeVisible();
  });
});
