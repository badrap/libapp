import { type UiNode, element } from "../internal.ts";

type RelativeTimeProps = {
  /**
   * The datetime to display. Must be a valid Date object.
   */
  dateTime: Date;

  /**
   * How to interpret the time relative to now.
   *
   * - "auto": Automatically determine if the time is in the past or future.
   * - "past": Always format as past tense (e.g., "5 minutes ago").
   * - "future": Always format as future tense (e.g., "in 5 minutes").
   *
   * If "past" or "future" is set, datetimes not in the past or future,
   * respectively, are regarded to be happened 0 seconds ago.
   *
   * Default: "auto"
   */
  tense?: "auto" | "past" | "future";
};

/**
 * A component that displays a datetime as human-readable relative time
 * (e.g., "5 minutes ago", "in 3 hours") with automatic updates.
 *
 * Hovering shows a tooltip with the absolute date/time.
 *
 * @example
 * ```tsx
 * <RelativeTime dateTime="2024-01-01T12:00:00Z" />
 * <RelativeTime dateTime={new Date()} tense="past" />
 * ```
 */
export function RelativeTime(props: RelativeTimeProps): UiNode {
  return element("ui-relative-time", {
    dateTime: props.dateTime.toISOString(),
    tense: props.tense,
  });
}
