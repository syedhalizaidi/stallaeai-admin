import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { X, Building2, Loader2 } from 'lucide-react';
import SelectField from '../SelectField';
import { businessService } from '../../services/businessService';

const AddBusinessModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset
    } = useForm({
        defaultValues: {
            category: ''
        }
    });

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const result = await businessService.getBusinessCategories();
            if (result.success) {
                // Transform API response to match SelectField format
                const transformedCategories = result.data.map(item => ({
                    value: item.value,
                    label: item.value.charAt(0).toUpperCase() + item.value.slice(1).replace(/_/g, ' ')
                }));
                setCategories(transformedCategories);
            } else {
                console.error('Failed to fetch categories:', result.error);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const onSubmit = async (data) => {
        navigate(`/setup?step=basic-info&category=${encodeURIComponent(data.category)}`);
        reset();
        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Add Business</h2>
                            <p className="text-sm text-gray-600">Select your business type</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <SelectField
                        label="Business Category"
                        name="category"
                        options={categories}
                        placeholder={loadingCategories ? "Loading categories..." : "Select business category"}
                        error={errors.category?.message}
                        required
                        disabled={loadingCategories}
                        {...register('category', {
                            required: 'Category is required',
                            validate: (value) => value !== '' || 'Please select a category'
                        })}
                    />

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white cursor-pointer`}
                        >
                            Continue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBusinessModal;
