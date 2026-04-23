import { store } from "../../../lib/store";
import { Header } from "../shared/Header";

export function DangerTab() {
  return (
    <div className="space-y-4">
      <Header title="Danger zone" sub="Destructive actions. These cannot be undone." />
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
        <div className="font-medium text-red-800 dark:text-red-200">Reset all data</div>
        <p className="mt-1 text-sm text-red-700 dark:text-red-200">
          Wipes users, tickets, emails, jobs, and settings, then reseeds the demo data. You will be signed out.
        </p>
        <button
          className="btn-danger mt-3"
          onClick={() => {
            if (confirm("Reset all data? This cannot be undone.")) {
              store.resetSeed();
              localStorage.removeItem("helpdesk_session");
              location.href = "/login";
            }
          }}
        >
          Reset data
        </button>
      </div>
    </div>
  );
}
