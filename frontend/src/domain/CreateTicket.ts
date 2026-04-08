export interface CreateTicketDTO {
  name: string;
  documentId: number;
}

export interface CreateTicketResponse {
  status: 'accepted' | 'error';
  message: string;
}
