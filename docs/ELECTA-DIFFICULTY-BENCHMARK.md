# Electa Difficulty Benchmark Protocol

## Purpose

Electa's design target is to be unusually difficult to program in. The project does **not** currently claim that it is harder than Malbolge or any other language. Difficulty is an empirical question and must be evaluated with independent participants.

## Challenge construction

1. Publish a versioned challenge set with exact source, input, fuel, and expected output.
2. Include tasks that separately exercise stateful decoding, both tapes, pointer wraparound, conditional jumps, byte I/O, and combined programs.
3. Keep starter/conformance fixtures separate from scored puzzle challenges. A conformance test checks correctness; it does not measure problem-solving difficulty.
4. Freeze each benchmark set before a study begins. Do not change a task after participants have started.

## Study design

For a meaningful comparison with Malbolge:

- Recruit the same participant pool for both languages, preferably with comparable prior experience.
- Provide equivalent documentation, task difficulty targets, time limits, and access to reference tools.
- Randomize language order and task order to reduce learning and fatigue effects.
- Do not give one language a compiler, debugger, or reference interpreter that the other language lacks.
- Record prior experience, completion time, number of attempts, hints used, and whether the final program passes the same test oracle.
- Report every participant and task count, including failures and withdrawals; do not report only successful attempts.

## Metrics

Primary metrics:

- **Solve rate:** fraction of participants completing a task within the fixed time limit.
- **Median solve time:** among successful attempts, with unsuccessful attempts reported separately as censored at the time limit.
- **Attempt count:** distinct submitted programs before the first passing solution.
- **Hint burden:** number and level of hints required.

Secondary metrics may include source length, debugging iterations, and participant-rated cognitive load. These are descriptive and should not replace objective completion data.

## Reporting standard

Publish the challenge version, participant count, participant experience profile, time limits, tool access, raw anonymized outcome table, and analysis method. Include uncertainty intervals where appropriate. Avoid a single universal “difficulty score” unless its construction is justified and validated.

## Current status

The repository contains five starter fixtures in `challenges/starter/` and an automated manifest-driven conformance test. No independent participant study has been run. Therefore, comparative difficulty claims remain unverified.
