import React, { useState, useCallback, useRef, useEffect } from 'react';

type Position = {
  x: number;
  y: number;
};

interface MenuState {
  visible: boolean;
  position: Position;
  triggerElement: HTMLElement | null;
}

interface ContextMenuProps {
  children: React.ReactNode;
  trigger?: React.ReactElement;
  onClose?: () => void;
  className?: string;
  longPressDelay?: number;
  menuGroup?: string;
}

interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  danger?: boolean;
  disabled?: boolean;
}

const ANIMATION_DURATION = 100; // ms
const TOUCH_MOVE_THRESHOLD = 10; // px
const LONG_PRESS_DELAY_DEFAULT = 500; // ms

const styles = `
  @keyframes menuAppear {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes menuDisappear {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }

  .context-menu {
    position: absolute;
    background: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 0.5rem;
    padding: 0.5rem 0;
    min-width: 12rem;
    border: 1px solid #e5e7eb;
    z-index: 50;
    touch-action: none;
    animation: menuAppear 0.1s ease-out;
    transform-origin: top left;
  }

  .context-menu.closing {
    animation: menuDisappear 0.1s ease-out forwards;
  }

  .context-menu-item {
    width: 100%;
    padding: 0.5rem 1rem;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.15s ease-out;
    position: relative;
    overflow: hidden;
  }

  .context-menu-item:hover:not(:disabled),
  .context-menu-item:focus:not(:disabled) {
    background-color: #f3f4f6;
    outline: none;
  }

  .context-menu-item:active:not(:disabled) {
    background-color: #e5e7eb;
    transform: scale(0.98);
  }

  .context-menu-item::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: currentColor;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .context-menu-item:focus:not(:disabled)::after {
    opacity: 0.04;
  }

  .context-menu-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .context-menu-item.danger {
    color: #dc2626;
  }

  .context-menu-item-icon {
    flex-shrink: 0;
    transition: transform 0.15s ease-out;
  }

  .context-menu-item:hover:not(:disabled) .context-menu-item-icon {
    transform: scale(1.1);
  }
`;

export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(({
  children,
  icon: Icon,
  onClick,
  className = '',
  disabled = false,
  danger = false,
  ...props
}, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      ref={ref}
      className={`context-menu-item ${danger ? 'danger' : ''} ${className}`}
      onClick={handleClick}
      role="menuitem"
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={16} className="context-menu-item-icon" aria-hidden="true" />}
      {children}
    </button>
  );
});

MenuItem.displayName = 'MenuItem';

export const ContextMenu: React.FC<ContextMenuProps> = ({
  children,
  trigger,
  onClose,
  className = '',
  longPressDelay = LONG_PRESS_DELAY_DEFAULT,
  menuGroup = 'default',
}) => {
  const [menuState, setMenuState] = useState<MenuState>({
    visible: false,
    position: { x: 0, y: 0 },
    triggerElement: null
  });
  const [isClosing, setIsClosing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchTimeout = useRef<number>();
  const touchStartPosition = useRef<Position | null>(null);

  // Inject styles once when component mounts
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    return () => styleElement.remove();
  }, []);

  const adjustPosition = useCallback((x: number, y: number): Position => {
    const menu = containerRef.current;
    if (!menu) return { x, y };

    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Try positioning to the left first
    const leftPosition = x - rect.width - 8;
    const rightPosition = x;

    // Calculate how much adjustment would be needed for each position
    const leftAdjustment = leftPosition < 8 ? 8 - leftPosition : 0;
    const rightAdjustment = (x + rect.width + 8) > viewportWidth ? 
      (x + rect.width + 8) - viewportWidth : 0;

    // Choose the position that needs less adjustment
    adjustedX = leftAdjustment <= rightAdjustment ? 
      Math.max(8, leftPosition) : 
      Math.min(viewportWidth - rect.width - 8, rightPosition);

    // Adjust Y position if needed
    if (y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 8;
    }

    return { x: Math.max(8, adjustedX), y: Math.max(8, adjustedY) };
  }, []);

  const hide = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setMenuState(prev => {
        if (prev.triggerElement && document.body.contains(prev.triggerElement)) {
          prev.triggerElement.focus();
        }
        return {
          visible: false,
          position: { x: 0, y: 0 },
          triggerElement: null
        };
      });
      setIsClosing(false);
      onClose?.();
    }, ANIMATION_DURATION);
  }, [onClose]);

  const show = useCallback((x: number, y: number, trigger: HTMLElement) => {
    // Focus the trigger element first
    trigger.focus();
    
    // Dispatch with menu group info
    window.dispatchEvent(new CustomEvent('menuOpen', { 
      detail: { group: menuGroup } 
    }));
    
    const adjusted = adjustPosition(x, y);
    setMenuState({
      visible: true,
      position: adjusted,
      triggerElement: trigger
    });
    setActiveIndex(0);
    setIsClosing(false);
  }, [adjustPosition, menuGroup]);

  useEffect(() => {
    const handleMenuOpen = (e: CustomEvent) => {
      // Only close if it's the same menu group
      if (menuState.visible && e.detail.group === menuGroup) {
        hide();
      }
    };
    
    window.addEventListener('menuOpen', handleMenuOpen as EventListener);
    return () => window.removeEventListener('menuOpen', handleMenuOpen as EventListener);
  }, [menuState.visible, hide, menuGroup]);

  const menuItems = React.Children.toArray(children).filter(
    child => React.isValidElement(child) && child.type === MenuItem
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    show(e.clientX, e.clientY, e.currentTarget as HTMLElement);
  }, [show]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPosition.current = { x: touch.clientX, y: touch.clientY };

    touchTimeout.current = window.setTimeout(() => {
      if (touchStartPosition.current) {
        show(touch.clientX, touch.clientY, e.currentTarget as HTMLElement);
      }
    }, longPressDelay);
  }, [show, longPressDelay]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPosition.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPosition.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPosition.current.y);

    if (deltaX > TOUCH_MOVE_THRESHOLD || deltaY > TOUCH_MOVE_THRESHOLD) {
      window.clearTimeout(touchTimeout.current);
      touchStartPosition.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    window.clearTimeout(touchTimeout.current);
    touchStartPosition.current = null;
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
      e.preventDefault();
      e.stopPropagation();
      
      if (!menuState.visible) {
        const rect = e.currentTarget.getBoundingClientRect();
        show(rect.left, rect.bottom, e.currentTarget as HTMLElement);
      }
      return;
    }

    if (!menuState.visible) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        const direction = e.key === 'ArrowDown' ? 1 : -1;
        const newIndex = (activeIndex + direction + menuItems.length) % menuItems.length;
        setActiveIndex(newIndex);
        containerRef.current?.querySelector(`[data-index="${newIndex}"]`)?.focus();
        break;
      }
      case 'Home':
      case 'PageUp':
        e.preventDefault();
        setActiveIndex(0);
        containerRef.current?.querySelector('[data-index="0"]')?.focus();
        break;
      case 'End':
      case 'PageDown':
        e.preventDefault();
        const lastIndex = menuItems.length - 1;
        setActiveIndex(lastIndex);
        containerRef.current?.querySelector(`[data-index="${lastIndex}"]`)?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        hide();
        break;
      case 'Enter':
      case ' ':
        if (document.activeElement?.getAttribute('role') === 'menuitem') {
          e.preventDefault();
          (document.activeElement as HTMLElement).click();
        }
        break;
    }
  }, [menuState.visible, activeIndex, menuItems.length, setActiveIndex, show, hide]);

  useEffect(() => {
    if (menuState.visible) {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          hide();
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuState.visible, hide]);

  useEffect(() => {
    if (menuState.visible) {
      requestAnimationFrame(() => {
        containerRef.current?.querySelector('[data-index="0"]')?.focus();
      });
    }
  }, [menuState.visible]);

  const triggerElement = trigger && React.cloneElement(trigger, {
    onContextMenu: handleContextMenu,
    onKeyDown: handleKeyDown,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  });

  if (!menuState.visible) {
    return triggerElement || null;
  }

  return (
    <>
      {triggerElement}
      <div
        ref={containerRef}
        className={`context-menu ${isClosing ? 'closing' : ''} ${className}`}
        style={{
          top: `${menuState.position.y}px`,
          left: `${menuState.position.x}px`,
        }}
        role="menu"
        aria-orientation="vertical"
        onKeyDown={handleKeyDown}
      >
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child) || child.type !== MenuItem) return null;

          return React.cloneElement(child, {
            tabIndex: index === activeIndex ? 0 : -1,
            'data-index': index,
            onFocus: () => setActiveIndex(index),
          });
        })}
      </div>
    </>
  );
};

export type { ContextMenuProps, MenuItemProps };
