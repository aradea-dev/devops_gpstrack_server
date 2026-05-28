const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true, // Biar tes jalan barengan, hemat waktu!
  reporter: 'html',    // Bikin laporan cakep dalam bentuk web
  use: {
    baseURL: 'http://localhost:3000', // SESUAIKAN dengan port GPS kamu
    screenshot: 'only-on-failure',     // Ambil bukti foto cuma kalau error
  },

  projects: [
    /* PROJECT 1: Desktop Testing */
    {
      name: 'Desktop_Chrome',
      use: { ...devices['Desktop Chrome'] },
    },

    /* PROJECT 1: Mobile Testing (Simulasi iPhone) */
    {
      name: 'Mobile_iPhone',
      use: { ...devices['iPhone 14'] },
    },

    /* PROJECT 3: Network Resilience (Simulasi Jaringan Busuk) */
    {
      name: 'Network_Slow_3G',
      use: { 
        ...devices['Desktop Chrome'],
        // Di sini sihirnya: kita paksa browser lemot kayak di pelosok
        offline: false,
        downloadThroughput: 50 * 1024 / 8, // 50kbps
        uploadThroughput: 50 * 1024 / 8,   // 50kbps
        latency: 500,                      // Delay setengah detik
      },
    },
  ],
});
