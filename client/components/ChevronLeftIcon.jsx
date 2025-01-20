export default function ChevronLeftIcon({ className, width, height, fill, opacity}) {
  return (
    <svg className={className} width={width} height={height} viewBox="12 14 16 16" fill={fill} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23.429 13.25C23.5414 13.2486 23.6529 13.2712 23.7562 13.3164C23.8595 13.3617 23.9525 13.4284 24.029 13.5125C24.3718 13.8625 24.3718 14.405 24.029 14.755L16.9147 22.0175L24.029 29.2625C24.3718 29.6125 24.3718 30.155 24.029 30.505C23.6861 30.855 23.1547 30.855 22.8118 30.505L15.1147 22.6125C14.7718 22.2625 14.7718 21.72 15.1147 21.37L22.829 13.5125C23.0004 13.3375 23.2233 13.25 23.429 13.25Z"
        fill={fill} />
    </svg>
  );
}
