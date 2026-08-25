-- Flow variables — closes a real mechanical gap found by reading Wati's own
-- help center (not just their marketing site): their chatbot builder has an
-- "Ask a Question" node that stores the reply, and a separate "Set a
-- Condition" node that branches on any previously stored answer, not just
-- the message that was just sent. Sendkar's flows could only ever branch on
-- the immediately-preceding reply — this adds the same "ask now, decide
-- later" capability without a full node-graph rewrite: a step can capture
-- its reply into a named variable, and any later step's branches can test
-- that variable instead of the live reply.

alter table flow_steps add column capture_variable text;

alter table contact_flow_state add column variables jsonb not null default '{}'::jsonb;
