import React from "react";

const NewReleaseButton = () => {
  return (
    <div
      className="flex flex-row items-center justify-center gap-4 select-none"
    >
      <SparkleSvg width="18" height="18" />

      <div className="flex items-center justify-center rounded-full bg-new_release_btn_gradient p-0.5">
        <div className="relative rounded-full bg-background px-6 py-1.5">
          <TopLeftSvg />
          <p className="text-[#C2C2C2] text-lg">New Release</p>
          <BottomRightSvg />
        </div>
      </div>

      <SparkleSvg width="18" height="18" />
    </div>
  );
};

export default NewReleaseButton;

const TopLeftSvg = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="blur-[3px] absolute top-[5px] left-[5px] -rotate-2"
    >
      <path
        d="M0.5 19C0.5 9 5 0.5 17.5 0.5C8 4.5 5.5 7.5 0.5 19Z"
        fill="#FBEEAF"
      />
    </svg>
  );
};

const BottomRightSvg = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="blur-[3px] absolute bottom-[5px] right-[5px] rotate-[5deg]"
    >
      <path
        d="M17 0.5C17 10.5 12.5 19 0 19C9.5 15 12 12 17 0.5Z"
        fill="#FBEEAF"
      />
    </svg>
  );
};

const SparkleSvg = ({
  width,
  height,
  color,
  className,
}: {
  width?: string;
  height?: string;
  color?: string;
  className?: string;
}) => {
  return (
    <svg
      width={width || "24"}
      height={height || "24"}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}`}
    >
      <path
        d="M0 7.5C4.5 8 7 10.5 7.5 15C8 10.5 10.5 8 15 7.5C10.5 7 8 4.5 7.5 0C7 4.5 4.5 7 0 7.5Z"
        fill={color || "#FBEEAF"}
      />
    </svg>
  );
};
