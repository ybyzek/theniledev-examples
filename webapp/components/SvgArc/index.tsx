// just a TS version of http://jsbin.com/quhujowota/1/edit?html,js,output
type Props = {
  x: number;
  y: number;
  radius: number;
  startAngle: number;
  endAngle: number;
};

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function makeArc({ x, y, radius, startAngle, endAngle }: Props) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');

  return d;
}

export default function SvgArc(
  props: Props & { color: string; strokeWidth: number; svgHeight: number }
) {
  const { strokeWidth, color, svgHeight, ...rest } = props;
  const d = makeArc(rest);

  return (
    <svg height={svgHeight}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
