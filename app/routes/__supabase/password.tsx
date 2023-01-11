import { AppShell, Center, Stack, Button, TextInput, PasswordInput } from "@mantine/core";
import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { useId } from "react";
import { useField, useIsSubmitting, ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import TitleCard from "~/ui/TitleCard";
import { createServerClient } from "~/utils/supabase.server";

const validator = withZod(
  z.object({
    email: z
      .string()
      .min(1, {
        message: "Email is verplicht",
      })
      .email({ message: "Ongeldig emailadres" }),
    password: z.string().min(1, {
      message: "Wachtwoord is verplicht",
    }),
  })
);

export async function action({ request }: ActionArgs) {
  const response = new Response();

  const supabase = createServerClient({
    request,
    response,
  });

  const formData = await request.formData();

  const result = await validator.validate(formData);

  if (result.error) {
    return validationError(result.error);
  }

  const { password, email } = result.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return validationError({
      fieldErrors: {
        password: "Inloggegevens zijn onjuist",
      },
    });
  }

  return redirect("/match", {
    headers: response.headers,
  });
}

export default function Password() {
  const formId = useId();

  const isSubmitting = useIsSubmitting(formId);

  const emailField = useField("email", { formId });
  const passwordField = useField("password", { formId });

  return (
    <Center h="100%">
      <TitleCard title="Log in">
        <ValidatedForm id={formId} method="post" validator={validator}>
          <Stack>
            <TextInput error={emailField.error} {...emailField.getInputProps({ label: "Email" })} />
            <PasswordInput error={passwordField.error} {...passwordField.getInputProps({ label: "Wachtwoord" })} />
          </Stack>

          <Button loading={isSubmitting} type="submit" mt="xl" fullWidth>
            Verstuur
          </Button>
        </ValidatedForm>
      </TitleCard>
    </Center>
  );
}
