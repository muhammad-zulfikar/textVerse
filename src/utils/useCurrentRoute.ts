import { computed } from 'vue';
import { useRoute } from 'vue-router';

export function useCurrentRoute() {
  const route = useRoute();

  const isHomeRoute = computed(() => {
    return route.path === '/' || route.name === 'Note';
  });

  const isPublicRoute = computed(() => {
    return route.path.startsWith('/public');
  });

  const isTrashRoute = computed(() => {
    return route.path.startsWith('/trash');
  });

  const isSettingsRoute = computed(() => {
    return route.path.startsWith('/settings');
  });

  return {
    isHomeRoute,
    isPublicRoute,
    isTrashRoute,
    isSettingsRoute,
  };
}
