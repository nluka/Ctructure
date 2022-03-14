import assert from "../assert";

describe('formatDoom', () => {
  const _assert = (filePathname: string, expected?: string): void =>
    assert(`./format_doom/${filePathname}`, expected);

  _assert('am_map.c');
  // d_englsh.h skipped
  _assert('d_event.h');
  // d_french.h skipped
  _assert('d_items.c');
  _assert('d_items.h');
  _assert('d_main.c');
  _assert('d_main.h');
  _assert('d_net.c');
  _assert('d_net.h');
  _assert('d_player.h');
  _assert('d_textur.h');
  _assert('d_think.h');
  _assert('d_ticcmd.h');
  _assert('doomdata.h');
  // doomdef.c skipped
  _assert('doomdef.h');
  _assert('doomstat.c');
  _assert('doomstat.h');
  // dstrings.c skipped
  // dstrings.h skipped
  _assert('f_finale.c');
  // f_finale.h skipped
  _assert('f_wipe.c');
  _assert('f_wipe.h');
  _assert('g_game.c');
  // g_game.h skipped
  _assert('hu_lib.c');
  _assert('hu_lib.h');
  _assert('hu_stuff.c');
  // hu_stuff.h skipped
  // i_main.c skipped
  _assert('i_net.c');
  // i_net.h skipped
  _assert('i_sound.c');
  // i_sound.h skipped
  _assert('i_system.c');
});
