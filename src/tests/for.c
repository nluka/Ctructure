static struct child {
  struct child * next;
  int address;
};

void for_loop() {
  const struct child * blanket, * next;

  for (; (next = blanket->next); blanket = next)
    if (!addrcmp(&blanket->address, &next->address)) {
      // do something
      break;
    }

  for (int i = 0; i < 10; ++i) {
    // do something
  }
}