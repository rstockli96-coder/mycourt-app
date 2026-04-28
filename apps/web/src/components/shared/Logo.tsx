import Link from 'next/link'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ href = '/', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-7 w-7 text-base',
    md: 'h-9 w-9 text-lg',
    lg: 'h-12 w-12 text-xl',
  }
  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  return (
    <Link href={href} className="flex items-center gap-2">
      <div className={`flex items-center justify-center rounded-full bg-green-600 font-bold text-white ${sizes[size]}`}>
        M
      </div>
      <span className={`font-bold text-gray-900 ${textSizes[size]}`}>MyCourt</span>
    </Link>
  )
}
