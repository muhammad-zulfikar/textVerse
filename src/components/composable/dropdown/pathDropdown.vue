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
    <DropdownItem
      v-for="route in availableRoutes"
      :key="route.path"
      :label="getRouteLabel(route.name)"
      :icon="getRouteIcon(getRouteLabel(route.name))"
      :itemType="
        currentPath === getRouteLabel(route.name) ? 'active' : 'normal'
      "
      @click="handleRouteClick(route.path)"
    />
  </Dropdown>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { uiStore } from '@/store';
  import {
    PhTrash,
    PhHouseLine,
    PhInfo,
    PhGear,
    PhSignIn,
    PhKey,
    PhWarning,
  } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
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
    return getRouteIcon(currentPathName.value);
  });

  const availableRoutes = computed(() =>
    router.options.routes.filter(
      (route) =>
        route.name &&
        route.name !== '404' &&
        route.name !== 'About' &&
        route.name !== 'Note' &&
        route.name !== 'Public' &&
        !(route.name === 'Sign In') &&
        !(route.name === 'Reset Password')
    )
  );

  const getRouteLabel = (routeName: string | symbol | undefined): string => {
    if (typeof routeName === 'string') {
      return routeName;
    } else {
      return 'Unknown';
    }
  };

  const getRouteIcon = (routeName: string) => {
    switch (routeName) {
      case 'Home':
        return PhHouseLine;
      case 'Settings':
        return PhGear;
      case 'Trash':
        return PhTrash;
      case 'Sign In':
        return PhSignIn;
      case 'Reset Password':
        return PhKey;
      case 'About':
        return PhInfo;
      case '404':
        return PhWarning;
    }
  };

  const handleRouteClick = (path: string) => {
    router.push(path);
    closeDropdown();
  };

  const closeDropdown = () => {
    uiStore.setActiveDropdown(null);
  };
</script>
