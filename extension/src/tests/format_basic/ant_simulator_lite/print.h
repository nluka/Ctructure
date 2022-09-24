#ifndef ANT_SIMULATOR_LITE_UI_PRINT
#define ANT_SIMULATOR_LITE_UI_PRINT

#include <stddef.h>

typedef enum TextColor {
  TC_DEFAULT = 0,
  TC_RED = 31,
  TC_GREEN = 32,
  TC_YELLOW = 33,
  TC_BLUE = 34,
  TC_MAGENTA = 35,
  TC_CYAN = 36,
  TC_DARK_GRAY = 90
} TextColor_t;

void print_banner();
void print_horizontal_rule();
void printfc(TextColor_t color, const char *format, ...);
void stdout_cursor_hide();
void stdout_cursor_show();
void stdout_cursor_move_up(size_t count);
void stdout_clear_current_line();

#endif // ANT_SIMULATOR_LITE_UI_PRINT
