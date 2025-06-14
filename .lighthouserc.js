module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      startServerCommand: 'yarn start',
      // Next.js prints "ready - started server on ..." on startup
      startServerReadyPattern: 'started server',
      waitForReadyTimeout: 120000,
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.9 }],
        // Maintain strict accessibility and security checks
        'color-contrast': ['error', { minScore: 0.9 }],
        'csp-xss': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};