int main(int argc, char **argv) {
  int a = 1;
  int *pa = &a;
  int b = *pa;
  int c = b * a;
  return 0;
}