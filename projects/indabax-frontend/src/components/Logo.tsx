import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img
        src="/src/assets/indabax-logo.png"
        alt="IndabaX Logo"
        className={cn(sizeClasses[size], "object-contain")}
        onError={(e) => {
          // Fallback to a simple text logo if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="flex items-center justify-center ${sizeClasses[size]} bg-primary text-primary-foreground rounded-lg font-bold text-lg">
                IX
              </div>
            `;
          }
        }}
      />
    </div>
  );
}
