// start of bug 1
static const struct userdiff_funcname * diff_funcname_pattern(
  struct diff_options * o,
  struct diff_filespec * one
) {
  diff_filespec_load_driver(one, o->repo->index);
  return one->driver->funcname.pattern ? &one->driver->funcname : NULL;
}

void diff_set_mnemonic_prefix(
  struct diff_options * options,
  const char * a,
  const char * b
) {
  if (!options->a_prefix)
    options->a_prefix = a;
  if (!options->b_prefix)
    options->b_prefix = b;
}
// end of bug 1

void bug2() {
  #if LIBCURL_VERSION_NUM >= 0x072400 // A lot of servers don't yet support ALPN
    curl_easy_setopt(info->curl, CURLOPT_SSL_ENABLE_ALPN, 0);
  #endif

  code = curl_easy_perform(info->curl);
  if (code != CURLE_OK) {
    warn("Remote update of URL \"%s\" failed: %s", url, info->error);
    return false;
  }
}

// start of bug 3
static bool update_files_to_local(void * param, obs_data_t * local_file) {
  struct update_info * info = param;
  struct file_update_data data = {
    .name = obs_data_get_string(local_file, "name"),
    .version = (int)obs_data_get_int(local_file, "version")
  };

  enum_files(info->cache_package, newer_than_cache, &data);
  if (data.newer || !data.found)
    copy_local_to_cache(info, data.name);

  return true;
}
// end of bug 3
