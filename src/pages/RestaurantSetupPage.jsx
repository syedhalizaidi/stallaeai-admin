import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Home, Menu as MenuIcon, Camera, Scissors, Car, ArrowLeft } from "lucide-react";
import BasicInfo from "../components/RestaurantSetup/BasicInfo";
import Menu from "../components/RestaurantSetup/Menu";
import Images from "../components/RestaurantSetup/Images";
import BarberForm from "../components/SetupBusiness/BarberForm";
import CarDealershipForm from "../components/SetupBusiness/CarDealershipForm";

const RestaurantSetupPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState("basic-info");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editId, setEditId] = useState(null);
  const [businessType] = useState(searchParams.get("businessType"));
  const [basicInfoData, setBasicInfoData] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [imagesData, setImagesData] = useState([]);

  const steps = [
    { id: "basic-info", name: "Basic Info", icon: Home },
    { id: "menu", name: "Menu", icon: MenuIcon },
    { id: "images", name: "Images", icon: Camera },
  ];

  useEffect(() => {
    const step = searchParams.get("step") || "basic-info";
    const category = searchParams.get("category");
    const editIdParam = searchParams.get("editId");

    setCurrentStep(step);
    setEditId(editIdParam);
    if (category) {
      setSelectedCategory(decodeURIComponent(category));
    }
  }, [searchParams]);

  const handleStepChange = (stepId) => {
    setCurrentStep(stepId);
    setSearchParams({ step: stepId });
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.id === currentStep);
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex();
    return Math.round((currentIndex / (steps.length - 1)) * 100);
  };
  const currentIndex = getCurrentStepIndex();


  const renderCurrentStep = () => {
    if (selectedCategory === "barber") {
      return (
        <BarberForm
          onNext={() => {
            navigate("/dashboard");
          }}
        />
      );
    }

    if (selectedCategory === "car_dealership") {
      return (
        <CarDealershipForm
          onNext={() => {
            navigate("/dashboard");
          }}
        />
      );
    }

    switch (currentStep) {
      case "basic-info":
        return (
          <BasicInfo
            data={basicInfoData}
            onNext={(data) => {
              setBasicInfoData(data);
              handleStepChange("menu");
            }}
            editId={editId}
            isEditMode={!!editId}
            businessType={businessType}
          />
        );
      case "menu":
        return (
          <Menu
            data={menuData}
            onNext={(data) => {
              setMenuData(data);
              handleStepChange("images");
            }}
            onPrevious={() => handleStepChange("basic-info")}
            editId={editId}
            businessType={businessType}
            isEditMode={!!editId}
          />
        );
      case "images":
        return (
          <Images
            data={imagesData}
            onPrevious={(data) => {
              setImagesData(data);
              handleStepChange("menu");
            }}
            onNext={() => navigate("/dashboard")}
            editId={editId}
            isEditMode={!!editId}
          />
        );
      default:
        return (
          <BasicInfo
            onNext={() => handleStepChange("menu")}
            editId={editId}
            isEditMode={!!editId}
          />
        );
    }
  };

  return (
    <div className="flex-1 p-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
      >
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span>Back to Dashboard</span>
      </button>
      {selectedCategory === "barber" ||
      selectedCategory === "car_dealership" ? (
        <div className="max-w-6xl mx-auto">{renderCurrentStep()}</div>
      ) : (
        <>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Setup Your Business
              </h1>
              <p className="text-gray-600">
                Let's get your business ready for AI-powered orders
              </p>
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
      const isEditMode = !!editId;
      const canNavigate = isActive || isEditMode;

      return (
        <button
          key={step.id}
          onClick={() => handleStepChange(step.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
            isActive
              ? "bg-blue-600 text-white shadow-lg transform scale-105"
              : canNavigate
              ? "text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer" 
              : "text-gray-400 bg-gray-100 cursor-not-allowed opacity-60"
          }`}
          disabled={!canNavigate}
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
        </>
      )}
    </div>
  );
};

export default RestaurantSetupPage;
