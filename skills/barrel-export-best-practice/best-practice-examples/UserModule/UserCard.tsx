export interface UserCardProps {
  name: string;
  email: string;
}

export function UserCard({ name, email }: UserCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-gray-500">{email}</p>
    </div>
  );
}
