import CauseIcon, { causeIconNames } from "../components/CauseIcon.jsx";

/**
 * charities.js names its icon as a string so the data file stays free of
 * imports. The names are the drawings in CauseIcon.jsx; an unmapped name
 * falls back to the first one rather than crashing the page.
 *
 * Returns a component with the same props the interface icons take (size,
 * strokeWidth, aria-hidden), so call sites don't care which set drew it.
 */
export function iconFor(name) {
  const key = causeIconNames.includes(name) ? name : causeIconNames[0];
  return function Icon(props) {
    return <CauseIcon name={key} {...props} />;
  };
}
