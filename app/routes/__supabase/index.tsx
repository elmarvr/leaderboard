import type { UploadHandlerPart } from "@remix-run/node";
import { unstable_createMemoryUploadHandler } from "@remix-run/node";
import { unstable_composeUploadHandlers } from "@remix-run/node";
import { type ActionArgs, unstable_parseMultipartFormData, redirect } from "@remix-run/node";

import { z } from "zod";
import { withZod } from "@remix-validated-form/with-zod";
import { useField, useIsSubmitting, ValidatedForm, validationError } from "remix-validated-form";

import { Button, Center, Stack, TextInput } from "@mantine/core";

import { useId } from "react";

import AvatarFileButton from "~/ui/AvatarFileButton";

import TitleCard from "~/ui/TitleCard";

import { createServerClient, createSupabaseUploadHandler } from "~/utils/supabase.server";
import { createTeam, teamIsUnique } from "~/models/team.server";

const createTeamSchema = z.object({
  name: z.string().min(1, { message: "Naam is verplicht" }),
});

export async function action({ request }: ActionArgs) {
  const response = new Response();

  const client = createServerClient({
    request,
    response,
  });

  const uploadHandler = unstable_composeUploadHandlers(async (file: UploadHandlerPart) => {
    if (file.name !== "avatar" || !file.filename) {
      return undefined;
    }

    return createSupabaseUploadHandler(client, "avatars")(file);
  }, unstable_createMemoryUploadHandler());

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);

  const serverValidator = withZod(
    createTeamSchema
      .extend({
        avatar: z.string().optional().or(z.instanceof(File)),
      })
      .refine(({ name }) => teamIsUnique(client, name), {
        message: "Team bestaat al",
        path: ["name"],
      })
  );

  const result = await serverValidator.validate(formData);

  if (result.error) {
    return validationError(result.error);
  }

  const { name, avatar } = result.data;

  const avatarUrl =
    typeof avatar === "string" ? client.storage.from("avatars").getPublicUrl(avatar).data.publicUrl : null;

  await createTeam(client, {
    name,
    avatar_url: avatarUrl,
  });

  return redirect("/leaderboard");
}

export default function Create() {
  const formId = useId();

  const nameField = useField("name", { formId });
  const avatarField = useField("avatar", { formId });
  const isSubmitting = useIsSubmitting(formId);

  const clientValidator = withZod(
    createTeamSchema.extend({
      avatar: z.instanceof(File).optional(),
    })
  );

  return (
    <Center h="100%" pb={56}>
      <TitleCard title="Maak een team aan">
        <ValidatedForm encType="multipart/form-data" id={formId} validator={clientValidator} method="post">
          <Stack align="center">
            <AvatarFileButton {...avatarField.getInputProps()} />

            <TextInput
              w="100%"
              {...nameField.getInputProps({
                placeholder: "2018 vo",
                label: "Naam",
                error: nameField.error,
              })}
            />
          </Stack>

          <Button loading={isSubmitting} type="submit" mt="xl" w="100%">
            Maak aan
          </Button>
        </ValidatedForm>
      </TitleCard>
    </Center>
  );
}
