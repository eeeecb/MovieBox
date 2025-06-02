import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  useAnimatedStyle,
  interpolate 
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

let LinearGradient;
if (Platform.OS !== 'web') {
  try {
    LinearGradient = require('react-native-linear-gradient').default;
  } catch (e) {
    console.warn('LinearGradient não disponível, usando fallback');
    LinearGradient = null;
  }
}

export const ShimmerBase = ({ 
  style, 
  duration,
  children,
  intensity,
  shimmerWidth = 0.7,
  borderRadius = 4
}) => {
  const { theme, isDark } = useTheme();
  const shimmerPosition = useSharedValue(-1);

  const shimmerDuration = duration || theme.colors.shimmer?.speed || 1500;
  const shimmerIntensity = intensity || theme.colors.shimmer?.intensity || 0.3;

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: shimmerDuration }),
      -1,
      false
    );
  }, [shimmerDuration]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [-100, 100]
    );

    return {
      transform: [{ translateX: `${translateX}%` }]
    };
  });

  const getBaseColor = () => {
    return theme.colors.shimmer?.base || (isDark ? '#2A2A2A' : '#E1E9EE');
  };

  const getHighlightColor = () => {
    return theme.colors.shimmer?.highlight || (isDark ? '#404040' : '#F5F7FA');
  };

  const renderWebShimmer = () => (
    <View style={[
      {
        backgroundColor: getBaseColor(),
        borderRadius,
        overflow: 'hidden'
      },
      style
    ]}>
      {children}
      <Animated.View 
        style={[
          StyleSheet.absoluteFillObject,
          animatedStyle,
          {
            width: `${shimmerWidth * 100}%`,
            backgroundColor: getHighlightColor(),
            opacity: shimmerIntensity + 0.3
          }
        ]}
      />
    </View>
  );

  const renderMobileShimmer = () => {
    const shimmerColors = [
      'transparent',
      `rgba(${isDark ? '255, 255, 255' : '255, 255, 255'}, ${shimmerIntensity + 0.2})`,
      'transparent'
    ];

    return (
      <View style={[
        {
          backgroundColor: getBaseColor(),
          borderRadius,
          overflow: 'hidden'
        },
        style
      ]}>
        {children}
        <Animated.View 
          style={[
            StyleSheet.absoluteFillObject,
            animatedStyle,
            { width: `${shimmerWidth * 100}%` }
          ]}
        >
          {LinearGradient ? (
            <LinearGradient
              colors={shimmerColors}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          ) : (
            <View style={[
              StyleSheet.absoluteFillObject,
              { 
                backgroundColor: getHighlightColor(),
                opacity: shimmerIntensity + 0.2
              }
            ]} />
          )}
        </Animated.View>
      </View>
    );
  };

  return Platform.OS === 'web' ? renderWebShimmer() : renderMobileShimmer();
};

export const ShimmerBox = ({ 
  width, 
  height, 
  borderRadius = 4, 
  style,
  duration = 1500 
}) => (
  <ShimmerBase
    style={[{ width, height }, style]}
    borderRadius={borderRadius}
    duration={duration}
  />
);

export const ShimmerLine = ({ 
  width = '100%', 
  height = 16, 
  borderRadius = 8,
  style,
  duration = 1500 
}) => (
  <ShimmerBox 
    width={width} 
    height={height} 
    borderRadius={borderRadius}
    style={style}
    duration={duration}
  />
);

export const ShimmerCircle = ({ 
  size, 
  style,
  duration = 1500 
}) => (
  <ShimmerBox 
    width={size} 
    height={size} 
    borderRadius={size / 2}
    style={style}
    duration={duration}
  />
);