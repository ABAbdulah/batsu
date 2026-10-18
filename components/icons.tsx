import type { SVGProps } from "react";

// Line icons from the design canvas (24px grid, 1.5 stroke).
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 8h14l-1 13H6L5 8z" />
      <path d="M9 8V6a3 3 0 016 0v2" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8h16M4 16h16" />
    </Icon>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <Icon strokeWidth={1.6} {...props}>
      <path d="M4 19.5l1.2-3.6A8 8 0 1 1 8.3 19z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-1.8-1-1 .8c-1-.4-1.8-1.2-2.2-2.2l.8-1-1-1.8z" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon strokeWidth={1.6} {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon strokeWidth={1.6} {...props}>
      <path d="M9 5l7 7-7 7" />
    </Icon>
  );
}

export function CashIcon(props: IconProps) {
  return (
    <Icon strokeWidth={1.4} {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.5v5M18 9.5v5" />
    </Icon>
  );
}

export function ExchangeIcon(props: IconProps) {
  return (
    <Icon strokeWidth={1.4} {...props}>
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </Icon>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <Icon strokeWidth={1.4} {...props}>
      <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" />
      <circle cx="6.5" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </Icon>
  );
}
