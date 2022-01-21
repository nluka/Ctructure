# Ctructure README

Ctructure is an opinionated, [prettier](https://github.com/prettier/prettier)-inspired code formatter for the C programming language. Currently work in progress.

## Limitations/Caveats

- Max supported input file size is 4 MB
- [Stringizing](https://gcc.gnu.org/onlinedocs/cpp/Stringizing.html) is not currently supported
- Bit field ':' requires at least 1 leading whitespace in order to be formatted correctly (e.g. `int a : 3`)

## Issues

If you encounter unexpected behavior or failures, please create an [issue](https://github.com/nluka/Ctructure/issues). Include a copy of the exact file you were trying to format + the error / description of unexpected behavior.

## Contributing

All contributions are welcome.
