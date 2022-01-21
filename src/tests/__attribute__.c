#include <stdarg.h>

#define __attribute__(x)
#define LOG_ERR 1

__attribute__((format(printf, 1, 2))) static void logerror(
  const char * err,
  ...
) {
  va_list params;
  va_start(params, err);
  logreport(LOG_ERR, err, params);
  va_end(params);
}