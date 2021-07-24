import { Denops } from "https://deno.land/x/denops_std@v1.0.0/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v1.0.0/helper/mod.ts";
import * as autocmd from "https://deno.land/x/denops_std@v1.0.0/autocmd/mod.ts";
import {
  ensureNumber,
  ensureString,
} from "https://deno.land/x/unknownutil@v1.0.0/mod.ts";
import * as popup from "https://deno.land/x/denops_popup@v2.0.1/mod.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async dpsTest(text: unknown): Promise<unknown> {
      ensureString(text);
      const currentBufnr = await denops.call("bufnr", "%");
      ensureNumber(currentBufnr);
      const opts = {
        relative: "editor",
        row: 1,
        col: 1,
        width: 20,
        height: 20,
        border: true,
      };

      let bufnr: unknown; //empty buffer
      if (await denops.eval("has('nvim')") as number == 1) {
        bufnr = await denops.call("nvim_create_buf", false, true);
      } else {
        // how to get it in vim ?
        bufnr = -1;
      }
      ensureNumber(bufnr);
      console.log(bufnr);

      await execute(
        denops,
        `
        augroup dps_float_close
          autocmd! dps_float_close CursorMoved,CursorMovedI,VimResized *
          autocmd CursorMoved,CursorMovedI,VimResized * echo "hello"
        augroup END
        `,
      );
      // equal as below ?
      // now below is not work

      // await autocmd.define(
      //   denops,
      //   [
      //     "CursorMoved",
      //     "CursorMovedI",
      //     "VimResized",
      //   ],
      //   "*",
      //   "echo 'enter'",
      //   { group: "dps_float_close" },
      // );
      //
      const popupId = await popup.open(denops, bufnr, opts, {
        onClose: async () => {
          await autocmd.remove(
            denops,
            ["CursorMoved", "CursorMovedI", "VimResized"],
            "*",
            { group: "dps_float_close" },
          );
        },
      });

      console.log(popupId);
      await denops.call("setbufline", bufnr, 1, ["hello", "world"]);
      return await Promise.resolve();
    },
  };

  await execute(
    denops,
    `command! -nargs=* DpsTest call denops#request('${denops.name}', 'dpsTest', [<q-args>])`,
  );
}
