import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders default label when no props are passed", () => {
    render(<StatusBadge />);
    expect(screen.getByText("离线")).toBeInTheDocument();
  });

  it("renders correct label for each variant", () => {
    const { rerender } = render(<StatusBadge variant="online" />);
    expect(screen.getByText("在线")).toBeInTheDocument();

    rerender(<StatusBadge variant="busy" />);
    expect(screen.getByText("忙碌")).toBeInTheDocument();

    rerender(<StatusBadge variant="away" />);
    expect(screen.getByText("离开")).toBeInTheDocument();
  });

  it("renders custom label when provided", () => {
    render(<StatusBadge variant="online" label="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies correct CSS class for online variant", () => {
    render(<StatusBadge variant="online" />);
    const badge = screen.getByText("在线");
    expect(badge.className).toContain("bg-green-100");
  });
});
