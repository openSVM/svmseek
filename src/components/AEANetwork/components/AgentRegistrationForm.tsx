import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  FormHelperText,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { 
  validateAndSanitizeUrl, 
  validateRepositoryUrl 
} from '../../../utils/urlSanitizer';
import { 
  createValidatedInputHandler, 
  ValidationPresets 
} from '../../../utils/inputValidation';

interface AgentFormData {
  name: string;
  description: string;
  repository: string;
  documentation: string;
  endpoint: string;
  capabilities: string[];
  tags: string[];
}

interface AgentRegistrationFormProps {
  onSubmit: (data: AgentFormData) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
}

export const AgentRegistrationForm: React.FC<AgentRegistrationFormProps> = ({
  onSubmit,
  isLoading,
  onCancel
}) => {
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    repository: '',
    documentation: '',
    endpoint: '',
    capabilities: [],
    tags: []
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [newCapability, setNewCapability] = useState('');
  const [newTag, setNewTag] = useState('');

  // Create input handlers with validation
  const handleNameChange = createValidatedInputHandler(
    (value) => setFormData(prev => ({ ...prev, name: value })),
    (error) => setErrors(prev => ({ ...prev, name: error || '' })),
    { ...ValidationPresets.shortText, required: true }
  );

  const handleDescriptionChange = createValidatedInputHandler(
    (value) => setFormData(prev => ({ ...prev, description: value })),
    (error) => setErrors(prev => ({ ...prev, description: error || '' })),
    { ...ValidationPresets.description, required: true }
  );

  const handleRepositoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, repository: value }));
    
    if (value.trim()) {
      const validation = validateRepositoryUrl(value);
      setErrors(prev => ({
        ...prev,
        repository: validation.isValid ? '' : validation.error || 'Invalid repository URL'
      }));
    } else {
      setErrors(prev => ({ ...prev, repository: '' }));
    }
  };

  const handleDocumentationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, documentation: value }));
    
    if (value.trim()) {
      const validation = validateAndSanitizeUrl(value);
      setErrors(prev => ({
        ...prev,
        documentation: validation.isValid ? '' : validation.error || 'Invalid documentation URL'
      }));
    } else {
      setErrors(prev => ({ ...prev, documentation: '' }));
    }
  };

  const handleEndpointChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, endpoint: value }));
    
    if (value.trim()) {
      const validation = validateAndSanitizeUrl(value);
      setErrors(prev => ({
        ...prev,
        endpoint: validation.isValid ? '' : validation.error || 'Invalid endpoint URL'
      }));
    } else {
      setErrors(prev => ({ ...prev, endpoint: '' }));
    }
  };

  const addCapability = () => {
    if (newCapability.trim() && !formData.capabilities.includes(newCapability.trim())) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, newCapability.trim()]
      }));
      setNewCapability('');
    }
  };

  const removeCapability = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter(c => c !== capability)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate required fields
    const requiredErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      requiredErrors.name = 'Agent name is required';
    }
    
    if (!formData.description.trim()) {
      requiredErrors.description = 'Description is required';
    }
    
    if (!formData.repository.trim()) {
      requiredErrors.repository = 'Repository URL is required';
    }
    
    if (Object.keys(requiredErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...requiredErrors }));
      return;
    }
    
    // Check for existing validation errors
    if (Object.values(errors).some(error => error)) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to register agent'
      }));
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      role="form"
      aria-label="Agent registration form"
    >
      <TextField
        label="Agent Name"
        value={formData.name}
        onChange={handleNameChange}
        error={!!errors.name}
        helperText={errors.name}
        required
        fullWidth
        inputProps={{
          'aria-describedby': 'agent-name-help',
          maxLength: 100
        }}
        FormHelperTextProps={{
          id: 'agent-name-help'
        }}
      />

      <TextField
        label="Description"
        value={formData.description}
        onChange={handleDescriptionChange}
        error={!!errors.description}
        helperText={errors.description || 'Describe what this agent does and its capabilities'}
        required
        fullWidth
        multiline
        rows={3}
        inputProps={{
          'aria-describedby': 'agent-description-help',
          maxLength: 500
        }}
        FormHelperTextProps={{
          id: 'agent-description-help'
        }}
      />

      <TextField
        label="Repository URL"
        value={formData.repository}
        onChange={handleRepositoryChange}
        error={!!errors.repository}
        helperText={errors.repository || 'GitHub, GitLab, or other git repository URL'}
        required
        fullWidth
        type="url"
        inputProps={{
          'aria-describedby': 'agent-repository-help',
          maxLength: 2048
        }}
        FormHelperTextProps={{
          id: 'agent-repository-help'
        }}
      />

      <TextField
        label="Documentation URL (Optional)"
        value={formData.documentation}
        onChange={handleDocumentationChange}
        error={!!errors.documentation}
        helperText={errors.documentation || 'Link to documentation or README'}
        fullWidth
        type="url"
        inputProps={{
          'aria-describedby': 'agent-docs-help',
          maxLength: 2048
        }}
        FormHelperTextProps={{
          id: 'agent-docs-help'
        }}
      />

      <TextField
        label="Endpoint URL (Optional)"
        value={formData.endpoint}
        onChange={handleEndpointChange}
        error={!!errors.endpoint}
        helperText={errors.endpoint || 'API endpoint for interacting with the agent'}
        fullWidth
        type="url"
        inputProps={{
          'aria-describedby': 'agent-endpoint-help',
          maxLength: 2048
        }}
        FormHelperTextProps={{
          id: 'agent-endpoint-help'
        }}
      />

      {/* Capabilities */}
      <Box>
        <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>
          Capabilities
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, marginBottom: 1, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Add capability..."
            value={newCapability}
            onChange={(e) => setNewCapability(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
            sx={{ flexGrow: 1, minWidth: 200 }}
            inputProps={{
              maxLength: 50,
              'aria-label': 'Add new capability'
            }}
          />
          <Button
            variant="outlined"
            onClick={addCapability}
            disabled={!newCapability.trim()}
            aria-label="Add capability"
          >
            <AddIcon />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {formData.capabilities.map((capability, index) => (
            <Chip
              key={index}
              label={capability}
              onDelete={() => removeCapability(capability)}
              size="small"
              color="primary"
              variant="outlined"
              aria-label={`Capability: ${capability}. Click to remove.`}
            />
          ))}
        </Box>
        <FormHelperText>Add relevant capabilities (e.g., "data analysis", "web scraping")</FormHelperText>
      </Box>

      {/* Tags */}
      <Box>
        <Typography variant="subtitle2" sx={{ marginBottom: 1 }}>
          Tags
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, marginBottom: 1, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            sx={{ flexGrow: 1, minWidth: 200 }}
            inputProps={{
              maxLength: 30,
              'aria-label': 'Add new tag'
            }}
          />
          <Button
            variant="outlined"
            onClick={addTag}
            disabled={!newTag.trim()}
            aria-label="Add tag"
          >
            <AddIcon />
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {formData.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              onDelete={() => removeTag(tag)}
              size="small"
              color="secondary"
              variant="outlined"
              aria-label={`Tag: ${tag}. Click to remove.`}
            />
          ))}
        </Box>
        <FormHelperText>Add descriptive tags for easier discovery</FormHelperText>
      </Box>

      {errors.submit && (
        <Alert severity="error" role="alert">
          {errors.submit}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
          onClick={onCancel} 
          disabled={isLoading}
          aria-label="Cancel agent registration"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || Object.values(errors).some(error => error)}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
          aria-label="Register agent"
        >
          {isLoading ? 'Registering...' : 'Register Agent'}
        </Button>
      </Box>
    </Box>
  );
};