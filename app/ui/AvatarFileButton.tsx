import { ActionIcon, Box, FileButton, Avatar, createStyles, useMantineTheme } from "@mantine/core";

import { IconPencil, IconUsers } from "@tabler/icons";
import { useState } from "react";

interface AvatarFileButtonProps {
  value: File | null;
  onChange: (file: File | null) => void;
  name: string;
}

export default function AvatarFileButton({ name, value, onChange }: AvatarFileButtonProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const theme = useMantineTheme();

  return (
    <Box display="inline-block" pos="relative">
      <Avatar
        radius={100}
        src={avatarUrl}
        sx={{ border: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[3]}` }}
        size={100}
        imageProps={{
          onLoad: () => {
            if (avatarUrl) URL.revokeObjectURL(avatarUrl);
          },
        }}
      >
        <IconUsers size={40} stroke={1.5} />
      </Avatar>

      <FileButton
        accept="image/*"
        name={name}
        onChange={(value) => {
          if (value) {
            setAvatarUrl(URL.createObjectURL(value));
          }

          onChange(value);
        }}
      >
        {(props) => (
          <ActionIcon variant="filled" bottom={0} right={0} pos="absolute" {...props}>
            <IconPencil size={18} />
          </ActionIcon>
        )}
      </FileButton>
    </Box>
  );
}
