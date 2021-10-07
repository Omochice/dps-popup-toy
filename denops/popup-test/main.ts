import { Denops, ensureArray, execute, isString } from "./deps.ts";
import { openPopup } from "./popup.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async dpsTest(...args: Array<unknown>): Promise<void> {
      ensureArray(args, isString);
      await openPopup(denops, args, { autoclose: true });

      return await Promise.resolve();
    },
  };

  await execute(
    denops,
    `
    let g:DpsPopupToy_strings = ["hello", "denops", "popup!!"]
    command! DpsPopupToy call denops#request('${denops.name}', 'dpsTest', g:DpsPopupToy_strings)
    nnoremap <silent> <Plug>(DpsTest) <Cmd>DpsPopupToy<CR>
    `,
  );
}
