import { ref, onMounted, nextTick, Ref } from 'vue';

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function useMasonryLayout(columns: Ref<number>) {
  const masonryGrid = ref<HTMLElement | null>(null);

  const setItemPosition = (el: Element) => {
    const rect = el.getBoundingClientRect();
    const index = parseInt((el as HTMLElement).dataset.index || '0', 10);
    const column = index % columns.value;
    const left = column * (100 / columns.value);
    Object.assign((el as HTMLElement).style, {
      left: `${left}%`,
      top: `${rect.top}px`,
    });
  };

  const unsetItemPosition = (el: Element) => {
    Object.assign((el as HTMLElement).style, { left: '', top: '' });
    nextTick(updateMasonryLayout);
  };

  const handleBeforeLeave = (el: Element) => {
    const rect = el.getBoundingClientRect();
    Object.assign((el as HTMLElement).style, {
      position: 'absolute',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
  };

  const updateMasonryLayout = () => {
    if (!masonryGrid.value) return;

    const gap = 8;
    const columnWidth = 100 / columns.value;
    const columnHeights = Array(columns.value).fill(0);
    const noteElements = Array.from(
      masonryGrid.value.querySelectorAll('.notes')
    ) as HTMLElement[];

    noteElements.forEach((el, index) => {
      const column = index % columns.value;
      el.style.position = 'absolute';
      el.style.left = `calc(${column * columnWidth}% + ${gap / 2}px)`;
      el.style.top = `${columnHeights[column]}px`;
      el.style.width = `calc(${columnWidth}% - ${gap}px)`;

      void el.offsetHeight;

      columnHeights[column] += el.offsetHeight + gap;
    });

    masonryGrid.value.style.height = `${Math.max(...columnHeights)}px`;
  };

  const debouncedUpdateLayout = debounce(updateMasonryLayout, 100);

  onMounted(() => {
    nextTick(() => {
      updateMasonryLayout();
    });

    const mutationObserver = new MutationObserver(() => {
      debouncedUpdateLayout();
    });

    if (masonryGrid.value) {
      mutationObserver.observe(masonryGrid.value, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }
  });

  return {
    masonryGrid,
    setItemPosition,
    unsetItemPosition,
    handleBeforeLeave,
    updateMasonryLayout,
    debouncedUpdateLayout,
  };
}
