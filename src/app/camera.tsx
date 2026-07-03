import { useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { X } from 'lucide-react-native';
import { CameraView } from 'expo-camera';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCRIM = 'rgba(11,10,13,0.55)';
const FRAME_PADDING = 32;
const FRAME_WIDTH = SCREEN_WIDTH - FRAME_PADDING * 2;
const FRAME_HEIGHT = FRAME_WIDTH * 1.4;
const CORNER_SIZE = 24;
const BORDER_W = 3;

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const [cameraKey, setCameraKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setCameraKey((prev) => prev + 1);
    }, [])
  );

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ shutterSound: false });
    if (photo) {
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0A0D' }}>
      <CameraView
        key={cameraKey}
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        mode="picture"
      />

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: SCRIM }} />

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, backgroundColor: SCRIM }} />
            <View style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, backgroundColor: 'transparent' }}>
              <View style={{ position: 'absolute', top: 0, left: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: BORDER_W, borderLeftWidth: BORDER_W, borderColor: '#C6F24E', borderTopLeftRadius: 8 }} />
              <View style={{ position: 'absolute', top: 0, right: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: BORDER_W, borderRightWidth: BORDER_W, borderColor: '#C6F24E', borderTopRightRadius: 8 }} />
              <View style={{ position: 'absolute', bottom: 0, left: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: BORDER_W, borderLeftWidth: BORDER_W, borderColor: '#C6F24E', borderBottomLeftRadius: 8 }} />
              <View style={{ position: 'absolute', bottom: 0, right: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: BORDER_W, borderRightWidth: BORDER_W, borderColor: '#C6F24E', borderBottomRightRadius: 8 }} />
            </View>
            <View style={{ flex: 1, backgroundColor: SCRIM }} />
          </View>

          <View style={{ flex: 1, backgroundColor: SCRIM }} />
        </View>

        <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }} pointerEvents="box-none">
          <View className="flex-row justify-between px-5" style={{ paddingTop: insets.top + 16 }}>
            <Pressable
              className="w-11 h-11 rounded-pill bg-surface/20 items-center justify-center"
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Close camera"
            >
              <X size={20} color="#FFFFFF" />
            </Pressable>
            <View className="bg-brand-lime rounded-pill px-3 py-1 self-start">
              <Text className="font-heading text-[11px] text-brand-lime-ink">Auto</Text>
            </View>
          </View>
        </View>

        <View
          style={{ position: 'absolute', bottom: 32, left: 0, right: 0 }}
          pointerEvents="box-none"
          className="items-center"
        >
          <Pressable
            className="w-20 h-20 rounded-pill bg-surface/30 items-center justify-center border-4 border-surface/50"
            onPress={handleCapture}
            accessibilityRole="button"
            accessibilityLabel="Capture receipt"
          >
            <View className="w-16 h-16 rounded-pill bg-surface" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}