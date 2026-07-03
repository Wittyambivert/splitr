import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScanLine, ImagePlus, X } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Tag, Button } from '@/components/ui';

type ScanStage = 'idle' | 'camera' | 'processing' | 'results';

export default function ScanScreen() {
  const [stage, setStage] = useState<ScanStage>('idle');
  const [permission, requestPermission] = useCameraPermissions();

  if (stage === 'camera') {
    return (
      <View className="flex-1 bg-surface-black">
        <CameraView
          className="flex-1"
          facing="back"
          onBarcodeScanned={() => {}}
        />
        <SafeAreaView className="absolute inset-0" edges={['top']} pointerEvents="box-none">
          <View className="flex-row justify-between px-5 pt-4">
            <Pressable
              className="w-11 h-11 rounded-pill bg-surface/20 items-center justify-center"
              onPress={() => setStage('idle')}
            >
              <X size={20} color="#FFFFFF" />
            </Pressable>
            <View className="bg-brand-lime rounded-pill px-3 py-1 self-start">
              <Text className="font-heading text-[11px] text-brand-lime-ink">Auto</Text>
            </View>
          </View>
        </SafeAreaView>

        <View className="absolute bottom-8 left-0 right-0 items-center" pointerEvents="box-none">
          <Pressable className="w-20 h-20 rounded-pill bg-surface/30 items-center justify-center border-4 border-surface/50">
            <View className="w-16 h-16 rounded-pill bg-surface" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1 px-5" edges={['top']}>
        <View className="flex-1 items-center justify-center gap-8">
          <View className="w-24 h-24 rounded-pill bg-brand-lime items-center justify-center">
            <ScanLine size={40} color="#173300" />
          </View>

          <View className="items-center gap-2">
            <Text className="font-body text-[28px] leading-[34px] text-ink text-center">
              Scan your <Text className="font-display">receipt</Text>
            </Text>
            <Text className="text-sm text-ink-muted text-center max-w-[280px]">
              Take a photo of your receipt and we'll extract the items automatically
            </Text>
          </View>

          <View className="gap-3 w-full px-4">
            <Button
              variant="primary"
              icon={<ScanLine size={20} color="#173300" />}
              label="Scan Receipt"
              onPress={async () => {
                if (!permission?.granted) {
                  await requestPermission();
                }
                setStage('camera');
              }}
            />
            <Button
              variant="secondary"
              icon={<ImagePlus size={18} color="#151316" />}
              label="Upload Image"
              onPress={() => {}}
            />
          </View>

          <View className="flex-row gap-2">
            <Tag label="PDF" variant="pastel-sky" />
            <Tag label="Email Forward" variant="pastel-lilac" />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
