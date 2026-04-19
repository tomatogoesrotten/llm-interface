import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatWindow } from "@/components/ChatWindow";

describe("ChatWindow", () => {
  it("renders user and assistant with distinct test ids", () => {
    render(<ChatWindow messages={[
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ]} />);
    expect(screen.getByTestId("msg-user")).toHaveTextContent("hi");
    expect(screen.getByTestId("msg-assistant")).toHaveTextContent("hello");
  });

  it("shows placeholder when empty", () => {
    render(<ChatWindow messages={[]} />);
    expect(screen.getByText(/start the conversation/i)).toBeInTheDocument();
  });
});
