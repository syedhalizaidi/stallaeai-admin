import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Home, MapPin, Menu as MenuIcon, Camera } from 'lucide-react';
import BasicInfo from '../components/RestaurantSetup/BasicInfo';
import Location from '../components/RestaurantSetup/Location';
import Menu from '../components/RestaurantSetup/Menu';
import Sidebar from '../components/Sidebar';

const RestaurantSetupPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentStep, setCurrentStep] = useState('basic-info');

    const steps = [
        { id: 'basic-info', name: 'Basic Info', icon: Home },
        { id: 'location', name: 'Location', icon: MapPin },
        { id: 'menu', name: 'Menu', icon: MenuIcon },
        { id: 'images', name: 'Images', icon: Camera },
    ];

    useEffect(() => {
        const step = searchParams.get('step') || 'basic-info';
        setCurrentStep(step);
    }, [searchParams]);

    const handleStepChange = (stepId) => {
        setCurrentStep(stepId);
        setSearchParams({ step: stepId });
    };

    const getCurrentStepIndex = () => {
        return steps.findIndex(step => step.id === currentStep);
    };

    const getProgressPercentage = () => {
        const currentIndex = getCurrentStepIndex();
        return Math.round((currentIndex / (steps.length - 1)) * 100);
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'basic-info':
                return (
                    <BasicInfo
                        onNext={() => handleStepChange('location')}
                    />
                );
            case 'location':
                return (
                    <Location
                        onNext={() => handleStepChange('menu')}
                        onPrevious={() => handleStepChange('basic-info')}
                    />
                );
            case 'menu':
                return (
                    <Menu
                        onNext={() => handleStepChange('images')}
                        onPrevious={() => handleStepChange('location')}
                    />
                );
            case 'images':
                return <div>Images Step - Coming Soon</div>;
            default:
                return (
                    <BasicInfo
                        onNext={() => handleStepChange('location')}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Your Restaurant</h1>
                        <p className="text-gray-600">Let's get your restaurant ready for AI-powered orders</p>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-sm font-medium text-gray-700">
                            Step {getCurrentStepIndex() + 1} of {steps.length}
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                            {getProgressPercentage()}% Complete
                        </div>
                    </div>

                    {/* Step Navigation */}
                    <div className="flex justify-center mb-8">
                        <div className="flex space-x-2 bg-white rounded-lg p-2 shadow-sm border border-gray-200">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = step.id === currentStep;
                                const isCompleted = index < getCurrentStepIndex();

                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => handleStepChange(step.id)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : isCompleted
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{step.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Current Step Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {renderCurrentStep()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantSetupPage;
