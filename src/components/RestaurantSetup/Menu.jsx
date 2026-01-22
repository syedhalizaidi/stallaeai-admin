import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Clock, DollarSign, ArrowLeft, ChevronRight, X, Utensils, Upload } from 'lucide-react';
import { getMenuCategories, bulkDeleteMenuItems } from '../../services/restaurantDashboardService';
import { restaurantService } from '../../services/restaurantService';
import TextField from '../TextField';
import TextAreaField from '../TextAreaField';
import SelectField from '../SelectField';
import NumberField from '../NumberField';
import MenuItemsList from './MenuItemsList';
import UploadMenuModal from '../MenuComponents/UploadMenuModal/index';
import { useToast } from '../../contexts/ToastContext';

const Menu = ({ onNext, onPrevious, businessType }) => {
    const [fetchedCategories, setFetchedCategories] = useState([]);
    const hasPredefinedCategories = fetchedCategories.length > 0;
    const categories = fetchedCategories;
    useEffect(() => {
        const fetchCategories = async () => {
            if (businessType) {
                const response = await getMenuCategories(businessType);
                const apiData = response.data?.data;
                
                if (response.success && Array.isArray(apiData)) {
                    const formattedCategories = apiData.map((cat) => {
                        if (typeof cat === "string") {
                            return { value: cat, label: cat };
                        }
                        return {
                            value: cat.name || cat.value || cat,
                            label: cat.name || cat.label || cat,
                        };
                    });
                    setFetchedCategories(formattedCategories);
                }
            }
        };
        fetchCategories();
    }, [businessType]);

    const { showError } = useToast();
    const [showAddForm, setShowAddForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [customCategory, setCustomCategory] = useState('');

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
        defaultValues: {
            name: '',
            category: '',
            description: '',
            price: 0,
            prepTime: 15,
            image: null
        }
    });

    const onSubmit = async (data) => {
        const restaurantId = localStorage.getItem('restaurant_id');
        const formData = new FormData();
        formData.append('restaurant_id', restaurantId);
        formData.append('name', data.name);
        formData.append(
            'category',
            hasPredefinedCategories && data.category === 'Other'
                ? customCategory
                : data.category
        );
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('prep_time', data.prepTime);

        if (data.image) {
            formData.append("images", data.image);
        }

        try {
            setIsLoading(true);
            const result = await restaurantService.createMenuItem(formData);
            if (result.success) {
                reset();
                setUploadedImage(null);
                setCustomCategory('');
                setShowAddForm(false);
                // Refresh menu items list
                getMenuItems();
            }
            else {
                showError(result.message);
            }
        } catch (error) {
            showError(error.response.data.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        reset();
        setUploadedImage(null);
        setCustomCategory('');
        setShowAddForm(false);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setValue('image', file);

            // Create preview for display
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setUploadedImage(null);
        setValue('image', null);
    };

    const getMenuItems = async () => {
        const restaurantId = localStorage.getItem('restaurant_id');
        try {
            const result = await restaurantService.getMenuItems(restaurantId);
            if (result.success) {
                setMenuItems(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const handleEditItem = async (itemId, data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('category', data.category);
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('prep_time', data.prepTime);

        if (data.image) {
            formData.append("images", data.image);
        }

        if (data.delete_image) {
            formData.append("delete_image", "true");
        }

        try {
            const result = await restaurantService.updateMenuItem(itemId, formData);
            if (result.success) {
                getMenuItems();
            } else {
                console.error('Failed to update menu item:', result.error);
            }
        } catch (error) {
            console.error('Error updating menu item:', error);
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            const result = await restaurantService.deleteMenuItem(itemId);
            if (result.success) {
                getMenuItems();
            } else {
                console.error('Failed to delete menu item:', result.error);
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
        }
    };

    const handleBulkDelete = async (ids) => {
        try {
            const result = await bulkDeleteMenuItems(ids);
            if (result.success) {
                getMenuItems();
            } else {
                console.error('Failed to bulk delete menu items:', result.error);
            }
        } catch (error) {
            console.error('Error bulk deleting menu items:', error);
        }
    };

    useEffect(() => {
        getMenuItems();
    }, []);

    return (
        <div className="p-8">
            <div className="mb-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <span className="text-3xl mr-2">≡</span>
                        Menu
                    </h2>
                </div>
                {menuItems?.length > 0 && (
                    <MenuItemsList
                        menuItems={menuItems}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                        onBulkDelete={handleBulkDelete}
                        businessType={businessType}
                    />
                )}
                <div className="flex gap-3 flex-wrap mt-6">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add New Menu Item</span>
                    </button>
                    
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer"
                    >
                        <Upload className="h-4 w-4" />
                        <span>Upload Menu File</span>
                    </button>
                </div>
            </div>

            {/* Upload Menu Modal */}
            <UploadMenuModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                restaurantId={localStorage.getItem('restaurant_id')}
                onUploadSuccess={getMenuItems}
            />

            {/* Add Menu Item Form */}
            {showAddForm && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Add New Menu Item
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Image for Current Item
                            </label>
                            <div className="flex items-center space-x-4">
                                {/* Upload Box - only show if no image is uploaded */}
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={!!uploadedImage}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className={`${uploadedImage ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                    >
                                        <div className={`border-2 border-dashed rounded-lg p-8 text-center w-32 h-32 flex items-center justify-center ${uploadedImage
                                            ? 'border-gray-200 bg-gray-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}>
                                            <div className={`text-4xl ${uploadedImage
                                                ? 'text-gray-400'
                                                : 'text-blue-600'
                                                }`}>+</div>
                                        </div>
                                    </label>
                                </>

                                {/* Image Display - only show if an image is uploaded */}
                                {uploadedImage && (
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full overflow-hidden">
                                            <img
                                                src={uploadedImage}
                                                alt="Uploaded"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-lg px-2 py-1 flex items-center space-x-1 text-xs hover:bg-red-600 shadow-sm cursor-pointer"
                                        >
                                            <span className="text-white">×</span>
                                            <span className="text-white font-medium">Remove</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                You can upload up to 1 images. (Optional)
                            </p>
                        </div>

                        {/* Item Name and Category Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <TextField
                                label="Item Name *"
                                name="name"
                                placeholder="Item Name"
                                error={errors.name?.message}
                                {...register('name', {
                                    required: 'Item name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Item name must be at least 2 characters'
                                    }
                                })}
                            />

                            {hasPredefinedCategories ? (
                                <>
                                    <SelectField
                                        label="Category *"
                                        name="category"
                                        placeholder="Select category"
                                        options={categories}
                                        error={errors.category?.message}
                                        {...register('category', {
                                            required: 'Category is required'
                                        })}
                                    />
                                    {watch('category') === 'Other' && (
                                        <TextField
                                            label="Custom Category *"
                                            name="customCategory"
                                            placeholder="Enter your category"
                                            value={customCategory}
                                            onChange={(e) => setCustomCategory(e.target.value)}
                                            error={!customCategory ? 'Custom category is required' : ''}
                                        />
                                    )}
                                </>
                            ) : (
                                <TextField
                                    label="Category *"
                                    name="category"
                                    placeholder="Enter category"
                                    error={errors.category?.message}
                                    {...register('category', {
                                        required: 'Category is required'
                                    })}
                                />
                            )}
                        </div>

                        {/* Description */}
                        <TextAreaField
                            label="Description"
                            name="description"
                            placeholder="Brief description of the item"
                            rows={3}
                            error={errors.description?.message}
                            {...register('description')}
                        />

                        {/* Price and Duration Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <NumberField
                                label="Price *"
                                name="price"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                icon={DollarSign}
                                error={errors.price?.message}
                                {...register('price', {
                                    required: 'Price is required',
                                    min: {
                                        value: 0.01,
                                        message: 'Price must be greater than 0'
                                    }
                                })}
                            />

                            <NumberField
                                label="Duration (minutes) *"
                                name="prepTime"
                                placeholder="15"
                                min="1"
                                icon={Clock}
                                error={errors.prepTime?.message}
                                {...register('prepTime', {
                                    required: 'Duration is required',
                                    min: {
                                        value: 1,
                                        message: 'Duration must be at least 1 minute'
                                    }
                                })}
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-between pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        <span>Add to Menu</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                    onClick={onPrevious}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 invisible"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous</span>
                </button>
                <button
                    onClick={onNext}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <span>Next: Images</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Menu;
