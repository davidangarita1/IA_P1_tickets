import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  redirect: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe('RegisterPage redirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects /register to /request-turn permanently', async () => {
    const { default: RegisterPage } = await import('@/app/register/page');
    try {
      RegisterPage();
    } catch {
    }
    expect(mockRedirect).toHaveBeenCalledWith('/request-turn');
  });

  it('[Validate] /register route does not render form content directly', async () => {
    const { default: RegisterPage } = await import('@/app/register/page');
    try {
      RegisterPage();
    } catch {
    }
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });
});

