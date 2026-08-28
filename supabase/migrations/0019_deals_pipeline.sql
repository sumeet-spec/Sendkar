create table deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  title text not null,
  value numeric not null default 0,
  stage text not null default 'new' check (stage in ('new', 'contacted', 'negotiating', 'won', 'lost')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deals_workspace_id_idx on deals(workspace_id);

alter table deals enable row level security;

create policy "member can manage deals" on deals
  for all using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));
