import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export type UserStatus = "online" | "offline" | "busy" | "away";

export interface UserCardProps {
  name?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  status?: UserStatus;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

const statusConfig: Record<UserStatus, { label: string; className: string }> =
  {
    online: { label: "在线", className: "bg-green-500" },
    offline: { label: "离线", className: "bg-gray-400" },
    busy: { label: "忙碌", className: "bg-red-500" },
    away: { label: "离开", className: "bg-yellow-500" },
  };

export function UserCard({
  name,
  email,
  avatarUrl,
  role,
  status,
  onMessage,
  onViewProfile,
}: UserCardProps) {
  const statusInfo = status ? statusConfig[status] : null;

  return (
    <Card className="w-64">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="relative">
          <Avatar>
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>
              {name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          {statusInfo && (
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${statusInfo.className}`}
            />
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{name ?? "—"}</span>
          {role && <span className="text-xs text-muted-foreground">{role}</span>}
        </div>
        {statusInfo && (
          <Badge variant="outline" className="ml-auto text-xs">
            {statusInfo.label}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        {email && (
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        )}
      </CardContent>
      {(onMessage || onViewProfile) && (
        <CardFooter className="gap-2 pt-0">
          {onMessage && (
            <Button size="sm" variant="outline" onClick={onMessage}>
              发消息
            </Button>
          )}
          {onViewProfile && (
            <Button size="sm" onClick={onViewProfile}>
              查看主页
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
