alter table workspaces add column ai_agent_enabled boolean not null default false;
alter table workspaces add column ai_agent_knowledge text;

-- Marks a message as AI-composed, shown as a badge in the inbox so a human
-- teammate can tell which replies were automated vs typed by a person.
alter table messages add column sent_by_ai boolean not null default false;
