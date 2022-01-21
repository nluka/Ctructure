#include <stdio.h>

void switch_statement() {
  int a = 1;
  switch (a) {
    case 0:
      return;
    case 1: {
      char buf[1024];
      // some statements
      break;
    }
    case 2:
    case 3:
      printf("2!\n");
  }
}