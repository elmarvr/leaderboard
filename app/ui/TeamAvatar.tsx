import { Avatar } from "@mantine/core";
import { IconUsers } from "@tabler/icons";

export interface TeamAvatarProps {
  src?: string | null;
  size?: number;
}

export default function TeamAvatar({ src, size = 40 }: TeamAvatarProps) {
  return (
    <Avatar src={src} radius={size} size={size}>
      <IconUsers size={size / 2} />
    </Avatar>
  );
}
