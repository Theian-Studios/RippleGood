-- Ripple Good — how many people arrived on a tagged link, alongside how many
-- of them gave.
--
-- ── Counters, not rows ──────────────────────────────────────────────────────
-- One row per tag per day, incremented, rather than one row per visit. Two
-- reasons, and the second is the important one:
--
--   1. Nobody needs visit-level detail to answer "is this link working".
--   2. This function is callable by anon — it has to be, the site is static
--      and the anon key ships in the bundle. Row-per-visit would let anyone
--      with the key fill the table. A counter can be inflated but not grown:
--      the worst case is a wrong number in a cell that already existed.
--
-- Which is the honest caveat on this whole table: visits are a public write
-- and can be spoofed. Donations cannot — those arrive on Every.org's webhook,
-- from Every.org, with a charge id. Trust the gifts; read the visits as an
-- indicator.
--
-- Nothing here identifies anyone: a tag, a date, a count. No id, no address,
-- no session, nothing that survives the visit.

create table if not exists public.referral_visits (
  tag    text   not null,
  day    date   not null,
  visits bigint not null default 0,
  primary key (tag, day)
);

alter table public.referral_visits enable row level security;
revoke all on public.referral_visits from anon, authenticated;

-- The only write anon may make anywhere in this schema.
create or replace function public.record_referral_visit(p_tag text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Same shape the site produces and the webhook re-checks. Silently ignored
  -- rather than raising: a malformed tag is not worth an error page, and an
  -- error here would be a signal to anyone probing the endpoint.
  if p_tag is null or p_tag !~ '^[a-z0-9][a-z0-9_-]{0,31}$' then
    return;
  end if;

  insert into public.referral_visits as v (tag, day, visits)
  values (p_tag, (now() at time zone 'utc')::date, 1)
  on conflict (tag, day) do update set visits = v.visits + 1;
end;
$$;

revoke all on function public.record_referral_visit(text) from public;
grant execute on function public.record_referral_visit(text) to anon, authenticated;

-- One row per tag: arrivals, gifts, and what they came to.
--
-- A full outer join, so a tag shows up whether it has visits without gifts
-- (the link is being clicked and nobody is giving) or gifts without visits
-- (someone gave before the counter existed, or with JavaScript disabled).
-- Both of those are things worth seeing rather than rows worth dropping.
create or replace function public.referral_report()
returns table (
  tag          text,
  visits       bigint,
  gifts        bigint,
  amount_cents bigint
)
language sql
stable
security definer
set search_path = public
as $$
  -- Every column reference below is table-qualified on purpose. The names in
  -- RETURNS TABLE are in scope inside the body, so a bare `tag` or `visits`
  -- here is ambiguous against the output parameter of the same name.
  with v as (
    select rv.tag, sum(rv.visits)::bigint as visits
    from public.referral_visits rv
    group by rv.tag
  ),
  d as (
    select
      de.referrer                               as tag,
      count(*)::bigint                          as gifts,
      coalesce(sum(de.amount_cents), 0)::bigint as amount_cents
    from public.donation_events de
    where de.referrer is not null
    group by de.referrer
  )
  select
    coalesce(v.tag, d.tag)      as tag,
    coalesce(v.visits, 0)       as visits,
    coalesce(d.gifts, 0)        as gifts,
    coalesce(d.amount_cents, 0) as amount_cents
  from v
  full outer join d on v.tag = d.tag
  order by coalesce(v.visits, 0) desc, coalesce(d.amount_cents, 0) desc
$$;

revoke all on function public.referral_report() from public;
grant execute on function public.referral_report() to anon, authenticated;
