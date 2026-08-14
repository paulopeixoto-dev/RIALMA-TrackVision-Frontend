import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseTable from './BaseTable.vue'

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'status', label: 'Status' },
]

describe('BaseTable', () => {
  it('renders loading text inside a Vuestic-styled table', () => {
    const wrapper = mount(BaseTable, {
      props: { columns, rows: [], loading: true },
    })

    expect(wrapper.get('table').classes()).toContain('va-table')
    expect(wrapper.text()).toContain('Carregando...')
  })

  it('renders empty text when no rows exist', () => {
    const wrapper = mount(BaseTable, {
      props: { columns, rows: [], emptyText: 'Sem dados.' },
    })

    expect(wrapper.text()).toContain('Sem dados.')
  })

  it('keeps the custom row slot contract', () => {
    const wrapper = mount(BaseTable, {
      props: {
        columns,
        rows: [{ id: 1, name: 'Portaria', status: 'Ativo' }],
      },
      slots: {
        row: '<td>{{ row.name }}</td><td>{{ row.status }}</td>',
      },
    })

    expect(wrapper.text()).toContain('Portaria')
    expect(wrapper.text()).toContain('Ativo')
  })
})
