import { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Star, Plus, Loader2 } from 'lucide-react';
import { userService } from '../services/userService';

const Users = ({ restaurantId, restaurantName }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {

        const result = await userService.getUsers(restaurantId);
        if (result.success) {
            setUsers(result.data);
            setLoading(false);
            setError(null);
        } else {
            setError(result.error);
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchUsers();
    }, [restaurantId]);

     return (
         <div>
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {restaurantName ? `${restaurantName} - Users` : 'Users'}
                    </h1>
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Users</h3>
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
                        <p className="text-gray-600 mb-4">You haven't added any users yet. Get started by adding your first user.</p>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors mx-auto">
                            <Plus className="h-5 w-5 mr-2" />
                            Add Your First User
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Users List</h3>
                        <p className="text-sm text-gray-600">
                            {restaurantName ? `View and manage users for ${restaurantName}` : 'View and manage all your users'}
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Store className="h-5 w-5 text-gray-400 mr-3" />
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user?.full_name || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                                                <div className="text-sm text-gray-900">
                                                    {user?.email || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                                                <div className="text-sm text-gray-900">
                                                    {user?.phone_number || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Star className="h-5 w-5 text-gray-400 mr-3" />
                                                <div className="text-sm text-gray-900">
                                                    {user?.role || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-purple-600 hover:text-purple-900 cursor-pointer">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
