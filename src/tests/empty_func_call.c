#define git_log_output_encoding 1

const char * get_log_output_encoding(void) {
  return git_log_output_encoding ? git_log_output_encoding : get_commit_output_encoding();
}