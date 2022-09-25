// various utility/helper functions

#ifndef CTRUCTURE_UTIL_HPP
#define CTRUCTURE_UTIL_HPP

#include <fstream>
#include <string>
#include <vector>

namespace util {

bool is_alphabetic(char);
bool is_digit(char);
bool is_non_newline_whitespace(char);

void escape_escape_sequences(std::string &);

size_t find_unescaped(
  char const *str,
  char searchCh,
  char escapeCh,
  size_t offset
);

template <typename Ty>
bool is_even(Ty const num) {
  return num % 2 == 0;
}

// Returns the size of a static C-style array at compile time.
template <typename ElemTy, size_t Length>
constexpr
size_t lengthof(ElemTy (&)[Length]) {
  return Length;
}

std::fstream open_file(char const *pathname, int flags);
std::vector<char> extract_bin_file_contents(char const *pathname);
std::string extract_txt_file_contents(char const *pathname);

} // namespace util

#endif // CTRUCTURE_UTIL_HPP
