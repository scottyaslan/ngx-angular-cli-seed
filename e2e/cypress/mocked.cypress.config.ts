import { defineConfig } from 'cypress';

export default defineConfig({
    env: {
        config: 'mocked',
        url: 'http://localhost:1537/'
    },
    viewportWidth: 1366,
    viewportHeight: 768,
    chromeWebSecurity: false,
    e2e: {
        baseUrl: 'http://localhost:1537/#',
        specPattern: 'cypress/integration/mocked/**/*.spec.ts',
    },
});
