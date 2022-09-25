#include "format.hpp"

bool FormatResult::operator==(FormatResult const &other) const noexcept {
  return
    m_code == other.m_code &&
    m_err == other.m_err &&
    m_output == other.m_output;
}
bool FormatResult::operator!=(FormatResult const &other) const noexcept {
  return
    m_code != other.m_code ||
    m_err != other.m_err ||
    m_output != other.m_output;
}

FormatResult format(char const *const, size_t const) {
  return {
    FormatResult::Code::SUCCESS,
    "",
    ""
  };
}
