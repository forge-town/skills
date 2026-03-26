export interface AvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-16 w-16' }

export function Avatar({ src, alt, size = 'md' }: AvatarProps) {
  return (
    <img
      src={src ?? '/default-avatar.png'}
      alt={alt}
      className={`rounded-full object-cover ${sizeClass[size]}`}
    />
  )
}
