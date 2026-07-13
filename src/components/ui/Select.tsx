import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDownIcon } from '@radix-ui/react-icons';

interface SelectProps extends Omit<React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>, 'className' | 'ref'> {}

const Select = ({ children, ...props }: SelectProps) => (
  <SelectPrimitive.Root {...props}>
    {children}
  </SelectPrimitive.Root>
);
Select.displayName = SelectPrimitive.Root.displayName;

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={`
        flex h-10 w-full items-center justify-between rounded-lg border
        border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm
        ring-offset-[var(--bg)] focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-[var(--accent)]
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}`}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

interface SelectValueProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> {}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Value
      ref={ref}
      className={`flex items-center text-sm ${className}`}
      {...props}
    >
      {children}
    </SelectPrimitive.Value>
  )
);
SelectValue.displayName = SelectPrimitive.Value.displayName;

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, position = 'popper', ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={`
          relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg
          border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]
          shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
          data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
          ${position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1'}
          ${className}`}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={`
            p-1
            ${position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'}
          `}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={`
        relative flex w-full cursor-default select-none items-center rounded-sm
        py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-[var(--accent-bg)]
        focus:text-[var(--accent)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50
        ${className}`}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
);
SelectItem.displayName = SelectPrimitive.Item.displayName;

interface SelectSeparatorProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {}

const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
      ref={ref}
      className={`-mx-1 my-1 h-px bg-[var(--border)] ${className}`}
      {...props}
    />
  )
);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

const CheckIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
  </svg>
);

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSeparator,
};