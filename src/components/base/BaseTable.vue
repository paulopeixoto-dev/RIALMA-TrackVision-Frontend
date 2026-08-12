<script setup lang="ts">
export interface BaseTableColumn {
  key: string
  label: string
}

defineProps<{
  columns: BaseTableColumn[]
  rows: Record<string, unknown>[]
  loading?: boolean
  emptyText?: string
}>()
</script>

<template>
  <div class="table-wrap">
    <table class="base-table">
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
        <tr
          v-for="row in rows"
          v-else
          :key="String(row.id ?? row.uuid)"
        >
          <slot
            name="row"
            :row="row"
          >
            <td
              v-for="column in columns"
              :key="column.key"
            >
              {{ row[column.key] }}
            </td>
          </slot>
        </tr>
      </tbody>
    </table>
  </div>
</template>
