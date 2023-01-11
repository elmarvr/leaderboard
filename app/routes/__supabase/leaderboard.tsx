import { Container } from "@mantine/core";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

import { useEffect, useState } from "react";
import type { Team } from "~/models/team.server";
import LeaderboardTable from "~/ui/LeaderboardTable";
import { useSupabase } from "~/utils/supabase";
import { createServerClient } from "~/utils/supabase.server";

export async function loader({ request }: LoaderArgs) {
  const response = new Response();

  const client = createServerClient({
    request,
    response,
  });

  const { data: teams } = await client.from("teams").select("*");

  return json({
    initialTeams: teams ?? [],
  });
}

export async function action() {
  return json({});
}

export default function Leaderboard() {
  const { initialTeams } = useLoaderData<typeof loader>();
  const [teams, setTeams] = useState(initialTeams);

  const supabase = useSupabase();

  useEffect(() => {
    const subscription = supabase
      .channel("public:teams")
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, (payload) => {
        setTeams((teams) => {
          const newTeam = payload.new as Team;

          const team = teams.find((team) => team.id === newTeam.id);

          if (team) {
            return teams.map((team) => {
              if (team.id === newTeam.id) {
                return newTeam;
              }

              return team;
            });
          }

          return [newTeam, ...teams];
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  });

  return (
    <Container py={32} h="100%">
      <LeaderboardTable teams={teams} />
    </Container>
  );
}
