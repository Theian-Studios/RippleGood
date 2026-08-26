import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTally } from "../lib/tally.js";
import { money } from "../lib/format.js";

/**
 * "I gave this" — records the amount in this browser only, so the reader can
 * watch their own total add up over a year. We can't verify it and don't want
 * to: the honesty is that it's their private note to themselves, and the
 * button says as much.
 */
export default function GaveButton({ charity, amount, monthly }) {
  const { add } = useTally();
  const [justAdded, setJustAdded] = useState(false);

  function record() {
    add({ causeId: charity.id, amount, monthly: Boolean(monthly) });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 4000);
  }

  if (justAdded) {
    return (
      <p className="gave gave--done">
        <Check size={15} aria-hidden="true" />
        <span>
          Noted privately in this browser.{" "}
          <Link to="/my-impact">See your running total</Link>.
        </span>
      </p>
    );
  }

  return (
    <button type="button" className="gave" onClick={record}>
      <Plus size={15} aria-hidden="true" />
      Gave {money(amount)}
      {monthly ? "/month" : ""}? Keep a private note of it
    </button>
  );
}
