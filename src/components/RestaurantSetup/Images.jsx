import { useState, useEffect } from 'react';
import { Camera, Upload, X, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const Images = ({ onNext, onPrevious }) => {
    const { showError } = useToast();
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [exteriorFiles, setExteriorFiles] = useState([]);
    const [exteriorPreviews, setExteriorPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const navigate = useNavigate();

    const handleLogoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file size (3MB = 3 * 1024 * 1024 bytes)
            const maxSize = 3 * 1024 * 1024;
            if (file.size > maxSize) {
                showError('Logo file size must be less than 3MB');
                event.target.value = ''; // Clear the input
                return;
            }
            
            setLogoFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setLogoPreview(previewUrl);
        }
    };

    const handleExteriorUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file size (3MB = 3 * 1024 * 1024 bytes)
            const maxSize = 3 * 1024 * 1024;
            if (file.size > maxSize) {
                showError('Exterior image file size must be less than 3MB');
                event.target.value = ''; // Clear the input
                return;
            }
            
            // Clean up previous preview if exists
            if (exteriorPreviews.length > 0) {
                URL.revokeObjectURL(exteriorPreviews[0]);
            }
            setExteriorFiles([file]);
            setExteriorPreviews([URL.createObjectURL(file)]);
        }
    };

    const removeExteriorImage = () => {
        // Clean up the URL to prevent memory leaks
        if (exteriorPreviews.length > 0) {
            URL.revokeObjectURL(exteriorPreviews[0]);
        }
        setExteriorFiles([]);
        setExteriorPreviews([]);
    };

    const removeLogo = () => {
        if (logoPreview) {
            URL.revokeObjectURL(logoPreview);
        }
        setLogoFile(null);
        setLogoPreview(null);
    };

    // Cleanup URLs on component unmount
    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(logoPreview);
            }
            exteriorPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [logoPreview, exteriorPreviews]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isUpdate) {

        if (!logoFile || !exteriorFiles.length) return;

        setIsSubmitting(true);

        try {
            const restaurantId = localStorage.getItem('restaurant_id');
            const formData = new FormData();

            if (restaurantId) {
                formData.append("restaurant_id", restaurantId);
            }

            if (logoFile) {
                formData.append("logo", logoFile);
            }

            if (exteriorFiles.length > 0) {
                formData.append("exterior", exteriorFiles[0]);
            }

            const response = await restaurantService.uploadRestaurantImages(formData);

            if (response.success) {
                if (onNext) onNext();
            }
            else {
                showError(response.error);
            }
        } catch (err) {
            console.error('Error uploading business images:', err);
        } finally {
            setIsSubmitting(false);
        }

        } else {

            const hasNewLogo = logoFile && logoFile instanceof File;
            const hasNewExterior = exteriorFiles.length > 0 && exteriorFiles[0] instanceof File;
            
            if (!hasNewLogo && !hasNewExterior) {
                if (onNext) onNext();
                return;
            }
            
            setIsSubmitting(true);
            
            try {
                const restaurantId = localStorage.getItem('restaurant_id');
                const formData = new FormData();
                formData.append("restaurant_id", restaurantId);
                
                // Only append files that are actual File objects
                if (hasNewLogo) {
                    formData.append("logo", logoFile);
                }
                
                if (hasNewExterior) {
                    formData.append("exterior", exteriorFiles[0]);
                }
                
                const response = await restaurantService.updateRestaurantImages(restaurantId, formData);
                
                if (response.success) {
                    if (onNext) onNext();
                }
                else {
                    showError(response.error);
                }
            } catch (err) {
                console.error('Error updating business images:', err);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const getRestaurantImages = async () => {
        const restaurantId = localStorage.getItem('restaurant_id');
        const response = await restaurantService.getRestaurantImages(restaurantId);
        if (response.success) {
            if (response.data.logo) {
                setLogoPreview(response.data.logo);
                setIsUpdate(true);
            }

            if (response.data.exterior && response.data.exterior.length > 0) {
                const exteriorUrls = response.data.exterior.map(item => item.url);
                setExteriorPreviews(exteriorUrls);
                setIsUpdate(true);
            }
        }
    };

    useEffect(() => {
        getRestaurantImages();
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Images</h2>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Uploading...' : 'Complete Setup'}
                        </button>
                    </div>
                    {/* Restaurant Logo Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">Business Logo</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Required
                            </span>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 lg:p-8 text-center hover:border-gray-400 transition-colors">
                            {logoFile || logoPreview ? (
                                <div className="space-y-4">
                                    <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm sm:text-base font-medium text-gray-900">Upload Your Logo</p>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            A high-quality logo helps customers recognize your brand
                                        </p>
                                    </div>
                                    <label className="inline-flex items-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose Logo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Restaurant Exterior Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">Business Exterior</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Required
                            </span>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 lg:p-8 text-center hover:border-gray-400 transition-colors">
                            {exteriorFiles.length > 0 || exteriorPreviews.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                        <img
                                            src={exteriorPreviews[0]}
                                            alt="Exterior preview"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeExteriorImage}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm sm:text-base font-medium text-gray-900">Show customers what your business looks like</p>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            Upload a photo of your business exterior
                                        </p>
                                    </div>
                                    <label className="inline-flex items-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Add Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleExteriorUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className=" flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
                        >
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shadow-sm">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            <span>Back to Dashboard</span>
                        </button>
                        {onPrevious && (
                            <button
                                type="button"
                                onClick={onPrevious}
                                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 shadow-sm  text-[var(--text-muted)] font-medium rounded-md text-gray-700 bg-[var(--bg-primary)] border border-[var(--border-primary)] hover:bg-gray-50"
                            >
                                Previous
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Uploading...' : 'Complete Setup'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Images;
