/* @ct-no-format */ int arr[] = {
  0, 1, 2,
  3, 4, 5,
  6, 7, 8
}; /* @ct-no-format 3x3 */

void func_with_ignored_code() {
  int a = 1, b = 2;

  /* weird code @CT-no-format */
  a = (a + b) |
      (a - b) &
      (a * b) ^
      (a / b);
  /* end of weird code @CT-no-format */
}

// @ct-NO-FORMAT
void ignored_func(int *p) {}

/* @ct-no-format */
void   func_a();
char * func_b();
long   func_c();
short  func_d();
/* @ct-no-format */
