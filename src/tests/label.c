void label() {
  int a = 1, b = 2;
  label1:
  a += b;
  {
    label2:
    b += a;
    label3:
    b += a;
  }
  exit:
  return;
}