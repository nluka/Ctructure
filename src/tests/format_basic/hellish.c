void f() {
  int a, b, c, d, e, *p;

  int a = (b - c) * d / e;
  int b = (b - c) * (d) / e;
  int *p = &a;

  for (;;)
    *p++;

  for (;;) {
    *p++;
  }

  int a = (int)&p;
  int a = (int)*p;
  int a = (int)(&p);
  int a = (b * c) * d;

  typedef int t;

  int a = (t)*p;
  int a = (t *)*p;
  int a = (t *const)*p;
  int a = (t **const)*p;
  int a = (const t *const *const)*p;
  int a = (t const *const *const)*p;
}

int func() {
  int a, b;
  return a * b;
}

void huh() {
  processes = (Process *)malloc(sizeOfBuffer * sizeof (Process)); // allocate memory for processes
  if (numProcesses >= sizeOfBuffer) {
    sizeOfBuffer *= 2;
    processes = realloc(processes, sizeOfBuffer * sizeof (Process));
  }
}
