import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Clock, DollarSign, ArrowLeft, ChevronRight, X, Utensils } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';
import TextField from '../TextField';
import TextAreaField from '../TextAreaField';
import SelectField from '../SelectField';
import NumberField from '../NumberField';
import MenuItemsList from './MenuItemsList';
import { useToast } from '../../contexts/ToastContext';

const CATEGORY_MAP = {
    restaurant: [
        { value: "Appetizers", label: "Appetizers" },
        { value: "Soups", label: "Soups" },
        { value: "Salad", label: "Salad" },
        { value: "Main Courses", label: "Main Courses" },
        { value: "Desserts", label: "Desserts" },
        { value: "Beverages", label: "Beverages" },
        { value: "Side Dishes", label: "Side Dishes" },
        { value: "Other", label: "Other" }
    ],

    car_dealership: [
        { value: "Sedan", label: "Sedan" },
        { value: "SUV", label: "SUV" },
        { value: "Truck", label: "Truck" },
        { value: "Coupe", label: "Coupe" },
        { value: "Convertible", label: "Convertible" },
        { value: "Hatchback", label: "Hatchback" },
        { value: "Van", label: "Van" },
        { value: "Electric", label: "Electric" },
        { value: "Hybrid", label: "Hybrid" },
        { value: "Other", label: "Other" }
    ],

    barber: [
        { value: "Haircut", label: "Haircut" },
        { value: "Beard", label: "Beard" },
        { value: "Shave", label: "Shave" },
        { value: "Kids Cut", label: "Kids Cut" },
        { value: "Hair Color", label: "Hair Color" },
        { value: "Facial", label: "Facial" },
        { value: "Packages", label: "Packages" },
        { value: "Other", label: "Other" }
    ]
};


const Menu = ({ onNext, onPrevious, businessType }) => {
    const categories = CATEGORY_MAP[businessType] || CATEGORY_MAP["restaurant"];
    const { showError } = useToast();
    const [showAddForm, setShowAddForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [menuItems, setMenuItems] = useState([]);

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
        formData.append('category', data.category);
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
                    />
                )}
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 cursor-pointer mt-6"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add New Menu Item</span>
                </button>
            </div>

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

                        {/* Price and Prep Time Row */}
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
                                label="Prep Time (minutes) *"
                                name="prepTime"
                                placeholder="15"
                                min="1"
                                icon={Clock}
                                error={errors.prepTime?.message}
                                {...register('prepTime', {
                                    required: 'Prep time is required',
                                    min: {
                                        value: 1,
                                        message: 'Prep time must be at least 1 minute'
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
