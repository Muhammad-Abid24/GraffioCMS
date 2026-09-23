"use client";

import React, { useActionState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@graffio/ui";
import { createMenuAction, updateMenuAction } from "./action";

export function MenuFormModal({
  menu,
  rootMenus,
  onClose,
}: {
  menu?: any;
  rootMenus: any[];
  onClose: (msg?: string) => void;
}) {
  const isEditing = !!menu;
  const [state, formAction, isPending] = useActionState(
    isEditing ? updateMenuAction : createMenuAction,
    { success: false, error: null },
  );

  useEffect(() => {
    if (state.success) {
      onClose(isEditing ? "Menu berhasil diperbarui!" : "Menu baru berhasil ditambahkan!");
    }
  }, [state.success, onClose, isEditing]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? "Edit Menu" : "Tambah Menu Baru"}
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

          {isEditing && <input type="hidden" name="menuId" value={menu.menuId} />}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Nama Menu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="menuName"
                  defaultValue={menu?.menuName || ""}
                  required
                  placeholder="e.g. Master Menu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Menu Alias <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="menuAlias"
                  defaultValue={menu?.menuAlias || ""}
                  required
                  placeholder="e.g. master-menu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  URL / Target <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="menuUrl"
                  defaultValue={menu?.menuUrl || ""}
                  required
                  placeholder="e.g. master-menu"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Menu Icon</label>
                <input
                  type="text"
                  name="menuIcon"
                  defaultValue={menu?.menuIcon || ""}
                  placeholder="e.g. box (Lucide icon)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Parent Menu</label>
                <select
                  name="parentId"
                  defaultValue={menu?.parentId || "none"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="none">-- Jadikan Root Level --</option>
                  {rootMenus.map((root) => (
                    <option
                      key={root.menuId}
                      value={root.menuId}
                      disabled={menu && menu.menuId === root.menuId}
                    >
                      {root.menuName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Urutan (Order)</label>
                <input
                  type="number"
                  name="orderMenu"
                  defaultValue={menu?.orderMenu || "0"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Status</label>
              <select
                name="statusMenu"
                defaultValue={menu?.statusMenu || "A"}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="A">Aktif (Enable)</option>
                <option value="N">Nonaktif (Disable/Draft)</option>
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? "Menyimpan..." : "Simpan Menu"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
