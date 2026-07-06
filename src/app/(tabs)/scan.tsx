import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ScanLine, ImagePlus } from 'lucide-react-native';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Tag } from '@/components/ui';

type ScanStage = 'idle' | 'processing';

export default function ScanScreen() {
  const [stage, setStage] = useState<ScanStage>('idle');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();

  const handleScanPress = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission required', 'Camera access is needed to scan receipts.');
        return;
      }
    }
    router.push('/camera');
  };

  const handleUpload = async () => {
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!mediaPermission.granted) {
      Alert.alert('Permission required', 'Photo library access is needed to upload receipts.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setStage('processing');
      // TODO: pass result.assets[0].uri to OCR service
    }
  };

  if (stage === 'processing') {
    return (
      <View className="flex-1 bg-canvas items-center justify-center">
        <ActivityIndicator size="large" color="#C6F24E" />
        <Text className="font-heading text-[17px] leading-[22px] text-ink mt-4">
          Processing receipt...
        </Text>
        <Text className="text-sm text-ink-muted mt-1">Extracting items</Text>
        <Pressable
          className="mt-10 px-6 h-12 rounded-pill bg-surface items-center justify-center active:opacity-80"
          onPress={() => setStage('idle')}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text className="font-heading text-[15px] text-ink">Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-8 pt-12">
          <View className="w-24 h-24 rounded-pill bg-brand-lime items-center justify-center">
            <ScanLine size={40} color="#173300" />
          </View>

          <View className="items-center gap-2">
            <Text className="font-body text-[28px] leading-[34px] text-ink text-center">
              Scan your <Text className="font-display">receipt</Text>
            </Text>
            <Text className="text-sm text-ink-muted text-center max-w-[280px] leading-[20px]">
              Take a photo of your receipt and we'll extract the items automatically
            </Text>
          </View>

          <View className="gap-3 w-full px-4">
            <Pressable
              className="bg-brand-lime rounded-pill px-6 h-14 items-center justify-center flex-row gap-2 active:opacity-80"
              onPress={handleScanPress}
              accessibilityRole="button"
              accessibilityLabel="Scan Receipt"
            >
              <ScanLine size={20} color="#173300" />
              <Text className="font-heading text-brand-lime-ink text-[15px]">Scan Receipt</Text>
            </Pressable>

            <Pressable
              className="bg-surface rounded-pill px-5 h-12 justify-center flex-row items-center gap-2 shadow-[0_8px_16px_rgba(21,19,22,0.06)] active:opacity-80"
              onPress={handleUpload}
              accessibilityRole="button"
              accessibilityLabel="Upload Image"
            >
              <ImagePlus size={18} color="#151316" />
              <Text className="font-heading text-ink text-[15px]">Upload Image</Text>
            </Pressable>
          </View>

          <View className="flex-row gap-2">
            <Tag label="PDF" variant="pastel-sky" />
            <Tag label="Email Forward" variant="pastel-lilac" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}