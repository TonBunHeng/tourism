import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import UsersHeader from './UsersHeader';
import UsersStats from './UsersStats';
import UsersToolbar from './UsersToolbar';
import UsersList from './UsersList';
import UserModal from './UserModal';
import UserDetailsModal from './UserDetailsModal';
import userService from '../../services/userService';
import authService, { normalizeRole } from '../../services/authService';
import { useAlert } from '../../context/AlertContext';
import { useSearch } from '../../context/SearchContext';
import SimplePagination from '../../components/common/SimplePagination';
import { getPageCache, setPageCache } from '../../utils/pageCache';

export default function Users() {
  const { showConfirm, showSuccess, showError } = useAlert();
  const { searchTerm, setSearchTerm } = useSearch();
  const cachedData = getPageCache('users_data');
  const [users, setUsers] = useState(() => cachedData?.users || []);
  const [isLoading, setIsLoading] = useState(() => !cachedData);

  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [quickFilter, setQuickFilter] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(() => cachedData?.totalRecords || 0);
  const [totalPages, setTotalPages] = useState(() => cachedData?.totalPages || 1);
  const itemsPerPage = 10;

  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = normalizeRole(currentUser?.role) === 'super_admin';

  const roles = ["All", "Super Admin", "Admin", "Business Owner", "Tourism Content Editor", "User"];
  const statuses = ["All", "Active", "Inactive", "Suspended", "Online", "Offline"];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "User",
    status: "Active",
    location: "",
    subscription: "Free",
    avatar: ""
  });

  const loadUsers = async (showLoadingState = true) => {
    if (showLoadingState && !getPageCache('users_data')) setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;

      if (quickFilter === 'admins') {
        params.role = 'admin';
      } else if (selectedRole !== "All") {
        params.role = normalizeRole(selectedRole);
      }

      if (selectedStatus !== "All" && selectedStatus !== "Online" && selectedStatus !== "Offline") {
        params.status = selectedStatus;
      }

      const res = await userService.getUsers(params);
      if (res && (res.success || Array.isArray(res.data) || res.data)) {
        const rawList = Array.isArray(res.data)
          ? res.data
          : (Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res) ? res : []));

        let formatted = rawList.map(u => {
          const isOnline = Boolean(u.is_online);
          const rawStatus = u.status || 'Active';
          const capitalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

          return {
            ...u,
            status: capitalizedStatus,
            onlineStatus: isOnline ? "Online" : "Offline",
            joinDate: u.created_at ? u.created_at.split("T")[0] : "2024-01-01",
            lastActive: u.last_active_human || (u.last_active_at ? u.last_active_at.replace("T", " ").substring(0, 16) : (isOnline ? "Online Now" : "Offline")),
            reviews: u.reviews_count || u.reviews || 0,
            favorites: u.favorites_count || u.favorites || 0,
            places: 0,
            reports: 0,
            twoFactorAuth: Boolean(u.two_factor_auth),
            activity: u.activity_level || (isOnline ? "High" : "Medium"),
          };
        });

        if (quickFilter === 'admins') {
          formatted = formatted.filter(u => ['super_admin', 'admin'].includes(normalizeRole(u.role)));
        }

        if (selectedStatus === "Online") {
          formatted = formatted.filter(u => u.onlineStatus === "Online");
        } else if (selectedStatus === "Offline") {
          formatted = formatted.filter(u => u.onlineStatus === "Offline");
        }

        setUsers(formatted);
        const meta = res.meta || res.data?.meta;
        const total = meta ? (meta.total || formatted.length) : formatted.length;
        const pages = meta ? (meta.last_page || Math.ceil((meta.total || formatted.length) / itemsPerPage) || 1) : 1;
        setTotalRecords(total);
        setTotalPages(pages);
        setPageCache('users_data', { users: formatted, totalRecords: total, totalPages: pages });
      }
    } catch (e) {
      console.error("Failed to load users from API", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(true);

    const interval = setInterval(() => {
      loadUsers(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPage, searchTerm, selectedRole, selectedStatus, quickFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearchChange = (val) => { setSearchTerm(val); setCurrentPage(1); };
  const handleRoleChange = (val) => { setSelectedRole(val); setCurrentPage(1); };
  const handleStatusChange = (val) => { setSelectedStatus(val); setCurrentPage(1); };
  const handleQuickFilterChange = (val) => { setQuickFilter(val); setCurrentPage(1); };

  const handleView = (userOrId) => {
    const userToView = typeof userOrId === "object" ? userOrId : users.find(u => u.id === userOrId);
    if (userToView) {
      setViewingUser(userToView);
    }
  };

  const handleDelete = async (id) => {
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) return;

    if (currentUser && Number(currentUser.id) === Number(id)) {
      showError("You cannot delete your own logged-in account.", "Action Blocked");
      return;
    }

    const isTargetSuperAdmin = normalizeRole(targetUser.role) === 'super_admin';
    if (isTargetSuperAdmin && !isSuperAdmin) {
      showError("Only Super Administrators can delete Super Admin accounts.", "Access Denied");
      return;
    }

    const confirmed = await showConfirm({
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user account "${targetUser.name}" (${targetUser.email})?\n\nThis action cannot be undone.`,
      confirmText: 'Delete User',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      const res = await userService.deleteUser(id);
      if (res?.success !== false) {
        showSuccess(`User account "${targetUser.name}" has been deleted successfully.`, 'User Deleted');
        loadUsers();
      } else {
        showError(res.message || "Failed to delete user.", 'Delete Failed');
      }
    } catch (e) {
      showError(e.message || "Failed to delete user.", 'Delete Failed');
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
      status: "Active",
      location: "",
      subscription: "Free",
      avatar: ""
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (user) => {
    const isTargetSuperAdmin = normalizeRole(user.role) === 'super_admin';
    if (isTargetSuperAdmin && !isSuperAdmin) {
      showError("Only Super Administrators can modify Super Admin accounts.", "Access Denied");
      return;
    }

    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      password: "",
      role: normalizeRole(user.role),
      status: user.status || "Active",
      location: user.location || "",
      subscription: user.subscription || "Free",
      avatar: user.avatar || ""
    });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingUser(null);
  };

  const handleFormChange = (updatedData) => {
    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showError("Please enter full name and email address.", "Validation Failed");
      return;
    }

    try {
      const payload = {
        ...formData,
        role: normalizeRole(formData.role)
      };

      if (editingUser) {
        if (!payload.password) delete payload.password;
        await userService.updateUser(editingUser.id, payload);
        showSuccess(`User account "${formData.name}" updated successfully.`, 'User Updated');
      } else {
        await userService.createUser(payload);
        showSuccess(`User account "${formData.name}" created successfully.`, 'User Created');
      }
      closeModal();
      loadUsers();
    } catch (e) {
      showError(e.message || "Failed to save user.", 'Save Failed');
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + users.length, totalRecords);

  return (
    <div className="flex flex-col">
      {/* Header Section */}
      <UsersHeader
        onOpenAddModal={openAddModal}
      />

      {/* Stats Cards */}
      <UsersStats users={users} />

      {/* Main Users Table / Grid Section */}
      <div className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] rounded-md shadow-sm border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden flex-1">
        <UsersToolbar
          totalCount={totalRecords}
          selectedRole={selectedRole}
          onRoleChange={handleRoleChange}
          roles={roles}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          statuses={statuses}
          quickFilter={quickFilter}
          onQuickFilterChange={handleQuickFilterChange}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#003E83] dark:text-blue-500 animate-spin" />
              <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Loading user accounts...</p>
            </div>
          </div>
        ) : (
          <UsersList
            users={users}
            startIndex={startIndex}
            onViewDetails={handleView}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        )}

        {/* Simple Pagination Footer */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={totalRecords}
          label="users"
        />
      </div>

      {/* Create / Edit User Modal */}
      <UserModal
        isOpen={isAddModalOpen}
        editingUser={editingUser}
        userData={formData}
        newUserData={formData}
        onUserChange={handleFormChange}
        onNewUserChange={handleFormChange}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      {/* View User Details Modal */}
      {viewingUser && (
        <UserDetailsModal
          user={viewingUser}
          isOpen={Boolean(viewingUser)}
          onClose={() => setViewingUser(null)}
          onEdit={() => {
            const userToEdit = viewingUser;
            setViewingUser(null);
            openEditModal(userToEdit);
          }}
        />
      )}
    </div>
  );
}
