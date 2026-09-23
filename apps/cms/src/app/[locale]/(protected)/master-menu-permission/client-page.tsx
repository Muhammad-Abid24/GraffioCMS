"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import { ShieldCheck, Save, ChevronDown, Home, CheckCircle2, Lock, X } from "lucide-react";
import { Button, Footer } from "@graffio/ui";
import { savePermissionsAction } from "./action";
import type { PermissionUpdatePayload } from "./action";

export function MasterMenuPermissionClient({
  rolesData,
  menusData,
  initialPermissions,
}: {
  rolesData: any[];
  menusData: any[];
  initialPermissions: any[];
}) {
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [selectedMenuId, setSelectedMenuId] = useState<number | "all">("all");
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Local state for all permissions
  // key: "roleId-menuId"
  const [localPermissions, setLocalPermissions] = useState<Record<string, any>>(() => {
    const map: Record<string, any> = {};
    initialPermissions.forEach((p) => {
      map[`${p.roleId}-${p.menuId}`] = { ...p };
    });
    return map;
  });

  // Keep local in sync if initial changes (e.g. after save)
  useEffect(() => {
    const map: Record<string, any> = {};
    initialPermissions.forEach((p) => {
      map[`${p.roleId}-${p.menuId}`] = { ...p };
    });
    setLocalPermissions(map);
  }, [initialPermissions]);

  // Determine if role is Super Admin
  const isSuperAdmin = useMemo(() => {
    if (!selectedRoleId) return false;
    const role = rolesData.find((r) => r.roleId === selectedRoleId);
    return role?.roleName === "Super Admin";
  }, [selectedRoleId, rolesData]);

  // Filter menus to show in table
  const displayedMenus = useMemo(() => {
    if (!selectedRoleId) return []; // Don't show anything until role is selected
    if (selectedMenuId === "all") return menusData;
    return menusData.filter((m) => m.menuId === selectedMenuId);
  }, [selectedRoleId, selectedMenuId, menusData]);

  // Get current permission for a menu and role
  const getPerm = (menuId: number) => {
    const key = `${selectedRoleId}-${menuId}`;
    if (isSuperAdmin) {
      return { canView: "Y", canCreate: "Y", canUpdate: "Y", canDelete: "Y" };
    }
    return (
      localPermissions[key] || { canView: "N", canCreate: "N", canUpdate: "N", canDelete: "N" }
    );
  };

  const handleToggle = (
    menuId: number,
    field: "canView" | "canCreate" | "canUpdate" | "canDelete",
  ) => {
    if (isSuperAdmin) return; // Locked for super admin

    const key = `${selectedRoleId}-${menuId}`;
    const current = localPermissions[key] || {
      roleId: selectedRoleId,
      menuId,
      canView: "N",
      canCreate: "N",
      canUpdate: "N",
      canDelete: "N",
    };

    const newValue = current[field] === "Y" ? "N" : "Y";

    setLocalPermissions((prev) => ({
      ...prev,
      [key]: {
        ...current,
        [field]: newValue,
      },
    }));
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    for (const key in localPermissions) {
      const current = localPermissions[key];
      const initial = initialPermissions.find((p) => `${p.roleId}-${p.menuId}` === key);

      if (!initial) {
        if (
          current.canView === "Y" ||
          current.canCreate === "Y" ||
          current.canUpdate === "Y" ||
          current.canDelete === "Y"
        ) {
          return true; // Added new permissions
        }
      } else {
        if (
          current.canView !== initial.canView ||
          current.canCreate !== initial.canCreate ||
          current.canUpdate !== initial.canUpdate ||
          current.canDelete !== initial.canDelete
        ) {
          return true; // Changed permissions
        }
      }
    }
    return false;
  }, [localPermissions, initialPermissions]);

  const handleSave = () => {
    setError(null);
    const updates: PermissionUpdatePayload[] = [];

    for (const key in localPermissions) {
      const current = localPermissions[key];
      const initial = initialPermissions.find((p) => `${p.roleId}-${p.menuId}` === key);

      const isChanged = !initial
        ? current.canView === "Y" ||
          current.canCreate === "Y" ||
          current.canUpdate === "Y" ||
          current.canDelete === "Y"
        : current.canView !== initial.canView ||
          current.canCreate !== initial.canCreate ||
          current.canUpdate !== initial.canUpdate ||
          current.canDelete !== initial.canDelete;

      if (isChanged) {
        updates.push({
          roleId: current.roleId,
          menuId: current.menuId,
          canView: current.canView,
          canCreate: current.canCreate,
          canUpdate: current.canUpdate,
          canDelete: current.canDelete,
        });
      }
    }

    if (updates.length === 0) return;

    startTransition(async () => {
      const res = await savePermissionsAction(updates);
      if (res.success) {
        setSuccessMessage("Perubahan hak akses berhasil disimpan!");
      } else {
        setError(res.error || "Gagal menyimpan perubahan.");
      }
    });
  };

  const ToggleSwitch = ({
    checked,
    onChange,
    disabled,
  }: {
    checked: boolean;
    onChange: () => void;
    disabled: boolean;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`${
        checked ? "bg-blue-600" : "bg-slate-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90"} relative inline-flex h-5 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`}
    >
      <span className="sr-only">Toggle permission</span>
      <span
        aria-hidden="true"
        className={`${
          checked ? "translate-x-2" : "-translate-x-2"
        } pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl flex-1 pb-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex flex-col gap-2 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Hak Akses</h1>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              <span className="mr-1.5 flex size-1.5 rounded-full bg-purple-500"></span>
              SECURITY MATRIX
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Atur izin akses (View, Create, Update, Delete) untuk setiap Role pada setiap modul/menu.
            Pilih Role terlebih dahulu untuk melihat dan mengatur matrix permission.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isPending}
            className={`font-semibold gap-2 ${
              hasUnsavedChanges
                ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-70"
            }`}
          >
            <Save className="size-4" />
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-border/50 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/2 space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pilih Role
          </label>
          <div className="relative">
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : "")}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none w-full shadow-sm"
            >
              <option value="">-- Pilih Role --</option>
              {rolesData.map((r) => (
                <option key={r.roleId} value={r.roleId}>
                  {r.roleName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="w-full md:w-1/2 space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pilih Menu (Opsional)
          </label>
          <div className="relative">
            <select
              value={selectedMenuId}
              onChange={(e) =>
                setSelectedMenuId(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              disabled={!selectedRoleId}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none w-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">Semua Menu</option>
              {menusData.map((m) => (
                <option key={m.menuId} value={m.menuId}>
                  {m.menuName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-border/50 overflow-hidden flex flex-col min-h-[300px]">
        {selectedRoleId === "" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
            <div className="bg-slate-50 p-4 rounded-full mb-4 ring-1 ring-slate-100">
              <ShieldCheck className="size-12 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Silakan Pilih Role</h3>
            <p className="text-sm font-medium max-w-sm text-center">
              Pilih role dari dropdown di atas untuk melihat dan mengatur matrix permission-nya.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {isSuperAdmin && (
              <div className="bg-purple-50 px-4 py-3 border-b border-purple-100 flex items-center gap-3">
                <Lock className="size-4 text-purple-600" />
                <p className="text-sm font-semibold text-purple-800">
                  Role <span className="font-bold">Super Admin</span> memiliki akses tak terbatas ke
                  seluruh sistem. Seluruh perizinan aktif secara default dan tidak dapat dimatikan.
                </p>
              </div>
            )}
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 w-[30%]">NAMA MENU</th>
                  <th className="px-4 py-4 text-center">VIEW (R)</th>
                  <th className="px-4 py-4 text-center">CREATE (C)</th>
                  <th className="px-4 py-4 text-center">UPDATE (U)</th>
                  <th className="px-4 py-4 text-center">DELETE (D)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedMenus.map((menu) => {
                  const perm = getPerm(menu.menuId);

                  return (
                    <tr key={menu.menuId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{menu.menuName}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {menu.menuAlias}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <ToggleSwitch
                          checked={perm.canView === "Y"}
                          onChange={() => handleToggle(menu.menuId, "canView")}
                          disabled={isSuperAdmin}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <ToggleSwitch
                          checked={perm.canCreate === "Y"}
                          onChange={() => handleToggle(menu.menuId, "canCreate")}
                          disabled={isSuperAdmin}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <ToggleSwitch
                          checked={perm.canUpdate === "Y"}
                          onChange={() => handleToggle(menu.menuId, "canUpdate")}
                          disabled={isSuperAdmin}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <ToggleSwitch
                          checked={perm.canDelete === "Y"}
                          onChange={() => handleToggle(menu.menuId, "canDelete")}
                          disabled={isSuperAdmin}
                        />
                      </td>
                    </tr>
                  );
                })}
                {displayedMenus.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-medium">
                      Tidak ada data menu ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {successMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center transform scale-100 transition-all">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <CheckCircle2 className="size-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Berhasil!</h3>
            <p className="text-sm text-slate-500 mb-6">{successMessage}</p>
            <Button
              onClick={() => setSuccessMessage(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
