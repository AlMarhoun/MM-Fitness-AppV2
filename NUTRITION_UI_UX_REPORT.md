# Nutrition UI / UX Report

## Direction

The screen follows Performance Instrument V3 as a compact Fueling Cockpit:

1. Selected date and day type.
2. Daily calorie and macro command surface.
3. Macro calorie-distribution pie.
4. Remaining-today instrument.
5. Meals, snacks, and beverages.
6. Existing adherence and notes.

## Logging Experience

- One sheet handles new and edited entries.
- Saved, Recent, and New Entry modes reduce repeated typing.
- Entry type, name, time, macros, calorie mode, and notes are available.
- Macro calories update live.
- Entering manual calories activates override mode; `Use Macro Calculation` restores automatic mode.
- Saved meals are reusable on any selected date and removable from the library.

## Empty and Over-Target States

- No entries: guidance explains the next action.
- No macros: the chart does not invent a distribution.
- Over target: remaining instruments show a clear, restrained over state.
- Legacy logs: old totals remain visible through an explicit fallback disclosure.

## Responsive Result

Rendered at 320, 360, 375, 390, 414, 430, and 480px. Document width matched viewport width at every size, with no off-screen elements or horizontal scrolling.
