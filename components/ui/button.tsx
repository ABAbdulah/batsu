import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Batsu pill buttons. Apply `buttonVariants` to a <Link> for link-styled CTAs.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-transparent font-sans whitespace-nowrap uppercase transition-colors duration-300 outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        solid: "bg-ink text-white hover:bg-brand hover:text-ink",
        light: "bg-white text-ink hover:bg-brand hover:text-ink",
        outline: "border-line-strong bg-white text-ink hover:border-ink",
      },
      size: {
        default: "min-h-12 px-[30px] py-4 text-[11.5px] font-semibold tracking-[0.16em]",
        sm: "min-h-11 px-[22px] py-3 text-[11px] font-semibold tracking-[0.16em]",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
