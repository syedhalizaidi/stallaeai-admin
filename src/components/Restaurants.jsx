import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Phone, Star, Plus, Loader2, ChevronRight, SquarePen, Trash2, BriefcaseBusiness, Volume2, Play, Pause } from 'lucide-react';
import { restaurantService } from '../services/restaurantService';
import Users from './Users';
import AddBusinessModal from './SetupBusiness/AddBusinessModal';
import BarberForm from './SetupBusiness/BarberForm';
import CarDealershipForm from './SetupBusiness/CarDealershipForm';
import DeleteBusinessModal from './DeleteBusinessModal';

const RestaurantsModule = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [businessType, setBusinessType] = useState(null);
  const [editBusinessId, setEditBusinessId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
  const [currentPlayingVoiceId, setCurrentPlayingVoiceId] = useState(null);
  const userRole = localStorage.getItem('userRole')?.replace(/"/g, '');

  const fetchBusinesses = async () => {
    const result = await restaurantService.getRestaurants();
        if (result.success) {
      setRestaurants(result.data);
      setLoading(false);
      setError(null);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurant(null);
  };

  const handleAddRestaurant = () => {
    setIsAddBusinessModalOpen(true);
  };

  const handleCategorySelected = (category) => {
    setSelectedCategory(category);
  };

  const handleDeleteClick = (restaurant) => {
    setBusinessToDelete(restaurant);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!businessToDelete) return;

    setIsDeleting(true);
    try {
      const result = await restaurantService.deleteRestaurant(businessToDelete.id);
      if (result.success) {
        fetchBusinesses();
        setIsDeleteModalOpen(false);
        setBusinessToDelete(null);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setBusinessToDelete(null);
  };

  const handleEditBusiness = (businessType, businessId) => {
    setBusinessType(businessType);
    setEditBusinessId(businessId);
    setIsEditMode(true);
  };

  const handleCloseEdit = () => {
    setIsEditMode(false);
    setBusinessType(null);
  };

  const handleEditSuccess = () => {
    setIsEditMode(false);
    setBusinessType(null);
    fetchBusinesses(); 
  };

  const handleVoicePlayPause = (e, restaurant) => {
    e.stopPropagation();
    
    if (!restaurant?.voice?.preview_url) return;
    
    const voiceId = restaurant.voice.id;
    
    // If this voice is currently playing, pause it
    if (currentPlayingVoiceId === voiceId && currentPlayingAudio) {
      currentPlayingAudio.pause();
      setCurrentPlayingAudio(null);
      setCurrentPlayingVoiceId(null);
      return;
    }
    
    // Stop any currently playing audio
    if (currentPlayingAudio) {
      currentPlayingAudio.pause();
    }
    
    // Start playing the new voice
    const audio = new Audio(restaurant.voice.preview_url);
    setCurrentPlayingAudio(audio);
    setCurrentPlayingVoiceId(voiceId);
    
    audio.play().catch(console.error);
    
    // Clean up when audio ends
    audio.addEventListener('ended', () => {
      setCurrentPlayingAudio(null);
      setCurrentPlayingVoiceId(null);
    });
  };

  // Function to render the appropriate form based on business type
  const renderBusinessForm = () => {
    if (!businessType) return null;

    const commonProps = {
      onNext: handleEditSuccess,
      editId: editBusinessId,
      isEditMode: true
    };

    if (businessType === 'restaurant') {
      navigate(`/setup?step=basic-info&editId=${editBusinessId}&businessType=${businessType}`);
    }

    switch (businessType) {
      case 'barber':
        return <BarberForm {...commonProps} />;
      case 'car_dealership':
        return <CarDealershipForm {...commonProps} />;
      case 'restaurant':
        return <BarberForm {...commonProps} />;
      default:
        return <BarberForm {...commonProps} />;
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            {selectedRestaurant ? (
              <>
                <span
                  className="text-gray-500 font-medium cursor-pointer hover:text-purple-600"
                  onClick={handleBackToRestaurants}
                >
                  Business
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500 font-medium">{selectedRestaurant.name}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-purple-600 font-medium">Users</span>
              </>
            ) : (
              <span className="text-purple-600 font-medium">Business</span>
            )}
          </nav>
        </div>

        <div className="flex space-x-4">
          {!selectedRestaurant && (
            <button
              onClick={handleAddRestaurant}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors cursor-pointer"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Business
            </button>
          )}
        </div>
      </div>

      {/* Content based on selection */}
      {selectedRestaurant ? (
        <Users
          restaurantId={selectedRestaurant.id}
          restaurantName={selectedRestaurant.name}
        />
      ) : (
        // Restaurant List
        loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading Businesses...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Businesses</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchBusinesses}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : restaurants?.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Businesses Found</h3>
              <p className="text-gray-600 mb-4">You haven't added any businesses yet. Get started by adding your first Business.</p>
              <button
                onClick={handleAddRestaurant}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors mx-auto cursor-pointer"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Business
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Businesses List</h3>
              <p className="text-sm text-gray-600">View and manage all your businesses</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Voice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Type
                    </th>
                    {(userRole === 'Admin' || userRole === 'Proprietor' || userRole === 'Manager') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {restaurants?.map((restaurant) => (
                    <tr
                      key={restaurant.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRestaurantClick(restaurant)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
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
                          <div className="text-sm font-medium text-gray-900">
                            {restaurant?.name || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Volume2 className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm text-gray-900">
                            {restaurant?.voice ? (
                              <div className="flex items-center space-x-2">
                                <span>{restaurant.voice.name}</span>
                                {restaurant.voice.preview_url && (
                                  <button
                                    onClick={(e) => handleVoicePlayPause(e, restaurant)}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    title={currentPlayingVoiceId === restaurant.voice.id ? "Pause voice" : "Play voice"}
                                  >
                                    {currentPlayingVoiceId === restaurant.voice.id ? (
                                      <Pause className="h-4 w-4 text-purple-600" />
                                    ) : (
                                      <Play className="h-4 w-4 text-purple-600" />
                                    )}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">No voice assigned</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm text-gray-900">
                            {restaurant?.phone_number || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BriefcaseBusiness className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm text-gray-900">
                            {restaurant?.business_type || 'N/A'}
                          </div>
                        </div>
                      </td>
                      {(userRole === 'Admin' || userRole === 'Proprietor' || userRole === 'Manager') && (
                        <td className="px-6 py-4 flex gap-2 whitespace-nowrap text-sm font-medium">
                          <SquarePen
                            className="h-5 w-5 text-purple-600 mr-3 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBusiness(restaurant?.business_type, restaurant.id);
                            }}
                          />
                          <Trash2
                            className="h-5 w-5 text-red-500 mr-3 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(restaurant);
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
        )
      )}

      {/* Add Business Modal */}
      <AddBusinessModal
        isOpen={isAddBusinessModalOpen}
        onClose={() => setIsAddBusinessModalOpen(false)}
        onCategorySelected={handleCategorySelected}
      />

       {/* Edit Business Modal */}
       {isEditMode && businessType && (
         <div className="fixed inset-0  flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}>
           <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6">
               {renderBusinessForm()}
               <div className="mt-4 flex justify-end">
                 <button
                   onClick={handleCloseEdit}
                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                 >
                   Cancel
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Delete Confirmation Modal */}
       <DeleteBusinessModal
         isOpen={isDeleteModalOpen}
         onClose={handleDeleteCancel}
         onConfirm={handleDeleteConfirm}
         businessName={businessToDelete?.name || 'this business'}
         isLoading={isDeleting}
       />

    </div>
  );
};

export default RestaurantsModule;
