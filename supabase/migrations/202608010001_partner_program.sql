create extension if not exists pgcrypto;

create table if not exists public.staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'reviewer' check (role in ('reviewer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  real_name text not null check (char_length(real_name) between 2 and 50),
  phone text not null check (phone ~ '^1[3-9][0-9]{9}$'),
  platform text not null check (platform in ('抖音', '快手', '小红书', '视频号')),
  profile_url text not null check (profile_url ~ '^https?://'),
  invite_code_used text,
  source text not null default 'direct',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create unique index if not exists applications_active_phone_idx
  on public.applications (phone)
  where status in ('pending', 'approved');
create index if not exists applications_pending_created_idx
  on public.applications (created_at)
  where status = 'pending';
create index if not exists applications_invite_code_idx
  on public.applications (invite_code_used)
  where invite_code_used is not null;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  application_id uuid not null unique references public.applications(id) on delete restrict,
  real_name text not null,
  phone text not null,
  platform text not null check (platform in ('抖音', '快手', '小红书', '视频号')),
  profile_url text not null,
  invite_code text not null unique,
  invited_by_member_id uuid references public.members(id) on delete set null,
  referral_rewarded_at timestamptz,
  joined_at timestamptz not null default now()
);

create index if not exists members_user_id_idx on public.members (user_id);
create index if not exists members_invited_by_idx on public.members (invited_by_member_id)
  where invited_by_member_id is not null;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  instructions jsonb not null default '[]'::jsonb check (jsonb_typeof(instructions) = 'array'),
  reward_points integer not null default 3 check (reward_points > 0),
  is_active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

create index if not exists tasks_active_window_idx on public.tasks (starts_at, ends_at)
  where is_active = true;

create table if not exists public.task_claims (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete restrict,
  claim_date date not null default current_date,
  status text not null default 'claimed' check (status in ('claimed', 'submitted', 'completed', 'rejected')),
  created_at timestamptz not null default now(),
  unique (member_id, task_id, claim_date)
);

create index if not exists task_claims_member_idx on public.task_claims (member_id, claim_date desc);
create index if not exists task_claims_task_idx on public.task_claims (task_id);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null unique references public.task_claims(id) on delete restrict,
  member_id uuid not null references public.members(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete restrict,
  work_url text not null check (work_url ~ '^https?://'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reward_points integer not null check (reward_points > 0),
  note text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists submissions_member_created_idx on public.submissions (member_id, created_at desc);
create index if not exists submissions_task_idx on public.submissions (task_id);
create index if not exists submissions_pending_created_idx on public.submissions (created_at)
  where status = 'pending';

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  points integer not null check (points <> 0),
  entry_type text not null check (entry_type in ('task_reward', 'referral_reward', 'redemption_hold', 'redemption_refund', 'adjustment')),
  description text not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists ledger_member_created_idx on public.ledger_entries (member_id, created_at desc);
create unique index if not exists ledger_unique_reference_idx
  on public.ledger_entries (entry_type, reference_id)
  where reference_id is not null;

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  points integer not null check (points >= 10),
  amount numeric(10, 2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'rejected')),
  note text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists redemptions_member_created_idx on public.redemptions (member_id, created_at desc);
create index if not exists redemptions_pending_created_idx on public.redemptions (created_at)
  where status = 'pending';

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_users
    where user_id = (select auth.uid())
  );
$$;

create or replace function public.current_member_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.members
  where user_id = (select auth.uid())
  limit 1;
$$;

alter table public.staff_users enable row level security;
alter table public.applications enable row level security;
alter table public.members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_claims enable row level security;
alter table public.submissions enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.redemptions enable row level security;

create policy staff_self_read on public.staff_users for select to authenticated
  using (user_id = (select auth.uid()));
create policy applications_staff_all on public.applications for all to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy members_self_read on public.members for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_staff()));
create policy tasks_member_read on public.tasks for select to authenticated
  using (is_active = true or (select public.is_staff()));
create policy claims_self_read on public.task_claims for select to authenticated
  using (member_id = (select public.current_member_id()) or (select public.is_staff()));
create policy submissions_self_read on public.submissions for select to authenticated
  using (member_id = (select public.current_member_id()) or (select public.is_staff()));
create policy ledger_self_read on public.ledger_entries for select to authenticated
  using (member_id = (select public.current_member_id()) or (select public.is_staff()));
create policy redemptions_self_read on public.redemptions for select to authenticated
  using (member_id = (select public.current_member_id()) or (select public.is_staff()));

create or replace function public.submit_application(
  p_real_name text,
  p_phone text,
  p_platform text,
  p_profile_url text,
  p_invite_code text default null,
  p_source text default 'direct'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if char_length(trim(p_real_name)) not between 2 and 50
    or p_phone !~ '^1[3-9][0-9]{9}$'
    or p_platform not in ('抖音', '快手', '小红书', '视频号')
    or p_profile_url !~ '^https?://'
  then
    raise exception 'invalid application data';
  end if;

  insert into public.applications (
    real_name, phone, platform, profile_url, invite_code_used, source
  ) values (
    trim(p_real_name), p_phone, p_platform, p_profile_url,
    nullif(upper(trim(coalesce(p_invite_code, ''))), ''),
    left(coalesce(p_source, 'direct'), 500)
  ) returning id into v_id;
  return v_id;
exception
  when unique_violation then
    raise exception 'application already exists';
end;
$$;

create or replace function public.claim_task(p_task_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member_id uuid := public.current_member_id();
  v_claim_id uuid;
begin
  if v_member_id is null then raise exception 'member required'; end if;
  if extract(isodow from current_date) > 5 then raise exception 'tasks are available on weekdays'; end if;
  if not exists (
    select 1 from public.tasks
    where id = p_task_id and is_active = true
      and starts_at <= now() and (ends_at is null or ends_at > now())
  ) then raise exception 'task unavailable'; end if;

  insert into public.task_claims (member_id, task_id)
  values (v_member_id, p_task_id)
  returning id into v_claim_id;
  return v_claim_id;
end;
$$;

create or replace function public.link_current_user_to_member()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_phone text := right(coalesce((select auth.jwt() ->> 'phone'), ''), 11);
  v_member_id uuid;
begin
  if v_user_id is null or v_phone !~ '^1[3-9][0-9]{9}$' then
    raise exception 'phone authenticated user required';
  end if;
  update public.members
  set user_id = v_user_id
  where phone = v_phone and (user_id is null or user_id = v_user_id)
  returning id into v_member_id;
  if v_member_id is null then raise exception 'approved member not found'; end if;
  return v_member_id;
end;
$$;

create or replace function public.submit_work(p_claim_id uuid, p_work_url text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_claim public.task_claims%rowtype;
  v_reward integer;
  v_submission_id uuid;
begin
  if p_work_url !~ '^https?://' then raise exception 'invalid work url'; end if;
  select * into v_claim from public.task_claims
  where id = p_claim_id and member_id = public.current_member_id()
  for update;
  if not found or v_claim.status <> 'claimed' then raise exception 'claim unavailable'; end if;
  select reward_points into v_reward from public.tasks where id = v_claim.task_id;

  insert into public.submissions (claim_id, member_id, task_id, work_url, reward_points)
  values (v_claim.id, v_claim.member_id, v_claim.task_id, p_work_url, v_reward)
  returning id into v_submission_id;
  update public.task_claims set status = 'submitted' where id = v_claim.id;
  return v_submission_id;
end;
$$;

create or replace function public.request_redemption(p_points integer)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member_id uuid := public.current_member_id();
  v_balance bigint;
  v_redemption_id uuid;
begin
  if v_member_id is null then raise exception 'member required'; end if;
  if p_points < 10 then raise exception 'minimum redemption is 10 points'; end if;
  perform pg_advisory_xact_lock(hashtext(v_member_id::text));
  select coalesce(sum(points), 0) into v_balance
  from public.ledger_entries where member_id = v_member_id;
  if v_balance < p_points then raise exception 'insufficient points'; end if;

  insert into public.redemptions (member_id, points, amount)
  values (v_member_id, p_points, p_points::numeric)
  returning id into v_redemption_id;
  insert into public.ledger_entries (member_id, points, entry_type, description, reference_id)
  values (v_member_id, -p_points, 'redemption_hold', '积分兑换申请', v_redemption_id);
  return v_redemption_id;
end;
$$;

create or replace function public.review_application(
  p_application_id uuid,
  p_approve boolean,
  p_note text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_application public.applications%rowtype;
  v_member_id uuid;
  v_inviter_id uuid;
  v_invite_code text;
begin
  if not public.is_staff() then raise exception 'staff required'; end if;
  select * into v_application from public.applications
  where id = p_application_id for update;
  if not found or v_application.status <> 'pending' then raise exception 'application unavailable'; end if;

  if not p_approve then
    update public.applications
    set status = 'rejected', note = left(coalesce(p_note, ''), 500), reviewed_at = now()
    where id = p_application_id;
    return null;
  end if;

  select id into v_inviter_id from public.members
  where invite_code = v_application.invite_code_used;
  loop
    v_invite_code := 'BFY' || right(v_application.phone, 4) || upper(substr(md5(random()::text), 1, 2));
    exit when not exists (select 1 from public.members where invite_code = v_invite_code);
  end loop;

  insert into public.members (
    application_id, real_name, phone, platform, profile_url, invite_code, invited_by_member_id
  ) values (
    v_application.id, v_application.real_name, v_application.phone,
    v_application.platform, v_application.profile_url, v_invite_code, v_inviter_id
  ) returning id into v_member_id;
  update public.applications
  set status = 'approved', note = left(coalesce(p_note, ''), 500), reviewed_at = now()
  where id = p_application_id;
  return v_member_id;
end;
$$;

create or replace function public.review_submission(
  p_submission_id uuid,
  p_approve boolean,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_submission public.submissions%rowtype;
  v_member public.members%rowtype;
begin
  if not public.is_staff() then raise exception 'staff required'; end if;
  select * into v_submission from public.submissions
  where id = p_submission_id for update;
  if not found or v_submission.status <> 'pending' then raise exception 'submission unavailable'; end if;

  if not p_approve then
    update public.submissions
    set status = 'rejected', note = left(coalesce(p_note, ''), 500), reviewed_at = now()
    where id = p_submission_id;
    update public.task_claims set status = 'rejected' where id = v_submission.claim_id;
    return;
  end if;

  update public.submissions
  set status = 'approved', note = left(coalesce(p_note, ''), 500), reviewed_at = now()
  where id = p_submission_id;
  update public.task_claims set status = 'completed' where id = v_submission.claim_id;
  insert into public.ledger_entries (member_id, points, entry_type, description, reference_id)
  values (v_submission.member_id, v_submission.reward_points, 'task_reward', '品牌内容发布审核通过', v_submission.id);

  select * into v_member from public.members where id = v_submission.member_id for update;
  if v_member.invited_by_member_id is not null and v_member.referral_rewarded_at is null then
    update public.members set referral_rewarded_at = now()
    where id = v_member.id and referral_rewarded_at is null;
    if found then
      insert into public.ledger_entries (member_id, points, entry_type, description, reference_id)
      values (v_member.invited_by_member_id, 1, 'referral_reward', v_member.real_name || '完成首条有效任务', v_member.id);
    end if;
  end if;
end;
$$;

create or replace function public.review_redemption(
  p_redemption_id uuid,
  p_paid boolean,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_redemption public.redemptions%rowtype;
begin
  if not public.is_staff() then raise exception 'staff required'; end if;
  select * into v_redemption from public.redemptions
  where id = p_redemption_id for update;
  if not found or v_redemption.status <> 'pending' then raise exception 'redemption unavailable'; end if;

  if p_paid then
    update public.redemptions
    set status = 'paid', note = left(coalesce(p_note, ''), 500), reviewed_at = now()
    where id = p_redemption_id;
  else
    update public.redemptions
    set status = 'rejected', note = left(coalesce(p_note, ''), 500), reviewed_at = now()
    where id = p_redemption_id;
    insert into public.ledger_entries (member_id, points, entry_type, description, reference_id)
    values (v_redemption.member_id, v_redemption.points, 'redemption_refund', '兑换未通过，积分退回', v_redemption.id);
  end if;
end;
$$;

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
grant select on public.staff_users, public.members, public.tasks, public.task_claims,
  public.submissions, public.ledger_entries, public.redemptions to authenticated;
grant select, update on public.applications, public.submissions, public.redemptions to authenticated;
grant execute on function public.submit_application(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.claim_task(uuid) to authenticated;
grant execute on function public.link_current_user_to_member() to authenticated;
grant execute on function public.submit_work(uuid, text) to authenticated;
grant execute on function public.request_redemption(integer) to authenticated;
grant execute on function public.review_application(uuid, boolean, text) to authenticated;
grant execute on function public.review_submission(uuid, boolean, text) to authenticated;
grant execute on function public.review_redemption(uuid, boolean, text) to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.current_member_id() to authenticated;
