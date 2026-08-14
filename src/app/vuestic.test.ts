import { describe, expect, it } from 'vitest'
import { vuesticGlobalConfig } from './vuestic'

describe('vuesticGlobalConfig', () => {
  it('defines the TrackVision theme colors used by Vuestic UI', () => {
    expect(vuesticGlobalConfig.config?.colors?.variables).toMatchObject({
      primary: '#1f6feb',
      secondary: '#1f2937',
      success: '#25855a',
      warning: '#b7791f',
      danger: '#c2410c',
    })
  })
})
