import { AppShell, Button, Center, SegmentedControl, Stack } from "@mantine/core";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { useId } from "react";
import { useControlField, useIsSubmitting, ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import { getTeam, updateTeam } from "~/models/team.server";
import { TeamSelect } from "~/routes/resources/teams";
import TitleCard from "~/ui/TitleCard";
import { getMatchScore } from "~/utils/elo";
import { authorize, createServerClient } from "~/utils/supabase.server";

const validator = withZod(
  z
    .object({
      team1: z.string().min(1, { message: "Team 1 is verplicht" }),
      team2: z.string().min(1, { message: "Team 2 is verplicht" }),
      matchResult: z.enum(["1", "draw", "2"]),
    })
    .refine((data) => data.team1 !== data.team2, {
      message: "Winnaar en verliezer mogen niet hetzelfde zijn",
      path: ["loser"],
    })
);

export async function action({ request }: ActionArgs) {
  const response = new Response();

  const client = createServerClient({
    request,
    response,
  });

  const formData = await request.formData();

  const result = await validator.validate(formData);

  if (result.error) {
    return validationError(result.error, {}, response);
  }

  const { team1: team1Id, team2: team2Id, matchResult } = result.data;

  const team1 = await getTeam(client, team1Id);
  const team2 = await getTeam(client, team2Id);

  switch (matchResult) {
    case "draw":
      await updateTeam(client, team1.id, {
        score: getMatchScore(team1, team2, "draw"),
      });

      await updateTeam(client, team2.id, {
        score: getMatchScore(team2, team1, "draw"),
      });

      break;

    case "1":
      await updateTeam(client, team1.id, {
        score: getMatchScore(team1, team2, "win"),
      });

      await updateTeam(client, team2.id, {
        score: getMatchScore(team2, team1, "loss"),
      });

      break;

    case "2":
      await updateTeam(client, team1.id, {
        score: getMatchScore(team1, team2, "loss"),
      });

      await updateTeam(client, team2.id, {
        score: getMatchScore(team2, team1, "win"),
      });
  }

  return json({}, response);
}

export async function loader({ request }: LoaderArgs) {
  const session = await authorize(request);

  return json({ session });
}

export default function Score() {
  const formId = useId();

  const isSubmitting = useIsSubmitting(formId);

  return (
    <AppShell>
      <Center h="100%">
        <TitleCard title="Vul uitslag in">
          <ValidatedForm
            id={formId}
            validator={validator}
            method="post"
            defaultValues={{
              matchResult: "1",
            }}
          >
            <Stack>
              <TeamSelect label="Team 1" name="team1" />
              <TeamSelect label="Team 2" name="team2" />
              <MatchResultControl />
            </Stack>

            <Button mt="xl" loading={isSubmitting} fullWidth color="red" type="submit">
              Verstuur
            </Button>
          </ValidatedForm>
        </TitleCard>
      </Center>
    </AppShell>
  );
}

function MatchResultControl() {
  const [value, setValue] = useControlField<string>("result");

  const resultOptions = [
    {
      label: "Team 1",
      value: "1",
    },

    {
      label: "Gelijkspel",
      value: "draw",
    },

    {
      label: "Team 2",
      value: "2",
    },
  ];

  return (
    <>
      <input hidden name="matchResult" value={value || undefined} />
      <SegmentedControl data={resultOptions} value={value} onChange={setValue} fullWidth />
    </>
  );
}
