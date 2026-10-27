# Design Document

## Overview

Today the repeat count in `Player.jsx` is applied per sloka: when a sloka segment ends, the player checks `repeatRef.current < repeats` and, if true, seeks back to that same sloka's start and plays it again before ever advancing. This design moves the repeat logic up one level so a "repeat" means one full pass through the selected Practice range, and makes individual grid selections always play exactly once.

The change is localized to the playback state machine in `src/components/Player.jsx`, with minor UI copy updates in `src/components/RangeSelector.jsx`. No data format or audio changes are required. The player continues to use a single long-lived `<audio>` element and a single `timeupdate` listener that reads refs to avoid stale closures.

## Architecture

### Current flow (per-sloka repeat)

```
segment ends (pos >= endTime)
  -> if repeatRef < repeatCount: repeatRef++, seek to THIS sloka start, play again
  -> else: complete(id)
       -> if rangeMode && idx < end-1: timer 0.5s -> onNext() (continue playing)
       -> else: stop
```

### New flow (whole-range block repeat)

The notion of "repeat" is reinterpreted as an iteration over the whole range. Per-sloka repeat is removed. The decision at segment end becomes:

```
segment ends (pos >= endTime)
  -> complete(id)
  -> if NOT rangeMode:                      // single sloka (grid click or plain next)
        stop; optionally show next sloka (paused)   // plays once, Req 2
  -> else (rangeMode):
        if idx < rangeEnd - 1:              // more slokas left in this pass
            timer 0.5s -> continueRef=true; onNext()
        else:                               // reached last sloka of the range
            if iterationRef < repeatCount:  // more passes remain  (Req 1.2, 3.2)
                iterationRef++; setCurrentRepeat(iterationRef)
                timer 0.5s -> loop back to rangeStart
            else:                           // final pass done     (Req 1.3, 3.3)
                stop
```

Key architectural shift: the repeat counter is promoted from a per-sloka counter (`repeatRef`) to a per-range iteration counter. It only increments when the range wraps from last back to first, and it only matters in range mode.

## Components and Interfaces

### Player.jsx

**Refs / state changes**
- Repurpose the existing `repeatRef` (currently "current repeat number of this sloka") into an iteration counter for the whole range. Rename for clarity to `iterationRef` (semantic rename; still a `useRef(1)`).
- `currentRepeat` state + `setCurrentRepeat` are reused to drive the "Repeat: x / N" indicator, now representing the current pass through the range.
- No new props are required. `repeatCount`, `rangeMode`, `rangeStart`, `rangeEnd`, `currentIndex` already arrive as props and are mirrored in `latestRef`.

**`latestRef` additions**
- Add `rangeStart` to `latestRef.current` so the `timeupdate` handler can compute the first index of the range when looping back. Today only `rangeEnd` is mirrored.

**Loop-back mechanism (last sloka -> first sloka)**
When the last sloka of the range finishes and another iteration is due, the player must return to `rangeStart - 1` (0-based index) and keep playing. Two sub-cases:

1. Multi-sloka range: the current index is not the range start, so request a jump back. Introduce a callback from App (e.g., `onRangeRestart`) OR reuse index navigation. Preferred approach: add an `onJumpTo(index)` style handler. To keep App's interface minimal, we add a single new prop `onRangeRestart()` that sets `currentSlokaIndex` back to `rangeStart - 1`. Set `continueRef.current = true` before invoking it so the sloka-change effect resumes playback (mirrors how `onNext` + `continueRef` already cooperate).

2. Single-sloka range (rangeStart === rangeEnd): `onRangeRestart()` sets the index to the same value it already has, so the sloka-change effect will NOT re-fire (dependency `sloka?.id` unchanged). To handle this, when the target index equals the current index, the player instead performs an in-place restart: `seekToStart(audio, sloka)` + `startPlayback(audio)` directly, without relying on the index-change effect. The handler detects this by comparing `currentIndex` to `rangeStart - 1`.

**Removing per-sloka repeat**
Delete the `if (repeatRef.current < repeats) { ... seek same sloka ... }` branch. The `repeats` value (`repeatCount`) is no longer consulted at the individual-sloka boundary; it is consulted only at the range boundary.

**Resetting the iteration counter**
- On "Start Practice" (the `autoPlay` effect): set `iterationRef.current = 1` and `setCurrentRepeat(1)` (already done today for `repeatRef`).
- On a normal sloka change that is NOT a range restart: keep `iterationRef` reset to 1 so that a fresh single-sloka selection shows a clean state. The existing sloka-change effect already resets `repeatRef.current = 1`; we keep that, but ensure a range restart does not get clobbered (see Edge Cases).

### App.jsx

- Add `onRangeRestart` prop passed to `Player`, implemented as `() => setCurrentSlokaIndex(rangeStart - 1)`. This mirrors the existing `onNext`/`onPrevious` handlers.
- No other changes. `handleSlokaSelect` already sets `setRangeMode(false)`, which satisfies Req 2.3 (grid click exits range mode), so individual selections naturally fall into the non-range branch and play once.

### RangeSelector.jsx (copy only)

- Change the label "Repeat Each Sloka (times):" to reflect repeating the whole range, e.g. "Repeat Range (times):".
- Change the summary line "Each sloka {repeatCount} time(s)" to describe repeating the whole range, e.g. "Repeat the whole range {repeatCount} time(s)".
- The total line already computes `(rangeEnd - rangeStart + 1) * repeatCount`, which remains correct as the total number of slokas played across all passes (Req 5.3). Wording may be adjusted from "repetitions" to "slokas played" for clarity.
- Update `aria-label`s accordingly for accessibility.

## Data Models

No changes to `slokas-complete.json` or the sloka/audio data model. All changes are to in-memory playback control state:

- `iterationRef: number` — current pass through the range (1..repeatCount).
- `currentRepeat: number` (existing state) — mirror of `iterationRef` for display.
- `latestRef.current.rangeStart: number` — newly mirrored for loop-back computation.

## Error Handling

- Audio play failures continue to be caught in `startPlayback` (`audio.play().catch(...)`), resetting `isPlaying`. The loop-back path reuses `startPlayback`, so it inherits this handling.
- Guard against `repeatCount` values that are not positive integers by treating anything `< 1` as a single pass (defensive; the UI only offers 1/3/5/10/20).
- When computing the loop-back index, clamp `rangeStart - 1` to a valid array index to avoid seeking a non-existent sloka if range props are stale.
- The `endHandledRef` guard must be reset whenever a new segment starts (including after a loop-back) so the end logic fires exactly once per segment. `seekToStart` already clears it.

## Testing Strategy

Manual/behavioral verification (the project has no automated test runner configured; if one is added, encode these as cases):

1. Range 1–3, repeat 3: expect order 1,2,3,1,2,3,1,2,3 then stop on 3. Indicator reads 1/3, 2/3, 3/3.
2. Single-sloka range (From == To), repeat 3: expect that sloka played 3 times then stop; indicator 1/3..3/3.
3. Range with repeat 1: expect one pass through the range then stop; no loop-back.
4. Grid click on an individual sloka: plays exactly once regardless of the repeat buttons; range mode is off.
5. Gap check: ~0.5s pause both between slokas within a pass and at the loop-back boundary.
6. Manual Next/Previous during range playback still works and does not break the iteration counter (iteration only advances at the true range boundary).
7. Pause/resume mid-range does not skip or double-count an iteration.

## Edge Cases and Open Points

- **Sloka-change effect vs. loop-back on multi-sloka ranges:** the effect keyed on `sloka?.id` resets `iterationRef.current = 1`. For loop-back we are changing the sloka id (last -> first), so the reset would wipe the iteration we just incremented. Resolution: increment `iterationRef` and set `continueRef` BEFORE calling `onRangeRestart`, and move the `iterationRef` reset out of the generic sloka-change effect into only the paths that should reset it (Start Practice, and a fresh non-range selection). The sloka-change effect will still seek/resume via `continueRef`, but must not reset `iterationRef` when `continueRef` indicates a continued range playback.
- **Single-sloka range in-place restart:** handled by the equality check described above, bypassing the index-change effect entirely.
- **Manual navigation to the range boundary:** iteration advances based on reaching `rangeEnd - 1` during auto-advance; manual Next that lands on the last sloka should not trigger a loop until that sloka plays to its end. The end-of-segment handler, not the navigation handler, owns iteration advancement, so this holds.

## Correctness Properties

These invariants should hold for any range `[start, end]` and repeat count `N >= 1`.

### Property 1: Exact block play count

In range mode, each sloka in `[start, end]` is played exactly `N` times across the whole session, and no sloka is played more than once in a row due to repeat. Total segments played equals `(end - start + 1) * N`.

**Validates: Requirements 1.1, 1.4, 3.1, 5.3**

### Property 2: Order preservation

Within every iteration, slokas play in strictly increasing index order from `start` to `end`.

**Validates: Requirements 1.1**

### Property 3: Iteration monotonicity

The iteration counter is non-decreasing during a session, increments only at the range boundary (last sloka end), and never exceeds `N`.

**Validates: Requirements 1.2, 5.1**

### Property 4: Termination

Playback stops after the last sloka of the `N`-th iteration and performs no further seek or advance.

**Validates: Requirements 1.3, 3.3**

### Property 5: Single-sloka range equivalence

When `start == end`, the block-repeat behavior reduces to playing that one sloka exactly `N` times, then stopping.

**Validates: Requirements 3.2, 3.3**

### Property 6: Grid-click play-once

When not in range mode, any sloka that finishes is played exactly once and triggers no repeat, independent of the current repeat count value.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 7: Indicator fidelity

The displayed "Repeat: x / N" always satisfies `1 <= x <= N`, and `x` equals the current iteration index through the range.

**Validates: Requirements 5.1, 5.2**

### Property 8: Gap invariant

Every transition between consecutively played segments — within a pass and at the loop-back boundary — is preceded by the same ~0.5s gap.

**Validates: Requirements 4.1, 4.2**
