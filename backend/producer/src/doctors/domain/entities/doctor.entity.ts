export type DoctorStatus = 'Activo' | 'Inactivo';
export type FranjaHoraria = '06:00-14:00' | '14:00-22:00';

export class Doctor {
    readonly id: string;
    readonly nombre: string;
    readonly cedula: string;
    readonly consultorio: string | null;
    readonly franjaHoraria: FranjaHoraria | null;
    readonly status: DoctorStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: {
        id: string;
        nombre: string;
        cedula: string;
        consultorio: string | null;
        franjaHoraria: FranjaHoraria | null;
        status: DoctorStatus;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this.id = props.id;
        this.nombre = props.nombre;
        this.cedula = props.cedula;
        this.consultorio = props.consultorio;
        this.franjaHoraria = props.franjaHoraria;
        this.status = props.status;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
