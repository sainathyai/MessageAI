import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface WaveformVisualizerProps {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  color?: string;
  barCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  duration,
  currentTime,
  isPlaying,
  color,
  barCount = 30,
}) => {
  const { theme } = useTheme();
  
  // Generate consistent waveform pattern based on duration
  const bars = useMemo(() => {
    // Create pseudo-random but consistent pattern
    const seed = Math.floor(duration * 1000);
    const random = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return (x - Math.floor(x));
    };
    
    return Array.from({ length: barCount }, (_, i) => {
      // Create a wave-like pattern
      const base = Math.sin(i / barCount * Math.PI) * 0.5 + 0.5;
      const variation = random(i) * 0.3;
      return Math.max(0.2, Math.min(1, base + variation));
    });
  }, [duration, barCount]);

  const progress = duration > 0 ? currentTime / duration : 0;
  const activeColor = color || theme.primary;
  const inactiveColor = theme.border;

  return (
    <View style={styles.container}>
      {bars.map((height, index) => {
        const barProgress = index / bars.length;
        const isActive = barProgress <= progress;
        
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: `${height * 100}%`,
                backgroundColor: isActive ? activeColor : inactiveColor,
                opacity: isActive ? 1 : 0.5,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    gap: 2,
    flex: 1,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    minWidth: 2,
  },
});

