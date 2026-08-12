<script setup lang="ts">
import TheSidebar from '@/components/navigation/TheSidebar.vue'
import TheTopbar from '@/components/navigation/TheTopbar.vue'
</script>

<template>
  <div class="admin-shell">
    <TheSidebar />
    <div class="admin-main">
      <TheTopbar />
      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
