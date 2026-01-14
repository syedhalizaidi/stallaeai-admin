import React, { useState, useEffect } from "react";
import { useToast } from "../contexts/ToastContext";
import { knowledgeBaseService } from "../services/knowledgeBaseService";
import { useBusinessContext } from "../contexts/BusinessContext";
import { Loader2, Trash2, Upload, FileText } from "lucide-react";

const KnowledgePage = () => {
  const { showSuccess, showError } = useToast();
  const { selectedBusiness } = useBusinessContext();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [faqFiles, setFaqFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileType, setFileType] = useState("faq");
  const [selectedFileType, setSelectedFileType] = useState("all");

  const fetchFAQFiles = async () => {
    if (!selectedBusiness) return;
    setLoading(true);
    const result = await knowledgeBaseService.getFAQFiles(selectedBusiness.id);
    setLoading(false);
    if (result.success) setFaqFiles(result.data);
    else showError(result.error || "Failed to fetch FAQ files.");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      showError("Only PDF and Word files are allowed");
      e.target.value = "";
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showError("File size cannot exceed 5MB");
      e.target.value = "";
      return;
    }
    setSelectedFiles([file]);
    showSuccess(`${file.name} selected`);
  };

  const handleUpload = async () => {
    if (!selectedBusiness) return showError("Please select a business first.");
    if (selectedFiles.length === 0)
      return showError("Please select at least one file to upload.");
    try {
      setLoading(true);
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("file_type", fileType);
        const result = await knowledgeBaseService.uploadFAQ(
          selectedBusiness.id,
          formData
        );
        if (!result.success)
          showError(result.error || `Failed to upload ${file.name}`);
      }
      showSuccess("Files uploaded successfully!");
      setSelectedFiles([]);
      fetchFAQFiles();
    } catch {
      showError("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!selectedBusiness) return;
    try {
      setLoading(true);
      const result = await knowledgeBaseService.deleteFAQFile(
        selectedBusiness.id,
        fileId
      );
      setLoading(false);
      if (result.success) {
        showSuccess("File deleted successfully!");
        fetchFAQFiles();
      } else showError(result.error);
    } catch {
      setLoading(false);
      showError("Failed to delete file.");
    }
  };

  const filteredFiles =
    selectedFileType === "all"
      ? faqFiles
      : faqFiles.filter((file) => file.file_type === selectedFileType);

  useEffect(() => {
    fetchFAQFiles();
  }, [selectedBusiness]);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl shadow-md p-5 mb-8">
          <h1 className="text-2xl font-semibold mb-1">Knowledge Base</h1>
          <p className="text-sm opacity-80">
            Upload and manage proposal or FAQ documents for each business.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-5 mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Upload className="w-5 h-5 text-purple-600" />
            Upload Files
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Type *
            </label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 customSelect rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="faq">FAQ</option>
              <option value="knowledge_base">Knowledge Base</option>
              <option value="instruction">Instructions</option>
            </select>
          </div>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700"
          />
          {selectedFiles.length > 0 && (
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
          <button
            onClick={handleUpload}
            disabled={loading || selectedFiles.length === 0}
            className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
              loading || selectedFiles.length === 0
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" /> Upload Files
              </>
            )}
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Uploaded Files
            </h2>
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <button
                onClick={() => setSelectedFileType("all")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedFileType === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFileType("faq")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedFileType === "faq"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                FAQ
              </button>
              <button
                onClick={() => setSelectedFileType("knowledge_base")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedFileType === "knowledge_base"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Knowledge Base
              </button>
              <button
                onClick={() => setSelectedFileType("instruction")}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedFileType === "instruction"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Instructions
              </button>
            </div>
          </div>
          {loading ? (
            <p className="text-gray-600 flex items-center gap-2">
              <Loader2 className="animate-spin w-5 h-5" /> Loading files...
            </p>
          ) : filteredFiles.length === 0 ? (
            <p className="text-gray-600">
              {selectedFileType === "all"
                ? "No files uploaded yet."
                : `No ${
                    selectedFileType === "faq" ? "FAQ" : selectedFileType === "knowledge_base" ? "Knowledge Base" : "Instructions"
                  } files uploaded yet.`}
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <li
                  key={file.id}
                  className="flex justify-between items-center flex-col md:flex-row p-3 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-800 font-medium md:w-[410px] w-[100%]">
                          {file.filename}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium text-center ${
                            file.file_type === "faq"
                              ? "bg-blue-100 text-blue-700"
                              : file.file_type === "knowledge_base" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {file.file_type === "faq" ? "FAQ" : file.file_type === "knowledge_base" ? "Knowledge Base" : "Instructions"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(file.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgePage;
