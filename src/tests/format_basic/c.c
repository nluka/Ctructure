void us2() {
  // EXAMPLE 1:
  int a = (b - c) * d / e;
  //            ^ ^ ^
  //            not supported

  // do this instead:
  int a = (b - c) * (d) / e;

  // EXAMPLE 2:
  int *p = &a;
  for (;;)
    *p++;
  //     ^ ^^
  //     not supported

  // do this instead:
  for (;;) {
    *p++;
  }
}

void us3() {
  int a = (int)&b;
  //          ^^^
  //          not supported

  // do this instead:
  int a = (int)(&b);

  int a = (t)*b;
  int a = (t *)*b;
  int a = (t *const)*b;
  int a = (t **const)*b;
  int a = (const t *const *const)*b;
}
