#include <stdio.h>

void switch_statement() {
  int a = 1, b = 2;
  switch (a) {
    case 0:
      return;
    case 1: {
      char buf[1024];
      switch (b) {
        case 0:
        case 1:
          return;
        default:
        case 2: {
          return;
        }
      }
      break;
    }
    case 2:
    case 3:
      printf("2!\n");
    default:
      break;
  }
}