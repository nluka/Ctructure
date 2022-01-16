import expectedAntSimulatorLiteCommandLine from "./ant_simulator_lite/command_line/expected";
import expectedAntSimulatorLiteTimespan from "./ant_simulator_lite/timespan/expected";
import assert from "./assert";
import expectedAsterisks from "./asterisks/expected";
import expectedEmptyHeader from "./empty_header/expected";

assert(
  './asterisks/asterisks.c',
  expectedAsterisks,
  'asterisks'
);
assert(
  './empty_header/empty_header.h',
  expectedEmptyHeader,
  'empty_header'
);
assert(
  './ant_simulator_lite/command_line/command_line.c',
  expectedAntSimulatorLiteCommandLine,
  'ant_simulator_lite/command_line'
);
assert(
  './ant_simulator_lite/timespan/timespan.c',
  expectedAntSimulatorLiteTimespan,
  'ant_simulator_lite/command_line'
);
