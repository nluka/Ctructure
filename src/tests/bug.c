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