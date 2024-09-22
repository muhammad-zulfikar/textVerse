<template>
  <Dropdown
    dropdownId="path"
    contentWidth="9rem"
    direction="down"
    position="left"
  >
    <template #label>
      <Button>
        <component :is="currentIcon" :size="20" />
        <span class="flex items-center ml-2 text-sm">
          {{ currentPathName }}
        </span>
      </Button>
    </template>
    <div class="px-1 space-y-1">
      <router-link
        v-for="route in availableRoutes"
        :key="route.path"
        :to="route.path"
        @click="closeDropdown"
        class="block w-full text-left text-sm p-2 rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200"
        :class="{
          'bg-cream-200 dark:bg-gray-700': currentPath === route.name,
        }"
      >
        <component
          :is="getIconForRoute(route.name as string)"
          :size="20"
          class="mr-2 inline-block"
        />
        {{ route.name }}
      </router-link>
    </div>
  </Dropdown>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { uiStore } from '@/store';
  import { PhTrash, PhHouseLine, PhInfo, PhGear } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import Button from '@/components/ui/button.vue';

  const route = useRoute();
  const router = useRouter();

  const currentPath = computed(() => {
    return route.name === 'Note' ? 'Home' : (route.name as string);
  });

  const currentPathName = computed(() => {
    return currentPath.value;
  });

  const currentIcon = computed(() => {
    return getIconForRoute(currentPathName.value);
  });

  const availableRoutes = computed(() =>
    router.options.routes.filter(
      (route) =>
        route.name &&
        route.name !== '404' &&
        route.name !== 'About' &&
        route.name !== 'Note' &&
        route.name !== 'Public' &&
        !(route.name === 'Sign In')
    )
  );

  const getIconForRoute = (routeName: string) => {
    switch (routeName) {
      case 'Home':
        return PhHouseLine;
      case 'Settings':
        return PhGear;
      case 'Trash':
        return PhTrash;
      default:
        return PhInfo;
    }
  };

  const closeDropdown = () => {
    uiStore.setActiveDropdown(null);
  };
</script>
