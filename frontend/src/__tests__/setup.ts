jest.mock('@/config/env', () => ({
  env: {
    API_BASE_URL: 'http://localhost:3000',
    WS_URL: 'http://localhost:3000',
  },
}));

import '@testing-library/jest-dom';
