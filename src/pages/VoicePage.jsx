import React, { useEffect, useMemo, useState } from 'react';
import SelectField from '../components/SelectField';
import { businessService } from '../services/businessService';
import Sidebar from '../components/Sidebar';
import { useToast } from '../contexts/ToastContext';

const VoicePage = () => {
  const { showSuccess } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [selectedVoicePreviewUrl, setSelectedVoicePreviewUrl] = useState('');
  const [selectedVoiceName, setSelectedVoiceName] = useState('');

  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoading(true);
      setError('');
      const result = await businessService.getBusinesses();
      if (result.success) {
        setBusinesses(result.data);
      } else {
        setError(result.error || 'Failed to fetch businesses');
      }
      setIsLoading(false);
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (!selectedBusinessId) {
      setVoices([]);
      setSelectedVoiceId('');
      setSelectedVoicePreviewUrl('');
      setSelectedVoiceName('');
      return;
    }

    const fetchVoices = async () => {
      setIsLoading(true);
      const result = await businessService.getVoices();
      if (result.success) {
        const list = result.data?.voices || result.data || [];
        setVoices(Array.isArray(list) ? list : []);
      } else {
        setError((prev) => prev || result.error || 'Failed to fetch voices');
      }
      setIsLoading(false);
    };
    fetchVoices();
  }, [selectedBusinessId]);

  useEffect(() => {
    if (!selectedVoiceId) {
      setSelectedVoicePreviewUrl('');
      setSelectedVoiceName('');
      return;
    }
    const match = voices.find((v) => (v.id || v.voice_id) === selectedVoiceId);
    const preview = match?.preview_url || '';
    const name = match?.name || '';
    setSelectedVoicePreviewUrl(preview);
    setSelectedVoiceName(name);
  }, [selectedVoiceId, voices]);

  const businessOptions = useMemo(() => {
    return businesses?.map((b) => ({ value: b.id, label: b.name }));
  }, [businesses]);
  
  const voiceOptions = useMemo(() => {
    return (voices || []).map((v) => ({ value: v.id || v.voice_id, label: v.name }));
  }, [voices]);

  const handleSubmit = () => {
  
    const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
    const businessName = selectedBusiness?.name || 'Business';
    const voiceName = selectedVoiceName || 'Voice';
    
    showSuccess(`Voice ${voiceName} assigned to ${businessName} successfully`, 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Voice</h1>
          <p className="text-gray-500">Select a business to continue</p>
        </div>

        <div className="max-w-xl space-y-4">
          <SelectField
            label="Business"
            name="businessId"
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            options={businessOptions}
            placeholder={isLoading ? 'Loading businesses...' : 'Select business'}
            disabled={isLoading}
            required
          />
          <SelectField
            label="Voice"
            name="voiceId"
            value={selectedVoiceId}
            onChange={(e) => setSelectedVoiceId(e.target.value)}
            options={voiceOptions}
            placeholder={!selectedBusinessId ? 'Select business first' : (isLoading ? 'Loading voices...' : 'Select voice')}
            disabled={isLoading || !selectedBusinessId}
            required
          />
          {selectedVoiceName && (
            <div className="text-sm text-gray-700">Selected voice: <span className="font-medium">{selectedVoiceName}</span></div>
          )}
          {selectedVoicePreviewUrl && (
            <audio key={selectedVoicePreviewUrl} src={selectedVoicePreviewUrl} controls autoPlay className="w-full" />
          )}
          {selectedBusinessId && selectedVoiceId && (
            <button
              onClick={handleSubmit}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Submit
            </button>
          )}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default VoicePage;


