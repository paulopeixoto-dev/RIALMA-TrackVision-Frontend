import type { PartialGlobalConfig } from 'vuestic-ui'

const trackVisionTheme = {
  colors: {
    variables: {
      primary: '#1f6feb',
      secondary: '#1f2937',
      success: '#25855a',
      warning: '#b7791f',
      danger: '#c2410c',
      info: '#2563eb',
      backgroundPrimary: '#f5f7fa',
      backgroundSecondary: '#ffffff',
      backgroundElement: '#eef2f7',
      textPrimary: '#1f2933',
      textInverted: '#ffffff',
    },
  },
} satisfies PartialGlobalConfig

export const vuesticGlobalConfig = {
  config: trackVisionTheme,
}
