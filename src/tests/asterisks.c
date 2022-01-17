#include <stdio.h>

typedef int CustomType_t;

void indirection(CustomType_t * inp1, CustomType_t * inp2, CustomType_t * inp3) {
  CustomType_t * p = inp1,
    ** pp = &p,
    *** ppp = &pp,
    **** pppp = &ppp;
}

void dereferencing(int const * volatile a, int const * restrict b) {
  int arr[] = { (*a) * (*b) };
}

void multiplication() {
  int a = 1,
    b = 2,
    c = 3,
    d = 4;
  int res = printf("%d %d %d %d", a * b, a + b * c, b * c - d, a * b + c * d);
}