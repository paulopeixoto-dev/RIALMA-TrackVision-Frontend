<script setup lang="ts">
export interface BaseTableColumn {
  key: string
  label: string
}

defineProps<{
  columns: BaseTableColumn[]
  rows: unknown[]
  loading?: boolean
  emptyText?: string
}>()

function asRecord(row: unknown): Record<string, unknown> {
  return typeof row === 'object' && row !== null ? (row as Record<string, unknown>) : {}
}

function rowKey(row: unknown, index: number): string {
  const record = asRecord(row)
  return String(record.id ?? record.uuid ?? index)
}

function cellValue(row: unknown, key: string): unknown {
  return asRecord(row)[key]
}
</script>

<template>
  <div class="table-wrap va-table-responsive">
    <table class="va-table va-table--hoverable base-table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length">
            Carregando...
          </td>
        </tr>
        <tr v-else-if="rows.length === 0">
          <td :colspan="columns.length">
            {{ emptyText ?? 'Nenhum registro encontrado.' }}
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="(row, index) in rows"
            :key="rowKey(row, index)"
          >
            <slot
              name="row"
              :row="row"
            >
              <td
                v-for="column in columns"
                :key="column.key"
              >
                {{ cellValue(row, column.key) }}
              </td>
            </slot>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
