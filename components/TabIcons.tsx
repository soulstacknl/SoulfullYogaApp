import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = {
  color: ColorValue;
  size?: number;
};

// Icons recreated 1:1 from the inline SVGs in soulful-yoga-app-prototype.html

export function RoosterIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Rect x="3" y="5" width="18" height="16" rx="3" />
      <Path d="M8 3v4M16 3v4M3 10h18" />
    </Svg>
  );
}

export function LessenIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Rect x="3" y="5" width="18" height="16" rx="3" />
      <Path d="M8 3v4M16 3v4M8.5 14.5l2.5 2.5 4.5-5" />
    </Svg>
  );
}

export function VideosIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Rect x="3" y="5" width="18" height="14" rx="3" />
      <Path d="M10 9l6 3-6 3z" fill={color} stroke="none" />
    </Svg>
  );
}

export function BerichtenIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 3.5V17H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      <Path d="M8 10h8M8 13h5" />
    </Svg>
  );
}

export function ProfielIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
    </Svg>
  );
}
