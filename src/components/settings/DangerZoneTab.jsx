import SectionCard from "./SectionCard";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";

export default function DangerZoneTab({ scheduledDeletionAt, onDeleteClick, onCancelDeletion }) {
  return (
    <SectionCard icon={FiAlertTriangle} title="Delete Shop">
      {scheduledDeletionAt ? (
        <>
          <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">
            Your shop is scheduled for permanent deletion on{" "}
            <strong className="text-red-600 dark:text-red-400">
              {new Date(scheduledDeletionAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </strong>
            . You can cancel this at any time before then.
          </p>
          <button onClick={onCancelDeletion} className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-xs transition-all">
            Cancel Deletion
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">
            Permanently delete this shop and all its data. The deletion is delayed by 30 days
            and can be cancelled during that period. After deletion, you can create a new shop
            with the same email address.
          </p>
          <button onClick={onDeleteClick} className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-2">
            <FiTrash2 size={13} />
            Delete Shop
          </button>
        </>
      )}
    </SectionCard>
  );
}
