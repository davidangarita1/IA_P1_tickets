import React from "react";

type IconProps = {
  className?: string;
  style?: React.CSSProperties;
  "aria-hidden"?: boolean;
};

function makeIcon(name: string) {
  const Icon = ({ className, style, ...props }: IconProps) => (
    <span
      role="img"
      aria-label={name}
      className={className}
      style={style}
      data-icon={name}
      {...props}
    />
  );
  Icon.displayName = name;
  return Icon;
}

export const EditOutlined = makeIcon("edit");
export const CloseOutlined = makeIcon("close");
export const DeleteOutlined = makeIcon("delete");
export const PlusOutlined = makeIcon("plus");
export const CheckOutlined = makeIcon("check");
export const LoadingOutlined = makeIcon("loading");
