/**
 * Puerto de dominio: contrato para publicar eventos al message broker.
 *
 * ⚕️ HUMAN CHECK - ISP: interfaz mínima, solo publish
 */
export interface IEventPublisher {
    publish(event: string, payload: unknown): void;
}
