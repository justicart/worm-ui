# Signal UI Intent

## Purpose

This repo is a design system playground and component demo app built from a blank Vite project.
The app should function as both a component catalog and a live demo surface for each component.

## Current Stack

- Vite
- React
- TypeScript
- React Router
- Plain CSS with CSS variables

## Product Direction

- The main page is the design system demo shell.
- The left sidebar lists all components, grouped by category.
- Clicking a component in the sidebar updates the right-side demo area.
- Routing is URL-driven with `/components/:componentName`.
- Components that are not implemented yet should still be clickable and should render a shared coming-soon page.
- Keep this file updated as product, structure, or component conventions change.

## Visual Direction

- The system is primarily monochrome.
- Use restrained accent color intentionally rather than broadly.
- Accent color should often appear in interactive states, not as constant decoration.
- The range inspiration is the current visual anchor: a minimal black structural form with selective color on active interaction.
- Avoid generic default UI styling. The design language should feel deliberate and slightly distinctive.
- Prefer reusable color tokens over one-off color literals.
- Maintain both palette tokens and semantic tokens:
  - palette tokens define raw ink, paper, cloud, accent, and shadow values
  - semantic tokens map those values to UI roles like surface, border, text, and track

## Component Conventions

- Start with accessible patterns and standard ARIA behavior.
- Prefer robust custom components over forcing an exact visual style onto native controls when native styling becomes too limiting.
- When possible, form components should be backed by native form elements and real HTML labels rather than button-mimicked semantics.
- For form accessibility, prefer native element semantics first and use ARIA to fill the gaps for custom controls, not to replace semantics native elements already provide.
- Form elements should support both controlled and uncontrolled usage.
- For form APIs, prefer a consistent React convention:
  - controlled: `value` plus change callback
  - uncontrolled: `defaultValue` plus optional change callback
- Keep component APIs predictable so future components follow the same patterns.
- Component demo implementations should live in `src/components/__examples__/`.
- Demo example files should be named `{Component}Example.tsx`.
- Route-level component pages can render those example components rather than owning demo markup directly.

## Range Decisions So Far

- Horizontal only for now.
- Accessible keyboard support is required.
- The range should support both pointer and keyboard interaction.
- The current route is `/components/range`.
- The range demo currently establishes the first version of the design language.
- The range uses a reusable `Input` component for the editable value field.
- The range's numeric field should update the visual control live as the user types valid values, while blur and Enter still act as commit points.
- The range's manual numeric input should be optional via a prop and default to hidden.
- Modified step keys from the range's numeric input, such as `Shift+Arrow`, should use the same animated jump behavior as the focused range control.
- The range cursor should only present grab/drag affordance when the pointer is inside the actual vertical hit zone for the track.
- The range supports an optional string label presented as a standard field label above the control.
- The range should be backed by a native hidden `input[type="range"]` with a real `<label>` association; the custom SVG track remains the visual layer and owns pointer interaction.
- The range supports a disabled state that locks both the track interaction and the inline input.
- The switch is a boolean companion to the range language and should reuse the same contour path logic rather than separate hand-drawn states.
- The switch should render as a wider row with the visible label on the left and a compact right-aligned control on the right; label clicks toggle the control.
- The switch should use the same visual stroke and thumb scale as the range, with boolean endpoints mapped to the true left and right bounds like range `0` and `100`.
- The switch should also use the range's visible-bound stroke trimming so overshoot shapes the endpoints without extending the rendered line past the control bounds.
- The shared contour helper should derive its cubic control points from the hump dimensions rather than fixed offsets, so range and switch both keep clean geometry at different scales.
- The switch can use different local hump width, hump height, and thumb Y-offset values than the range so its compact boolean silhouette stays visually balanced.
- The switch should still use the range's vertical SVG coordinate system: a 56-unit canvas with the center line and viewBox crop derived from that height rather than unrelated fixed Y values.
- The switch control itself should stay very compact horizontally, closer to a small switch silhouette than a mini slider.
- Disabled switch thumb styling should match the range's disabled thumb styling.
- Shared control states like thumb fill, thumb stroke, glow, and halo opacity should be standardized through common CSS variables so range and switch stay visually in sync.

## Working Style For Future Sessions

- Ask questions one at a time when product direction is still being decided.
- Preserve the route-driven catalog structure.
- Treat the catalog definition as the source of truth for sidebar navigation.
- When adding a new component, add it to the catalog and provide either a real demo page or the shared coming-soon page.
- Keep `INTENT.md` updated alongside structural or behavior changes.

## Near-Term Next Steps

- Expand the range page into multiple variants.
- Establish a reusable pattern for component docs sections such as overview, examples, API, and states.
- Add more input components using the same controlled/uncontrolled API convention.
- Follow up with `Progress` and `Meter` as separate, semantically distinct components that can reuse the same contour language.
