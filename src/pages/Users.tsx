import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { store, useStore } from "../lib/store";
import { Avatar } from "../components/Avatar";
import { RoleBadge } from "../components/Badges";
import { relativeTime } from "../lib/format";
import { Modal } from "../components/Modal";
import type { Role, User } from "../lib/types";
import { useAuth } from "../lib/auth";

export default function Users() {
  const users = useStore((s) => s.users);
  const { user: me } = useAuth();
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-slate-500">{users.length} total</p>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> Invite user
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={u.name} color={u.avatarColor} size={28} />
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4 py-3 text-xs text-slate-500">{relativeTime(u.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button className="btn-ghost p-1" onClick={() => setEditing(u)} aria-label="Edit">
                    <Pencil size={16} />
                  </button>
                  <button
                    className="btn-ghost p-1 text-red-600"
                    aria-label="Delete"
                    disabled={u.id === me?.id}
                    title={u.id === me?.id ? "You can't delete your own account" : "Delete user"}
                    onClick={() => {
                      if (confirm(`Delete ${u.name}?`)) store.deleteUser(u.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal
        open={creating}
        onClose={() => setCreating(false)}
        onSave={({ name, email, password, role }) => {
          store.createUser({ name, email, password, role });
          setCreating(false);
        }}
        title="Invite user"
      />
      <UserModal
        open={!!editing}
        user={editing ?? undefined}
        onClose={() => setEditing(null)}
        onSave={({ name, email, password, role }) => {
          if (editing) {
            const patch: Partial<User> = { name, email, role };
            if (password) patch.password = password;
            store.updateUser(editing.id, patch);
          }
          setEditing(null);
        }}
        title="Edit user"
      />
    </div>
  );
}

function UserModal({
  open,
  onClose,
  onSave,
  user,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; email: string; password: string; role: Role }) => void;
  user?: User;
  title: string;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(user?.role ?? "agent");

  // reset when modal opens with a different user
  useEffect(() => {
    if (open) {
      setName(user?.name ?? "");
      setEmail(user?.email ?? "");
      setPassword("");
      setRole(user?.role ?? "agent");
    }
  }, [open, user?.id]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={() => onSave({ name, email, password, role })}
            disabled={!name || !email || (!user && !password)}
          >
            Save
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">{user ? "New password (leave blank to keep current)" : "Password"}</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="label">Role</label>
          <div className="grid grid-cols-3 gap-2">
            {(["customer", "agent", "admin"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                  role === r
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
