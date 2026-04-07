import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal/ConfirmDeleteModal";

describe("ConfirmDeleteModal", () => {
  const defaultProps = {
    doctorName: "Juan García",
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the confirmation message with the doctor name", () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    expect(
      screen.getByText(
        /Está seguro de que desea dar de baja al Dr\. Juan García/i
      )
    ).toBeInTheDocument();
  });

  it("renders Cancelar and Aceptar buttons", () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /aceptar/i })).toBeInTheDocument();
  });

  it("calls onCancel when Cancelar button is clicked", () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when Aceptar button is clicked", () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /aceptar/i }));

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables Aceptar button when loading is true", () => {
    render(<ConfirmDeleteModal {...defaultProps} loading={true} />);

    expect(screen.getByRole("button", { name: /aceptar/i })).toBeDisabled();
  });

  it("does not close when clicking the overlay", () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId("confirm-delete-overlay"));

    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it("includes the description about hiding from active doctors list", () => {
    render(<ConfirmDeleteModal {...defaultProps} />);

    expect(
      screen.getByText(/ocultará de la lista de médicos activos/i)
    ).toBeInTheDocument();
  });
});
