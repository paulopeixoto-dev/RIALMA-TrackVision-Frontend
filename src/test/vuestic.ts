import { createVuestic } from 'vuestic-ui'
import { vuesticGlobalConfig } from '@/app/vuestic'

export function createVuesticTestPlugin() {
  return createVuestic(vuesticGlobalConfig)
}
