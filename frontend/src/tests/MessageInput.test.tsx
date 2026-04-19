import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "@/components/MessageInput";

describe("MessageInput", () => {
  it("Enter submits and clears", async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} disabled={false} />);
    const ta = screen.getByLabelText("message") as HTMLTextAreaElement;
    await userEvent.type(ta, "hello");
    await userEvent.keyboard("{Enter}");
    expect(onSend).toHaveBeenCalledWith("hello");
    expect(ta.value).toBe("");
  });

  it("Shift+Enter inserts newline", async () => {
    const onSend = vi.fn();
    render(<MessageInput onSend={onSend} disabled={false} />);
    const ta = screen.getByLabelText("message") as HTMLTextAreaElement;
    await userEvent.type(ta, "a");
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}b");
    expect(onSend).not.toHaveBeenCalled();
    expect(ta.value).toBe("a\nb");
  });

  it("Send disabled on empty input", () => {
    render(<MessageInput onSend={() => {}} disabled={false} />);
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });
});
