import { useQuery } from "@tanstack/react-query";
import { render, screen } from "@testing-library/preact";
import { expect, test, vi } from "vitest";

import { CommerceQueryProvider, commerceQueryClient } from "@services/query-client";

test("provides TanStack query hooks to Preact components", async () => {
  const queryFn = vi.fn().mockResolvedValue("hook data");

  function HookConsumer() {
    const query = useQuery({ queryKey: ["test", "preact-hook"], queryFn });
    return <span>{query.data || "loading"}</span>;
  }

  render(<CommerceQueryProvider><HookConsumer /></CommerceQueryProvider>);
  expect(await screen.findByText("hook data")).toBeTruthy();
  expect(queryFn).toHaveBeenCalledOnce();
  commerceQueryClient.removeQueries({ queryKey: ["test"] });
});
