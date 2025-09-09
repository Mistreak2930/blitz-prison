-- Enable required extensions
create extension if not exists pgcrypto with schema public;

-- Enums
create type public.app_role as enum ('admin','moderator','user','dev','news_updater','announcements_manager');
create type public.chat_type as enum ('direct','group');
create type public.chat_request_status as enum ('pending','accepted','declined');
create type public.post_reaction_type as enum ('like','helpful','funny','love');
create type public.message_type as enum ('text','image','file','system');

-- Utility function to update updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Function to check if a user has a role (used by RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- Function to check if a user is a participant in a conversation
create or replace function public.is_participant(_conversation_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.chat_participants cp
    where cp.conversation_id = _conversation_id
      and cp.user_id = _user_id
  );
$$;

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null,
  avatar_url text,
  bio text,
  location text,
  website text,
  minecraft_username text,
  discord_username text,
  last_seen timestamptz not null default now(),
  post_count integer not null default 0,
  reputation integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Allow public read, users can insert their own and update their own
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: create profile on new auth.user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, username)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'username',''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- User roles
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create trigger update_user_roles_updated_at
before update on public.user_roles
for each row execute function public.update_updated_at_column();

create policy "Anyone authenticated can read user roles"
  on public.user_roles for select to authenticated using (true);

create policy "Only admins can insert roles"
  on public.user_roles for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete roles"
  on public.user_roles for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Announcements
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create trigger update_announcements_updated_at
before update on public.announcements
for each row execute function public.update_updated_at_column();

create policy "Announcements are viewable by everyone"
  on public.announcements for select using (true);

create policy "Admins or announcement managers can insert"
  on public.announcements for insert to authenticated
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'announcements_manager'));

create policy "Admins or announcement managers can update"
  on public.announcements for update to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'announcements_manager'))
  with check (auth.uid() = user_id or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'announcements_manager'));

create policy "Admins or announcement managers can delete"
  on public.announcements for delete to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'announcements_manager'));

-- News
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news enable row level security;

create trigger update_news_updated_at
before update on public.news
for each row execute function public.update_updated_at_column();

create policy "News are viewable by everyone"
  on public.news for select using (true);

create policy "Admins or news updaters can insert"
  on public.news for insert to authenticated
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'news_updater'));

create policy "Admins or news updaters can update"
  on public.news for update to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'news_updater'))
  with check (auth.uid() = user_id or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'news_updater'));

create policy "Admins or news updaters can delete"
  on public.news for delete to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'news_updater'));

-- Forum posts
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  category_id integer not null,
  title text not null,
  content text not null,
  views integer not null default 0,
  likes integer not null default 0,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.forum_posts enable row level security;

create trigger update_forum_posts_updated_at
before update on public.forum_posts
for each row execute function public.update_updated_at_column();

create policy "Forum posts are viewable by everyone"
  on public.forum_posts for select using (true);

create policy "Users can create their own forum posts"
  on public.forum_posts for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Owners or staff can update forum posts"
  on public.forum_posts for update to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'moderator'))
  with check (auth.uid() = user_id or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'moderator'));

create policy "Owners or staff can delete forum posts"
  on public.forum_posts for delete to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'moderator'));

-- Post reactions
create table if not exists public.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type public.post_reaction_type not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id, reaction_type)
);

alter table public.post_reactions enable row level security;

create policy "Reactions are viewable by everyone"
  on public.post_reactions for select using (true);

create policy "Users can add reactions"
  on public.post_reactions for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove their reactions"
  on public.post_reactions for delete to authenticated
  using (auth.uid() = user_id);

-- Private messages
create table if not exists public.private_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  subject text,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.private_messages enable row level security;

create trigger update_private_messages_updated_at
before update on public.private_messages
for each row execute function public.update_updated_at_column();

create policy "Participants can view messages"
  on public.private_messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Senders can create messages"
  on public.private_messages for insert to authenticated
  with check (auth.uid() = sender_id);

create policy "Recipients can mark messages"
  on public.private_messages for update to authenticated
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- Moderation logs
create table if not exists public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid references auth.users(id) on delete set null,
  action_type text not null,
  reason text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.moderation_logs enable row level security;

create policy "Staff can view moderation logs"
  on public.moderation_logs for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'moderator'));

create policy "Staff can insert moderation logs"
  on public.moderation_logs for insert to authenticated
  with check ((auth.uid() = moderator_id) and (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'moderator')));

-- Chat conversations
create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  name text,
  type public.chat_type not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_conversations enable row level security;

create trigger update_chat_conversations_updated_at
before update on public.chat_conversations
for each row execute function public.update_updated_at_column();

create policy "Participants can view conversations"
  on public.chat_conversations for select to authenticated
  using (
    exists (
      select 1 from public.chat_participants cp
      where cp.conversation_id = id and cp.user_id = auth.uid()
    ) or created_by = auth.uid()
  );

create policy "Users can create conversations"
  on public.chat_conversations for insert to authenticated
  with check (created_by = auth.uid());

create policy "Participants can update conversations"
  on public.chat_conversations for update to authenticated
  using (
    exists (
      select 1 from public.chat_participants cp
      where cp.conversation_id = id and cp.user_id = auth.uid()
    ) or created_by = auth.uid()
  )
  with check (
    exists (
      select 1 from public.chat_participants cp
      where cp.conversation_id = id and cp.user_id = auth.uid()
    ) or created_by = auth.uid()
  );

-- Chat participants
create table if not exists public.chat_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  is_admin boolean not null default false,
  unique (conversation_id, user_id)
);

alter table public.chat_participants enable row level security;

create policy "Participants can view participants"
  on public.chat_participants for select to authenticated
  using (public.is_participant(conversation_id, auth.uid()));

create policy "Creators or users can add participants"
  on public.chat_participants for insert to authenticated
  with check (
    (
      auth.uid() = user_id
      and public.is_participant(conversation_id, auth.uid())
    )
    or
    (
      (select created_by from public.chat_conversations c where c.id = conversation_id) = auth.uid()
    )
  );

create policy "Users can remove themselves or creators can manage"
  on public.chat_participants for delete to authenticated
  using (
    auth.uid() = user_id
    or (select created_by from public.chat_conversations c where c.id = conversation_id) = auth.uid()
  );

-- Chat messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  message_type public.message_type not null default 'text',
  reply_to_id uuid references public.chat_messages(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.chat_messages enable row level security;

create trigger update_chat_messages_updated_at
before update on public.chat_messages
for each row execute function public.update_updated_at_column();

create policy "Participants can view messages"
  on public.chat_messages for select to authenticated
  using (public.is_participant(conversation_id, auth.uid()));

create policy "Participants can send messages"
  on public.chat_messages for insert to authenticated
  with check (sender_id = auth.uid() and public.is_participant(conversation_id, auth.uid()));

create policy "Senders can update their messages"
  on public.chat_messages for update to authenticated
  using (sender_id = auth.uid());

-- Message reactions
create table if not exists public.message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now(),
  unique (message_id, user_id, reaction)
);

alter table public.message_reactions enable row level security;

create policy "Participants can view message reactions"
  on public.message_reactions for select to authenticated
  using (
    exists (
      select 1 from public.chat_messages m
      join public.chat_participants p on p.conversation_id = m.conversation_id and p.user_id = auth.uid()
      where m.id = message_id
    )
  );

create policy "Users can react to messages"
  on public.message_reactions for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.chat_messages m
      join public.chat_participants p on p.conversation_id = m.conversation_id and p.user_id = auth.uid()
      where m.id = message_id
    )
  );

create policy "Users can remove their message reactions"
  on public.message_reactions for delete to authenticated
  using (auth.uid() = user_id);

-- Chat requests
create table if not exists public.chat_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  message text,
  status public.chat_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_requests enable row level security;

create trigger update_chat_requests_updated_at
before update on public.chat_requests
for each row execute function public.update_updated_at_column();

-- Prevent duplicate pending requests between same users
create unique index if not exists uq_chat_requests_pending
on public.chat_requests (sender_id, recipient_id)
where status = 'pending';

create policy "Sender or recipient can view chat requests"
  on public.chat_requests for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Senders can create chat requests"
  on public.chat_requests for insert to authenticated
  with check (auth.uid() = sender_id);

create policy "Recipients can update chat requests"
  on public.chat_requests for update to authenticated
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- Realtime configuration
alter table public.forum_posts replica identity full;
alter table public.chat_conversations replica identity full;
alter table public.chat_messages replica identity full;
alter table public.message_reactions replica identity full;
alter table public.chat_requests replica identity full;

alter publication supabase_realtime add table public.forum_posts;
alter publication supabase_realtime add table public.chat_conversations;
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.message_reactions;
alter publication supabase_realtime add table public.chat_requests;
