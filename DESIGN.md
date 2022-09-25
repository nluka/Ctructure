# Ctructure Design

This document outlines, at a high-level, how the various components of Ctructure are designed, implemented, and fit together.

Some useful external sources which guided the design and implementation:
- [ISO C17 Specification](https://web.archive.org/web/20181230041359if_/http://www.open-std.org/jtc1/sc22/wg14/www/abq/c17_updated_proposed_fdis.pdf)

## Brains

The meat and potatoes of Ctructure - this is where the formatting happens.

In [v1](https://github.com/nluka/Ctructure/tree/v1) the "brains" were written in JavaScript (TypeScript to be exact) because that's what VSCode extensions are written in. As of v2, the brains are being rewritten in C++ because:
- JavaScript's abstractness was an obstacle for certain aspects of development. The lack of control makes life difficult and forces unavoidable performance pitfalls. `In the beginning, all you want is results - in the end, all you want is control.`
- The approach taken in [v1](https://github.com/nluka/Ctructure/tree/v1) (i.e. no parsing/AST) created ambiguity problems which made source code difficult or impossible to make sense of (and thus format) in certain cases. It's now clear that an AST of sorts is necessary for Ctructure to be a robust code formatter - this means rewriting a majority of the codebase. We may as well kill 2 birds with 1 stone and rewrite it using a more appropriate programming language.

The formatting pipeline Ctructure implements is:

```Lexing -> Parsing -> Printing```

The 3 stages are described below.

### Lexing

Ctructure's lexing stage takes the input text and breaks it into tokens.

Most important things to know about Ctructure's lexing:
- Only a single pass is done on the input text
- The result is a `std::vector<Token>`. A `Token` is a structure detailing the **type**, **position**, and **length** of a token.

_Development of this component has begun, but is not yet finished._

### Parsing

Ctructure's parsing stage takes the tokens generated from [lexing](#lexing) stage and transforms them into an Abstract Syntax Tree (AST).

Ctructure's AST is not your typical C AST because:
- It **integrates preprocessor directives**. When translating a C program into machine code, preprocessing preceeds parsing, thus the parser doesn't see preprocessing directives. A formatter cannot discard preprocessor directives - what good would it be if it did?
- It **integrates comments**. This is necessary because a formatter cannot discard comments like a compiler does.

_Development of this component has not yet begun._

### Printing

Ctructure's printing stage traverses the parsed AST from the [parsing](#parsing) stage and prints formatted source code.

_Development of this component has not yet begun._

## Extension

This is the VSCode extension which wraps the [brains](#brains) of Ctructure. It will either:

- Access the brains via a Node.js addon. This is probably our best bet, but we must first get node-gyp to work - the thing is truly garbage.

OR

- Like the [Clang-Format](https://marketplace.visualstudio.com/items?itemName=xaver.clang-format) extension, spawn a process of a compiled executable of the brains to use them. This is not ideal because it defeats one of the key visions of Ctructure, a C code formatter which doesn't require you to install and configure a separate executable. We want the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) experience, not the [Clang-Format](https://marketplace.visualstudio.com/items?itemName=xaver.clang-format) experience.
