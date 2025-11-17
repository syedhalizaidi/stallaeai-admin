import React, { useEffect, useMemo, useState } from 'react';
import SelectField from '../components/SelectField';
import { businessService } from '../services/businessService';
import { useToast } from '../contexts/ToastContext';

const VoicePage = () => {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [selectedVoicePreviewUrl, setSelectedVoicePreviewUrl] = useState('');
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [hasExistingVoice, setHasExistingVoice] = useState(false);
  const [voiceChanged, setVoiceChanged] = useState(false);

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
      setHasExistingVoice(false);
      setVoiceChanged(false);
      return;
    }

    const fetchVoicesAndCheckBusinessVoice = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const voicesResult = await businessService.getVoices();
        if (voicesResult.success) {
          const list = voicesResult.data?.voices || [];
          setVoices(list ?? []);
        } else {
          setError(voicesResult.error || 'Failed to fetch voices');
        }

        // Check if selected business has a voice from the businesses listing
        const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
        if (selectedBusiness && selectedBusiness.voice) {
          const businessVoice = selectedBusiness.voice;

          const voicesList = voicesResult.success ? (voicesResult.data?.voices || []) : [];
          const matchingVoice = voicesList.find(v => {
            const nameMatch = v.name === businessVoice.name;
            return nameMatch;
          });
          
          if (matchingVoice) {
            const voiceId = matchingVoice.id;
            setSelectedVoiceId(voiceId);
            setSelectedVoicePreviewUrl(businessVoice.preview_url || '');
            setSelectedVoiceName(businessVoice.name || '');
            setHasExistingVoice(true);
            setVoiceChanged(false); 
          } else {
            setSelectedVoiceId('');
            setSelectedVoicePreviewUrl('');
            setSelectedVoiceName('');
            setHasExistingVoice(true);
            setVoiceChanged(false); 
          }
        } else {
          setSelectedVoiceId('');
          setSelectedVoicePreviewUrl('');
          setSelectedVoiceName('');
          setHasExistingVoice(false);
          setVoiceChanged(false);
        }
      } catch (error) {
        setError('Failed to fetch voice data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoicesAndCheckBusinessVoice();
  }, [selectedBusinessId]);


  const businessOptions = useMemo(() => {
    return businesses?.map((b) => ({ value: b.id, label: b.name }));
  }, [businesses]);
  
  const voiceOptions = useMemo(() => {
    return (voices || []).map((v) => ({ value: v.id || v.voice_id, label: v.name }));
  }, [voices]);

  const handleVoiceChange = (e) => {
    const newVoiceId = e.target.value;
    setSelectedVoiceId(newVoiceId);
    
    const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
    
    setVoiceChanged(true);
    
    if (selectedBusiness && selectedBusiness.voice) {
      setHasExistingVoice(true);
    } else {
      setHasExistingVoice(false);
    }
    
    const match = voices.find((v) => (v.id || v.voice_id) === newVoiceId);
    const preview = match?.preview_url || '';
    const name = match?.name || '';
    setSelectedVoicePreviewUrl(preview);
    setSelectedVoiceName(name);
  };

  const handleSubmit = async () => {
    if (!selectedVoiceId || !selectedBusinessId) {
      showError('Please select both business and voice');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
      const selectedVoice = voices.find(v => (v.id || v.voice_id) === selectedVoiceId);
      
      const voiceData = {
        name: selectedVoice?.name || '',
        category: selectedVoice?.category || '',
        gender: selectedVoice?.gender || '',
        preview_url: selectedVoice?.preview_url || '',
        business_id: selectedBusinessId,
        id: selectedVoiceId
      };

      // Use appropriate API based on whether voice already exists
      let result;
      if (hasExistingVoice) {
        // Update existing voice assignment
        result = await businessService.updateVoice(selectedBusinessId, voiceData);
      } else {
        // Create new voice assignment
        result = await businessService.createVoice(voiceData);
      }
      
      if (result.success) {
        const businessName = selectedBusiness?.name || 'Business';
        const voiceName = selectedVoice?.name || 'Voice';
        const action = hasExistingVoice ? 'updated' : 'assigned';
        showSuccess(`Voice ${voiceName} ${action} to ${businessName} successfully`);
        setHasExistingVoice(true); 
        setVoiceChanged(false);
        
        // Refresh business listing to get updated voice information
        const refreshResult = await businessService.getBusinesses();
        if (refreshResult.success) {
          setBusinesses(refreshResult.data);
        }
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('Failed to assign voice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            onChange={handleVoiceChange}
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
            // Show button only if:
            // 1. Business has no voice and user selected a voice (voiceChanged will be true)
            // 2. Business has voice and user changed the selection (voiceChanged will be true)
            (voiceChanged || (!hasExistingVoice && selectedVoiceId)) && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-2 px-4 rounded-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors font-medium ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isSubmitting ? 'Processing...' : (hasExistingVoice ? 'Update Voice' : 'Assign Voice')}
              </button>
            )
          )}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </div>
  );
};

export default VoicePage;


