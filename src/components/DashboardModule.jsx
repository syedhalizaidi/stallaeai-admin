import { Store, MapPin, Phone, Star, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantService } from '../services/restaurantService';

const DashboardModule = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await restaurantService.getRestaurants();

      if (response.success) {
        const restaurantData = response.data || [];
        setRestaurants(restaurantData);

        // Navigate to restaurants if no restaurants found
        if (restaurantData.length === 0) {
          navigate('/restaurants');
        }
      } else {
        setError(response.error || 'Failed to fetch restaurants');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalRestaurants: restaurants?.length,
    activeLocations: 1,
    inactiveLocations: 1,
    averageRating: 0
  };

  return (
    <div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 mt-4 sm:mt-[100px]">
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

      {/* Restaurant List */}
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Restaurant List</h3>
            <p className="text-sm text-gray-600">View and manage all your restaurant locations</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading restaurants...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <Store className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Failed to load restaurants</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
            <button
              onClick={fetchRestaurants}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Restaurant Table */}
      {!loading && !error && restaurants.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Rating
                 </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {restaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center mr-3">
                      {restaurant?.logo ? (
                        <img
                          src={restaurant.logo}
                          alt={restaurant.name || 'Restaurant'}
                          className="h-full w-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <Store className="h-5 w-5 text-purple-600" style={{ display: restaurant?.logo ? 'none' : 'flex' }} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3" />
                      <div className="text-sm text-gray-900">
                        {restaurant.location ?
                          `${restaurant.location.street_address || ''} ${restaurant.location.city || ''}`
                          : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3" />
                      <div className="text-sm text-gray-900">
                        {restaurant.phone || restaurant.phone_number || 'N/A'}
                      </div>
                    </div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center">
                       <Star className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3" />
                       <div className="text-sm text-gray-900">
                         {restaurant.rating || 'N/A'}
                       </div>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DashboardModule;
