#ifndef FUNC_POINTERS_H
#define FUNC_POINTERS_H

typedef struct A {
  void (*callback1)();
  void (*callback2)(void);
  void (*callback3)(const char * const str);
  int (*add)(int a, char b);
} A_t;

#endif // FUNC_POINTERS_H