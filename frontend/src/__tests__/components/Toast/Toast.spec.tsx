import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Toast from "@/components/Toast/Toast";

describe("Toast", () => {
  it("renders nothing when visible is false", () => {
    render(
      <Toast
        message="test message"
        type="success"
        visible={false}
        onHide={jest.fn()}
      />
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders the message when visible is true", () => {
    render(
      <Toast
        message="Operation completed"
        type="success"
        visible={true}
        onHide={jest.fn()}
      />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Operation completed")).toBeInTheDocument();
  });

  it("renders the close button when visible", () => {
    render(
      <Toast
        message="test"
        type="success"
        visible={true}
        onHide={jest.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /cerrar notificación/i })
    ).toBeInTheDocument();
  });

  it("calls onHide when close button is clicked", () => {
    const onHide = jest.fn();
    render(
      <Toast message="test" type="success" visible={true} onHide={onHide} />
    );

    fireEvent.click(screen.getByRole("button", { name: /cerrar notificación/i }));

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it("renders with error type and shows the message", () => {
    render(
      <Toast
        message="Something failed"
        type="error"
        visible={true}
        onHide={jest.fn()}
      />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something failed")).toBeInTheDocument();
  });
});
