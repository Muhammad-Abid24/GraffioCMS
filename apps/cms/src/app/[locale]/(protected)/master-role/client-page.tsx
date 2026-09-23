"use client";

import React, { useState, useTransition, useEffect } from "react";
import {
  Plus,
  Users,
  UserCheck,
  UserMinus,
  Pencil,
  Trash2,
  Search,
  ChevronDown,
  AlertTriangle,
  Home,
  CheckCircle2,
} from "lucide-react";
import { Button, Footer } from "@graffio/ui";
import { deleteRoleAction } from "./action";
import { RoleFormModal } from "./role-form-modal";

export function MasterRoleClient({
  rolesData,
  totalRoles,
  activeRoles,
  inactiveRoles,
}: {
  rolesData: any[];
  totalRoles: number;
  activeRoles: number;
  inactiveRoles: number;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [deletingRole, setDeletingRole] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, limit]);

  // Filter roles based on search term
  const filteredRoles = rolesData.filter((role) =>
    role.roleName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredRoles.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * limit, currentPage * limit);

  const handleAddRole = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleDeleteRole = (role: any) => {
    setDeleteError(null);
    setDeletingRole(role);
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const res = await deleteRoleAction(deletingRole.roleId);
      if (res.success) {
        setDeletingRole(null);
        setSuccessMessage("Role berhasil dihapus!");
      } else {
        setDeleteError(res.error || "Gagal menghapus role.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl flex-1">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex flex-col gap-2 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Manajemen Peran (Roles)
          </h1>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
              <span className="mr-1.5 flex size-1.5 rounded-full bg-blue-500"></span>
              ACCESS CONTROL
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Kelola daftar peran pengguna (Role) di sistem untuk mengatur hak akses ke berbagai modul
            secara dinamis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleAddRole}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-sm gap-2"
          >
            <Plus className="size-4" />
            Tambah Role Baru
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Role Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-border/50 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              TOTAL ROLES
            </div>
            <div className="bg-blue-50 p-1.5 rounded-md text-blue-600">
              <Users className="size-4" />
            </div>
          </div>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-black text-slate-900 leading-none">{totalRoles}</span>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            <span className="text-slate-900 font-bold">{activeRoles} Enable</span> • {inactiveRoles}{" "}
            Disable
          </div>
        </div>

        {/* Active Role Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-border/50 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              ROLE AKTIF
            </div>
            <div className="bg-emerald-50 p-1.5 rounded-md text-emerald-600">
              <UserCheck className="size-4" />
            </div>
          </div>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-black text-slate-900 leading-none">{activeRoles}</span>
          </div>
          <div className="text-xs font-medium text-slate-400">Total Role Enable</div>
        </div>

        {/* Inactive Role Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-border/50 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              ROLE DISABLE
            </div>
            <div className="bg-red-50 p-1.5 rounded-md text-red-500">
              <UserMinus className="size-4" />
            </div>
          </div>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-black text-slate-900 leading-none">{inactiveRoles}</span>
          </div>
          <div className="text-xs font-medium text-slate-400">Total Role Disable</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-50/50 rounded-xl p-2 ring-1 ring-slate-200 flex flex-col md:flex-row gap-2 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama role..."
            className="w-full bg-white border-none rounded-lg pl-9 pr-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="appearance-none bg-white border-none rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-full"
            >
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-border/50 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-4">ID</th>
                <th className="px-4 py-4">NAMA ROLE</th>
                <th className="px-4 py-4">STATUS</th>
                <th className="px-4 py-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRoles.map((role) => (
                <tr key={role.roleId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-mono text-xs text-slate-500">{role.roleId}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900 text-base">{role.roleName}</div>
                  </td>
                  <td className="px-4 py-4">
                    {role.statusRole === "A" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-700">
                        <span className="size-1.5 rounded-full bg-red-500"></span>
                        Disable
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedRoles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-medium">
                    Tidak ada data role ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between text-xs font-medium text-slate-500">
          <div>
            Menampilkan {paginatedRoles.length > 0 ? (currentPage - 1) * limit + 1 : 0} -{" "}
            {Math.min(currentPage * limit, totalItems)} dari {totalItems} role
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-md ${currentPage === 1 ? "hover:bg-slate-200 text-slate-400 cursor-not-allowed" : "hover:bg-slate-200 text-slate-700"}`}
            >
              Sebelumnya
            </button>
            <button className="px-3 py-1.5 rounded-md bg-blue-600 text-white shadow-sm font-bold">
              {currentPage}
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-md ${currentPage === totalPages ? "hover:bg-slate-200 text-slate-400 cursor-not-allowed" : "hover:bg-slate-200 text-slate-700"}`}
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-red-50 p-2 rounded-full text-red-600">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hapus Role?</h3>
                <p className="text-sm text-slate-500">
                  Anda yakin ingin menghapus role <strong>{deletingRole.roleName}</strong>? Tindakan
                  ini tidak bisa dibatalkan dan akan mencabut seluruh akses menu terkait.
                </p>
                {deleteError && (
                  <p className="text-xs text-red-500 mt-2 font-medium bg-red-50 p-2 rounded">
                    {deleteError}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setDeletingRole(null)} disabled={isPending}>
                Batal
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isPending ? "Menghapus..." : "Ya, Hapus Role"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <RoleFormModal
          role={editingRole}
          onClose={(msg?: any) => {
            setIsFormOpen(false);
            if (typeof msg === "string") setSuccessMessage(msg);
          }}
        />
      )}

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
