import React, { useState } from "react";
import { X, Upload, Download, FileJson, AlertCircle, CheckCircle2 } from "lucide-react";
import Button from "../../Button";
import { useToast } from "../../../contexts/ToastContext";
import { uploadMenuFile } from "../../../services/restaurantDashboardService";

const UploadMenuModal = ({ isOpen, onClose, restaurantId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { showError, showSuccess } = useToast();

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/menu-template.json";
    link.download = "menu-template.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Template downloaded successfully!");
  };

  const validateMenuJSON = (data) => {
    if (!data.categories || !Array.isArray(data.categories)) {
      return "Invalid format: 'categories' array is required";
    }

    for (let i = 0; i < data.categories.length; i++) {
      const category = data.categories[i];
      
      if (!category.category_name) {
        return `Category ${i + 1}: 'category_name' is required`;
      }

      if (!category.items || !Array.isArray(category.items)) {
        return `Category '${category.category_name}': 'items' array is required`;
      }

      for (let j = 0; j < category.items.length; j++) {
        const item = category.items[j];
        
        if (!item.name) {
          return `Category '${category.category_name}', Item ${j + 1}: 'name' is required`;
        }
        
        if (item.price === undefined || item.price === null) {
          return `Item '${item.name}': 'price' is required`;
        }

        if (typeof item.price !== "number" || item.price < 0) {
          return `Item '${item.name}': 'price' must be a positive number`;
        }

      }
    }

    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setValidationError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/json") {
      setValidationError("Please select a valid JSON file");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setValidationError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setValidationError("");

    try {
      // Validate JSON format before uploading
      const fileContent = await selectedFile.text();
      const menuData = JSON.parse(fileContent);

      const validationError = validateMenuJSON(menuData);
      if (validationError) {
        setValidationError(validationError);
        setIsUploading(false);
        return;
      }

      // Upload the file using the API
      const response = await uploadMenuFile(restaurantId, selectedFile);

      if (response.success) {
        showSuccess(response.message || "Menu file uploaded successfully!");
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        handleClose();
      } else {
        setValidationError(response.message || "Failed to upload menu file");
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        setValidationError("Invalid JSON format. Please check your file.");
      } else {
        setValidationError(error.message || "Failed to upload menu");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setValidationError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileJson className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Menu File</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Download the template file by clicking the button below</li>
              <li>Open the file in any text editor (Notepad, TextEdit, VS Code, etc.)</li>
              <li>Replace the example data with your own menu items</li>
              <li>Make sure to keep the same structure and format</li>
              <li>Save the file and upload it here</li>
            </ol>
          </div>

          {/* Download Template Button */}
          <div className="flex justify-center">
            <Button
              variant="secondary"
              onClick={handleDownloadTemplate}
              icon={<Download size={18} />}
              iconPosition="start"
            >
              Download Template File
            </Button>
          </div>

          {/* File Format Example */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Required Format</h3>
            <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
              {`{
  "categories": [
    {
      "category_name": "Manicures",
      "items": [
        {
          "name": "Classic Manicure",
          "price": 30,
          "duration": "30 min",
          "description": "Basic manicure service"
        }
      ]
    }
  ]
}`}
            </pre>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p><strong>Required fields:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li><code className="bg-gray-200 px-1 rounded">name</code> - Item name (text)</li>
                <li><code className="bg-gray-200 px-1 rounded">price</code> - Price (number, e.g., 30 or 30.50)</li>
                <li><code className="bg-gray-200 px-1 rounded">duration</code> - Duration (text, e.g., "30 min")</li>
              </ul>
              <p className="mt-2"><strong>Optional field:</strong></p>
              <ul className="list-disc list-inside ml-2">
                <li><code className="bg-gray-200 px-1 rounded">description</code> - Item description (text)</li>
              </ul>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select JSON File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-50 file:text-purple-700
                  hover:file:bg-purple-100
                  file:cursor-pointer cursor-pointer"
              />
            </div>
            {selectedFile && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>{selectedFile.name}</span>
              </div>
            )}
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Validation Error</h4>
                  <p className="text-sm text-red-700 mt-1">{validationError}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            icon={!isUploading && <Upload size={18} />}
            iconPosition="start"
          >
            {isUploading ? "Uploading..." : "Upload Menu"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadMenuModal;
