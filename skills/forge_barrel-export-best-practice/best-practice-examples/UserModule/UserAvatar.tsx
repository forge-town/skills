export interface UserAvatarProps {
  src?: string;
  alt: string;
}

export function UserAvatar({ src, alt }: UserAvatarProps) {
  return (
    <img
      src={src ?? "/default-avatar.png"}
      alt={alt}
      className="h-10 w-10 rounded-full object-cover"
    />
  );
}
