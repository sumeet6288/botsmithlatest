// Available AI models and providers
export const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: [
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    ]
  },
  google: {
    name: 'Google (Gemini)',
    models: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
    ]
  }
};

export const getProviderForModel = (model) => {
  for (const [provider, data] of Object.entries(AI_PROVIDERS)) {
    if (data.models.some(m => m.value === model)) {
      return provider;
    }
  }
  return 'openai'; // Default
};

export const getAllModels = () => {
  const allModels = [];
  Object.entries(AI_PROVIDERS).forEach(([provider, data]) => {
    data.models.forEach(model => {
      allModels.push({
        ...model,
        provider,
        providerName: data.name
      });
    });
  });
  return allModels;
};
