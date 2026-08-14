import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const checkedRoots = [
  'src/pages',
  'src/layouts',
  'src/components/forms',
  'src/components/navigation',
]

const forbiddenBaseComponents = ['BaseButton', 'BaseInput', 'BaseSelect']

function vueFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(path, entry.name)

    if (entry.isDirectory()) {
      return vueFiles(fullPath)
    }

    return entry.isFile() && entry.name.endsWith('.vue') ? [fullPath] : []
  })
}

describe('Vuestic template contract', () => {
  it('keeps screens and forms using Vuestic components directly for native controls', () => {
    const violations = checkedRoots
      .flatMap((root) => vueFiles(root))
      .flatMap((file) => {
        const source = readFileSync(file, 'utf8')

        return forbiddenBaseComponents
          .filter((component) => source.includes(component))
          .map((component) => `${file}: ${component}`)
      })

    expect(violations).toEqual([])
  })
})
