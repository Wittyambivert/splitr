import type { ReactNode } from 'react';
import { Modal, Pressable, View, Text, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <AnimatedPressable
        className="flex-1 bg-[rgba(11,10,13,0.55)] justify-end"
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        onPress={onClose}
        accessibilityLabel="Close"
        accessibilityRole="button"
      >
        <AnimatedPressable
          className="bg-surface-black rounded-t-xl pt-3 pb-8"
          entering={SlideInDown.duration(260)}
          exiting={SlideOutDown.duration(200)}
          onPress={() => {}}
        >
          <View className="items-center mb-4">
            <View className="w-9 h-1 rounded-pill bg-white/30" />
          </View>
          {children}
        </AnimatedPressable>
      </AnimatedPressable>
    </Modal>
  );
}
