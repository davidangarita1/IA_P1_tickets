export interface CreateTicketDTO {
  name: string;
  documentId: string;
}

export interface CreateTicketResponse {
  status: "accepted" | "error";
  message: string;
}
