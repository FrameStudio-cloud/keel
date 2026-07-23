/* eslint-disable no-unused-vars */
import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { useFocusTrap } from "./useFocusTrap";

function TestComponent({ active }) {
  const ref = useFocusTrap(active);
  return (
    <div ref={ref} data-testid="container">
      <button data-testid="first">First</button>
      <button data-testid="middle">Middle</button>
      <button data-testid="last">Last</button>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("focuses the first element when active", () => {
    const { getByTestId } = render(<TestComponent active={true} />);
    expect(document.activeElement).toBe(getByTestId("first"));
  });

  it("does not focus when inactive", () => {
    document.body.focus();
    render(<TestComponent active={false} />);
    expect(document.activeElement).not.toBe(document.querySelector("[data-testid='first']"));
  });

  it("wraps Tab from last to first", () => {
    const { getByTestId } = render(<TestComponent active={true} />);
    getByTestId("last").focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
    Object.defineProperty(event, "shiftKey", { value: false });
    getByTestId("last").dispatchEvent(event);
    expect(document.activeElement).toBe(getByTestId("first"));
  });

  it("wraps Shift+Tab from first to last", () => {
    const { getByTestId } = render(<TestComponent active={true} />);
    const first = getByTestId("first");
    first.focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
    Object.defineProperty(event, "shiftKey", { value: true });
    first.dispatchEvent(event);
    expect(document.activeElement).toBe(getByTestId("last"));
  });

  it("does not trap Tab when inactive", () => {
    const { getByTestId } = render(<TestComponent active={false} />);
    const last = getByTestId("last");
    last.focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
    Object.defineProperty(event, "shiftKey", { value: false });
    const prevented = !last.dispatchEvent(event);
    expect(prevented).toBe(false);
  });
});
