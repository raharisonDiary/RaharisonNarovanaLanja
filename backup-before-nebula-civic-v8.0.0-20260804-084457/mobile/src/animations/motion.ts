import { Animated, Easing, Platform } from 'react-native'

export const nativeDriver = Platform.OS !== 'web'

export const motion = {
  fast: 170,
  normal: 280,
  slow: 520,
  spring: {
    damping: 18,
    stiffness: 210,
    mass: 0.72,
  },
}

export function runFadeUp(
  opacity: Animated.Value,
  translateY: Animated.Value,
  delay = 0,
) {
  Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration: motion.normal,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    }),
    Animated.timing(translateY, {
      toValue: 0,
      duration: motion.normal,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    }),
  ]).start()
}

export function runRouteEnter(
  opacity: Animated.Value,
  translateY: Animated.Value,
  scale: Animated.Value,
) {
  opacity.setValue(0.45)
  translateY.setValue(10)
  scale.setValue(0.992)

  Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    }),
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    }),
    Animated.spring(scale, {
      toValue: 1,
      ...motion.spring,
      useNativeDriver: nativeDriver,
    }),
  ]).start()
}

export function springTo(value: Animated.Value, toValue: number) {
  Animated.spring(value, {
    toValue,
    ...motion.spring,
    useNativeDriver: nativeDriver,
  }).start()
}

export function pulse(value: Animated.Value) {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 0.62,
        duration: 900,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: 900,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: nativeDriver,
      }),
    ]),
  )
}

export function floatingLoop(
  value: Animated.Value,
  distance = 12,
  duration = 5200,
) {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: distance,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: nativeDriver,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: nativeDriver,
      }),
    ]),
  )
}
