# Implementation Plan

## Overview

This plan converts the playback repeat behavior from per-sloka repetition to whole-range block repetition, makes individual grid selections play exactly once, and updates the Practice Range UI copy. All code changes are in `src/App.jsx`, `src/components/Player.jsx`, and `src/components/RangeSelector.jsx`. No data or audio changes.

## Task Dependency Graph

```
1 (App onRangeRestart)
      \
       -> 2.1 -> 2.2 -> 2.3   (Player: counter -> end-logic -> single-sloka loop-back)
3 (RangeSelector copy)  [independent]
2.3, 3 -> 4 (verify & build)
```

- Task 1 must land before Task 2 (Player depends on the new `onRangeRestart` prop).
- Tasks 2.1 -> 2.2 -> 2.3 are sequential within Player.
- Task 3 is independent and can be done any time before Task 4.
- Task 4 depends on Tasks 2 and 3.

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1", "3"] },
    { "wave": 2, "tasks": ["2.1"] },
    { "wave": 3, "tasks": ["2.2"] },
    { "wave": 4, "tasks": ["2.3"] },
    { "wave": 5, "tasks": ["4"] }
  ]
}
```

## Tasks

- [x] 1. Add range-restart handler in App.jsx
  - Add an `onRangeRestart` callback implemented as `() => setCurrentSlokaIndex(rangeStart - 1)` and pass it to `Player`.
  - Verify `handleSlokaSelect` still sets `rangeMode = false` so grid clicks play once.
  - _Requirements: 1.2, 2.3, 3.2_

- [x] 2. Convert per-sloka repeat into whole-range block repeat in Player.jsx
  - [x] 2.1 Promote the repeat counter to a range iteration counter
    - Rename/repurpose `repeatRef` to `iterationRef` (semantics: current pass through the range) and keep driving `currentRepeat`/`setCurrentRepeat` for the indicator.
    - Add `rangeStart` and `onRangeRestart` to `latestRef.current` so the `timeupdate` handler can loop back.
    - Ensure `iterationRef` resets to 1 only on Start Practice and on a fresh non-range selection, not during a range loop-back.
    - _Requirements: 1.1, 5.1, 5.2_
  - [x] 2.2 Replace the end-of-segment decision logic
    - Remove the per-sloka repeat branch (`if (repeatRef.current < repeats) { seek same sloka }`).
    - In range mode: if `idx < rangeEnd - 1`, advance with the existing 0.5s gap (continue playing). If at the last sloka of the range and `iterationRef < repeatCount`, increment the iteration, set `continueRef`, and loop back after a 0.5s gap; otherwise stop.
    - Not in range mode: stop after one play (optionally surface the next sloka paused, as today).
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 4.1, 4.2_
  - [x] 2.3 Handle the single-sloka range loop-back
    - When the loop-back target index equals the current index (start == end), perform an in-place `seekToStart` + `startPlayback` instead of relying on the index-change effect.
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Update RangeSelector.jsx copy and accessibility labels
  - Change the "Repeat Each Sloka (times):" label and the "Each sloka N times" summary to describe repeating the whole range; adjust `aria-label`s to match.
  - Keep the total calculation `(rangeEnd - rangeStart + 1) * repeatCount`.
  - _Requirements: 5.3_

- [x] 4. Verify behavior and build
  - Run the project build/lint to confirm no errors.
  - Manually verify the scenarios in the design Testing Strategy (block order, single-sloka range, repeat=1, grid click plays once, 0.5s gaps, manual nav, pause/resume).
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.2, 4.1, 5.1_

## Notes

- No automated test runner is configured in this project; Task 4 relies on the build/lint plus manual verification.
- The trickiest part is Task 2.1's rule that the sloka-change effect must not reset the iteration counter during a loop-back (driven by `continueRef`).
- UI copy changes (Task 3) are intentional per Requirement 5.3; they do not affect the total-count math.
