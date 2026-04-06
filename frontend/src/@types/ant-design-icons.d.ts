declare module "@ant-design/icons" {
  import type { FC, SVGProps } from "react";

  export interface AntdIconProps extends SVGProps<SVGSVGElement> {
    className?: string;
    style?: React.CSSProperties;
    spin?: boolean;
    rotate?: number;
  }

  export const EditOutlined: FC<AntdIconProps>;
  export const CloseOutlined: FC<AntdIconProps>;
  export const DeleteOutlined: FC<AntdIconProps>;
  export const PlusOutlined: FC<AntdIconProps>;
  export const CheckOutlined: FC<AntdIconProps>;
  export const LoadingOutlined: FC<AntdIconProps>;
}
