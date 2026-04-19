import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "@/app/page";
import * as api from "@/lib/api";

beforeEach(() => { vi.restoreAllMocks(); });

describe("Page integration", () => {
  it("types and sees streamed assistant reply", async () => {
    vi.spyOn(api, "getHistory").mockResolvedValue([]);
    vi.spyOn(api, "createSession").mockResolvedValue({ id: "s" });
    vi.spyOn(api, "streamChat").mockImplementation(async (_c, onToken) => {
      onToken("he"); onToken("llo");
    });

    render(<Page />);
    await screen.findByPlaceholderText(/type a message/i);

    const ta = screen.getByLabelText("message");
    await userEvent.type(ta, "hi");
    await userEvent.keyboard("{Enter}");

    const assistants = await screen.findAllByTestId("msg-assistant");
    expect(assistants[assistants.length - 1]).toHaveTextContent("hello");
  });
});
