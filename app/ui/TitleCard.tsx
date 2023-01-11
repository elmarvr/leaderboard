import { Button, Paper, Stack, Title } from "@mantine/core";
import type { ComponentProps, ReactNode } from "react";
import type { ValidatedForm } from "remix-validated-form";
import { useIsSubmitting } from "remix-validated-form";

export interface TitleCardProps {
  title: string;

  children?: ReactNode;
}

export default function TitleCard({ title, children, ...props }: TitleCardProps) {
  return (
    <Stack justify="center" align="center" w="100%">
      <Title align="center" pb={18}>
        {title}
      </Title>

      <Paper maw={400} w="100%" radius="md" p="xl" withBorder>
        {children}
      </Paper>
    </Stack>
  );
}
