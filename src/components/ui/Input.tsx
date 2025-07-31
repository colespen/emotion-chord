import React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#f0f6fc] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#7d8590] focus:outline-none focus:border-[#4044ff] disabled:cursor-not-allowed disabled:opacity-50 selection:bg-[#1f2937] selection:text-[#f0f6fc] autofill:!bg-[#0d1117] autofill:!text-[#f0f6fc]",
        className
      )}
      style={{
        WebkitBoxShadow: '0 0 0 1000px #0d1117 inset',
        WebkitTextFillColor: '#f0f6fc',
      }}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#f0f6fc] placeholder:text-[#7d8590] focus:outline-none focus:border-[#4044ff] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        WebkitBoxShadow: '0 0 0 1000px #0d1117 inset',
        WebkitTextFillColor: '#f0f6fc',
      }}
      {...props}
    />
  );
}
