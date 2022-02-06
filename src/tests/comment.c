void comments() {
  int a = 1, b = 2, c;

  c = a + b; // add
  c = a - b; // sub
  c = a * b; // mult
  c = a / b; // div

  { // section
    int d;
    d = a + b; /* add */
    d = a - b; /* sub */
    d = a * b; /* mult */
    d = a / b; /* div */
  }

  { // section
    int e;
    e = a + b; /*add*/
    e = a - b; /*sub*/
    e = a * b; /*mult*/
    e = a / b; /*div*/
  }
}