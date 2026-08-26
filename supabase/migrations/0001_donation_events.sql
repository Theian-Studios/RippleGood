-- Ripple Good — verified donation events from the Every.org partner webhook.
--
-- WHAT IS DELIBERATELY NOT HERE: donor first name, last name, or email.
-- Every.org's webhook payload carries all three when a donor opts to share
-- them. Storing them would pull this project into GDPR/CCPA territory —
-- lawful basis, retention, deletion requests, a processor agreement — and
-- would falsify the promise the site makes on /my-impact and in the README.
-- The absence of those columns is the enforcement: the webhook drops the
-- fields on arrival and the schema gives them nowhere to land.

create table if not exists public.donation_events (
  -- Every.org's charge id. Primary key, because webhooks are delivered more
  -- than once and a repeat delivery must not become a second donation.
  charge_id          text primary key,

  -- Which Ripple Good cause page sent this donor, from partner_metadata.
  -- Nullable: a donation can reach the nonprofit's Every.org page by another
  -- route, and we would rather record it uncategorised than drop it.
  cause_id           text,

  nonprofit_slug     text        not null,
  nonprofit_ein      text,

  -- Integer cents, never floats. Money in floating point drifts.
  amount_cents       bigint      not null check (amount_cents >= 0),
  net_cents          bigint      check (net_cents >= 0),
  currency           text        not null default 'USD',

  frequency          text        not null default 'One-time',
  payment_method     text,
  partner_donation_id text,

  donated_at         timestamptz not null,
  received_at        timestamptz not null default now()
);

create index if not exists donation_events_cause_idx on public.donation_events (cause_id);
create index if not exists donation_events_date_idx  on public.donation_events (donated_at desc);

-- Locked by default. No policies are created for anon or authenticated, so
-- with RLS on, neither can read or write a single row. The Edge Function uses
-- the service role, which bypasses RLS by design.
alter table public.donation_events enable row level security;

revoke all on public.donation_events from anon, authenticated;

-- The only thing the public site can see: totals, never rows.
--
-- A security-definer function rather than a view, so the privilege escalation
-- is explicit, greppable, and returns exactly the shape we intend — a view
-- would silently inherit definer rights and is easy to widen by accident.
create or replace function public.donation_totals()
returns table (cause_id text, gifts bigint, amount_cents bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    cause_id,
    count(*)::bigint                     as gifts,
    coalesce(sum(amount_cents), 0)::bigint as amount_cents
  from public.donation_events
  group by cause_id
$$;

revoke all on function public.donation_totals() from public;
grant execute on function public.donation_totals() to anon, authenticated;
