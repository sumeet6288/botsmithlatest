// Article exports
export { default as QuickStartGuide } from './QuickStartGuide';
export { default as AddingKnowledgeBase } from './AddingKnowledgeBase';
export { default as CustomizationOptions } from './CustomizationOptions';
export { default as AnalyticsInsights } from './AnalyticsInsights';
export { default as SharingDeployment } from './SharingDeployment';
export { default as ChatbotManagement } from './ChatbotManagement';

// Map article IDs to components
export const articleRoutes = {
  'quick-start-guide': QuickStartGuide,
  'adding-knowledge-base': AddingKnowledgeBase,
  'customization-options': CustomizationOptions,
  'analytics-insights': AnalyticsInsights,
  'sharing-deployment': SharingDeployment,
  'chatbot-management': ChatbotManagement,
};
