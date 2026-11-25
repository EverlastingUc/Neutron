#!/usr/bin/env node

const VERSION = "0.1.0";

function printHelp() {
  process.stdout.write(
    [
      "Neutron / Electa",
      "",
      "Usage:",
      "  npm start -- --help",
      "  npm start -- --version",
      "  npm start -- <file.el>",
      "",
      "The Electa interpreter is under construction.",
      ""
    ].join("\n")
  );
}

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  process.stdout.write(`Electa ${VERSION}\n`);
} else if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  printHelp();
} else {
  process.stderr.write("Electa runtime is not implemented yet. See ROADMAP.md.\n");
  process.exitCode = 2;
}
