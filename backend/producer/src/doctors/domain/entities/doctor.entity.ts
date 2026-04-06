export type DoctorStatus = 'active' | 'inactive';
export type Shift = '06:00-14:00' | '14:00-22:00';

export class Doctor {
    readonly _id: string;
    readonly id: string;
    readonly name: string;
    readonly documentId: string;
    readonly office: string | null;
    readonly shift: Shift | null;
    readonly status: DoctorStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(props: {
        id: string;
        name: string;
        documentId: string;
        office: string | null;
        shift: Shift | null;
        status: DoctorStatus;
        createdAt: Date;
        updatedAt: Date;
    }) {
        this._id = props.id;
        this.id = props.id;
        this.name = props.name;
        this.documentId = props.documentId;
        this.office = props.office;
        this.shift = props.shift;
        this.status = props.status;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
}
