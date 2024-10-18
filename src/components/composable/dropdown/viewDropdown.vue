<template>
  <Dropdown
    dropdownId="view"
    contentWidth="8.8rem"
    direction="down"
    position="right"
  >
    <template #label>
      <Button>
        <div v-if="uiStore.viewType === 'card'">
          <PhSquaresFour :size="20" />
        </div>
        <div v-if="uiStore.viewType === 'table'">
          <PhTable :size="20" />
        </div>
        <div v-if="uiStore.viewType === 'tree'">
          <PhTreeView :size="20" />
        </div>
      </Button>
    </template>
    <DropdownSubmenu
      :label="'Card'"
      :icon="PhSquaresFour"
      :itemType="
        expandedOption === 'card' || uiStore.viewType === 'card'
          ? 'active'
          : 'normal'
      "
      v-model="openColumnSubmenu"
      @update:modelValue="updateColumnSubmenu"
      :mainClick="() => setViewType('card')"
    >
      <DropdownItem @click.stop="decreaseColumns" :icon="PhMinusCircle">
        Decrease Columns
      </DropdownItem>
      <DropdownItem @click.stop="increaseColumns" :icon="PhPlusCircle">
        Increase Columns
      </DropdownItem>
    </DropdownSubmenu>
    <DropdownItem
      :label="'Table'"
      :icon="PhTable"
      :itemType="uiStore.viewType === 'table' ? 'active' : 'normal'"
      @click="setViewType('table')"
    />
    <DropdownItem
      :label="'Tree'"
      :icon="PhTreeView"
      :itemType="uiStore.viewType === 'tree' ? 'active' : 'normal'"
      @click="setViewType('tree')"
    />
  </Dropdown>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { uiStore } from '@/store';
  import {
    PhSquaresFour,
    PhTable,
    PhTreeView,
    PhMinusCircle,
    PhPlusCircle,
  } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import DropdownSubmenu from '@/components/ui/dropdownSubmenu.vue';
  import Button from '@/components/ui/button.vue';

  const isOpen = ref(false);
  const isMobile = ref(window.innerWidth < 640);
  const expandedOption = ref('');
  const openColumnSubmenu = ref(false);

  const closeModal = () => {
    isOpen.value = false;
    uiStore.activeDropdown = null;
    expandedOption.value = '';
    openColumnSubmenu.value = false;
  };

  const updateColumnSubmenu = (isOpen: boolean) => {
    openColumnSubmenu.value = isOpen;
  };

  const setViewType = (viewType: 'card' | 'table' | 'tree') => {
    uiStore.setViewType(viewType);
    if (viewType !== 'card') {
      uiStore.setColumns(isMobile.value ? 2 : 5);
    }
    closeModal();
  };

  const increaseColumns = () => {
    if (uiStore.columns < (isMobile.value ? 2 : 5)) {
      uiStore.setColumns(uiStore.columns + 1);
    }
    uiStore.setViewType('card');
  };

  const decreaseColumns = () => {
    if (uiStore.columns > 1) {
      uiStore.setColumns(uiStore.columns - 1);
    }
    uiStore.setViewType('card');
  };
</script>
