#include <stdbool.h>
#define TC_RED 1
void bug() {
  while (1) {
    char input[12];
    int quantityInput = 0;
    if (quantityInput <= 0) {
      printfc(TC_RED, "ERROR: quantity must be > 0\n");
      continue;
    }
    const bool wasValueInputted = input[0] >= '\n';
  }
}