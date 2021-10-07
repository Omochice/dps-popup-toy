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

  await execute(
    denops,
    `
    let g:popup_toy_strings = ["hello", "denops", "popup!!"]
    command! DpsPopupToy call denops#request('${denops.name}', 'show', g:popup_toy_strings)
    nnoremap <silent> <Plug>(popup_toy) <Cmd>DpsPopupToy<CR>
    `,
  );
}
