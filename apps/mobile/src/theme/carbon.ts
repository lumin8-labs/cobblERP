import React, { createContext, useContext, useState } from 'react';

/**
 * IBM Carbon Design System Color Tokens for React Native
 * Supports both Gray 100 (Dark) and White (Light) themes
 * Reference: https://carbondesignsystem.com/elements/color/tokens/
 */

export type CarbonThemeMode = 'g100' | 'white';

export interface CarbonThemeColors {
  background: string;
  layer01: string;
  layer02: string;
  layer03: string;
  layerActive: string;
  layerHover: string;
  layerSelected: string;
  interactive01: string;
  interactiveHover: string;
  interactiveActive: string;
  buttonDanger: string;
  buttonTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textPlaceholder: string;
  textOnColor: string;
  borderSubtle: string;
  borderStrong: string;
  borderInteractive: string;
  supportSuccess: string;
  supportSuccessBg: string;
  supportError: string;
  supportErrorBg: string;
  supportWarning: string;
  supportWarningBg: string;
  supportInfo: string;
  supportInfoBg: string;
  brandAccent: string;
  brandTeal: string;
  brandPurple: string;
}

export const CarbonThemes: Record<CarbonThemeMode, CarbonThemeColors> = {
  // Industrial Shop Floor Dark Theme
  g100: {
    background: '#161616',
    layer01: '#262626',
    layer02: '#393939',
    layer03: '#525252',
    layerActive: '#525252',
    layerHover: '#333333',
    layerSelected: '#393939',
    interactive01: '#0f62fe',
    interactiveHover: '#0353e9',
    interactiveActive: '#002d9c',
    buttonDanger: '#da1e28',
    buttonTertiary: '#ffffff',
    textPrimary: '#f4f4f4',
    textSecondary: '#c6c6c6',
    textPlaceholder: '#8d8d8d',
    textOnColor: '#ffffff',
    borderSubtle: '#393939',
    borderStrong: '#6f6f6f',
    borderInteractive: '#0f62fe',
    supportSuccess: '#42be65',
    supportSuccessBg: '#0e2b16',
    supportError: '#fa4d56',
    supportErrorBg: '#341113',
    supportWarning: '#f1c21b',
    supportWarningBg: '#3b2f05',
    supportInfo: '#4589ff',
    supportInfoBg: '#092754',
    brandAccent: '#0f62fe',
    brandTeal: '#009d9a',
    brandPurple: '#8a3ffc',
  },

  // Corporate / Clean White Light Theme
  white: {
    background: '#ffffff',
    layer01: '#f4f4f4',
    layer02: '#e0e0e0',
    layer03: '#d1d1d1',
    layerActive: '#c6c6c6',
    layerHover: '#e5e5e5',
    layerSelected: '#e0e0e0',
    interactive01: '#0f62fe',
    interactiveHover: '#0353e9',
    interactiveActive: '#002d9c',
    buttonDanger: '#da1e28',
    buttonTertiary: '#161616',
    textPrimary: '#161616',
    textSecondary: '#525252',
    textPlaceholder: '#8d8d8d',
    textOnColor: '#ffffff',
    borderSubtle: '#e0e0e0',
    borderStrong: '#8d8d8d',
    borderInteractive: '#0f62fe',
    supportSuccess: '#198038',
    supportSuccessBg: '#defbe6',
    supportError: '#da1e28',
    supportErrorBg: '#fff1f1',
    supportWarning: '#b28600',
    supportWarningBg: '#fdf4d8',
    supportInfo: '#0043ce',
    supportInfoBg: '#edf5ff',
    brandAccent: '#0f62fe',
    brandTeal: '#0072c3',
    brandPurple: '#6929c4',
  },
};

// Default backwards compatibility
export const CarbonColors = CarbonThemes.g100;

export const CarbonSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const CarbonTypography = {
  fontFamily: 'System',
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.32,
  },
  body01: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.16,
  },
  body02: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  },
  heading01: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  heading02: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  heading03: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700' as const,
  },
};

interface ThemeContextType {
  mode: CarbonThemeMode;
  colors: CarbonThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: CarbonThemeMode) => void;
}

const CarbonThemeContext = createContext<ThemeContextType>({
  mode: 'g100',
  colors: CarbonThemes.g100,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const CarbonThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<CarbonThemeMode>('g100');

  const toggleTheme = () => {
    setMode((prev) => (prev === 'g100' ? 'white' : 'g100'));
  };

  return React.createElement(
    CarbonThemeContext.Provider,
    {
      value: {
        mode,
        colors: CarbonThemes[mode],
        toggleTheme,
        setTheme: setMode,
      },
    },
    children
  );
};

export const useCarbonTheme = () => useContext(CarbonThemeContext);
