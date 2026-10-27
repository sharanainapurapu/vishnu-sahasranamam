# Requirements Document

## Introduction

In the Vishnu Sahasranamam learning app, users can select a practice range (e.g., slokas 1–10) and a repeat count, then auto-play the range. Today the repeat count is applied to each sloka individually: the app plays sloka 1 N times, then sloka 2 N times, and so on. This does not match how people practice a set of slokas, where the goal is to recite the whole sequence and then repeat the whole sequence.

This feature changes playback so the repeat count applies to the entire selected range as a block. The app plays the range from first to last sloka once, then repeats the full range for the chosen number of iterations. It also clarifies that repeat only applies to Practice Range playback, while clicking an individual sloka in the "All Slokas" grid plays that sloka exactly once.

## Requirements

### Requirement 1: Repeat the whole range as a block

**User Story:** As a learner practicing a set of slokas, I want the repeat count to replay the entire selected range, so that I rehearse the full sequence in order rather than hearing each sloka repeated back-to-back.

#### Acceptance Criteria

1. WHEN the user starts Practice with a range and a repeat count of N THEN the system SHALL play every sloka in the range in order from the first to the last exactly once per iteration.
2. WHEN one iteration of the range completes (the last sloka in the range finishes) AND the current iteration count is less than N THEN the system SHALL return to the first sloka of the range and begin the next iteration.
3. WHEN the final iteration (iteration N) completes at the last sloka of the range THEN the system SHALL stop playback and SHALL NOT advance or loop further.
4. WHEN playing a range with repeat count N THEN the system SHALL NOT replay any individual sloka consecutively as a result of the repeat count (no per-sloka repetition).

### Requirement 2: Individual sloka selection plays once

**User Story:** As a learner browsing slokas, I want clicking a sloka in the "All Slokas" grid to play it a single time, so that selecting one sloka is a quick listen and not a repeated loop.

#### Acceptance Criteria

1. WHEN the user selects an individual sloka from the "All Slokas" grid THEN the system SHALL play that sloka exactly once.
2. WHEN an individually selected sloka finishes AND it was not started from Practice Range THEN the system SHALL NOT repeat that sloka regardless of the repeat count value.
3. WHEN the user selects an individual sloka from the grid THEN the system SHALL exit range mode so that range-based looping does not apply.

### Requirement 3: Practice Range honors the repeat count, including a single-sloka range

**User Story:** As a learner, I want the repeat count I chose in the Practice Range section to be respected even when my range is a single sloka, so that the control behaves consistently.

#### Acceptance Criteria

1. WHEN the user starts Practice with a range THEN the system SHALL use the repeat count selected in the Practice Range section.
2. WHEN the selected Practice range contains exactly one sloka AND the repeat count is N THEN the system SHALL play that single sloka N times in succession.
3. WHEN the final iteration of a single-sloka Practice range completes THEN the system SHALL stop playback.

### Requirement 4: Gap between iterations

**User Story:** As a learner, I want a brief pause between repetitions of the range, so that the transition back to the first sloka is not abrupt.

#### Acceptance Criteria

1. WHEN the system loops from the last sloka of the range back to the first sloka for the next iteration THEN the system SHALL wait approximately 0.5 seconds before starting the next iteration, matching the existing gap used between slokas.
2. WHEN advancing between slokas within a single iteration THEN the system SHALL continue to use the existing approximately 0.5 second gap.

### Requirement 5: Accurate progress indicators

**User Story:** As a learner, I want the on-screen repeat indicator to reflect which pass through the range I am on, so that I know how many full repetitions remain.

#### Acceptance Criteria

1. WHEN a range is playing with repeat count N THEN the system SHALL display the current iteration number and total (e.g., "Repeat: 2 / 3") representing passes through the whole range, not per-sloka repeats.
2. WHEN the repeat count is 1 THEN the system SHALL present the practice session as a single pass through the range.
3. WHERE the Practice Range section shows a summary of what will play THE system SHALL describe the repeat as repeating the whole range (not "each sloka") and SHALL compute the total as the number of slokas in the range multiplied by the repeat count.

## Glossary

- **Sloka**: A single verse segment of the recitation, defined by a start/end time in the shared audio file.
- **Practice Range**: A user-selected contiguous set of slokas (from the Practice Range section) chosen by a "From" and "To" selector.
- **Range Mode**: The playback state entered by clicking "Start Practice" in the Practice Range section, in which the player auto-advances through the selected range.
- **Iteration (pass)**: One complete play-through of the selected range from its first sloka to its last sloka.
- **Repeat Count (N)**: The number of full iterations of the range to play before stopping.
- **All Slokas grid**: The grid listing every sloka segment; clicking a card selects that single sloka for one-time playback.
