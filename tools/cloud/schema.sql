-- FAND accounts and campaigns, for a Supabase project.
-- Paste this whole file into the project's SQL Editor and run it once. It is safe to run again after an update.
--
-- user_data            each account's own saved data (the site's localStorage keys), one row per key
-- campaigns            a DM's campaign and its invite code
-- campaign_members     who is in each campaign, as 'dm' or 'player'
-- campaign_characters  the characters shared with a campaign: every member can read them, the owner and the DM can change them
--
-- The site never writes campaigns, members, or characters directly: the fand_* functions below check who is asking
-- and do the change. Row-level security keeps every row readable only by its owner or by members of its campaign.

-- ── your own saved data ──────────────────────────────────────────
create table if not exists public.user_data (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key text not null check (char_length(key) between 1 and 64),
  value jsonb,
  ts bigint not null default 0,                -- when the browser last changed this key (ms); the newest change wins
  updated_at timestamptz not null default now(),
  primary key (user_id, key),
  check (value is null or octet_length(value::text) < 4000000)
);
alter table public.user_data enable row level security;
drop policy if exists "own data" on public.user_data;
create policy "own data" on public.user_data for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.user_data from anon;
grant select, insert, update, delete on public.user_data to authenticated;

-- ── campaigns ────────────────────────────────────────────────────
-- invite codes: 8 characters from an alphabet without look-alikes (no 0/O, 1/I/L)
create or replace function public.fand_code() returns text language plpgsql volatile set search_path = '' as $$
declare a constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; b bytea := uuid_send(gen_random_uuid()); s text := ''; i int;
begin
  for i in 0..7 loop s := s || substr(a, 1 + get_byte(b, i) % length(a), 1); end loop;
  return s;
end $$;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  dm uuid not null references auth.users (id) on delete cascade,
  invite text not null unique default public.fand_code(),
  created_at timestamptz not null default now()
);
create table if not exists public.campaign_members (
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 60),
  role text not null default 'player' check (role in ('dm', 'player')),
  joined_at timestamptz not null default now(),
  primary key (campaign_id, user_id)
);
create table if not exists public.campaign_characters (
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  id text not null check (id ~ '^[A-Za-z0-9_-]{1,40}$'),   -- plain ids only: the site puts them in its pages
  owner uuid not null references auth.users (id) on delete cascade,
  data jsonb not null check (octet_length(data::text) < 1000000),
  updated_at timestamptz not null default now(),
  primary key (campaign_id, id)
);
create index if not exists campaign_members_user on public.campaign_members (user_id);
create index if not exists campaigns_dm on public.campaigns (dm);
create index if not exists campaign_characters_owner on public.campaign_characters (owner);

-- membership checks used by the policies (security definer, so a policy can look at campaign_members without recursion).
-- They live in a schema the API doesn't expose, and only answer for the person asking.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
create or replace function private.fand_is_member(c uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.campaign_members m where m.campaign_id = c and m.user_id = (select auth.uid()))
$$;
create or replace function private.fand_is_dm(c uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.campaigns k where k.id = c and k.dm = (select auth.uid()))
$$;
revoke execute on function private.fand_is_member(uuid), private.fand_is_dm(uuid) from public, anon;
grant execute on function private.fand_is_member(uuid), private.fand_is_dm(uuid) to authenticated;
-- earlier versions of this file kept them in public: the policies below are recreated to use the private ones first

alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.campaign_characters enable row level security;

drop policy if exists "members read" on public.campaigns;
drop policy if exists "dm deletes" on public.campaigns;
create policy "members read" on public.campaigns for select to authenticated using (private.fand_is_member(id));
create policy "dm deletes" on public.campaigns for delete to authenticated using (dm = (select auth.uid()));

drop policy if exists "members read" on public.campaign_members;
drop policy if exists "leave or remove" on public.campaign_members;
create policy "members read" on public.campaign_members for select to authenticated using (private.fand_is_member(campaign_id));
-- a player can leave; the DM can remove anyone but themself (a DM ends a campaign by deleting it)
create policy "leave or remove" on public.campaign_members for delete to authenticated
  using ((user_id = (select auth.uid()) and role <> 'dm') or (private.fand_is_dm(campaign_id) and user_id <> (select auth.uid())));

drop policy if exists "members read" on public.campaign_characters;
drop policy if exists "owner or dm deletes" on public.campaign_characters;
create policy "members read" on public.campaign_characters for select to authenticated using (private.fand_is_member(campaign_id));
create policy "owner or dm deletes" on public.campaign_characters for delete to authenticated
  using (owner = (select auth.uid()) or private.fand_is_dm(campaign_id));

revoke all on public.campaigns, public.campaign_members, public.campaign_characters from anon;
revoke insert, update on public.campaigns, public.campaign_members, public.campaign_characters from authenticated;
grant select, delete on public.campaigns, public.campaign_members, public.campaign_characters to authenticated;

-- someone who leaves (or is removed) takes their characters out of the campaign
create or replace function public.fand_member_gone() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.campaign_characters where campaign_id = old.campaign_id and owner = old.user_id;
  return old;
end $$;
drop trigger if exists fand_member_gone on public.campaign_members;
create trigger fand_member_gone after delete on public.campaign_members for each row execute function public.fand_member_gone();

-- ── what the site calls ──────────────────────────────────────────
create or replace function public.fand_me() returns uuid language plpgsql stable set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  return auth.uid();
end $$;

-- start a campaign: the caller becomes its DM
create or replace function public.fand_create_campaign(p_name text, p_me text) returns public.campaigns
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.fand_me(); r public.campaigns;
begin
  insert into public.campaigns (name, dm) values (left(trim(p_name), 80), me) returning * into r;
  insert into public.campaign_members (campaign_id, user_id, name, role) values (r.id, me, left(trim(coalesce(p_me, '')), 60), 'dm');
  return r;
end $$;

-- join with an invite code (joining again only updates your name)
create or replace function public.fand_join_campaign(p_code text, p_me text) returns public.campaigns
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.fand_me(); r public.campaigns;
begin
  select * into r from public.campaigns where invite = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then raise exception 'No campaign has that invite code.'; end if;
  insert into public.campaign_members (campaign_id, user_id, name) values (r.id, me, left(trim(coalesce(p_me, '')), 60))
    on conflict (campaign_id, user_id) do update set name = excluded.name;
  return r;
end $$;

-- the DM: a new invite code (the old one stops working), or a new name
create or replace function public.fand_new_invite(p_campaign uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare c text;
begin
  perform public.fand_me();
  update public.campaigns set invite = public.fand_code() where id = p_campaign and dm = auth.uid() returning invite into c;
  if c is null then raise exception 'Only the DM can do that.'; end if;
  return c;
end $$;
create or replace function public.fand_rename_campaign(p_campaign uuid, p_name text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.fand_me();
  update public.campaigns set name = left(trim(p_name), 80) where id = p_campaign and dm = auth.uid();
  if not found then raise exception 'Only the DM can do that.'; end if;
end $$;

-- your name in every campaign you are in
create or replace function public.fand_set_name(p_me text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.campaign_members set name = left(trim(coalesce(p_me, '')), 60) where user_id = public.fand_me();
end $$;

-- share or update a character: a member adds their own; afterwards only its owner or the DM can change it
create or replace function public.fand_save_character(p_campaign uuid, p_id text, p_data jsonb) returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.fand_me(); t timestamptz;
begin
  if not private.fand_is_member(p_campaign) then raise exception 'You are not in that campaign.'; end if;
  insert into public.campaign_characters as c (campaign_id, id, owner, data) values (p_campaign, p_id, me, p_data)
    on conflict (campaign_id, id) do update set data = excluded.data, updated_at = now()
    where c.owner = me or private.fand_is_dm(p_campaign)
    returning c.updated_at into t;
  if t is null then raise exception 'Only the character''s owner or the DM can change it.'; end if;
  return t;
end $$;

revoke execute on function public.fand_create_campaign(text, text), public.fand_join_campaign(text, text), public.fand_new_invite(uuid),
  public.fand_rename_campaign(uuid, text), public.fand_set_name(text), public.fand_save_character(uuid, text, jsonb) from public, anon;
grant execute on function public.fand_create_campaign(text, text), public.fand_join_campaign(text, text), public.fand_new_invite(uuid),
  public.fand_rename_campaign(uuid, text), public.fand_set_name(text), public.fand_save_character(uuid, text, jsonb) to authenticated;
revoke execute on function public.fand_member_gone() from public, anon, authenticated;

drop function if exists public.fand_is_member(uuid);
drop function if exists public.fand_is_dm(uuid);

-- ── profile pictures ─────────────────────────────────────────────
-- A small square picture (a data: URL the browser makes, about 10-30 KB). You see your own; members of a campaign
-- see each other's. The site sets it only through fand_set_avatar, which accepts nothing but a plain image.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  avatar text check (avatar is null or (octet_length(avatar) < 200000 and avatar ~ '^data:image/(webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$')),
  updated_at timestamptz not null default now()
);
create or replace function private.fand_shares_campaign(u uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.campaign_members a join public.campaign_members b on a.campaign_id = b.campaign_id
    where a.user_id = (select auth.uid()) and b.user_id = u)
$$;
revoke execute on function private.fand_shares_campaign(uuid) from public, anon;
grant execute on function private.fand_shares_campaign(uuid) to authenticated;
alter table public.profiles enable row level security;
drop policy if exists "self or fellow members read" on public.profiles;
create policy "self or fellow members read" on public.profiles for select to authenticated
  using (user_id = (select auth.uid()) or private.fand_shares_campaign(user_id));
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
create or replace function public.fand_set_avatar(p_avatar text) returns void
language plpgsql security definer set search_path = '' as $$
declare me uuid := public.fand_me();
begin
  if p_avatar is not null and (octet_length(p_avatar) >= 200000 or p_avatar !~ '^data:image/(webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$') then
    raise exception 'That picture can''t be used. Try a smaller JPEG, PNG, or WebP image.';
  end if;
  insert into public.profiles (user_id, avatar) values (me, p_avatar)
    on conflict (user_id) do update set avatar = excluded.avatar, updated_at = now();
end $$;
revoke execute on function public.fand_set_avatar(text) from public, anon;
grant execute on function public.fand_set_avatar(text) to authenticated;

-- live updates: the party page hears about characters and members as they change
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'campaign_characters') then
      alter publication supabase_realtime add table public.campaign_characters;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'campaign_members') then
      alter publication supabase_realtime add table public.campaign_members;
    end if;
  end if;
end $$;
