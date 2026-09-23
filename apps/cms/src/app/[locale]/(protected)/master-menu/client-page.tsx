"use client";

import React, { useState, useTransition, useEffect } from "react";
import {
  RefreshCcw,
  Plus,
  Network,
  LayoutTemplate,
  EyeOff,
  GripVertical,
  Pencil,
  Trash2,
  FolderTree,
  CornerDownRight,
  Search,
  ChevronDown,
  X,
  AlertTriangle,
  Home,
  CheckCircle2,
} from "lucide-react";
import { Button, Footer } from "@graffio/ui";
import { deleteMenuAction } from "./action";
import { MenuFormModal } from "./menu-form-modal";
import { reorderMenusAction } from "./action";

export function MasterMenuClient({
  menuTree,
  rootMenus,
  totalMenus,
  activeMenus,
  inactiveMenus,
}: {
  menuTree: any[];
  rootMenus: any[];
  totalMenus: number;
  activeMenus: number;
  inactiveMenus: number;
}) {
  const [localTree, setLocalTree] = useState(menuTree);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [deletingMenu, setDeletingMenu] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, limit]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      setLocalTree(menuTree);
    }
  }, [menuTree, hasUnsavedChanges]);

  // Filter the menu tree based on search term
  const filteredTree = localTree
    .filter((root) => {
      const matchesSearch =
        root.menuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        root.menuAlias.toLowerCase().includes(searchTerm.toLowerCase());

      // Check if children match
      const matchingChildren = root.children.filter(
        (c: any) =>
          c.menuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.menuAlias.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      return matchesSearch || matchingChildren.length > 0;
    })
    .map((root) => {
      const matchesSearch =
        root.menuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        root.menuAlias.toLowerCase().includes(searchTerm.toLowerCase());

      // If root matches, keep all children. Otherwise, keep only matching children.
      return {
        ...root,
        children: matchesSearch
          ? root.children
          : root.children.filter(
              (c: any) =>
                c.menuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.menuAlias.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
      };
    });

  const totalItems = filteredTree.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedTree = filteredTree.slice((currentPage - 1) * limit, currentPage * limit);

  const handleAddMenu = () => {
    setEditingMenu(null);
    setIsFormOpen(true);
  };

  const handleEditMenu = (menu: any) => {
    setEditingMenu(menu);
    setIsFormOpen(true);
  };

  const handleDeleteMenu = (menu: any) => {
    setDeleteError(null);
    setDeletingMenu(menu);
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const res = await deleteMenuAction(deletingMenu.menuId);
      if (res.success) {
        setDeletingMenu(null);
        setSuccessMessage("Menu berhasil dihapus!");
      } else {
        setDeleteError(res.error || "Failed to delete menu.");
      }
    });
  };

  const handleSaveOrder = () => {
    startTransition(async () => {
      const updates: { menuId: number; orderMenu: number }[] = [];
      localTree.forEach((root, rIndex) => {
        updates.push({ menuId: root.menuId, orderMenu: (rIndex + 1) * 10 });
        root.children.forEach((child: any, cIndex: number) => {
          updates.push({ menuId: child.menuId, orderMenu: (cIndex + 1) * 10 });
        });
      });

      const res = await reorderMenusAction(updates);
      if (res.success) {
        setHasUnsavedChanges(false);
        setSuccessMessage("Urutan menu berhasil disimpan!");
      } else {
        alert("Failed to save order: " + res.error);
      }
    });
  };

  // Drag and Drop Handlers
  const onDragStart = (
    e: React.DragEvent,
    item: any,
    type: "root" | "child",
    parentId?: number,
  ) => {
    setDraggedItem({ ...item, type, parentId });
    e.dataTransfer.effectAllowed = "move";
    // Slight opacity to show it's being dragged
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = "0.4";
    }
  };

  const onDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = "1";
    }
    setDraggedItem(null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (
    e: React.DragEvent,
    targetItem: any,
    targetType: "root" | "child",
    targetParentId?: number,
  ) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Rule 1: Root can only drop on Root
    if (draggedItem.type === "root" && targetType === "root") {
      const draggedIndex = localTree.findIndex((m) => m.menuId === draggedItem.menuId);
      const targetIndex = localTree.findIndex((m) => m.menuId === targetItem.menuId);

      if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
        const newTree = [...localTree];
        const [removed] = newTree.splice(draggedIndex, 1);
        newTree.splice(targetIndex, 0, removed);

        newTree.forEach((root, i) => {
          root.displayOrder = i + 1;
        });

        setLocalTree(newTree);
        setHasUnsavedChanges(true);
      }
    }

    // Rule 2: Child can only drop on Child within the same Parent
    if (
      draggedItem.type === "child" &&
      targetType === "child" &&
      draggedItem.parentId === targetParentId
    ) {
      const newTree = [...localTree];
      const parentIndex = newTree.findIndex((m) => m.menuId === targetParentId);
      if (parentIndex !== -1) {
        const children = [...newTree[parentIndex].children];
        const draggedIndex = children.findIndex((c) => c.menuId === draggedItem.menuId);
        const targetIndex = children.findIndex((c) => c.menuId === targetItem.menuId);

        if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
          const [removed] = children.splice(draggedIndex, 1);
          children.splice(targetIndex, 0, removed);

          children.forEach((child, i) => {
            child.displayOrder = `${newTree[parentIndex].displayOrder}.${i + 1}`;
          });

          newTree[parentIndex].children = children;
          setLocalTree(newTree);
          setHasUnsavedChanges(true);
        }
      }
    }

    setDraggedItem(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl flex-1">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex flex-col gap-2 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Manajemen Struktur Menu & Navigasi
          </h1>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              <span className="mr-1.5 flex size-1.5 rounded-full bg-emerald-500"></span>
              LIVE WEBSITE ENGINE V1.0
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Atur hierarki navigasi utama, mega menu produk, tautan footer, urutan posisi (order
            index), serta parameter target URL website profil korporat secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={!hasUnsavedChanges || isPending}
            onClick={handleSaveOrder}
            className={`font-semibold gap-2 ${
              hasUnsavedChanges
                ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 cursor-not-allowed opacity-70"
            }`}
          >
            <RefreshCcw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Menyimpan..." : "Simpan Urutan (Reorder)"}
          </Button>
          <Button
            onClick={handleAddMenu}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-sm gap-2"
          >
            <Plus className="size-4" />
            Tambah Menu Baru
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Menu Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-border/50 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              TOTAL MENU ITEM
            </div>
            <div className="bg-blue-50 p-1.5 rounded-md text-blue-600">
              <Network className="size-4" />
            </div>
          </div>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-black text-slate-900 leading-none">{totalMenus}</span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100 mb-1">
              ✓ Semua Rute
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            <span className="text-slate-900 font-bold">{activeMenus} Enable</span> • {inactiveMenus}{" "}
            Disable
          </div>
        </div>

        {/* Active Menu Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-border/50 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              MENU AKTIF
            </div>
            <div className="bg-emerald-50 p-1.5 rounded-md text-emerald-600">
              <LayoutTemplate className="size-4" />
            </div>
          </div>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-black text-slate-900 leading-none">{activeMenus}</span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100 mb-1">
              Sudah Rilis
            </span>
          </div>
          <div className="text-xs font-medium text-slate-400">Total Menu Enable</div>
        </div>

        {/* Inactive Menu Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm ring-1 ring-border/50 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              DRAFT / TERSEMBUNYI
            </div>
            <div className="bg-red-50 p-1.5 rounded-md text-red-500">
              <EyeOff className="size-4" />
            </div>
          </div>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-black text-slate-900 leading-none">{inactiveMenus}</span>
            <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600 border border-orange-100 mb-1">
              Belum Rilis
            </span>
          </div>
          <div className="text-xs font-medium text-slate-400">Total Menu Disable</div>
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
            placeholder="Cari nama menu, path URL, atau identifier..."
            className="w-full bg-white border-none rounded-lg pl-9 pr-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {/* Stubs for future actual filtering */}
          <div className="relative">
            <select className="appearance-none bg-white border-none rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-full">
              <option>Semua URL</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="appearance-none bg-white border-none rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-full">
              <option>Semua Role</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select className="appearance-none bg-white border-none rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-full">
              <option>Semua Status</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
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
                <th className="px-4 py-4 w-24">URUTAN</th>
                <th className="px-4 py-4">NAMA MENU & LABEL</th>
                <th className="px-4 py-4">URL / ROUTE TARGET</th>
                <th className="px-4 py-4">ROLE</th>
                <th className="px-4 py-4">STATUS</th>
                <th className="px-4 py-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTree.map((root) => (
                <React.Fragment key={root.menuId}>
                  {/* Root Row */}
                  <tr
                    draggable
                    onDragStart={(e) => onDragStart(e, root, "root")}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, root, "root")}
                    className="hover:bg-slate-50/50 transition-colors group cursor-move"
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="size-4 text-slate-300 group-hover:text-slate-500" />
                        <span className="inline-flex items-center justify-center rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                          {root.displayOrder}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-0.5">
                          <FolderTree className="size-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                            {root.menuName}
                            <span className="text-xs font-medium text-slate-400">
                              ({root.menuAlias})
                            </span>
                          </div>
                          <div className="text-xs font-medium text-slate-500">
                            Level 1 &bull; Root Item
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-mono font-medium text-blue-600">
                        /{root.menuUrl}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs text-slate-600">All</span>
                    </td>
                    <td className="px-4 py-4">
                      {root.statusMenu === "A" ? (
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
                          onClick={() => handleEditMenu(root)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleAddMenu()}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          <Plus className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(root)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Child Rows */}
                  {root.children.map((child: any) => (
                    <tr
                      key={child.menuId}
                      draggable
                      onDragStart={(e) => onDragStart(e, child, "child", root.menuId)}
                      onDragEnd={onDragEnd}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, child, "child", root.menuId)}
                      className="hover:bg-slate-50/50 transition-colors group cursor-move"
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 pl-8">
                        <div className="flex items-center gap-2">
                          <GripVertical className="size-4 text-slate-300 group-hover:text-slate-500" />
                          <span className="inline-flex items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                            {child.displayOrder}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 pl-10">
                        <div className="flex items-start gap-2">
                          <CornerDownRight className="size-4 text-slate-300 mt-1" />
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                              {child.menuName}
                              <span className="text-xs font-medium text-slate-400 hidden lg:inline-block">
                                ({child.menuAlias})
                              </span>
                            </div>
                            <div className="text-[11px] font-medium text-slate-400">
                              Child of: {root.menuName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-mono font-medium text-slate-500">
                          /{child.menuUrl}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-400">_self</span>
                      </td>
                      <td className="px-4 py-3">
                        {child.statusMenu === "A" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                            <span className="size-1.5 rounded-full bg-emerald-500"></span>
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold text-red-600">
                            <span className="size-1.5 rounded-full bg-red-500"></span>
                            Disable
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditMenu(child)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenu(child)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between text-xs font-medium text-slate-500">
          <div>
            Menampilkan {paginatedTree.length > 0 ? (currentPage - 1) * limit + 1 : 0} -{" "}
            {Math.min(currentPage * limit, totalItems)} dari {totalItems} item menu
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
      {deletingMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-red-50 p-2 rounded-full text-red-600">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hapus Menu?</h3>
                <p className="text-sm text-slate-500">
                  Anda yakin ingin menghapus menu <strong>{deletingMenu.menuName}</strong>? Tindakan
                  ini tidak bisa dibatalkan.
                </p>
                {deleteError && (
                  <p className="text-xs text-red-500 mt-2 font-medium bg-red-50 p-2 rounded">
                    {deleteError}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setDeletingMenu(null)} disabled={isPending}>
                Batal
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isPending ? "Menghapus..." : "Ya, Hapus Menu"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <MenuFormModal
          menu={editingMenu}
          rootMenus={rootMenus}
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
