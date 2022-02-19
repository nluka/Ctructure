#include <stdio.h>

typedef int CusType_t;

int a = 1, b = 2, c = 3, d = 4, e = 5, f = 6, g = 7, h = 8;
int *pa = &a, *pb = &b, *pc = &c, *pd = &d, *pe = &e, *pf = &f;

void indirection(CusType_t *inp1, CusType_t *inp2, CusType_t *inp3) {
  CusType_t *p = inp1,
    **pp = &p,
    ***ppp = &pp,
    ****pppp = &ppp,
    *****ppppp = &pppp;
}

void dereference() {
  int arr[] = { (*pa), *pb, *pc * d + e };

  if ((a == 1) && (b == 2))
    *pa = 1;
  else if (c == 3) {
    *pc = 3;
  } else
    *pd += 1;

  while ((1) + (2))
    *pe -= 1;

  do {
    *pf *= 1;
  } while (1);
}

void multiplication() {
  printf(
    "%d %d %d\n",
    add4(a * b, c * d, e * f, g * h),
    add4(a * b, c * d, e * f, g * h),
    add4(a * b, c * d, e * f, g * h)
  );
}

void add4(int a, int b, int c, int d) {
  return a + b + c + d;
}

static BLAKE2_INLINE void secure_zero_memory(void *v, size_t n) {
  static void *(*const volatile memset_v)(void *, int, size_t) = &memset;
  memset_v(v, 0, n);
}

typedef struct A {
  void (*callback1)();
  void (*callback2)(void);
  void (*callback3)(const char *const str);
  int (*add)(int a, char b);
} A_t;

typedef struct B {
  CusType_t v1;
  CusType_t *p1;
  CusType_t v2;
  CusType_t *p2;
  CusType_t *p3;
} B_t;

typedef int *int_ptr;