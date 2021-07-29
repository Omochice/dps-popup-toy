import { Denops } from "https://deno.land/x/denops_std@v1.0.0/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v1.0.0/helper/mod.ts";
import * as autocmd from "https://deno.land/x/denops_std@v1.0.0/autocmd/mod.ts";
import { ensureNumber } from "https://deno.land/x/unknownutil@v1.0.0/mod.ts";
import * as popup from "https://deno.land/x/denops_popup@v2.0.1/mod.ts";

async function makeEmptyBuffer(denops: Denops): Promise<number> {
  if (await denops.meta.host === "nvim") {
    const bufnr = await denops.call("nvim_create_buf", false, true);
    ensureNumber(bufnr);
    return bufnr;
  } else {
    const name = "dps-popup-test://popup";
    await execute(denops, `badd ${name}`);
    const bufnr = await denops.call("bufnr", `^${name}$`);
    ensureNumber(bufnr);
    await denops.call("setbufvar", bufnr, "&buftype", "nofile");
    return bufnr;
  }
}

async function closeCmd(denops: Denops, winid: number): Promise<string> {
  if (await denops.meta.host === "nvim") {
    return `nvim_win_close(${winid}, v:false)`;
  } else {
    return `popup_close(${winid})`;
  }
}

async function openPopup(
  denops: Denops,
  content: string | string[],
  autoclose = false,
  style?: popup.PopupWindowStyle,
): Promise<void> {
  if (typeof (style) === "undefined") {
    style = {
      row: 1,
      col: 1,
      width: 20,
      height: 20,
      border: true,
    };
  }
  const bufnr = await makeEmptyBuffer(denops);
  ensureNumber(bufnr);

  const popupWinId = await popup.open(denops, bufnr, style);
  ensureNumber(popupWinId);

  await denops.call("setbufline", bufnr, 1, content);
  // await denops.call("setbufline", bufnr, 1, ["hello", "world"]);

  if (autoclose) {
    const cmd = await closeCmd(denops, popupWinId);
    const row = await denops.call("line", ".");
    const vcol = await denops.call("virtcol", ".");

    await autocmd.group(denops, "dps_float_close", (helper) => {
      helper.remove(
        ["CursorMoved", "CursorMovedI", "VimResized"],
        "*",
      );
      helper.define(
        ["CursorMoved", "CursorMovedI", "VimResized"],
        "*",
        `if (line('.') != ${row} || virtcol('.') != ${vcol}) | call ${cmd} | augroup dps_float_close | autocmd! | augroup END | endif`,
      );
    });
  }
  return await Promise.resolve();
}

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
