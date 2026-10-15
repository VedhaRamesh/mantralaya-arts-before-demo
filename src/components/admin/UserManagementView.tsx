import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, Role } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  SlidersHorizontal,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  Shield,
  Truck,
  User,
  X,
  FileText,
  KeyRound,
  Copy,
  MessageCircle,
  Share2,
  Lock,
} from 'lucide-react';
import { formatWhatsAppNumber } from '../../utils/whatsapp';
import { PaginationControls } from '../common/PaginationControls';

export const UserManagementView: React.FC = () => {
  const { allUsers, addUserProfile, updateUserProfile, toggleUserStatus, orders } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination State (Defaults to 20 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [viewingOrdersUser, setViewingOrdersUser] = useState<UserProfile | null>(null);

  // Add Form State
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addRole, setAddRole] = useState<Role>('CUSTOMER');
  const [addAccessPin, setAddAccessPin] = useState('1234');
  const [addPassword, setAddPassword] = useState('Devotee@123');
  const [addAddress, setAddAddress] = useState('');
  const [addNotes, setAddNotes] = useState('');
  const [addStatus, setAddStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  // Filtered users (Single Admin and Customer directory)
  const filteredUsers = allUsers.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.fullName.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone.includes(q);
      const matchId = u.id.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchId;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const res = addUserProfile({
      fullName: addName,
      email: addEmail,
      phone: addPhone,
      role: addRole,
      accessPin: addAccessPin,
      password: addPassword,
      deliveryAddress: addAddress,
      notes: addNotes,
      status: addStatus,
    });

    if (res.success && res.user) {
      setFormSuccess(`Profile "${res.user.fullName}" (${res.user.id}) created successfully!`);
      // Reset form
      setAddName('');
      setAddEmail('');
      setAddPhone('');
      setAddAccessPin('1234');
      setAddPassword('Devotee@123');
      setAddAddress('');
      setAddNotes('');
      setAddStatus('ACTIVE');
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess('');
      }, 2000);
    } else {
      setFormError(res.error || 'Failed to create user profile.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError('');

    const res = updateUserProfile(editingUser.id, {
      fullName: editingUser.fullName,
      email: editingUser.email,
      phone: editingUser.phone,
      accessPin: editingUser.accessPin,
      password: editingUser.password,
      deliveryAddress: editingUser.deliveryAddress,
      notes: editingUser.notes,
      status: editingUser.status,
    });

    if (res.success) {
      setEditingUser(null);
    } else {
      setFormError(res.error || 'Failed to update user profile.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Add User Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-cinzel text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#701A1E]" />
            <span>User Profile Directory</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Register authorized devotee customer accounts, manage store staff, and audit historical orders.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setFormSuccess('');
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>Add User Profile</span>
        </button>
      </div>

      {/* Filter and Search Bar with responsive scroll and stack */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email, phone, or ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
          />
        </div>

        {/* Role & Status Filters (Supplier removed, only Customer & Admin) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {/* Role Filter Tabs */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl text-xs shrink-0">
            {['ALL', 'CUSTOMER', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRoleFilter(r);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap capitalize ${
                  roleFilter === r
                    ? 'bg-white text-[#701A1E] font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r === 'ADMIN' ? 'Admin / Staff' : 'Customers'}
              </button>
            ))}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl text-xs shrink-0">
            {['ALL', 'ACTIVE', 'INACTIVE'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap capitalize ${
                  statusFilter === s
                    ? 'bg-white text-stone-900 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {s === 'ALL' ? 'All' : s.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profiles Listing: Dual-Mode (Responsive Stacked Cards on Mobile, Table on Desktop) */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        {/* Mobile View: Fluid Stacked Profile Cards with Responsive Toolbar (md:hidden) */}
        <div className="md:hidden divide-y divide-stone-100">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No user profiles found matching your search.
            </div>
          ) : (
            paginatedUsers.map((user) => {
              const userOrderCount = orders.filter((o) => o.customerId === user.id).length;
              const isActive = user.status === 'ACTIVE';

              return (
                <div key={user.id} className="p-4 space-y-3">
                  {/* Card Header: Avatar, Name, ID, Role & Status with natural wrapping */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                          user.role === 'ADMIN' || user.role === 'SUPPLIER'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-stone-900 leading-tight truncate">
                          {user.fullName}
                        </p>
                        <span className="font-mono text-[10px] text-stone-400">
                          {user.id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          user.role === 'ADMIN' || user.role === 'SUPPLIER'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {user.role === 'SUPPLIER' ? 'ADMIN (MERGED)' : user.role}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-100 text-stone-500 border border-stone-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-stone-400'}`} />
                        <span>{user.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Phone, Email, Credentials & Registration */}
                  <div className="bg-stone-50/70 p-3 rounded-2xl border border-stone-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <a
                        href={`tel:${user.phone}`}
                        className="text-stone-800 font-medium font-mono flex items-center gap-1 hover:text-[#701A1E]"
                      >
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>{user.phone}</span>
                      </a>
                      <span className="text-stone-400 font-mono text-[10px]">
                        Reg: {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-stone-500 text-[11px] truncate">
                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>

                    {user.deliveryAddress && (
                      <div className="flex items-start gap-1 text-stone-500 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{user.deliveryAddress}</span>
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                      <span className="text-amber-900 font-mono font-semibold flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          PIN: <strong className="text-stone-900">{user.accessPin || '1234'}</strong>
                        </span>
                        {user.password && (
                          <span className="text-stone-400 text-[10px] ml-1">
                            · PW: <strong className="text-stone-800 font-mono">{user.password}</strong>
                          </span>
                        )}
                      </span>
                      {user.role === 'CUSTOMER' && (
                        <span className="text-[10px] text-stone-500">
                          {userOrderCount} {userOrderCount === 1 ? 'order' : 'orders'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Toolbar: Wrapped 2-row layout with comfortable touch hitboxes */}
                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {user.role === 'CUSTOMER' && (
                        <>
                          <a
                            href={`https://wa.me/${formatWhatsAppNumber(user.phone)}?text=${encodeURIComponent(
                              `Namaskara ${user.fullName}!\n\nYour Mantralaya Arts customer account has been created by the administrator.\n\n📱 Registered Mobile: ${user.phone}\n🔑 Access PIN: ${user.accessPin || '1234'}\n🔒 Password: ${user.password || 'Lakshmi@123'}\n🆔 Customer ID: ${user.id}\n\nPlease visit our app to log in and explore sacred pooja essentials.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1 hover:bg-emerald-100 transition active:scale-95"
                            title="Send WhatsApp Credentials"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="text-[11px]">WhatsApp</span>
                          </a>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `Mantralaya Arts Customer Login:\nMobile: ${user.phone}\nPIN: ${user.accessPin || '1234'}\nPassword: ${user.password || 'Lakshmi@123'}\nCustomer ID: ${user.id}`
                              );
                              setCopiedUserId(user.id);
                              setTimeout(() => setCopiedUserId(null), 2000);
                            }}
                            className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-1 hover:bg-stone-200 transition cursor-pointer active:scale-95"
                            title="Copy Login Credentials"
                          >
                            {copiedUserId === user.id ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="text-[11px]">{copiedUserId === user.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            onClick={() => setViewingOrdersUser(user)}
                            className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-stone-100 text-stone-700 hover:text-[#701A1E] text-xs font-medium flex items-center gap-1 transition cursor-pointer active:scale-95"
                            title="View Orders"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span className="text-[11px]">{userOrderCount} Orders</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => {
                          setFormError('');
                          setEditingUser({ ...user });
                        }}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs flex items-center gap-1 transition cursor-pointer active:scale-95"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Edit</span>
                      </button>

                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1 active:scale-95 ${
                          isActive
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                        title={isActive ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {isActive ? <XCircle className="w-3.5 h-3.5 text-amber-700" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />}
                        <span className="text-[11px]">{isActive ? 'Disable' : 'Enable'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full 6-Column Data Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">User Profile &amp; ID</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5 text-center">Role</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Registered</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    No user profiles found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const userOrderCount = orders.filter((o) => o.customerId === user.id).length;
                  const isActive = user.status === 'ACTIVE';

                  return (
                    <tr key={user.id} className="hover:bg-stone-50/70 transition">
                      {/* Name & ID */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                              user.role === 'ADMIN' || user.role === 'SUPPLIER'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900 leading-tight">
                              {user.fullName}
                            </p>
                            <span className="font-mono text-[10px] text-stone-400">
                              {user.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-3.5">
                        <p className="text-stone-800 font-medium font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{user.phone}</span>
                        </p>
                        <p className="text-stone-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-stone-400" />
                          <span>{user.email}</span>
                        </p>
                        <p className="text-amber-800 font-mono font-semibold text-[11px] flex items-center gap-1 mt-0.5">
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          <span>PIN: {user.accessPin || '1234'}</span>
                          {user.password && <span className="text-stone-400 font-normal"> · PW: {user.password}</span>}
                        </p>
                      </td>

                      {/* Role Badge */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            user.role === 'ADMIN' || user.role === 'SUPPLIER'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {user.role === 'SUPPLIER' ? 'ADMIN (MERGED)' : user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-500 border border-stone-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-stone-400'}`} />
                          <span>{user.status}</span>
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="p-3.5 text-stone-500 font-mono text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.role === 'CUSTOMER' && (
                            <>
                              <a
                                href={`https://wa.me/${formatWhatsAppNumber(user.phone)}?text=${encodeURIComponent(
                                  `Namaskara ${user.fullName}!\n\nYour Mantralaya Arts customer account has been created by the administrator.\n\n📱 Registered Mobile: ${user.phone}\n🔑 Access PIN: ${user.accessPin || '1234'}\n🔒 Password: ${user.password || 'Lakshmi@123'}\n🆔 Customer ID: ${user.id}\n\nPlease visit our app to log in and explore sacred pooja essentials.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition"
                                title="Send WhatsApp Access PIN"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `Mantralaya Arts Customer Login:\nMobile: ${user.phone}\nPIN: ${user.accessPin || '1234'}\nPassword: ${user.password || 'Lakshmi@123'}\nCustomer ID: ${user.id}`
                                  );
                                  setCopiedUserId(user.id);
                                  setTimeout(() => setCopiedUserId(null), 2000);
                                }}
                                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
                                title="Copy Login Credentials"
                              >
                                {copiedUserId === user.id ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </>
                          )}

                          {user.role === 'CUSTOMER' && (
                            <button
                              onClick={() => setViewingOrdersUser(user)}
                              className="p-1.5 rounded-lg text-stone-500 hover:text-[#701A1E] hover:bg-stone-100 transition cursor-pointer"
                              title={`View ${userOrderCount} orders`}
                            >
                              <Package className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setFormError('');
                              setEditingUser({ ...user });
                            }}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              isActive
                                ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                                : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                            }`}
                            title={isActive ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Universal Responsive Pagination Controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Modal: Add User Profile (Supplier role option removed) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="bg-[#701A1E] text-amber-50 px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="font-cinzel text-base font-bold text-amber-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>Add New User Profile</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Smt. Radhika Shastri"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      placeholder="e.g. radhika@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">User Role *</label>
                    <select
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value as Role)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none bg-white font-medium"
                    >
                      <option value="CUSTOMER">Customer (Devotee)</option>
                      <option value="ADMIN">Administrator (Staff)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Account Status</label>
                    <select
                      value={addStatus}
                      onChange={(e) => setAddStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none bg-white font-medium"
                    >
                      <option value="ACTIVE">Active (Access Granted)</option>
                      <option value="INACTIVE">Inactive (Suspended)</option>
                    </select>
                  </div>
                </div>

                {/* PIN & Password Credential Setup */}
                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-stone-800 flex items-center gap-1.5 text-xs">
                      <KeyRound className="w-3.5 h-3.5 text-[#701A1E]" />
                      <span>Access PIN (4 Digits) *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAddAccessPin(String(Math.floor(1000 + Math.random() * 9000)))}
                      className="text-[10px] text-amber-800 hover:text-amber-950 font-semibold underline cursor-pointer"
                    >
                      Generate PIN
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addAccessPin}
                    onChange={(e) => setAddAccessPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 1234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono tracking-widest focus:ring-2 focus:ring-[#701A1E] focus:outline-none bg-white font-bold"
                  />

                  <div>
                    <label className="font-semibold text-stone-800 flex items-center gap-1.5 text-xs mb-1">
                      <Lock className="w-3.5 h-3.5 text-[#701A1E]" />
                      <span>Initial Password</span>
                    </label>
                    <input
                      type="text"
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      placeholder="e.g. Devotee@123"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#701A1E] focus:outline-none bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Users can authenticate with either this PIN or Password, and can self-reset via Mobile OTP anytime.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Delivery Address
                  </label>
                  <textarea
                    rows={2}
                    value={addAddress}
                    onChange={(e) => setAddAddress(e.target.value)}
                    placeholder="Temple street address for receiving prasad and orders..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Additional Notes</label>
                  <input
                    type="text"
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                    placeholder="e.g. Devotee regular pooja subscriber"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Create User Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User Profile */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="bg-[#701A1E] text-amber-50 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-cinzel text-base font-bold text-amber-100">
                  Edit Profile: {editingUser.fullName}
                </h3>
                <span className="text-[10px] text-amber-200/80 font-mono">ID: {editingUser.id}</span>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Account Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none bg-white"
                  >
                    <option value="ACTIVE">Active (Access Granted)</option>
                    <option value="INACTIVE">Inactive (Access Suspended)</option>
                  </select>
                </div>

                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-stone-800 flex items-center gap-1.5 text-xs">
                        <KeyRound className="w-3.5 h-3.5 text-[#701A1E]" />
                        <span>Access PIN</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingUser({ ...editingUser, accessPin: String(Math.floor(1000 + Math.random() * 9000)) })}
                        className="text-[10px] text-amber-800 hover:text-amber-950 font-semibold underline cursor-pointer"
                      >
                        Generate PIN
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={editingUser.accessPin || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, accessPin: e.target.value.replace(/\D/g, '') })}
                      placeholder="e.g. 1234"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono tracking-widest focus:ring-2 focus:ring-[#701A1E] focus:outline-none font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-800 flex items-center gap-1.5 text-xs mb-1">
                      <Lock className="w-3.5 h-3.5 text-[#701A1E]" />
                      <span>Account Password</span>
                    </label>
                    <input
                      type="text"
                      value={editingUser.password || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                      placeholder="e.g. Lakshmi@123"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-[#701A1E] focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Delivery Address</label>
                  <textarea
                    rows={2}
                    value={editingUser.deliveryAddress || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, deliveryAddress: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Additional Notes</label>
                  <input
                    type="text"
                    value={editingUser.notes || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#701A1E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#701A1E] hover:bg-[#581216] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View User Orders */}
      {viewingOrdersUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            <div className="bg-[#701A1E] text-amber-50 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-cinzel text-base font-bold text-amber-100 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-300" />
                  <span>Order History: {viewingOrdersUser.fullName}</span>
                </h3>
                <span className="text-[10px] text-amber-200/80 font-mono">
                  {viewingOrdersUser.id} · {viewingOrdersUser.phone}
                </span>
              </div>
              <button
                onClick={() => setViewingOrdersUser(null)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {(() => {
                const userOrders = orders.filter((o) => o.customerId === viewingOrdersUser.id);
                if (userOrders.length === 0) {
                  return (
                    <div className="text-center py-10 text-stone-500 text-xs">
                      No order records found for this devotee profile.
                    </div>
                  );
                }
                return (
                  <div className="space-y-4">
                    {userOrders.map((ord) => (
                      <div key={ord.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-stone-900">
                            #{ord.orderNumber}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            {ord.currentStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 font-mono">
                          Placed on: {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                          <span className="text-stone-600">{ord.items.length} items</span>
                          <span className="font-mono font-bold text-[#701A1E]">
                            ₹{(ord.revisedTotal || ord.originalTotal).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
