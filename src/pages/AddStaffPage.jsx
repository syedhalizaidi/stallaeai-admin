import { useState, useEffect } from "react";
import {
  Store,
  MapPin,
  Phone,
  Plus,
  Loader2,
  SquarePen,
  Trash2,
} from "lucide-react";
import { userService } from "../services/userService";
import DeleteUserModal from "../components/DeleteUserModal";
import AddUserModal from "../components/AddUserModal";


const AddStaffPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const userRole = localStorage.getItem("userRole")?.replace(/"/g, "");

  const fetchUsers = async () => {
    const result = await userService.listUser();
    if (result.success) {
      setUsers(result.data);
      setLoading(false);
      setError(null);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const result = await userService.deleteUser(userToDelete.id);
      if (result.success) {
        fetchUsers();
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsAddUserModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsAddUserModalOpen(true);
  };

  const handleUserAdded = () => {
    fetchUsers();
  };

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false);
    setEditingUser(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{"Users"}</h1>
          {userRole !== "Staff" && (
            <button
              onClick={handleAddUser}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add User
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading Users...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Users
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchUsers}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Users Found
            </h3>
            {userRole !== "Staff" && (
              <>
                <p className="text-gray-600 mb-4">
                  You haven't added any users yet. Get started by adding your
                  first user.
                </p>
                <button
                  onClick={handleAddUser}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors mx-auto cursor-pointer"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First User
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Users List</h3>
            <p className="text-sm text-gray-600">
              {"View and manage all your users"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FullName
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  {(userRole === "Admin" ||
                    userRole === "Proprietor") && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Store className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {user?.full_name || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm text-gray-900">
                          {user?.email || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm text-gray-900">
                          {user?.phone_number || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">
                          {user?.role || "N/A"}
                        </div>
                      </div>
                    </td>
                    {(userRole === "Admin" ||
                      userRole === "Proprietor") && (
                        <td className="px-6 py-4 flex gap-2 whitespace-nowrap text-sm font-medium">
                          <SquarePen
                            className="h-5 w-5 text-purple-600 mr-3 cursor-pointer"
                            onClick={() => handleEditUser(user)}
                          />
                          <Trash2
                            className="h-5 w-5 text-red-500 mr-3 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user);
                            }}
                          />
                        </td>
                      )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseModal}
        onUserAdded={handleUserAdded}
        editUser={editingUser}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteUser}
        userName={userToDelete?.full_name || userToDelete?.email || "this user"}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AddStaffPage;
