import { autocmd, Denops, ensureNumber, fn, popup } from "./deps.ts";

function closeCmd(host: "vim" | "nvim", winid: number): string {
  if (host == "nvim") {
    return `nvim_win_close(${winid}, v:false)`;
  } else {
    return `popup_close(${winid})`;
  }
}

export type PopupConfig = {
  style?: popup.PopupWindowStyle;
  underCursor?: boolean;
  autoclose?: boolean;
  wrap?: boolean;
};

type BorderStyle = {
  topLeft: string;
  top: string;
  topRight: string;
  right: string;
  bottomRight: string;
  bottom: string;
  bottomLeft: string;
  left: string;
};

type PopupOption = {
  denops: Denops;
  bufnr: number;
  position: Position | "cursor";
  size: { width: number; height: number };
  autoclose?: boolean;
  border?: BorderStyle | "none";
};

type Position = { row: number; col: number };

export async function openPopup(option: PopupOption): Promise<number> {
  const position: Position = { row: 0, col: 0 };
  if (option.position == "cursor") {
    const winline = await fn.winline(option.denops);
    const wincol = await fn.wincol(option.denops);
    const winwidth = ensureNumber(await fn.winwidth(option.denops, "."));
    const borderWidth = option.border == "none" ? 0 : 2;
    const contentWidth = option.size.width;
    const expectedPopupWidth = contentWidth + borderWidth;
    // if popup is over than window, shift popup to left
    if (wincol + expectedPopupWidth > winwidth) {
      const col = Math.max(1, winwidth - expectedPopupWidth);
      position.row = winline;
      position.col = col;
    } else {
      position.row = winline;
      position.col = wincol;
    }
  } else {
    position.row = option.position.row;
    position.col = option.position.col;
  }

  const config: popup.PopupWindowStyle = {
    row: position.row,
    col: position.col,
    width: option.size.width,
    height: option.size.height,
    border: option.border,
  };

  const winid = await popup.open(option.denops, option.bufnr, config);

  if (option.autoclose == true) { // t/f/undefined
    const row = await fn.line(option.denops, ".");
    const vcol = await fn.virtcol(option.denops, ".");
    const cmd = closeCmd(option.denops.meta.host, winid);
    const augroupName = "dps_popup_test_internal";
    await autocmd.group(option.denops, augroupName, (helper) => {
      helper.remove(
        ["CursorMoved", "CursorMovedI", "VimResized"],
        "*",
      );
      helper.define(
        ["CursorMoved", "CursorMovedI", "VimResized"],
        "*",
        `if (line('.') != ${row} || virtcol('.') != ${vcol}) | call ${cmd} | augroup ${augroupName} | autocmd! | augroup END | endif`,
      );
    });
  }
  return Promise.resolve(winid);
}
