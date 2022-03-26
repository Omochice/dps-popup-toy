import { Denops, ensureArray, execute, isString } from "./deps.ts";
import { openPopup } from "./popup.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async show(...args: Array<unknown>): Promise<void> {
      ensureArray(args, isString);
      await openPopup(denops, args, { autoclose: true });

      return await Promise.resolve();
    },
  };
  return await Promise.resolve();
}
