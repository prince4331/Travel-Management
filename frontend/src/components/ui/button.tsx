import * as React from "react";
import { cn } from "../../utils/cn";

const buttonVariants = {
  primary: "bg-primary-600 text-white hover:bg-primary-700",
  secondary: "border border-primary-600 text-primary-600 hover:bg-primary-50",
  subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizeVariants = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};


type ButtonAsType = 'button' | 'a';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: ButtonAsType;
  asChild?: boolean; // Support for Radix UI pattern
  href?: string;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof sizeVariants;
  loadingText?: string;
  isLoading?: boolean;
}


export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
  { as = 'button', asChild, href, className, variant = "primary", size = "md", loadingText, isLoading, disabled, children, ...props },
    ref,
  ) => {
    const baseClass = cn(
      "inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
      buttonVariants[variant],
      sizeVariants[size],
      className,
    );
    
    // Filter out button-specific props when rendering as anchor
    const { form, formAction, formEncType, formMethod, formNoValidate, formTarget, type, value, ...anchorProps } = props as any;
    
    if (as === 'a') {
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={baseClass} aria-disabled={disabled || isLoading} {...anchorProps}>
          {isLoading ? loadingText ?? "Loading..." : children}
        </a>
      );
    }
    // Only pass button props
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} disabled={disabled || isLoading} className={baseClass} {...props}>
        {isLoading ? loadingText ?? "Loading..." : children}
      </button>
    );
  }
);
Button.displayName = "Button";
