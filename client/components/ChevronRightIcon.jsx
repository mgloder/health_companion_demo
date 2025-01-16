export default function ChevronRightIcon({ className, width, height, fill, opacity}) {
  return (
      <svg className={className} width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill={fill} xmlns="http://www.w3.org/2000/svg">
        <g opacity={opacity}>
          <path
            d="M2.78551 5.8125C2.66372 5.81096 2.54298 5.83601 2.43103 5.88606C2.31909 5.93612 2.21842 6.01006 2.13551 6.10313C1.76408 6.49063 1.76408 7.09125 2.13551 7.47875L9.84265 15.5194L2.13551 23.5406C1.76408 23.9281 1.76408 24.5288 2.13551 24.9163C2.50693 25.3038 3.08265 25.3038 3.45408 24.9163L11.7926 16.1781C12.1641 15.7906 12.1641 15.19 11.7926 14.8025L3.43551 6.10313C3.24979 5.90938 3.00836 5.8125 2.78551 5.8125Z"
            fill={fill} />
        </g>
      </svg>
  );
}
