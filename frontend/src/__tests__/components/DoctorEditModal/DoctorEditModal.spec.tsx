import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DoctorEditModal from '@/components/DoctorEditModal/DoctorEditModal';
import { mockDoctorService, buildDoctor } from '@/__tests__/mocks/factories';
import type { Shift, Doctor } from '@/domain/Doctor';

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
  doctor: Doctor = buildDoctor(),
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
    <DoctorEditModal
      doctor={doctor}
      onClose={onClose}
      onSuccess={onSuccess}
      doctorService={service}
      showToast={showToast}
    />,
  );

  return { onClose, onSuccess, showToast, service };
}

describe('DoctorEditModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupShifts();
  });

  it('renders the modal title as Editar Medico', () => {
    renderModal();

    expect(screen.getByRole('heading', { name: /editar médico/i })).toBeInTheDocument();
  });

  it('pre-fills form fields with doctor data', () => {
    const doctor = buildDoctor({
      name: 'Juan García',
      documentId: '12345678',
      office: '2',
      shift: '06:00-14:00',
    });
    renderModal(doctor);

    expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe('Juan García');
    expect((screen.getByLabelText(/cédula/i) as HTMLInputElement).value).toBe('12345678');
    expect((screen.getByLabelText(/consultorio/i) as HTMLSelectElement).value).toBe('2');
  });

  it('renders Cerrar, Guardar buttons and X icon', () => {
    renderModal();

    expect(screen.getByRole('button', { name: /^cerrar$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/cerrar modal/i)).toBeInTheDocument();
  });

  it('calls onClose when Cerrar button is clicked', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: /^cerrar$/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when X icon is clicked', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByLabelText(/cerrar modal/i));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking outside the modal', () => {
    const { onClose } = renderModal();

    const backdrop = screen.getByTestId('edit-modal-backdrop');
    fireEvent.click(backdrop);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close when pressing Escape', () => {
    const { onClose } = renderModal();

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    const spy = jest.spyOn(escapeEvent, 'preventDefault');
    document.dispatchEvent(escapeEvent);

    expect(spy).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables Guardar when name is less than 3 characters', () => {
    renderModal();

    const nombreInput = screen.getByLabelText(/nombre/i);
    fireEvent.change(nombreInput, { target: { value: 'AB' } });
    fireEvent.blur(nombreInput);

    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled();
  });

  it('shows validation error when name is emptied', () => {
    renderModal();

    const nombreInput = screen.getByLabelText(/nombre/i);
    fireEvent.change(nombreInput, { target: { value: '' } });
    fireEvent.blur(nombreInput);

    expect(screen.getByText(/nombre completo es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled();
  });

  it('shows validation error when cedula is emptied', () => {
    renderModal();

    const cedulaInput = screen.getByLabelText(/cédula/i);
    fireEvent.change(cedulaInput, { target: { value: '' } });
    fireEvent.blur(cedulaInput);

    expect(screen.getByText(/cédula es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled();
  });

  it('calls doctorService.update on submit with changed fields', async () => {
    const doctor = buildDoctor({
      _id: 'doc-1',
      name: 'Juan García',
      documentId: '12345678',
      office: '2',
      shift: '06:00-14:00',
    });
    const service = mockDoctorService([doctor]);
    service.update.mockResolvedValueOnce(buildDoctor({ name: 'Pedro López' }));
    const onSuccess = jest.fn();
    const showToast = jest.fn();

    render(
      <DoctorEditModal
        doctor={doctor}
        onClose={jest.fn()}
        onSuccess={onSuccess}
        doctorService={service}
        showToast={showToast}
      />,
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Pedro López' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(service.update).toHaveBeenCalledWith(
        'doc-1',
        expect.objectContaining({ name: 'Pedro López' }),
      );
      expect(showToast).toHaveBeenCalledWith('Médico guardado exitosamente', 'success');
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error toast on failed update', async () => {
    const doctor = buildDoctor();
    const service = mockDoctorService([doctor]);
    service.update.mockRejectedValueOnce(
      new Error('La franja horaria del consultorio ya está ocupada'),
    );
    const showToast = jest.fn();

    render(
      <DoctorEditModal
        doctor={doctor}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
        doctorService={service}
        showToast={showToast}
      />,
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Nuevo Nombre' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        'La franja horaria del consultorio ya está ocupada',
        'error',
      );
    });
  });

  it('fetches available shifts including current doctor shift on office change', () => {
    const doctor = buildDoctor({ _id: 'doc-1', office: '2', shift: '06:00-14:00' });
    const fetchShifts = jest.fn();
    mockUseAvailableShifts.mockReturnValue({
      shifts: ['14:00-22:00'],
      loading: false,
      fetchShifts,
    });

    renderModal(doctor);

    fireEvent.change(screen.getByLabelText(/consultorio/i), { target: { value: '3' } });

    expect(fetchShifts).toHaveBeenCalledWith('3', 'doc-1');
  });

  it('shows Guardando... while submitting', async () => {
    const doctor = buildDoctor();
    let resolveUpdate!: (val: Doctor) => void;
    const service = mockDoctorService([doctor]);
    service.update.mockReturnValueOnce(
      new Promise((res) => {
        resolveUpdate = res;
      }),
    );

    render(
      <DoctorEditModal
        doctor={doctor}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
        doctorService={service}
        showToast={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Nuevo Nombre' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(screen.getByRole('button', { name: /guardando/i })).toBeInTheDocument();

    await act(async () => {
      resolveUpdate(buildDoctor({ name: 'Nuevo Nombre' }));
    });
  });

  it('strips non-numeric characters from cedula input', () => {
    renderModal();

    const cedulaInput = screen.getByLabelText(/cédula/i);
    fireEvent.change(cedulaInput, { target: { value: 'abc99999999' } });

    expect((cedulaInput as HTMLInputElement).value).toBe('99999999');
  });

  it('removes Escape event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = render(
      <DoctorEditModal
        doctor={buildDoctor()}
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

  it('loads available shifts on mount when doctor has office', () => {
    const doctor = buildDoctor({ _id: 'doc-1', office: '2' });
    const fetchShifts = jest.fn();
    mockUseAvailableShifts.mockReturnValue({
      shifts: ['06:00-14:00', '14:00-22:00'],
      loading: false,
      fetchShifts,
    });

    renderModal(doctor);

    expect(fetchShifts).toHaveBeenCalledWith('2', 'doc-1');
  });

  it('does not preventDefault for non-Escape key events', () => {
    renderModal();

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    const preventDefaultSpy = jest.spyOn(enterEvent, 'preventDefault');
    document.dispatchEvent(enterEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('shows cedula length error when value is too short', () => {
    renderModal();

    const cedulaInput = screen.getByLabelText(/cédula/i);
    fireEvent.change(cedulaInput, { target: { value: '123' } });
    fireEvent.blur(cedulaInput);

    expect(screen.getByText(/7 y 10 dígitos/i)).toBeInTheDocument();
  });

  it('disables shift select when no office is selected', () => {
    const doctor = buildDoctor({ office: null, shift: null });
    renderModal(doctor);

    expect(screen.getByLabelText(/franja horaria/i)).toBeDisabled();
  });

  it('shows shift required error when office is set but no shift selected', () => {
    setupShifts(['06:00-14:00', '14:00-22:00']);
    const doctor = buildDoctor({ office: null, shift: null });
    renderModal(doctor);

    fireEvent.change(screen.getByLabelText(/consultorio/i), { target: { value: '3' } });

    expect(screen.getByText(/franja horaria es obligatoria/i)).toBeInTheDocument();
  });

  it('shows no shifts available message when office has no free shifts', () => {
    setupShifts([]);
    const doctor = buildDoctor({ office: null, shift: null });
    renderModal(doctor);

    fireEvent.change(screen.getByLabelText(/consultorio/i), { target: { value: '3' } });

    expect(screen.getByText(/no hay franjas disponibles/i)).toBeInTheDocument();
  });

  it('disables Guardar when office is set but shift is not', () => {
    setupShifts(['06:00-14:00', '14:00-22:00']);
    renderModal();

    fireEvent.change(screen.getByLabelText(/consultorio/i), { target: { value: '3' } });

    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled();
  });

  it('shows generic error when update throws a non-Error', async () => {
    const doctor = buildDoctor();
    const service = mockDoctorService([doctor]);
    service.update.mockRejectedValueOnce('string error');
    const showToast = jest.fn();

    render(
      <DoctorEditModal
        doctor={doctor}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
        doctorService={service}
        showToast={showToast}
      />,
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Nuevo Nombre' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Error al actualizar médico', 'error');
    });
  });

  it('does not fetch shifts when office is cleared', () => {
    const doctor = buildDoctor({ office: '2' });
    const fetchShifts = jest.fn();
    mockUseAvailableShifts.mockReturnValue({
      shifts: ['06:00-14:00'],
      loading: false,
      fetchShifts,
    });

    renderModal(doctor);
    fetchShifts.mockClear();

    fireEvent.change(screen.getByLabelText(/consultorio/i), { target: { value: '' } });

    expect(fetchShifts).not.toHaveBeenCalled();
  });

  it('updates shift select value when a shift is chosen', () => {
    setupShifts(['06:00-14:00', '14:00-22:00']);
    const doctor = buildDoctor({ office: '2', shift: null });
    renderModal(doctor);

    const franjaSelect = screen.getByLabelText(/franja horaria/i) as HTMLSelectElement;
    fireEvent.change(franjaSelect, { target: { value: '14:00-22:00' } });

    expect(franjaSelect.value).toBe('14:00-22:00');
  });
});
