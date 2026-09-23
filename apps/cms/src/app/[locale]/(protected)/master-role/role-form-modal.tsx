"use client";

import React, { useActionState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@graffio/ui";
import { createRoleAction, updateRoleAction } from "./action";

export function RoleFormModal({ role, onClose }: { role?: any; onClose: (msg?: string) => void }) {
  const isEditing = !!role;
  const [state, formAction, isPending] = useActionState(
    isEditing ? updateRoleAction : createRoleAction,
    { success: false, error: null },
  );

  useEffect(() => {
    if (state.success) {
      onClose(isEditing ? "Role berhasil diperbarui!" : "Role baru berhasil ditambahkan!");
    }
  }, [state.success, onClose, isEditing]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? "Edit Role" : "Tambah Role Baru"}
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

          {isEditing && <input type="hidden" name="roleId" value={role.roleId} />}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Nama Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="roleName"
                defaultValue={role?.roleName || ""}
                required
                placeholder="e.g. Editor, Admin, User"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Status Role <span className="text-red-500">*</span>
              </label>
              <select
                name="statusRole"
                defaultValue={role?.statusRole || "A"}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
              >
                <option value="A">Aktif (Enable)</option>
                <option value="N">Disable</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={isPending}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold min-w-32"
            >
              {isPending ? "Menyimpan..." : "Simpan Role"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
