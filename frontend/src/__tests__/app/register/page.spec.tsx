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

  it('[HU-01] redirects /register to /solicitar-turno permanently', async () => {
    const { default: RegisterPage } = await import('@/app/register/page');
    try {
      RegisterPage();
    } catch {
    }
    expect(mockRedirect).toHaveBeenCalledWith('/solicitar-turno');
  });

  it('[HU-01][Validate] /register route does not render form content directly', async () => {
    const { default: RegisterPage } = await import('@/app/register/page');
    try {
      RegisterPage();
    } catch {
    }
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });
});

