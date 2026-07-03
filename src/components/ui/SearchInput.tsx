import type { ComponentProps } from 'react';
import { TextInput, View } from 'react-native';
import type { ComponentType } from 'react';

interface SearchInputProps extends ComponentProps<typeof TextInput> {
  icon?: ComponentType<{ size: number; color: string }>;
  variant?: 'dark' | 'light';
}

export function SearchInput({ icon: Icon, variant = 'dark', className = '', ...props }: SearchInputProps) {
  const isDark = variant === 'dark';

  return (
    <View
      className={`flex-row items-center h-14 px-5 gap-3 rounded-pill ${
        isDark ? 'bg-surface-black border border-brand-lime' : 'bg-canvas-alt rounded-md'
      } ${className}`}
    >
      {Icon && <Icon size={18} color={isDark ? '#FFFFFF' : '#8A8791'} />}
      <TextInput
        className={`flex-1 text-[15px] font-medium ${
          isDark ? 'text-white' : 'text-ink'
        }`}
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : '#B7B4BE'}
        cursorColor="#C6F24E"
        {...props}
      />
    </View>
  );
}
