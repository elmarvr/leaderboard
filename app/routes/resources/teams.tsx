import type { SelectProps } from "@mantine/core";
import { Select, Loader } from "@mantine/core";
import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useSpinDelay } from "spin-delay";
import { createServerClient } from "~/utils/supabase.server";
import { searchTeams } from "~/models/team.server";
import invariant from "tiny-invariant";
import { useControlField, useField } from "remix-validated-form";

export const loader = async ({ request }: ActionArgs) => {
  const response = new Response();

  const client = createServerClient({
    request,
    response,
  });

  const url = new URL(request.url);

  const query = url.searchParams.get("query");

  invariant(query, "query is required");

  const teams = await searchTeams(client, query);

  return json(
    {
      teams,
    },
    {
      headers: response.headers,
    }
  );
};

interface TeamSelectProps extends Omit<SelectProps, "data"> {
  name: string;
}

export function TeamSelect({ name, ...props }: TeamSelectProps) {
  const teamFetcher = useFetcher<typeof loader>();

  const teams = teamFetcher.data?.teams ?? [];

  const [value, setValue] = useControlField<string | null>(name);
  const { error, validate } = useField(name);

  const teamOptions = teams.map((team) => ({
    label: team.name,
    value: team.id,
  }));

  const busy = teamFetcher.state !== "idle";

  const showSpinner = useSpinDelay(busy, {
    delay: 150,
    minDuration: 500,
  });

  function handleSearchChange(value: string) {
    if (!value) return;

    teamFetcher.submit(
      {
        query: value,
      },
      { method: "get", action: "/resources/teams" }
    );
  }

  return (
    <>
      <input hidden name={name} value={value || undefined} />
      <Select
        w="100%"
        searchable
        data={teamOptions}
        rightSection={showSpinner ? <Loader size="xs" /> : undefined}
        value={value}
        onChange={(value) => {
          setValue(value);
          validate();
        }}
        error={error}
        onSearchChange={handleSearchChange}
        {...props}
      />
    </>
  );
}
