#define SIGTERM 1

static struct child {
  struct child * next;
  int address;
};

void for_loop() {
  const struct child * blanket, *next;

  for (; (next = blanket->next); blanket = next)
    if (!addrcmp(&blanket->address, &next->address)) {
      // do something
      break;
    }
}