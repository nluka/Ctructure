import assert from "../assert";

describe('formatDoom', () => {
  const _assert = (filePathname: string, expected?: string): void =>
    assert(`./format_doom/${filePathname}`, expected);

  _assert('am_map.c');
  _assert('d_items.c');
  _assert('d_main.c');
  _assert('d_net.c');
});
