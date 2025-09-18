import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CurrencySettings, TaxPresetZA } from '@/types/money';
import { DEFAULT_CURRENCY_SETTINGS } from '@/utils/currency';

interface SettingsState {
  currency: CurrencySettings;
  taxSettings: TaxPresetZA | null;
  disclaimerAccepted: boolean;
  autoSave: boolean;
  saveInterval: number; // minutes
  theme: {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
    successColor: string;
    warningColor: string;
    errorColor: string;
    contrastMode: 'normal' | 'high'; // For WCAG AA compliance
  };
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
    screenReaderOptimized: boolean;
    keyboardNavigation: boolean;
  };
  notifications: {
    enabled: boolean;
    types: {
      projectionUpdates: boolean;
      errors: boolean;
      warnings: boolean;
      milestones: boolean;
    };
  };
  privacy: {
    analyticsEnabled: boolean;
    errorReportingEnabled: boolean;
  };
}

const initialState: SettingsState = {
  currency: DEFAULT_CURRENCY_SETTINGS,
  taxSettings: {
    taxYear: '2024-25',
    brackets: [
      { threshold: 0, rate: 0.18 },
      { threshold: 22620000, rate: 0.26 }, // R226,200
      { threshold: 35320000, rate: 0.31 }, // R353,200
      { threshold: 48860000, rate: 0.36 }, // R488,600
      { threshold: 64160000, rate: 0.39 }, // R641,600
      { threshold: 114750000, rate: 0.41 }, // R1,147,500
      { threshold: 178500000, rate: 0.45 }, // R1,785,000
    ],
    primaryRebate: 1731600, // R17,316
    secondaryRebate: 953400, // R9,534 (additional for 65+)
    tertiaryRebate: 317400, // R3,174 (additional for 75+)
    medicalAidCredits: {
      member: 36700, // R367
      firstDependent: 36700, // R367
      additionalDependents: 24700, // R247
    },
  },
  disclaimerAccepted: false,
  autoSave: true,
  saveInterval: 5, // 5 minutes
  theme: {
    mode: 'system',
    primaryColor: '#1976d2',
    successColor: '#2e7d32',
    warningColor: '#ed6c02',
    errorColor: '#d32f2f',
    contrastMode: 'normal',
  },
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    screenReaderOptimized: false,
    keyboardNavigation: true,
  },
  notifications: {
    enabled: true,
    types: {
      projectionUpdates: true,
      errors: true,
      warnings: true,
      milestones: false,
    },
  },
  privacy: {
    analyticsEnabled: false,
    errorReportingEnabled: true,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateCurrencySettings: (
      state,
      action: PayloadAction<Partial<CurrencySettings>>
    ) => {
      state.currency = { ...state.currency, ...action.payload };
    },
    updateTaxSettings: (state, action: PayloadAction<TaxPresetZA>) => {
      state.taxSettings = action.payload;
    },
    acceptDisclaimer: state => {
      state.disclaimerAccepted = true;
    },
    updateAutoSave: (
      state,
      action: PayloadAction<{ enabled: boolean; interval?: number }>
    ) => {
      state.autoSave = action.payload.enabled;
      if (action.payload.interval !== undefined) {
        state.saveInterval = action.payload.interval;
      }
    },
    updateTheme: (
      state,
      action: PayloadAction<Partial<typeof initialState.theme>>
    ) => {
      state.theme = { ...state.theme, ...action.payload };
    },
    updateAccessibility: (
      state,
      action: PayloadAction<Partial<typeof initialState.accessibility>>
    ) => {
      state.accessibility = { ...state.accessibility, ...action.payload };
    },
    updateNotifications: (
      state,
      action: PayloadAction<Partial<typeof initialState.notifications>>
    ) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    updatePrivacy: (
      state,
      action: PayloadAction<Partial<typeof initialState.privacy>>
    ) => {
      state.privacy = { ...state.privacy, ...action.payload };
    },
    resetSettings: () => initialState,
  },
});

export const {
  updateCurrencySettings,
  updateTaxSettings,
  acceptDisclaimer,
  updateAutoSave,
  updateTheme,
  updateAccessibility,
  updateNotifications,
  updatePrivacy,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
