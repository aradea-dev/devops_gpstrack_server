const { test, expect } = require('@playwright/test');

test('Verify GPS Coordinates Mutation', async ({ page }) => {
  console.log(`Testing on: ${test.info().project.name}`);

  // 1. Buka dashboard GPS
  await page.goto('/');

  // 2. Ambil data koordinat pertama (sesuaikan selector #id web kamu)
  const initialCoord = await page.textContent('#coordinate-display');
  
  // 3. Tunggu mutasi data (perpindahan)
  await page.waitForTimeout(5000);

  // 4. Cek koordinat setelah 5 detik
  const newCoord = await page.textContent('#coordinate-display');

  // 5. Validasi: Angka harus berubah!
  expect(newCoord).not.toBe(initialCoord);
  console.log(`✅ Success: Coordinate moved from ${initialCoord} to ${newCoord}`);
});
