create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  gender text check (gender is null or gender in ('male', 'female', 'other')),
  age integer check (age is null or (age >= 13 and age <= 120)),
  height_cm numeric check (height_cm is null or (height_cm >= 80 and height_cm <= 260)),
  weight_kg numeric check (weight_kg is null or (weight_kg >= 25 and weight_kg <= 350)),
  selected_goal text,
  selected_program text,
  current_body_type text,
  desired_body_type text,
  nutrition_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weekly_workouts integer not null default 4 check (weekly_workouts between 0 and 14),
  weekly_calories integer not null default 1800 check (weekly_calories between 0 and 20000),
  daily_steps integer not null default 8000 check (daily_steps between 0 and 100000),
  daily_water_ml integer not null default 2500 check (daily_water_ml between 0 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(name) between 1 and 160),
  workout_type text,
  training_plan_id text,
  notes text,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  workout_name text not null check (length(workout_name) between 1 and 160),
  duration_minutes integer not null default 0 check (duration_minutes >= 0 and duration_minutes <= 1440),
  calories integer not null default 0 check (calories >= 0 and calories <= 10000),
  steps integer not null default 0 check (steps >= 0 and steps <= 200000),
  avg_heart_rate integer check (avg_heart_rate is null or (avg_heart_rate between 30 and 230)),
  occurred_at timestamptz not null default now(),
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_id)
);

create table if not exists public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  entry_date timestamptz not null default now(),
  weight_kg numeric check (weight_kg is null or (weight_kg >= 25 and weight_kg <= 350)),
  waist_cm numeric check (waist_cm is null or (waist_cm >= 30 and waist_cm <= 250)),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_id)
);

create table if not exists public.nutrition_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text not null,
  entry_date date not null default current_date,
  meal_type text,
  name text not null check (length(name) between 1 and 160),
  calories integer not null default 0 check (calories >= 0 and calories <= 10000),
  protein_g numeric not null default 0 check (protein_g >= 0 and protein_g <= 1000),
  carbs_g numeric not null default 0 check (carbs_g >= 0 and carbs_g <= 2000),
  fat_g numeric not null default 0 check (fat_g >= 0 and fat_g <= 1000),
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_id)
);

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_goals_updated_at before update on public.goals for each row execute function public.set_updated_at();
create trigger set_workouts_updated_at before update on public.workouts for each row execute function public.set_updated_at();
create trigger set_workout_logs_updated_at before update on public.workout_logs for each row execute function public.set_updated_at();
create trigger set_progress_entries_updated_at before update on public.progress_entries for each row execute function public.set_updated_at();
create trigger set_nutrition_entries_updated_at before update on public.nutrition_entries for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_logs enable row level security;
alter table public.progress_entries enable row level security;
alter table public.nutrition_entries enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

create policy "workouts_select_own" on public.workouts for select using (auth.uid() = user_id);
create policy "workouts_insert_own" on public.workouts for insert with check (auth.uid() = user_id);
create policy "workouts_update_own" on public.workouts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workouts_delete_own" on public.workouts for delete using (auth.uid() = user_id);

create policy "workout_logs_select_own" on public.workout_logs for select using (auth.uid() = user_id);
create policy "workout_logs_insert_own" on public.workout_logs for insert with check (auth.uid() = user_id);
create policy "workout_logs_update_own" on public.workout_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_logs_delete_own" on public.workout_logs for delete using (auth.uid() = user_id);

create policy "progress_entries_select_own" on public.progress_entries for select using (auth.uid() = user_id);
create policy "progress_entries_insert_own" on public.progress_entries for insert with check (auth.uid() = user_id);
create policy "progress_entries_update_own" on public.progress_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_entries_delete_own" on public.progress_entries for delete using (auth.uid() = user_id);

create policy "nutrition_entries_select_own" on public.nutrition_entries for select using (auth.uid() = user_id);
create policy "nutrition_entries_insert_own" on public.nutrition_entries for insert with check (auth.uid() = user_id);
create policy "nutrition_entries_update_own" on public.nutrition_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "nutrition_entries_delete_own" on public.nutrition_entries for delete using (auth.uid() = user_id);
