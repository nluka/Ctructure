typedef int CustomType_t;

CustomType_t asterisks1(
  CustomType_t * inp1,
  CustomType_t * inp2,
  CustomType_t * inp3
) {
  // some pointer stuff
  CustomType_t a,
    * p = &a,
    ** pp = &p;

  int i1 = 1,
    i2 = 2,
    i3 = 3;

  return i1 * i2 * i3 > 0;
}

void asterisks2(int const * volatile a, int const * restrict b) {
  int arr[] = { (*a) * (*b) };
}