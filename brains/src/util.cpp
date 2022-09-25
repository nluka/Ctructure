#include <cstring>
#include <filesystem>
#include <iostream>
#include <utility>

#include "exit.hpp"
#include "util.hpp"

using namespace std;

bool util::is_alphabetic(char const c) {
  return
    (c >= 'A' && c <= 'Z') ||
    (c >= 'a' && c <= 'z');
}

bool util::is_digit(char const c) {
  return (c >= '0' && c <= '9');
}

bool util::is_non_newline_whitespace(char const c) {
  return strchr(" \t\v\f", c);
}

void util::escape_escape_sequences(std::string &str) {
  std::pair<char, char> const sequences[] {
    { '\a', 'a' },
    { '\b', 'b' },
    { '\f', 'f' },
    { '\n', 'n' },
    { '\r', 'r' },
    { '\t', 't' },
    { '\v', 'v' },
  };

  for (size_t i = 0; i < str.length(); ++i) {
    char *const c = str.data() + i;

    for (auto const seq : sequences) {
      if (*c == seq.first) {
        *c = seq.second;
        str.insert(i, "\\");
        ++i; // to account for inserted "\\"
        break;
      }
    }
  }
}

size_t util::find_unescaped(
  char const *const str,
  char const searchCh,
  char const escapeCh,
  size_t const offset = 0
) {
  size_t const len = strlen(str);

  for (size_t pos = offset; pos < len; ++pos) {
    if (str[pos] != searchCh) {
      continue;
    }

    size_t escapeCount = 0;
    for (size_t i = pos - 1; i >= 0; --i) {
      if (str[i] == escapeCh) {
        ++escapeCount;
      } else {
        break;
      }
    }

    bool const isEscaped = !is_even(escapeCount);
    if (!isEscaped) {
      return pos;
    }
  }

  return std::string::npos;
}

fstream util::open_file(char const *const pathname, int const flags) {
  bool const forReading = (flags & 1) == 1;
  if (forReading) {
    if (!filesystem::exists(pathname)) {
      cerr << "fatal: file `" << pathname << "` not found\n";
      EXIT(ExitCode::FILE_NOT_FOUND);
    }
  }

  fstream file(pathname, static_cast<ios_base::openmode>(flags));

  if (!file.is_open()) {
    cerr << "fatal: unable to open file `" << pathname << "`\n";
    EXIT(ExitCode::FILE_OPEN_FAILED);
  }

  if (!file.good()) {
    cerr << "fatal: bad file `" << pathname << "`\n";
    EXIT(ExitCode::BAD_FILE);
  }

  return file;
}

vector<char> util::extract_bin_file_contents(char const *const pathname) {
  fstream file = util::open_file(pathname, ios::binary | ios::in);
  auto const fileSize = filesystem::file_size(pathname);
  vector<char> vec(fileSize);
  file.read(vec.data(), fileSize);
  return vec;
}

string util::extract_txt_file_contents(char const *const pathname) {
  fstream file = util::open_file(pathname, ios::in);
  auto const fileSize = filesystem::file_size(pathname);

  string content{};
  content.reserve(fileSize);

  getline(file, content, '\0');

  // remove any \r characters
  content.erase(
    remove(content.begin(), content.end(), '\r'),
    content.end()
  );

  return content;
}
