import path = require('path');
import TokenArray from '../../lexer/TokenArray';
import { tokenizeFile } from '../../lexer/tokenizeFile';
import assert from './assert';

const filePath = path.join(__dirname, '../../sample_code/simulation.c');
const tokenizedfile = tokenizeFile(filePath);

const expectedFormat = `#define _CRT_SECURE_NO_WARNINGS

#include <stdio.h>
#include <time.h>
#include <string.h>
#include "../command_vars.h"
#include "simulation.h"
#include "../util/timespan.h"
#include "log_event.h"
#include "../util/assert_file_handle.h"
#include "file_pgm_ascii.h"
#include "file_pgm_binary.h"

extern const command_vars_t g_comVars;

void simulation_handle_bad_status(
  simulation_t *const sim,
  const SimulationStatus_t status
) {
  switch (status) {
    case SS_FAILED_TO_ALLOCATE_MEMORY_FOR_GRID_CELLS:
      log_event(
        ET_WARNING,
        "Simulation '%s' failed to start: unable to allocate memory for grid cells",
        sim->name
      );
      sim->result = SR_ABORTED;
      return;
    case SS_FAILED_TO_OPEN_IMAGE_FILE:
      log_event(
        ET_WARNING,
        "Simulation '%s' failed to emit image file",
        sim->name
      );
      return;
    default:
      return;
  }
}

void simulation_run(simulation_t *const sim) {
  SimulationStatus_t status;
  
  status = simulation_init(sim);
  if (status != SS_OK) {
    simulation_handle_bad_status(sim, status);
    return;
  }
  
  simulation_iterate(sim);
  
  if (g_comVars.emitImageFiles) {
    status = simulation_emit_image(sim);
    if (status != SS_OK) {
      simulation_handle_bad_status(sim, status);
    }
  }
  
  simulation_destroy(sim);
}

SimulationStatus_t simulation_init(simulation_t *const sim) {
  sim->result = SR_NOT_STARTED;
  
  if (!grid_init_cells(&sim->grid)) {
    return SS_FAILED_TO_ALLOCATE_MEMORY_FOR_GRID_CELLS;
  }
  
  ant_t *const ant = &sim->ant;
  ant->grid = &sim->grid;
  ant->ruleset = &sim->ruleset;
  ant->stepsTaken = 0;
  
  return SS_OK;
}

void simulation_iterate(simulation_t *const sim) {
  sim->result = SR_STARTED;
  
  log_event(ET_INFO, "Started simulation '%s'", sim->name);
  
  const size_t maxIterations = sim->maxIterations;
  AntStepResult_t stepResult = ASR_OK;
  
  const time_t startTime = time(NULL);
  
  if (maxIterations == 0) {
    do {
      stepResult = ant_take_step(&sim->ant);
    } while (stepResult == ASR_OK);
  } else {
    for (size_t i = maxIterations; i > 0; --i) {
      stepResult = ant_take_step(&sim->ant);
      if (stepResult != ASR_OK) {
        break;
      }
    }
  }
  
  const time_t endTime = time(NULL);
  const timespan_t elapsedTime = timespan_calculate(endTime - startTime);
  str_t elapsedTimeStr = timespan_convert_to_str(&elapsedTime),
    resultDescriptionStr = str_create(63);
  
  switch (stepResult) {
    case ASR_HIT_BOUNDARY:
      str_append(&resultDescriptionStr, "ant hit a boundary after ");
      str_append_uint64(&resultDescriptionStr, sim->ant.stepsTaken);
      str_append(&resultDescriptionStr, " iterations");
      break;
    case ASR_OK:
      str_append(&resultDescriptionStr, "reached max iterations of ");
      str_append_uint64(&resultDescriptionStr, maxIterations);
      break;
  }
  
  log_event(
    ET_SUCCESS,
    "Finished simulation '%s': %s (took %s)",
    sim->name,
    resultDescriptionStr.value,
    elapsedTimeStr.value
  );
  
  str_destroy(&resultDescriptionStr);
  str_destroy(&elapsedTimeStr);
}

SimulationStatus_t simulation_emit_image(const simulation_t *const sim) {
  str_t filePathnameStr = str_create(strlen(sim->name) + 3);
  str_append(&filePathnameStr, sim->name);
  str_append(&filePathnameStr, ".pgm");
  
  FILE *file = fopen(filePathnameStr.value, "w");
  assert_file_handle(file, filePathnameStr.value, false);
  if (file == NULL) {
    return SS_FAILED_TO_OPEN_IMAGE_FILE;
  }
  
  const color_t maxColorValue = ruleset_find_largest_color(&sim->ruleset);
  
  log_event(ET_INFO, "Started writing file '%s'", filePathnameStr.value);
  
  const time_t startTime = time(NULL);
  
  switch (sim->outFileType) {
    case SIFT_PGM_ASCII:
      file_pgm_ascii_write(
        file,
        sim->grid.width,
        sim->grid.width,
        maxColorValue,
        sim->grid.cells
      );
      break;
    case SIFT_PGM_BINARY:
      file_pgm_binary_write(
        file,
        sim->grid.width,
        sim->grid.width,
        maxColorValue,
        sim->grid.cells
      );
      break;
  }
  
  fclose(file);
  
  const time_t endTime = time(NULL);
  const timespan_t elapsedTime = timespan_calculate(endTime - startTime);
  str_t elapsedTimeStr = timespan_convert_to_str(&elapsedTime);
  
  log_event(
    ET_SUCCESS,
    "Finished writing file '%s' (took %s)",
    filePathnameStr.value,
    elapsedTimeStr.value
  );
  
  str_destroy(&filePathnameStr);
  str_destroy(&elapsedTimeStr);
  
  return SS_OK;
}

void simulation_destroy(simulation_t *const sim) {
  grid_destroy(&sim->grid);
}
`;

const testInfoSimulationC: [[string, TokenArray], string, string] = [
  tokenizedfile,
  expectedFormat,
  'simulation.c',
];

export default testInfoSimulationC;
