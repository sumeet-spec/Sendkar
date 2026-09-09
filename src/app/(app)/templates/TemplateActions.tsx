"use client";

import { useTransition, useState } from "react";
import { deleteTemplate, duplicateTemplate, resubmitTemplate } from "./actions";

export function TemplateActions({ id, status, bodyText }: { id: string; status: string; bodyText?: string | null }) {
  const [dupPending, startDup] = useTransition();
  const [delPending, startDel] = useTransition();
  const [resubPending, startResub] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [resubOpen, setResubOpen] = useState(false);
  const [editedBody, setEditedBody] = useState(bodyText ?? "");
  const [resubError, setResubError] = useState<string | null>(null);

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
      {status === "rejected" && !resubOpen && (
        <button
          onClick={() => setResubOpen(true)}
          className="sk-btn sk-btn-primary w-full text-[12.5px]"
        >
          Fix & resubmit to Meta
        </button>
      )}

      {resubOpen && (
        <div className="flex flex-col gap-2">
          <textarea
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
            className="sk-input text-[12.5px]"
            rows={4}
            placeholder="Corrected body text…"
          />
          <div className="flex gap-2">
            <button
              disabled={resubPending || !editedBody.trim()}
              onClick={() =>
                startResub(async () => {
                  setResubError(null);
                  const result = await resubmitTemplate(id, editedBody);
                  if (result.error) setResubError(result.error);
                  else setResubOpen(false);
                })
              }
              className="sk-btn sk-btn-primary flex-1 text-[12.5px] disabled:opacity-60"
            >
              {resubPending ? "Resubmitting…" : "Resubmit"}
            </button>
            <button onClick={() => setResubOpen(false)} className="sk-btn sk-btn-ghost text-[12.5px]">
              Cancel
            </button>
          </div>
          {resubError && <p className="text-[12px] text-danger">{resubError}</p>}
        </div>
      )}

      <div className="flex gap-2">
        <button
          disabled={dupPending}
          onClick={() => startDup(() => duplicateTemplate(id))}
          className="sk-btn sk-btn-ghost flex-1 text-[12.5px] disabled:opacity-60"
        >
          {dupPending ? "Duplicating…" : "Duplicate"}
        </button>

        {confirmDelete ? (
          <>
            <button
              disabled={delPending}
              onClick={() => startDel(() => deleteTemplate(id))}
              className="flex-1 rounded-md border border-danger px-3 py-1.5 text-[12.5px] font-medium text-danger hover:bg-danger/10 disabled:opacity-60"
            >
              {delPending ? "Deleting…" : "Confirm delete"}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="sk-btn sk-btn-ghost text-[12.5px]">
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="sk-btn sk-btn-ghost flex-1 text-[12.5px] text-danger hover:border-danger"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
