#include <stddef.h>

typedef struct Timespan {
  size_t days;
  size_t hours;
  size_t minutes;
  size_t seconds;
} Timespan_t;

Timespan_t timespan_calculate(const time_t secondsElapsed) {
  const static size_t SECONDS_PER_DAY = 86400,
    SECONDS_PER_HOUR = 3600,
    SECONDS_PER_MINUTE = 60;

  size_t days = 0, hours = 0, minutes = 0, seconds = (size_t)secondsElapsed;

  while (seconds >= SECONDS_PER_DAY) {
    ++days;
    seconds -= SECONDS_PER_DAY;
  }

  while (seconds >= SECONDS_PER_HOUR) {
    ++hours;
    seconds -= SECONDS_PER_HOUR;
  }

  while (seconds >= SECONDS_PER_MINUTE) {
    ++minutes;
    seconds -= SECONDS_PER_MINUTE;
  }

  const Timespan_t timespan = {
    .days = days,
    .hours = hours,
    .minutes = minutes,
    .seconds = seconds
  };

  return timespan;
}
