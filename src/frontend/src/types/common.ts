import { ComponentType } from 'react';

// Common types for the application
export type AppError = {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
};

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export type ApiResponse<T> = {
  data?: T;
  error?: AppError;
  loading: boolean;
};

// Theme and UI types
export type ThemeMode = 'light' | 'dark' | 'system';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastMessage = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
};

// Navigation and routing types
export type RouteConfig = {
  path: string;
  component: ComponentType;
  title: string;
  icon?: string;
  requiresAuth?: boolean;
  children?: RouteConfig[];
};

// Form types
export type FormFieldError = {
  type: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, FormFieldError>;
};

// Data persistence types
export type StorageKey = string;

export type PersistedState = {
  version: string;
  timestamp: string;
  data: unknown;
};

// Accessibility types
export type AriaRole = 
  | 'button' | 'link' | 'textbox' | 'combobox' | 'listbox' | 'option'
  | 'grid' | 'gridcell' | 'row' | 'columnheader' | 'rowheader'
  | 'tab' | 'tabpanel' | 'tablist' | 'dialog' | 'alertdialog'
  | 'alert' | 'status' | 'progressbar' | 'slider'
  | 'menu' | 'menuitem' | 'menubar' | 'navigation'
  | 'main' | 'article' | 'section' | 'aside' | 'header' | 'footer';

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  handler: (event: KeyboardEvent) => void;
  description: string;
};