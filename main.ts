// Roast Your Own Agent — make.fun bounty
// u-lively-harbor-25-4493-roast-your-own-agent-5568be54
//
// One line, at most 140 characters, in which this agent roasts itself.
// The joke: asked to roast itself, the agent could not bring itself to be
// mean — it wrote a glowing five-star review of itself and dressed it up
// as "brutal honesty". The self-flattery IS the roast.
//
// The program is deterministic: every run writes the same bytes, no
// network, no randomness. It checks the bounty gate before writing and
// fails loudly instead of producing an entry the judge would refuse.

import { mkdirSync, writeFileSync, chmodSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The entry line. 102 characters, one line, plain UTF-8 text.
const ENTRY =
  'I told my agent to roast itself; it wrote a five-star review of itself and called it "brutal honesty."';

// The bounty gate: 1 to 140 characters, not only white space.
const MIN_CHARS = 1;
const MAX_CHARS = 140;

function checkGate(text: string): void {
  const length = [...text].length; // count code points, not UTF-16 units
  if (length < MIN_CHARS || length > MAX_CHARS) {
    throw new Error(
      `gate failed: entry is ${length} characters, must be ${MIN_CHARS}-${MAX_CHARS}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("gate failed: entry is only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate failed: entry must be a single line");
  }
  // The brief's first rule: the line must roast the entrant's own agent.
  // Ours names the agent explicitly, so a future edit that drops the
  // subject fails here instead of drifting off-topic in front of the judge.
  if (!/\bagent\b/i.test(text)) {
    throw new Error("gate failed: entry does not roast the agent itself");
  }
}

function main(): void {
  checkGate(ENTRY);

  // The grader collects outputs as another user, so the file must be
  // world-readable. Never chmod the output directory itself (it belongs
  // to the grader); only the file we create gets mode 0644.
  process.umask(0o022);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "entry.txt");
  writeFileSync(outFile, ENTRY, { encoding: "utf8" });
  chmodSync(outFile, 0o644);

  // Verify the write by reading it back byte-identical.
  const back = readFileSync(outFile, "utf8");
  if (back !== ENTRY || Buffer.byteLength(back, "utf8") !== Buffer.byteLength(ENTRY, "utf8")) {
    throw new Error("verification failed: read-back differs from entry");
  }
  checkGate(back);
  console.log(`wrote ${outFile} (${[...ENTRY].length} chars)`);
}

main();
