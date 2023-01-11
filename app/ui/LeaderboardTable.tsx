import { Group, ScrollArea, Table, Text } from "@mantine/core";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Reorder, motion, LayoutGroup } from "framer-motion";
import { useState } from "react";
import type { Team } from "~/models/team.server";
import StickyTableHead from "./StickyTableHead";
import TeamAvatar from "./TeamAvatar";

interface LeaderboardProps {
  teams: Team[];
}

const columnHelper = createColumnHelper<Team>();

const defaultColumns = [
  columnHelper.display({
    id: "rank",

    header: "#",

    cell({ table, row }) {
      const rank = table.getRowModel().flatRows.indexOf(row) + 1;

      const top3Gradients = [
        { from: "yellow", to: "orange", deg: 45 },
        { from: "white", to: "gray", deg: 45 },
        { from: "brown", to: "orange", deg: 45 },
      ];

      const isTop3 = rank <= 3;

      return (
        <Text variant={isTop3 ? "gradient" : "text"} gradient={top3Gradients[rank - 1]} weight="bold">
          {rank}
        </Text>
      );
    },
  }),

  columnHelper.accessor("name", {
    header: "Team",

    cell(props) {
      const avatarUrl = props.row.original.avatar_url;

      return (
        <Group>
          <TeamAvatar src={avatarUrl} />
          <Text>{props.getValue()}</Text>
        </Group>
      );
    },
  }),

  columnHelper.accessor("score", {
    header() {
      return <Text align="end">Score</Text>;
    },

    cell(props) {
      return <Text align="end">{props.getValue()}</Text>;
    },
  }),
];

export default function LeaderboardTable({ teams }: LeaderboardProps) {
  const table = useReactTable({
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    data: teams,
    state: {
      sorting: [
        {
          id: "score",
          desc: true,
        },
      ],
    },
  });

  return (
    <ScrollArea
      h="100%"
      styles={{
        thumb: {
          zIndex: 20,
        },
      }}
    >
      <Table>
        <StickyTableHead>
          <tr>
            {table.getFlatHeaders().map((header) => (
              <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
            ))}
          </tr>
        </StickyTableHead>

        <LayoutGroup>
          <motion.tbody layout>
            {table.getRowModel().flatRows.map((row) => (
              <motion.tr layout key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </motion.tr>
            ))}
          </motion.tbody>
        </LayoutGroup>
      </Table>
    </ScrollArea>
  );
}
