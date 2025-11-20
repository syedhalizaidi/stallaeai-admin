import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, Clock, DollarSign } from 'lucide-react';
import TextField from '../TextField';
import TextAreaField from '../TextAreaField';
import SelectField from '../SelectField';
import NumberField from '../NumberField';

const categories = [
    { value: 'Appetizers', label: 'Appetizers' },
    { value: 'Main Courses', label: 'Main Courses' },
    { value: 'Desserts', label: 'Desserts' },
    { value: 'Beverages', label: 'Beverages' },
    { value: 'Salads', label: 'Salads' },
    { value: 'Soups', label: 'Soups' },
    { value: 'Sides', label: 'Sides' },
    { value: 'Side Dishes', label: 'Side Dishes' },
    { value: 'Other', label: 'Other' }
];

const EditMenuItemModal = ({ isOpen, onClose, onUpdate, item }) => {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            name: '',
            category: '',
            description: '',
            price: 0,
            prepTime: 15
        }
    });

    useEffect(() => {
        if (item && isOpen) {
            setValue('name', item.name || '');
            setValue('category', item.category || '');
            setValue('description', item.description || '');
            setValue('price', item.price || 0);
            setValue('prepTime', item.prep_time || 15);
        }
    }, [item, isOpen, setValue]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await onUpdate(item.id, data);
            onClose();
        } catch (error) {
            console.error('Error updating menu item:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-lg relative text-left max-h-[90vh] overflow-y-auto">
                <button
                    onClick={handleCancel}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-none border-none"
                >
                    <X className="h-5 w-5" />
                </button>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Edit Menu Item
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

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
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    <span>Update</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMenuItemModal;
