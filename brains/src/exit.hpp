#ifndef CTRUCTURE_EXIT_HPP
#define CTRUCTURE_EXIT_HPP

enum class ExitCode : int {
  SUCCESS = 0,
  FILE_NOT_FOUND,
  FILE_OPEN_FAILED,
  BAD_FILE,
};

#define EXIT(code) std::exit(static_cast<int>(code))

#endif // CTRUCTURE_EXIT_HPP
