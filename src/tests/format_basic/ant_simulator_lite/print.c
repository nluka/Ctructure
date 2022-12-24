#include <stdio.h>
#include <stdarg.h>
#include "print.h"

void stdout_set_text_color(const TextColor_t color) {
  printf("\033[%dm", color);
}

void print_banner() {
  stdout_set_text_color(TC_CYAN);
  printf("\n");
  printf("   \\_|           \n");
  printf("   ( @)  _  __    \n");
  printf("    `(#)(#)(##)   \n");
  printf("     / |^`\\^`\\  \n");
  stdout_set_text_color(TC_DEFAULT);
  print_horizontal_rule();
  printf("ant simulator (lite)\n");
  print_horizontal_rule();
}

void printfc(const TextColor_t color, const char *const format, ...) {
  va_list args;
  va_start(args, format);
  stdout_set_text_color(color);
  vprintf(format, args);
  stdout_set_text_color(TC_DEFAULT);
  va_end(args);
}

void print_horizontal_rule() {
  printfc(TC_DARK_GRAY, "--------------------\n");
}

void stdout_cursor_hide() {
  printf("\33[?25l");
}

void stdout_cursor_show() {
  printf("\33[?25h");
}

void stdout_cursor_move_up(const size_t count) {
  printf("\33[%zuA", count);
}

void stdout_clear_current_line() {
  printf("\33[2K\r");
}
