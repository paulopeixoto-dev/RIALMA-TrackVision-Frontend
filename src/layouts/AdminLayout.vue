<script setup lang="ts">
import { ref } from 'vue'
import TheSidebar from '@/components/navigation/TheSidebar.vue'
import TheTopbar from '@/components/navigation/TheTopbar.vue'

const sidebarMinimized = ref(false)

function toggleSidebar(): void {
  sidebarMinimized.value = !sidebarMinimized.value
}
</script>

<template>
  <div
    class="admin-layout"
    data-test="admin-layout"
  >
    <VaLayout
      class="admin-layout__frame"
      :left="{ fixed: true, order: 1 }"
      :top="{ fixed: true, order: 2 }"
    >
      <template #top>
        <TheTopbar @toggle-sidebar="toggleSidebar" />
      </template>

      <template #left>
        <TheSidebar
          :minimized="sidebarMinimized"
          @toggle-minimized="toggleSidebar"
        />
      </template>

      <template #content>
        <main class="admin-content">
          <RouterView />
        </main>
      </template>
    </VaLayout>
  </div>
</template>
