

import { cn } from "@/lib/utils"
import { ComponentProps, forwardRef, useRef } from "react";

 

const Input = forwardRef<HTMLInputElement, ComponentProps<"input"> & { trim ?: boolean}>(
  ({ className, type, ...props }, ref) => {
  const shouldTrim = useRef(props.trim || false)

   const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if(props.onChange) {
        props.onChange({
          ...event,
          target: {
            ...event.target,
            value: shouldTrim.current ? value.trim() : value
          }
        })
      }
   }

   delete props.trim

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
        onChange={handleOnChange}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
