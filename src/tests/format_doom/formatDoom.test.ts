import assert from "../assert";

describe('formatDoom', () => {
  const _assert = (filePathname: string, expected?: string): void =>
    assert(`./format_doom/${filePathname}`, expected);

  _assert('am_map.txt');
  _assert('d_event.txt');
  _assert('d_items.txt');
  _assert('d_items.txt');
  _assert('d_main.txt');
  _assert('d_main 2.txt');
  _assert('d_net.txt');
  _assert('d_net.txt');
  _assert('d_player.txt');
  _assert('d_textur.txt');
  _assert('d_think.txt');
  _assert('d_ticcmd.txt');
  _assert('doomdata.txt');
  _assert('doomdef.txt');
  _assert('doomstat.txt');
  _assert('doomstat 2.txt');
  _assert('f_finale.txt');
  _assert('f_wipe.txt');
  _assert('f_wipe 2.txt');
  _assert('g_game.txt');
  _assert('hu_lib.txt');
  _assert('hu_lib.txt');
  _assert('hu_stuff.txt');
  _assert('i_net.txt');
  _assert('i_sound.txt');
  _assert('i_system.txt');
  _assert('i_video.txt');
  _assert('info.txt');
  _assert('info 2.txt');
  _assert('m_bbox.txt');
  _assert('m_cheat.txt');
  _assert('m_fixed.txt');
  _assert('m_menu.txt');
  _assert('m_misc.txt');
  _assert('m_random.txt');
  _assert('m_swap.txt');
  _assert('p_ceilng.txt');
  _assert('p_doors.txt');
  _assert('p_enemy.txt');
  _assert('p_floor.txt');
});
