import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Phone, Shield, Loader2 } from 'lucide-react';
import { userService } from '../services/userService';
import { useForm } from 'react-hook-form';
import TextField from './TextField';
import SelectField from './SelectField';

const roleOptions = [
    { value: 'Proprietor', label: 'Proprietor' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Staff', label: 'Staff' },
    { value: 'Customer', label: 'Customer' },
];

const AddUserModal = ({ isOpen, onClose, restaurantId, onUserAdded, editUser = null }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const isEditMode = !!editUser;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        clearErrors
    } = useForm({
        defaultValues: {
            full_name: '',
            email: '',
            password: '',
            phone_number: '',
            role: ''
        }
    });

    // Reset form when editUser changes
    useEffect(() => {
        if (editUser) {
            reset({
                full_name: editUser.full_name || '',
                email: editUser.email || '',
                password: '',
                phone_number: editUser.phone_number || '',
                role: editUser.role || ''
            });
        } else {
            reset({
                full_name: '',
                email: '',
                password: '',
                phone_number: '',
                role: ''
            });
        }
    }, [editUser, reset]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const payload = {
                full_name: data.full_name,
                email: data.email,
                phone_number: data.phone_number,
                role: data.role,
                restaurant_id: restaurantId
            };

            // Add password only for create mode
            if (!isEditMode) {
                payload.password = data.password;
            }

            let result;
            if (isEditMode) {
                result = await userService.updateUser(editUser.id, payload);
            } else {
                result = await userService.createUser(payload);
            }

            if (result.success) {
                setSubmitMessage(result.message);
                reset();

                // Call the callback to refresh users list
                if (onUserAdded) {
                    onUserAdded();
                }

                setTimeout(() => {
                    setSubmitMessage('');
                    onClose();
                }, 3000);
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} user`, error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            clearErrors();
            reset();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEditMode ? 'Edit User' : 'Add New User'}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X className="h-6 w-6 cursor-pointer" />
                    </button>
                </div>

                <div className="p-6">
                    {submitMessage && (
                        <div className={`p-4 rounded-lg text-sm ${submitMessage.includes('successfully')
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {submitMessage}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <TextField
                        label="Full Name"
                        type="text"
                        placeholder="Enter full name"
                        icon={User}
                        error={errors.full_name?.message}
                        {...register('full_name', {
                            required: 'Full name is required'
                        })}
                    />
                    <TextField
                        label="Email"
                        type="email"
                        placeholder="Enter email address"
                        icon={Mail}
                        error={errors.email?.message}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        })}
                    />
                    {!isEditMode && (
                        <TextField
                            label="Password"
                            type="password"
                            placeholder="Enter password"
                            icon={Lock}
                            error={errors.password?.message}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters"
                                },
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                                }
                            })}
                        />
                    )}
                    <TextField
                        label="Phone Number"
                        type="tel"
                        placeholder="e.g. +923001234567"
                        icon={Phone}
                        error={errors.phone_number?.message}
                        {...register('phone_number', {
                            required: 'Phone number is required',
                            pattern: {
                                value: /^[\+]?[1-9][\d]{0,15}$/,
                                message: "Please enter a valid phone number"
                            }
                        })}
                    />
                    <SelectField
                        label="Role"
                        placeholder="Select a role"
                        icon={Shield}
                        error={errors.role?.message}
                        options={roleOptions}
                        {...register('role', {
                            required: 'Role is required'
                        })}
                    />

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {isEditMode ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                isEditMode ? 'Update User' : 'Create User'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
