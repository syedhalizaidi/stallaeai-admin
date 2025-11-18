import { useState, useEffect, useMemo, useRef } from "react";
import { SquarePen, ChevronDown, Volume2 } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { businessService } from "../services/businessService";

const VoiceControl = ({
  voice: initialVoice,
  businessId,
  voices: parentVoices,
  onVoiceUpdated,
}) => {
  const { showSuccess, showError } = useToast();
  const [voices, setVoices] = useState(parentVoices || []);
  const [selectedVoiceId, setSelectedVoiceId] = useState(
    initialVoice?.id || ""
  );
  const [selectedVoiceName, setSelectedVoiceName] = useState(
    initialVoice?.name || ""
  );
  const [selectedVoicePreviewUrl, setSelectedVoicePreviewUrl] = useState(
    initialVoice?.preview_url || ""
  );
  const [hasExistingVoice, setHasExistingVoice] = useState(!!initialVoice);
  const [voiceChanged, setVoiceChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [isEditing, setIsEditing] = useState(!initialVoice);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (parentVoices?.length) setVoices(parentVoices);
  }, [parentVoices]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleVoiceChange = (id) => {
    const match = voices.find((v) => (v.id || v.voice_id) === id);
    setSelectedVoiceId(id);
    setSelectedVoiceName(match?.name || "");
    setSelectedVoicePreviewUrl(match?.preview_url || "");
    setVoiceChanged(true);
    setDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedVoiceId || !businessId) {
      showError("Please select a voice");
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedVoice = voices.find(
        (v) => (v.id || v.voice_id) === selectedVoiceId
      );
      const voiceData = {
        name: selectedVoice?.name || "",
        category: selectedVoice?.category || "",
        gender: selectedVoice?.gender || "",
        preview_url: selectedVoice?.preview_url || "",
        business_id: businessId,
        id: selectedVoiceId,
      };
      const result = hasExistingVoice
        ? await businessService.updateVoice(businessId, voiceData)
        : await businessService.createVoice(voiceData);

      if (result.success) {
        showSuccess(`Voice ${selectedVoice?.name} assigned successfully`);
        setHasExistingVoice(true);
        setVoiceChanged(false);
        setIsEditing(false);
        onVoiceUpdated && onVoiceUpdated();
      } else {
        showError(result.error);
      }
    } catch {
      showError("Failed to assign voice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayPause = (voice) => {
    if (!voice.preview_url) return;
    if (playingVoiceId === voice.id || playingVoiceId === voice.voice_id) {
      currentAudio?.pause();
      setCurrentAudio(null);
      setPlayingVoiceId(null);
      return;
    }
    currentAudio?.pause();
    const audio = new Audio(voice.preview_url);
    setCurrentAudio(audio);
    setPlayingVoiceId(voice.id || voice.voice_id);
    audio.play().catch(() => setPlayingVoiceId(null));
    audio.addEventListener("ended", () => {
      setCurrentAudio(null);
      setPlayingVoiceId(null);
    });
  };

  const VoiceDropdown = () => (
    <div ref={dropdownRef} className="relative w-60">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-full flex justify-between items-center px-3 py-2 border rounded-lg bg-white hover:bg-gray-50"
      >
        <span>{selectedVoiceName || "Select voice"}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>
      {dropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          {voices.map((voice) => (
            <div
              key={voice.id || voice.voice_id}
              className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleVoiceChange(voice.id || voice.voice_id)}
            >
              <span>{voice.name}</span>
              {voice.preview_url && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause(voice);
                  }}
                  className="ml-2 p-1 rounded-full"
                >
                  <Volume2
                    className={`h-5 w-5 ${
                      playingVoiceId === (voice.id || voice.voice_id)
                        ? "text-purple-600"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!hasExistingVoice && !isEditing) {
    return <VoiceDropdown />;
  }

  return (
    <div className="flex items-center space-x-6">
      {!isEditing && hasExistingVoice ? (
        <>
          {selectedVoicePreviewUrl && (
            <button
              onClick={() =>
                handlePlayPause({
                  id: selectedVoiceId,
                  preview_url: selectedVoicePreviewUrl,
                })
              }
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Volume2
                className={`h-5 w-5 ${
                  playingVoiceId === selectedVoiceId
                    ? "text-purple-600"
                    : "text-gray-400"
                }`}
              />
            </button>
          )}
          <span>{selectedVoiceName}</span>

          <button
            onClick={() => setIsEditing(true)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <SquarePen className="h-4 w-4 text-purple-600" />
          </button>
        </>
      ) : (
        <>
          <VoiceDropdown />
          {voiceChanged && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`p-1 rounded-full bg-purple-600 text-white ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-purple-700"
              }`}
            >
              <SquarePen className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default VoiceControl;
