<script setup lang="ts">
import {
  Camera,
  Home,
  Link,
  MapPin,
  Route,
  Server,
  Shield,
  Truck,
  Users,
} from 'lucide-vue-next'
import { computed, type Component } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

interface NavigationItem {
  label: string
  route: string
  permission?: string
  icon: Component
}

const navigationItems = [
  { label: 'Dashboard', route: 'dashboard', icon: Home },
  { label: 'Usuarios', route: 'users', permission: 'users.manage', icon: Users },
  { label: 'Roles', route: 'roles', permission: 'permissions.manage', icon: Shield },
  { label: 'Permissoes', route: 'permissions', permission: 'permissions.manage', icon: Shield },
  { label: 'Veiculos', route: 'vehicles', permission: 'vehicles.manage', icon: Truck },
  { label: 'Viagens', route: 'trips', permission: 'captures.view', icon: Route },
  { label: 'Locais', route: 'locations', permission: 'cameras.manage', icon: MapPin },
  { label: 'Edge Nodes', route: 'edge-nodes', permission: 'cameras.manage', icon: Server },
  { label: 'Cameras', route: 'cameras', permission: 'cameras.manage', icon: Camera },
  { label: 'Pares de Cameras', route: 'camera-pairs', permission: 'cameras.manage', icon: Link },
] satisfies NavigationItem[]

const visibleItems = computed(() => navigationItems.filter((item) => authStore.can(item.permission)))
</script>

<template>
  <aside class="sidebar">
    <RouterLink
      class="sidebar__brand"
      :to="{ name: 'dashboard' }"
    >
      <span>RIALMA</span>
      <strong>TrackVision</strong>
    </RouterLink>

    <nav
      class="sidebar__nav"
      aria-label="Principal"
    >
      <RouterLink
        v-for="item in visibleItems"
        :key="item.route"
        class="sidebar__link"
        active-class="sidebar__link--active"
        :to="{ name: item.route }"
      >
        <component
          :is="item.icon"
          :size="18"
          aria-hidden="true"
        />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
