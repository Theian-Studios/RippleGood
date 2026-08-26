import {
  Baby,
  Bird,
  Brain,
  HandCoins,
  HeartHandshake,
  MoonStar,
  Pill,
  Wind,
  Worm,
} from "lucide-react";

/**
 * charities.js names its icon as a string so the data file stays free of
 * imports. Adding a cause means adding its icon here too; anything unmapped
 * falls back rather than crashing the page.
 */
const registry = { Baby, Bird, Brain, HandCoins, MoonStar, Pill, Wind, Worm };

export function iconFor(name) {
  return registry[name] || HeartHandshake;
}
