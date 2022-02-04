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

static bool do_http_request(
  struct update_info * info,
  const char * url,
  long * response_code
) {
  CURLcode code;
  uint8_t null_terminator = 0;

  da_resize(info->file_data, 0);
  curl_easy_setopt(info->curl, CURLOPT_URL, url);
  curl_easy_setopt(info->curl, CURLOPT_HTTPHEADER, info->header);
  curl_easy_setopt(info->curl, CURLOPT_ERRORBUFFER, info->error);
  curl_easy_setopt(info->curl, CURLOPT_WRITEFUNCTION, http_write);
  curl_easy_setopt(info->curl, CURLOPT_WRITEDATA, info);
  curl_easy_setopt(info->curl, CURLOPT_FAILONERROR, true);
  curl_easy_setopt(info->curl, CURLOPT_NOSIGNAL, 1);
  curl_easy_setopt(info->curl, CURLOPT_ACCEPT_ENCODING, "");
  curl_obs_set_revoke_setting(info->curl);

  if (!info->remote_url) {
    // We only care about headers from the main package file
    curl_easy_setopt(info->curl, CURLOPT_HEADERFUNCTION, http_header);
    curl_easy_setopt(info->curl, CURLOPT_HEADERDATA, info);
  }

#if LIBCURL_VERSION_NUM >= 0x072400
  // A lot of servers don't yet support ALPN
  curl_easy_setopt(info->curl, CURLOPT_SSL_ENABLE_ALPN, 0);
#endif

  code = curl_easy_perform(info->curl);
  if (code != CURLE_OK) {
    warn("Remote update of URL \"%s\" failed: %s", url, info->error);
    return false;
  }

  if (
    curl_easy_getinfo(info->curl, CURLINFO_RESPONSE_CODE, response_code) != CURLE_OK
  )
    return false;

  if (*response_code >= 400) {
    warn("Remote update of URL \"%s\" failed: HTTP/%ld", url, *response_code);
    return false;
  }

  da_push_back(info->file_data, &null_terminator);

  return true;
}

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

static inline obs_data_t * get_package(const char * base_path, const char * file) {
  char * full_path = get_path(base_path, file);
  obs_data_t * package = obs_data_create_from_json_file(full_path);
  bfree(full_path);
  return package;
}

void misc() {
  if (sep == 1 && *p == '*') {
    from = 0;
    to = items->items.nr;
  } else if (isdigit(*p)) {
    char * endp;
    /*
      * A range can be specified like 5-7 or 5-.
      *
      * Note: `from` is 0-based while the user input
      * is 1-based, hence we have to decrement by
      * one. We do not have to decrement `to` even
      * if it is 0-based because it is an exclusive
      * boundary.
      */
    from = strtoul(p, &endp, 10) - 1;
    if (endp == p + sep)
      to = from + 1;
    else if (*endp == '-') {
      if (isdigit(*(++endp)))
        to = strtoul(endp, &endp, 10);
      else
        to = items->items.nr;
      /* extra characters after the range? */
      if (endp != p + sep)
        from = -1;
    }
  }
}
