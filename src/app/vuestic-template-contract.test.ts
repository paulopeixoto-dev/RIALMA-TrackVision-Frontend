import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const checkedRoots = [
  'src/pages',
  'src/layouts',
  'src/components/forms',
  'src/components/navigation',
]

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
  it('keeps screens, layouts, forms and navigation using Vuestic components directly', () => {
    const violations = checkedRoots
      .flatMap((root) => vueFiles(root))
      .flatMap((file) => {
        const source = readFileSync(file, 'utf8')

        return [...source.matchAll(/\bBase[A-Z][A-Za-z]+/g)]
          .map(([component]) => `${file}: ${component}`)
      })

    expect(violations).toEqual([])
  })
})
