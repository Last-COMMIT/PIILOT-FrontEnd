import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "../lib/utils"
import { Input, type InputProps } from "./input"

export type PasswordInputProps = Omit<InputProps, "type">

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, colorScheme, size, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false)

    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          colorScheme={colorScheme}
          size={size}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--color-sidebar-text)]",
            "hover:bg-[var(--color-sidebar-hover-bg)] hover:text-[var(--color-sidebar-hover-text)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-main-bg)] focus-visible:ring-offset-0 focus-visible:ring-offset-[var(--color-bg-main)]"
          )}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
