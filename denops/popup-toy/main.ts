import { Denops, ensure, fn, is, vars } from "./deps.ts";
import { openPopup } from "./popup.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async show(...args: Array<unknown>): Promise<void> {
      const bufnr = await fn.bufnr(denops, "dps_popup_test_string", true);
      await fn.bufload(denops, bufnr);
      await fn.setbufline(
        denops,
        bufnr,
        1,
        ensure(args, is.ArrayOf(is.String)),
      );
      await fn.setbufvar(denops, bufnr, "&buftype", "nofile");

      const contentsWidths: number[] = [];
      for (const line of args) {
        contentsWidths.push(
          ensure(await fn.strdisplaywidth(denops, line), is.Number),
        );
      }

      const contentMaxWidth = Math.max(
        ...contentsWidths,
      );
      await openPopup({
        denops: denops,
        bufnr: bufnr,
        position: "cursor",
        size: { width: contentMaxWidth, height: args.length },
        border: await vars.g.get(denops, "dps_popup_toy_border", undefined),
        autoclose: true,
      });

      return await Promise.resolve();
    },
  };
  return await Promise.resolve();
}
