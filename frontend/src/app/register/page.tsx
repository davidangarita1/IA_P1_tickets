import CreateTicketForm from "@/components/CreateTicketForm/CreateTicketForm";
import AuthGuard from "@/components/AuthGuard/AuthGuard";

// HUMAN CHECK - This component is a duplicate of the AppointmentRegistrationForm.

export default function RegisterPage() {
  return (
    <AuthGuard>
      <CreateTicketForm />
    </AuthGuard>
  );
}
