import { createStyles } from "@mantine/core";
import type { ReactNode } from "react";

export interface StickyTableHeadProps {
  children?: ReactNode;
}

export default function StickyTableHead({ children }: StickyTableHeadProps) {
  const { classes } = useStyles();

  return <thead className={classes.header}>{children}</thead>;
}

const useStyles = createStyles((theme) => ({
  header: {
    position: "sticky",
    top: 0,
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    zIndex: 10,
    ":after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      borderBottom: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[2]}`,
    },
  },
}));
