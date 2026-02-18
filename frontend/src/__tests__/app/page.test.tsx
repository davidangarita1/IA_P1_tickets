/**
 * @jest-environment jsdom
 *
 * 📂 LOCATED AT: frontend/src/__tests__/app/page.test.tsx
 *
 * ⚕️ HUMAN CHECK - Reescrito para reflejar el estado actual de page.tsx:
 *   - Hook renombrado: useTurnosWebSocket → useAppointmentsWebSocket
 *   - Texto actualizado: "Turnos Médicos" → "Turnos Habilitados"
 *   - Estado de conexión real: "Conectado" → "🟢 Conectado en tiempo real"
 *   - Datos del mock alineados con interfaz Appointment (cedula: number, timestamp: number)
 */
import { render, screen } from '@testing-library/react';
import Home from '../../app/page';

// ⚕️ HUMAN CHECK - Mock del hook useAppointmentsWebSocket (nombre actual del hook)
const mockUseAppointmentsWebSocket = jest.fn();
jest.mock('@/hooks/useAppointmentsWebSocket', () => ({
    useAppointmentsWebSocket: (...args: unknown[]) => mockUseAppointmentsWebSocket(...args),
}));

// ⚕️ HUMAN CHECK - Mock de hooks secundarios para aislar el test de la página
jest.mock('@/hooks/useAudioNotification', () => ({
    useAudioNotification: () => ({ audioEnabled: true, play: jest.fn() }),
}));

jest.mock('@/hooks/useNewAppointmentDetector', () => ({
    useNewAppointmentDetector: () => ({ showToast: false }),
}));

jest.mock('@/components/AppointmentList/AppointmentList', () => ({
    __esModule: true,
    default: ({ title, appointments }: { title: string; appointments: { nombre: string }[] }) => (
        <div>
            <span>{title}</span>
            {appointments.map((a) => (
                <span key={a.nombre}>{a.nombre}</span>
            ))}
        </div>
    ),
}));

describe('Home Page', () => {
    beforeEach(() => {
        mockUseAppointmentsWebSocket.mockReturnValue({
            appointments: [
                {
                    id: '1',
                    nombre: 'Test Patient',
                    cedula: 12345678,
                    estado: 'espera',
                    consultorio: null,
                    timestamp: Date.now(),
                },
                {
                    id: '2',
                    nombre: 'Active Patient',
                    cedula: 87654321,
                    estado: 'llamado',
                    consultorio: '1',
                    timestamp: Date.now(),
                },
            ],
            error: null,
            connected: true,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the title', () => {
        render(<Home />);
        // ⚕️ HUMAN CHECK - texto actual en page.tsx es "Turnos Habilitados"
        const title = screen.getByText(/Turnos Habilitados/i);
        expect(title).toBeInTheDocument();
    });

    it('displays connected status when connected is true', () => {
        render(<Home />);
        // ⚕️ HUMAN CHECK - texto real del estado conectado en page.tsx
        const status = screen.getByText(/Conectado en tiempo real/i);
        expect(status).toBeInTheDocument();
    });

    it('renders list of appointments via AppointmentList', () => {
        render(<Home />);
        // ⚕️ HUMAN CHECK - AppointmentList se renderiza para 'llamado' y 'espera',
        //   el mock devuelve todos los appointments a ambas instancias, por eso hay 2 ocurrencias.
        expect(screen.getAllByText('Test Patient').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Active Patient').length).toBeGreaterThanOrEqual(1);
    });

    it('does not show the empty state when appointments exist', () => {
        render(<Home />);
        const empty = screen.queryByText(/No hay turnos registrados/i);
        expect(empty).not.toBeInTheDocument();
    });

});

// ⚕️ HUMAN CHECK - Test de desconexión en suite separada para evitar conflictos
//   con jest.mock() hoisting. El mock de desconexión sobreescribe el del bloque superior.
describe('Home Page — disconnected state', () => {
    it('shows disconnected status when connected is false', () => {
        mockUseAppointmentsWebSocket.mockReturnValueOnce({
            appointments: [],
            error: null,
            connected: false,
        });

        render(<Home />);
        expect(screen.getByText(/Desconectado/i)).toBeInTheDocument();
    });
});
