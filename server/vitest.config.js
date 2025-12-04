import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['**/test/**/*.test.js'],
        setupFiles: ['./test/setup.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            exclude: [
                'node_modules/**',
                'test/**',
                '**/*.config.js',
                'src/server.js',
            ],
            include: ['src/**/*.js'],
        },
        testTimeout: 10000,
    },
});

