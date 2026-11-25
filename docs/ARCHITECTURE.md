# Neutron Architecture

## Repository overview

```mermaid
flowchart TD
  Source[".el source bytes"] --> Decode["UTF-8 and size checks"]
  Decode --> Lexer["Lexer: 64-symbol alphabet"]
  Lexer --> Parser["Parser: immutable symbol program"]
  Parser --> Runtime["Electa runtime: stateful decoder"]
  Runtime --> Machine["Data tape + control tape + key + PC"]
  Machine --> Output["Byte output"]
  Output --> Formatter["Canonical Electa formatter"]
  Formatter --> CLI["CLI and REPL"]
```

## Electa execution path

1. The CLI reads a bounded regular source file or accepts a line in the REPL.
2. The lexer checks source length, permitted whitespace, alphabet membership, and source positions.
3. The parser creates an immutable source-symbol representation. It does not pre-decode opcodes because decoding depends on runtime state.
4. The runtime decodes and executes one instruction at a time, updates the key, and enforces fuel.
5. The formatter converts emitted bytes and execution status into canonical Electa notation.

## Consoler path

```mermaid
flowchart TD
  App["Host application invariant check"] --> Report["Consoler reportSignal"]
  Report --> Validate["Finite event and code validation"]
  Validate --> Budget["Per-instance signal budget"]
  Budget --> Callback["Optional synchronous callback"]
  Callback --> Queue["Application-owned telemetry queue"]
  Queue --> Server["Server validates low-trust telemetry"]
  Server --> Correlate["Correlate with trusted server events"]
```

Consoler does not detect DevTools, perform network requests, or make authorization decisions. The application and server own telemetry delivery and security policy.
