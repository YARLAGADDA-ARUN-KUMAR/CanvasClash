import { useState } from 'react';

export default function ColorWheelButton({ size = 36, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        cursor: 'pointer',
        background: `
          conic-gradient(
            red,
            orange,
            yellow,
            green,
            cyan,
            blue,
            violet,
            red
          )
        `,
        transition: 'transform 0.3s ease',
        transform: hovered
          ? 'scale(1.1) rotate(15deg)'
          : 'scale(1) rotate(0deg)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}
    />
  );
}
