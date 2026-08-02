import SectionCard from "./SectionCard";
import { FiAlertTriangle, FiTrash2, FiDatabase } from "react-icons/fi";

export default function DangerZoneTab({ scheduledDeletionAt, onDeleteClick, onCancelDeletion, onDeleteDataClick }) {
  return (
    <>
      <SectionCard icon={FiDatabase} title="Delete All Data">
        <p className="text-xs text-text-body mb-1">
          Permanently removes all products, sales, expenses, stock history, catalogue listings,
          banners, posts, page views, and chat data. Your shop, settings, and account remain intact.
        </p>
        <button onClick={onDeleteDataClick} className="mt-3 px-4 py-2 bg-danger hover:bg-danger-500 text-danger-contrast font-bold rounded-lg text-xs transition-all flex items-center gap-2">
          <FiTrash2 size={13} />
          Delete All Data
        </button>
      </SectionCard>

      <SectionCard icon={FiAlertTriangle} title="Delete Shop">
        {scheduledDeletionAt ? (
          <>
            <p className="text-xs text-text-body mb-1">
              Your shop is scheduled for permanent deletion on{" "}
              <strong className="text-danger">
                {new Date(scheduledDeletionAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </strong>
              . You can cancel this at any time before then.
            </p>
            <button onClick={onCancelDeletion} className="mt-3 px-4 py-2 bg-success hover:bg-success-500 text-success-contrast font-bold rounded-lg text-xs transition-all">
              Cancel Deletion
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-text-body mb-1">
              Permanently delete this shop and all its data. The deletion is delayed by 30 days
              and can be cancelled during that period. After deletion, you can create a new shop
              with the same email address.
            </p>
            <button onClick={onDeleteClick} className="mt-3 px-4 py-2 bg-danger hover:bg-danger-500 text-danger-contrast font-bold rounded-lg text-xs transition-all flex items-center gap-2">
              <FiTrash2 size={13} />
              Delete Shop
            </button>
          </>
        )}
      </SectionCard>
    </>
  );
}
