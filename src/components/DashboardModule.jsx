import { useState } from 'react';
import { Store, MapPin, Star, Building2 } from 'lucide-react';
import AddBusinessModal from './SetupBusiness/AddBusinessModal';

const DashboardModule = () => {
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);

  const stats = {
    totalRestaurants: 1,
    activeLocations: 1,
    inactiveLocations: 1,
    averageRating: 0
  };

  return (
    <div>
      {/* Header with Business Button */}
      <div className="flex sm:flex-row flex-col justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your restaurant management dashboard</p>
        </div>
         <div className="w-full sm:w-auto mt-4 sm:mt-0">
           <button 
             onClick={() => setIsAddBusinessModalOpen(true)}
             className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors cursor-pointer"
           >
             <Building2 className="h-5 w-5 mr-2" />
             Add Business
           </button>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Restaurants</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.totalRestaurants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Active Locations</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.activeLocations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Inactive Locations</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.inactiveLocations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats?.averageRating > 0 ? stats?.averageRating : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Business Modal */}
      <AddBusinessModal 
        isOpen={isAddBusinessModalOpen}
        onClose={() => setIsAddBusinessModalOpen(false)}
      />
    </div>
  );
};

export default DashboardModule;
