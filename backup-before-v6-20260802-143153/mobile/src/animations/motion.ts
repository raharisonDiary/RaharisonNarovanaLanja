import { Animated, Easing } from 'react-native'

export function runFadeUp(opacity: Animated.Value, translateY: Animated.Value) {
  Animated.parallel([
    Animated.timing(opacity, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    Animated.timing(translateY, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
  ]).start()
}

export function pulse(value: Animated.Value) {
  return Animated.loop(Animated.sequence([
    Animated.timing(value, { toValue: 0.55, duration: 700, useNativeDriver: true }),
    Animated.timing(value, { toValue: 1, duration: 700, useNativeDriver: true }),
  ]))
}
