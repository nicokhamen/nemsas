import React from "react";
import type { IconType } from "react-icons";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  icon?: IconType;
  iconPosition?: "left" | "right";
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "text";
  color?: "red" | "green" | "blue" | "gray"; 
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  className = "",
  size = "md",
  variant = "solid",
  color = "red" , 
}) => {
  // Color styles
  const colorStyles = {
    red: {
      solid: "bg-[#DC2626] text-white hover:bg-[#DC2626]/90 focus:ring-[#DC2626]",
      outline: "border border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/10",
      text: "text-[#DC2626] hover:bg-[#DC2626]/10"
    },
    green: {
      solid: "bg-[#10B981] text-white hover:bg-[#10B981]/90 focus:ring-[#10B981]",
      outline: "border border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10",
      text: "text-[#10B981] hover:bg-[#10B981]/10"
    },
    blue: {
      solid: "bg-[#3B82F6] text-white hover:bg-[#3B82F6]/90 focus:ring-[#3B82F6]",
      outline: "border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10",
      text: "text-[#3B82F6] hover:bg-[#3B82F6]/10"
    },
    gray: {
      solid: "bg-[#6B7280] text-white hover:bg-[#6B7280]/90 focus:ring-[#6B7280]",
      outline: "border border-[#6B7280] text-[#6B7280] hover:bg-[#6B7280]/10",
      text: "text-[#6B7280] hover:bg-[#6B7280]/10"
    }
  };

  const baseStyles = "font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const stateStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : "";

  // Size variants
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // Icon size mapping
  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  const currentColorStyles = colorStyles[color][variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${stateStyles}
        ${sizeStyles[size]}
        ${currentColorStyles}
        ${className}
        inline-flex items-center justify-center gap-2 h-[45px]
      `}
    >
      {Icon && iconPosition === "left" && (
        <Icon size={iconSizes[size]} className="flex-shrink-0" />
      )}

      <span>{children}</span>

      {Icon && iconPosition === "right" && (
        <Icon size={iconSizes[size]} className="flex-shrink-0" />
      )}
    </button>
  );
};

export default Button;