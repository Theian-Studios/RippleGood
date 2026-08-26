import { useRef, useState } from "react";
import { Download, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import HonorCard from "../components/HonorCard.jsx";
import { charities, getCharityById } from "../data/charities.js";
import { approxOutcome, money } from "../lib/format.js";
import { usePageMeta } from "../lib/usePageMeta.js";

const OCCASIONS = [
  "In honor of",
  "In memory of",
  "Happy birthday",
  "Thank you",
  "Merry Christmas",
  "Congratulations",
];

export default function Honor() {
  usePageMeta(
    "Give in someone's name",
    "Make a card for a gift given in someone's honor — the outcome it funded, their name on it, yours at the bottom.",
  );

  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [honoree, setHonoree] = useState("");
  const [from, setFrom] = useState("");
  const [causeId, setCauseId] = useState(charities[0].id);
  const [amountText, setAmountText] = useState("50");

  const canvasRef = useRef(null);
  const charity = getCharityById(causeId);

  const parsed = Math.floor(Number(amountText));
  const amount = Number.isFinite(parsed) && parsed >= 1 ? parsed : null;

  // Falls back to the cause's headline for causes with no per-dollar figure,
  // so the card never invents a quantity we haven't verified.
  const outcome =
    (amount !== null && approxOutcome(amount, charity.custom)) || charity.headline;

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    const who = (honoree || "ripple").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.download = `ripple-${who}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <>
      <section className="pageHead">
        <div className="wrap wrap--narrow">
          <p className="eyebrow">In someone's name</p>
          <h1>
            A gift that's <span className="mark">already been given.</span>
          </h1>
          <p>
            Birthdays, memorials, thank-yous — make a card that says what the gift
            actually did, then give on the charity's site as usual. Most of them let
            you add a dedication at checkout.
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap wrap--narrow">
          <div className="give">
            <div className="honorForm">
              <div className="field">
                <label className="customAmount__label" htmlFor="occasion">
                  Occasion
                </label>
                <select
                  id="occasion"
                  className="field__control"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                >
                  {OCCASIONS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="customAmount__label" htmlFor="honoree">
                  Their name
                </label>
                <input
                  id="honoree"
                  className="field__control"
                  type="text"
                  maxLength={40}
                  placeholder="Ruth"
                  value={honoree}
                  onChange={(e) => setHonoree(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="customAmount__label" htmlFor="cause">
                  Cause
                </label>
                <select
                  id="cause"
                  className="field__control"
                  value={causeId}
                  onChange={(e) => setCauseId(e.target.value)}
                >
                  {charities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="customAmount__label" htmlFor="honor-amount">
                  Amount
                </label>
                <input
                  id="honor-amount"
                  className="field__control"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={amountText}
                  onChange={(e) => setAmountText(e.target.value)}
                />
              </div>

              <div className="field field--wide">
                <label className="customAmount__label" htmlFor="from">
                  From (optional)
                </label>
                <input
                  id="from"
                  className="field__control"
                  type="text"
                  maxLength={40}
                  placeholder="Ian"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
            </div>

            <div className="honorPreview">
              <HonorCard
                canvasRef={canvasRef}
                card={{
                  occasion,
                  honoree: honoree || "someone you love",
                  charity: charity.name,
                  outcome,
                  from,
                }}
              />
            </div>

            <div className="splitFoot">
              <button type="button" className="btn btn--outline" onClick={download}>
                <Download size={17} aria-hidden="true" />
                Download card
              </button>
              <a
                className="btn btn--primary"
                href={charity.donateUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Gift size={17} aria-hidden="true" />
                Give {amount ? money(amount) : ""} to {charity.name}
              </a>
            </div>
          </div>

          <div className="note" style={{ marginTop: 26 }}>
            <span>
              <strong>The card doesn't send the money.</strong> Make the donation on{" "}
              <Link to={`/cause/${charity.id}`}>{charity.name}'s page</Link> the way
              you normally would — adding the dedication there if they offer it — and
              use this card to tell the person. Nothing you type here leaves your
              browser.
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
