-- Ripple Good — where a donor came from, when they arrived on a tagged link.
--
-- Set by ?ref=<slug> on any page (see src/lib/referral.js), carried into
-- Every.org on partner_metadata, and returned on the donation webhook. It is a
-- source label — "garage-sale-center" — not anything about a person, and it
-- keeps the promise the rest of this schema makes: nothing here identifies a
-- donor.
--
-- Nullable, and most rows will be null: it is only ever set for donors who
-- arrived on a link we handed out.

alter table public.donation_events
  add column if not exists referrer text;

create index if not exists donation_events_referrer_idx
  on public.donation_events (referrer)
  where referrer is not null;

-- Totals per source, alongside the existing per-cause totals.
--
-- Read this as a floor, not a total. Only donations routed through Every.org
-- fire the webhook: two causes are direct-only, and every cause page also
-- offers the charity's own donation page as a second route. Gifts made either
-- way reach the charity and never appear here.
create or replace function public.referral_totals()
returns table (referrer text, cause_id text, gifts bigint, amount_cents bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    referrer,
    cause_id,
    count(*)::bigint                       as gifts,
    coalesce(sum(amount_cents), 0)::bigint as amount_cents
  from public.donation_events
  where referrer is not null
  group by referrer, cause_id
  order by referrer, amount_cents desc
$$;

revoke all on function public.referral_totals() from public;
grant execute on function public.referral_totals() to anon, authenticated;
