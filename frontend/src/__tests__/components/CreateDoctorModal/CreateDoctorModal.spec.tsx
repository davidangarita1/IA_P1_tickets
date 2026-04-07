import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DoctorFormModal from '@/components/DoctorFormModal/DoctorFormModal';
import { mockDoctorService, buildDoctor } from '@/__tests__/mocks/factories';
import type { Shift } from '@/domain/Doctor';

jest.mock('@/hooks/useAvailableShifts', () => ({
  useAvailableShifts: jest.fn(),
}));

import { useAvailableShifts } from '@/hooks/useAvailableShifts';

const mockUseAvailableShifts = useAvailableShifts as jest.MockedFunction<typeof useAvailableShifts>;

function setupShifts(shifts: Shift[] = ['06:00-14:00', '14:00-22:00'], loading = false) {
  mockUseAvailableShifts.mockReturnValue({
    shifts,
    loading,
    fetchShifts: jest.fn(),
  });
}

function renderModal(
  overrides: {
    onClose?: jest.Mock;
    onSuccess?: jest.Mock;
    showToast?: jest.Mock;
  } = {},
) {
  const onClose = overrides.onClose ?? jest.fn();
  const onSuccess = overrides.onSuccess ?? jest.fn();
  const showToast = overrides.showToast ?? jest.fn();
  const service = mockDoctorService();

  render(
    <DoctorFormModal
      onClose={onClose}
      onSuccess={onSuccess}
      doctorService={service}
      showToast={showToast}
    />,
  );

  return { onClose, onSuccess, showToast, service };
}

describe('DoctorFormModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupShifts();
  });

  it('renders the modal title', () => {
    renderModal();

    expect(screen.getByRole('heading', { name: /crear médico/i })).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    renderModal();

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cédula/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/consultorio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/franja horaria/i)).toBeInTheDocument();
  });

  it('renders Cerrar and Guardar buttons', () => {
    renderModal();

    expect(screen.getByRole('button', { name: /cerrar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
  });

  it('Guardar button is disabled when form fields are empty', () => {
    renderModal();

    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled();
  });

  it('shows nombre validation error when nombre is too short and blurred', () => {
    renderModal();

    const nombreInput = screen.getByLabelText(/nombre/i);
    fireEvent.change(nombreInput, { target: { value: 'AB' } });
    fireEvent.blur(nombreInput);

    expect(screen.getByText(/mínimo 3 caracteres/i)).toBeInTheDocument();
  });

  it('shows cedula validation error when cedula is invalid and blurred', () => {
    renderModal();

    const cedulaInput = screen.getByLabelText(/cédula/i);
    fireEvent.change(cedulaInput, { target: { value: '123' } });
    fireEvent.blur(cedulaInput);

    expect(screen.getByText(/7 y 10 dígitos/i)).toBeInTheDocument();
  });

  it('Guardar becomes enabled when nombre and cedula are valid', () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Dr. Juan García' },
    });
    fireEvent.change(screen.getByLabelText(/cédula/i), {
      target: { value: '12345678' },
    });

    expect(screen.getByRole('button', { name: /guardar/i })).not.toBeDisabled();
  });

  it('strips non-numeric characters from cedula input', () => {
    renderModal();

    const cedulaInput = screen.getByLabelText(/cédula/i);
    fireEvent.change(cedulaInput, { target: { value: 'abc12345678' } });

    expect((cedulaInput as HTMLInputElement).value).toBe('12345678');
  });

  it('calls showToast with success and calls onSuccess on successful create', async () => {
    const service = mockDoctorService([buildDoctor()]);
    service.create.mockResolvedValueOnce(buildDoctor());
    const onSuccess = jest.fn();
    const showToast = jest.fn();

    render(
      <DoctorFormModal
        onClose={jest.fn()}
        onSuccess={onSuccess}
        doctorService={service}
        showToast={showToast}
      />,
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Dr. Juan García' },
    });
    fireEvent.change(screen.getByLabelText(/cédula/i), {
      target: { value: '12345678' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Médico creado exitosamente', 'success');
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('calls showToast with error and does NOT call onSuccess on failed create', async () => {
    const service = mockDoctorService();
    service.create.mockRejectedValueOnce(new Error('Cédula ya existe'));
    const onSuccess = jest.fn();
    const showToast = jest.fn();

    render(
      <DoctorFormModal
        onClose={jest.fn()}
        onSuccess={onSuccess}
        doctorService={service}
        showToast={showToast}
      />,
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Dr. Juan García' },
    });
    fireEvent.change(screen.getByLabelText(/cédula/i), {
      target: { value: '12345678' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Cédula ya existe', 'error');
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows generic error message when create throws a non-Error', async () => {
    const service = mockDoctorService();
    service.create.mockRejectedValueOnce('string error');
    const showToast = jest.fn();

    render(
      <DoctorFormModal
        onClose={jest.fn()}
        onSuccess={jest.fn()}
        doctorService={service}
        showToast={showToast}
      />,
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Dr. Juan García' },
    });
    fireEvent.change(screen.getByLabelText(/cédula/i), {
      target: { value: '12345678' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Error al crear médico', 'error');
    });
  });

  it('calls onClose when Cerrar button is clicked', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls fetchShifts when consultorio is selected', () => {
    const fetchShifts = jest.fn();
    mockUseAvailableShifts.mockReturnValue({
      shifts: [],
      loading: false,
      fetchShifts,
    });

    renderModal();

    fireEvent.change(screen.getByLabelText(/consultorio/i), {
      target: { value: '3' },
    });

    expect(fetchShifts).toHaveBeenCalledWith('3');
  });

  it('resets franja horaria when consultorio changes', () => {
    setupShifts(['06:00-14:00', '14:00-22:00']);
    renderModal();

    const franjaSelect = screen.getByLabelText(/franja horaria/i);
    fireEvent.change(franjaSelect, { target: { value: '06:00-14:00' } });
    expect((franjaSelect as HTMLSelectElement).value).toBe('06:00-14:00');

    fireEvent.change(screen.getByLabelText(/consultorio/i), {
      target: { value: '2' },
    });

    expect((franjaSelect as HTMLSelectElement).value).toBe('');
  });

  it('disables franja dropdown when consultorio selected but no shifts available', () => {
    mockUseAvailableShifts.mockReturnValue({
      shifts: [],
      loading: false,
      fetchShifts: jest.fn(),
    });

    renderModal();

    fireEvent.change(screen.getByLabelText(/consultorio/i), {
      target: { value: '1' },
    });

    expect(screen.getByLabelText(/franja horaria/i)).toBeDisabled();
  });

  it('shows no-shifts message when consultorio is selected but no shifts available', () => {
    mockUseAvailableShifts.mockReturnValue({
      shifts: [],
      loading: false,
      fetchShifts: jest.fn(),
    });

    renderModal();

    fireEvent.change(screen.getByLabelText(/consultorio/i), {
      target: { value: '1' },
    });

    expect(screen.getByText(/no hay franjas disponibles/i)).toBeInTheDocument();
  });

  it('disables franja dropdown while shifts are loading', () => {
    setupShifts([], true);
    renderModal();

    expect(screen.getByLabelText(/franja horaria/i)).toBeDisabled();
  });

  it('prevents Escape key default action', () => {
    renderModal();

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    const preventDefaultSpy = jest.spyOn(escapeEvent, 'preventDefault');
    document.dispatchEvent(escapeEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('does not call onClose when the modal backdrop is clicked', () => {
    const { onClose } = renderModal();

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows Guardar button as 'Guardando...' while submitting", async () => {
    let resolveCreate!: (val: ReturnType<typeof buildDoctor>) => void;
    const service = mockDoctorService();
    service.create.mockReturnValueOnce(
      new Promise((res) => {
        resolveCreate = res;
      }),
    );

    render(
      <DoctorFormModal
        onClose={jest.fn()}
        onSuccess={jest.fn()}
        doctorService={service}
        showToast={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Dr. Juan García' },
    });
    fireEvent.change(screen.getByLabelText(/cédula/i), {
      target: { value: '12345678' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(screen.getByRole('button', { name: /guardando/i })).toBeInTheDocument();

    await act(async () => {
      resolveCreate(buildDoctor());
    });
  });

  it('removes Escape event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = render(
      <DoctorFormModal
        onClose={jest.fn()}
        onSuccess={jest.fn()}
        doctorService={mockDoctorService()}
        showToast={jest.fn()}
      />,
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('shows nombre obligatorio error when nombre is touched and empty', () => {
    renderModal();

    const nombreInput = screen.getByLabelText(/nombre/i);
    fireEvent.change(nombreInput, { target: { value: 'A' } });
    fireEvent.change(nombreInput, { target: { value: '' } });
    fireEvent.blur(nombreInput);

    expect(screen.getByText(/nombre completo es obligatorio/i)).toBeInTheDocument();
  });

  it('shows cedula obligatorio error when cedula is touched and empty', () => {
    renderModal();

    const cedulaInput = screen.getByLabelText(/cédula/i);
    fireEvent.change(cedulaInput, { target: { value: '1' } });
    fireEvent.change(cedulaInput, { target: { value: '' } });
    fireEvent.blur(cedulaInput);

    expect(screen.getByText(/cédula es obligatorio/i)).toBeInTheDocument();
  });

  it('shows shift required error when office is set and shifts available but none selected', () => {
    setupShifts(['06:00-14:00', '14:00-22:00']);
    renderModal();

    fireEvent.change(screen.getByLabelText(/consultorio/i), { target: { value: '3' } });

    expect(screen.getByText(/franja horaria es obligatoria/i)).toBeInTheDocument();
  });

  it('disables Guardar when office is set but shift is not selected', () => {
    setupShifts(['06:00-14:00', '14:00-22:00']);
    renderModal();

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Dr Juan' } });
    fireEvent.change(screen.getByLabelText(/cédula/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/consultorio/i), { target: { value: '3' } });

    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled();
  });

  it('does not preventDefault for non-Escape key events', () => {
    renderModal();

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    const preventDefaultSpy = jest.spyOn(enterEvent, 'preventDefault');
    document.dispatchEvent(enterEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('does not fetch shifts when office is cleared back to empty', () => {
    const fetchShifts = jest.fn();
    mockUseAvailableShifts.mockReturnValue({
      shifts: [],
      loading: false,
      fetchShifts,
    });

    renderModal();

    fireEvent.change(screen.getByLabelText(/consultorio/i), { target: { value: '3' } });
    fetchShifts.mockClear();
    fireEvent.change(screen.getByLabelText(/consultorio/i), { target: { value: '' } });

    expect(fetchShifts).not.toHaveBeenCalled();
  });
});
