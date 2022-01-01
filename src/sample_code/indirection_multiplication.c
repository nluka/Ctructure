#define WIDTH 10
void indirection_multiplcation(char **argv) {
  int volatile b = 1, c = 1;
  int a = b * c;
  int arr[WIDTH * WIDTH] = { 0 };
  int volatile *const p = &b;
}