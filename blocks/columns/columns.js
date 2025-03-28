import { createTag } from '../../libs/utils/utils.js';

function decorateFlexRows(block) {
  const rows = block.querySelectorAll(':scope > div');
  const colClass = [...block.classList].find((cls) => cls.startsWith('col-'));
  if (!colClass) return;
  const flexBasis = colClass?.match(/-(\d+)$/);
  const flexBasisVal = flexBasis ? parseInt(flexBasis[1], 10) : 'auto';
  const colIndex = colClass?.match(/col-(\d+)-/);
  const colIndexVal = colIndex ? parseInt(colIndex[1], 10) - 1 : 0;
  rows.forEach((row) => {
    const cols = [...row.children];
    if (flexBasis && colIndex) {
      cols[colIndexVal].style.setProperty('flex', `0 1 ${flexBasisVal}%`);
    }
  });
}

function getMediaHeightValue(e) {
  const match = [...e.classList].find((cls) => cls.startsWith('media-height-'))?.match(/^media-height-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

function applyMediaHeight(block) {
  const heightValue = getMediaHeightValue(block);
  if (!heightValue) return;
  const media = block.querySelector('.media');
  const isDesktop = window.matchMedia('(min-width: 960px)');
  if (isDesktop.matches) {
    media.style.setProperty('height', `${heightValue}px`);
  } else {
    media.style.removeProperty('height');
  }
}

// Call applyMediaHeight for all elements with the media-unbound class on initial load
window.addEventListener('resize', () => {
  const mediaUnboundBlocks = document.querySelectorAll('.media-unbound');
  mediaUnboundBlocks.forEach((block) => { applyMediaHeight(block); });
});

// Check for columns with CTA icons
function isIconsCol(col) {
  let parent;
  if (col.children.length === 1 && col.children[0].tagName === 'P') {
    [parent] = col.children;
  } else {
    parent = col;
  }
  const children = [...parent.children];
  const hasOnlyIcons = children.every((child) => {
    if (child.tagName === 'A') {
      const icon = child.querySelector('span.icon');
      return icon !== null;
    }
    return false;
  });
  if (hasOnlyIcons) {
    parent.classList.add('cta-icons');
  }
}

function decorateColumnsCalculation(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    const cols = [...row.children];
    const separator = createTag('div', { class: 'separator' });
    const firstGroup = createTag('div', { class: 'first-group' }, [cols[0], cols[1], cols[2]]);
    const secondGroup = createTag('div', { class: 'second-group' }, [cols[3], cols[4]]);
    row.append(firstGroup, separator, secondGroup);
  });
}

function decorateColIconList(col) {
  const colHeader = col.querySelector('h1, h2, h3, h4, h5, h6');
  const colHeaderIcon = colHeader?.querySelector('.icon');
  if (!colHeader && !colHeaderIcon) return;
  const colContentWrapper = createTag('ul', { class: 'col-icon-list' }, [...col.children]);
  col.append(colContentWrapper);
}

export default function decorate(block) {
  const rows = [...block.children];
  // setup media columns
  rows.forEach((row) => {
    const cols = [...row.children];
    block.classList.add(`columns-${cols.length}-cols`, 'ca-list');
    cols.forEach((col, i) => {
      if (block.classList.contains('cta-icons')) {
        isIconsCol(col);
      }
      const hasImg = col.querySelector('picture');
      if (hasImg) {
        const isSingleTagPicture = (col.children.length === 1 && col.children[0].tagName === 'PICTURE');
        if (isSingleTagPicture) {
          col.classList.add('media-count-1', 'media');
          if (i === 0) col.classList.add('media-left');
        } else {
          col.classList.add('media-copy');
        }
      } else {
        col.classList.add('copy');
      }
      decorateColIconList(col);
    });
  });
  // flex basis
  decorateFlexRows(block);
  if (block.classList.contains('media-unbound')) applyMediaHeight(block);
  if (block.classList.contains('calculation')) decorateColumnsCalculation(block);
}
