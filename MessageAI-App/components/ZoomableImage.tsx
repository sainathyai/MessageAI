import React, { useRef } from 'react';
import { StyleSheet, Animated, Dimensions } from 'react-native';
import { PinchGestureHandler, State, PinchGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { Image } from 'expo-image';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface ZoomableImageProps {
  uri: string;
  style?: any;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ uri, style }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(1);

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const onPinchStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.BEGAN) {
      baseScale.current = event.nativeEvent.scale;
    }

    if (event.nativeEvent.state === State.END) {
      // Smooth zoom out if too small
      if (event.nativeEvent.scale < 1) {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
        baseScale.current = 1;
      } 
      // Limit max zoom to 3x
      else if (event.nativeEvent.scale > 3) {
        Animated.spring(scale, {
          toValue: 3,
          useNativeDriver: true,
        }).start();
        baseScale.current = 3;
      } else {
        baseScale.current = event.nativeEvent.scale;
      }
    }
  };

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchEvent}
      onHandlerStateChange={onPinchStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <Image
          source={{ uri }}
          style={[styles.image, style]}
          contentFit="contain"
        />
      </Animated.View>
    </PinchGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

