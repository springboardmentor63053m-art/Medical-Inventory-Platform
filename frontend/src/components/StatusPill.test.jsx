import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatusPill from "./StatusPill";

describe("StatusPill", () => {
  it("renders the correct label for each stock status", () => {
    render(<StatusPill status="low" />);
    expect(screen.getByText("Low stock")).toBeInTheDocument();
  });

  it("falls back to 'In stock' for an unknown status", () => {
    render(<StatusPill status="something-unrecognized" />);
    expect(screen.getByText("In stock")).toBeInTheDocument();
  });

  it("renders 'Expired' for expired medicines", () => {
    render(<StatusPill status="expired" />);
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });
});
