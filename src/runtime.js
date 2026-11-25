const DEFAULT_FUEL = 1_000_000;
const MAX_FUEL = 10_000_000;
const DEFAULT_MAX_INPUT_BYTES = 1024 * 1024;
const MAX_INPUT_BYTES = 16 * 1024 * 1024;
const TAPE_SIZE = 256;

export class ElectaRuntimeError extends Error {
  constructor(message, { code = "E002", line, column, offset } = {}) {
    super(message);
    this.name = "ElectaRuntimeError";
    this.code = code;
    this.line = line;
    this.column = column;
    this.offset = offset;
  }
}

function normalizeInput(input, maxInputBytes) {
  let bytes;
  if (input === undefined) {
    bytes = new Uint8Array(0);
  } else if (input instanceof Uint8Array) {
    if (input.byteLength > maxInputBytes) {
      throw new ElectaRuntimeError("Input exceeds the configured byte limit.", { code: "E004" });
    }
    bytes = new Uint8Array(input);
  } else if (Array.isArray(input)) {
    if (input.length > maxInputBytes) {
      throw new ElectaRuntimeError("Input exceeds the configured byte limit.", { code: "E004" });
    }
    for (let index = 0; index < input.length; index += 1) {
      if (!Object.hasOwn(input, index) ||
          !Number.isInteger(input[index]) ||
          input[index] < 0 ||
          input[index] > 255) {
        throw new TypeError("Electa input arrays must contain only dense integer bytes (0–255).");
      }
    }
    bytes = Uint8Array.from(input);
  } else {
    throw new TypeError("Electa input must be a Uint8Array or an array of bytes.");
  }

  if (bytes.length > maxInputBytes) {
    throw new ElectaRuntimeError("Input exceeds the configured byte limit.", {
      code: "E004"
    });
  }
  return bytes;
}

function validateProgram(program) {
  if (
    program === null ||
    typeof program !== "object" ||
    program.type !== "ElectaProgram" ||
    !Array.isArray(program.symbols) ||
    program.length !== program.symbols.length
  ) {
    throw new TypeError("Electa runtime expects a program returned by parse().");
  }

  for (const symbol of program.symbols) {
    if (!symbol || !Number.isInteger(symbol.value) || symbol.value < 0 || symbol.value > 63) {
      throw new TypeError("Electa program contains an invalid source symbol.");
    }
  }
}

/**
 * Execute a parsed Electa program on the deterministic v1 abstract machine.
 *
 * @param {{ type: "ElectaProgram", symbols: readonly { value: number }[], length: number }} program
 * @param {{ input?: Uint8Array | number[], fuel?: number, maxInputBytes?: number }} options
 * @returns {{ status: "HALTED" | "FUEL", output: Uint8Array, steps: number, eof: boolean, state: object }}
 */
export function execute(program, options = {}) {
  validateProgram(program);
  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("Electa runtime options must be an object.");
  }

  const fuel = options.fuel ?? DEFAULT_FUEL;
  const maxInputBytes = options.maxInputBytes ?? DEFAULT_MAX_INPUT_BYTES;
  if (!Number.isSafeInteger(fuel) || fuel < 0 || fuel > MAX_FUEL) {
    throw new RangeError(`fuel must be an integer from 0 through ${MAX_FUEL}.`);
  }
  if (!Number.isSafeInteger(maxInputBytes) || maxInputBytes < 0 || maxInputBytes > MAX_INPUT_BYTES) {
    throw new RangeError(`maxInputBytes must be an integer from 0 through ${MAX_INPUT_BYTES}.`);
  }

  const input = normalizeInput(options.input, maxInputBytes);
  const data = new Uint8Array(TAPE_SIZE);
  const control = new Uint8Array(TAPE_SIZE);
  const output = [];
  let pc = 0;
  let dp = 0;
  let cp = 0;
  let key = 0;
  let inputPosition = 0;
  let eof = false;
  let steps = 0;
  let status = "HALTED";

  while (pc < program.length) {
    if (steps >= fuel) {
      status = "FUEL";
      break;
    }

    const symbol = program.symbols[pc];
    const opcode = (symbol.value ^ key) & 63;
    let nextPC = pc + 1;
    const cell = data[dp];

    switch (opcode) {
      case 0: // NOP
        break;
      case 1: // INC
        data[dp] = (cell + 1) & 255;
        break;
      case 2: // DEC
        data[dp] = (cell - 1) & 255;
        break;
      case 3: // RIGHT
        dp = (dp + 1) & 255;
        break;
      case 4: // LEFT
        dp = (dp - 1) & 255;
        break;
      case 5: // EMIT
        output.push(cell);
        break;
      case 6: // READ
        if (inputPosition < input.length) {
          data[dp] = input[inputPosition++];
        } else {
          data[dp] = 0;
          eof = true;
        }
        break;
      case 7: // JZ
        if (cell === 0) nextPC = pc + 2 + control[cp];
        break;
      case 8: // JNZ
        if (cell !== 0) nextPC = Math.max(0, pc - 2 - control[cp]);
        break;
      case 9: // CINC
        control[cp] = (control[cp] + 1) & 255;
        break;
      case 10: // CDEC
        control[cp] = (control[cp] - 1) & 255;
        break;
      case 11: // CRIGHT
        cp = (cp + 1) & 255;
        break;
      case 12: // CLEFT
        cp = (cp - 1) & 255;
        break;
      case 13: // MIX
        data[dp] = cell ^ control[cp];
        break;
      case 14: { // ROT
        const shift = control[cp] & 7;
        data[dp] = shift === 0
          ? cell
          : ((cell << shift) | (cell >>> (8 - shift))) & 255;
        break;
      }
      case 15: // HALT
        break;
      default:
        throw new ElectaRuntimeError(`Reserved opcode ${opcode}.`, {
          code: "E002",
          line: symbol.line,
          column: symbol.column,
          offset: symbol.offset
        });
    }

    steps += 1;
    key = (
      (key * 17) +
      opcode +
      data[dp] +
      (dp * 3) +
      (cp * 5) +
      (nextPC & 63)
    ) & 63;
    pc = nextPC;

    if (opcode === 15) {
      status = "HALTED";
      break;
    }
  }

  return {
    status,
    output: Uint8Array.from(output),
    steps,
    eof,
    state: {
      pc,
      dp,
      cp,
      key,
      data: new Uint8Array(data),
      control: new Uint8Array(control)
    }
  };
}
