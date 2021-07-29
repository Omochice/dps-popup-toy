import { Denops, execute } from "./deps.ts";
import { openPopup } from "./popup.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async dpsTest(): Promise<void> {
      await openPopup(denops, ["hello", "denops!!"], true);

      return await Promise.resolve();
    },
  };

  await execute(
    denops,
    `command! DpsTest call denops#request('${denops.name}', 'dpsTest', [])`,
  );
}
