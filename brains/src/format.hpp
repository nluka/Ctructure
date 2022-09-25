#ifndef CTRUCTURE_FORMAT_HPP
#define CTRUCTURE_FORMAT_HPP

#include <string>

struct FormatResult {
  enum class Code {
    SUCCESS = 0,
  };

  Code m_code;
  std::string m_err;
  std::string m_output;

  bool operator==(FormatResult const &) const noexcept;
  bool operator!=(FormatResult const &) const noexcept;
};

FormatResult format(char const *input, size_t inputLen);

#endif // CTRUCTURE_FORMAT_HPP
