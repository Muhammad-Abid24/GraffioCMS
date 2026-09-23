"use client";

import React, { useActionState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@graffio/ui";
import { createUserAction, updateUserAction } from "./action";

export function UserFormModal({
  user,
  roles,
  onClose,
}: {
  user?: any;
  roles: any[];
  onClose: (msg?: string) => void;
}) {
  const isEditing = !!user;
  const [state, formAction, isPending] = useActionState(
    isEditing ? updateUserAction : createUserAction,
    { success: false, error: null },
  );

  useEffect(() => {
    if (state.success) {
      onClose(isEditing ? "User berhasil diperbarui!" : "User baru berhasil ditambahkan!");
    }
  }, [state.success, onClose, isEditing]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden my-auto">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? "Edit User" : "Tambah User Baru"}
          </h2>
          <button
            type="button"
            onClick={() => onClose()}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <form action={formAction} className="p-6">
          {state.error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
              {state.error}
            </div>
          )}

          {isEditing && <input type="hidden" name="userId" value={user.userId} />}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                defaultValue={user?.email || ""}
                required
                placeholder="email@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Password{" "}
                {isEditing ? (
                  <span className="text-slate-400 font-normal">
                    (Kosongkan jika tidak ingin diubah)
                  </span>
                ) : (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <input
                type="password"
                name="password"
                required={!isEditing}
                placeholder="********"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Role Akses <span className="text-red-500">*</span>
              </label>
              <select
                name="roleId"
                defaultValue={user?.roleId || ""}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
              >
                <option value="" disabled>
                  -- Pilih Role --
                </option>
                {roles.map((r) => (
                  <option key={r.roleId} value={r.roleId}>
                    {r.roleName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Status User <span className="text-red-500">*</span>
              </label>
              <select
                name="statusUser"
                defaultValue={user?.statusUser || "A"}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
              >
                <option value="A">Aktif (Enable)</option>
                <option value="N">Disable</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-white pt-4">
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={isPending}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold min-w-32"
            >
              {isPending ? "Menyimpan..." : "Simpan User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
