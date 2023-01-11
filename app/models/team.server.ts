import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "supabase.types";

export type Team = Database["public"]["Tables"]["teams"]["Row"];

export async function teamIsUnique(client: SupabaseClient<Database>, name: string) {
  const { data, error } = await client.from("teams").select("*").eq("name", name).single();

  if (!error) {
    return !data;
  }

  //No results error
  if (error.code === "PGRST116") {
    return true;
  }

  throw error;
}

export async function createTeam(
  client: SupabaseClient<Database>,
  values: Database["public"]["Tables"]["teams"]["Insert"]
) {
  const { data } = await client.from("teams").insert(values).throwOnError();

  return data;
}

export async function searchTeams(client: SupabaseClient<Database>, query: string) {
  const { data } = await client.from("teams").select("*").ilike("name", `%${query}%`).throwOnError();

  return data ?? [];
}

export async function getTeam(client: SupabaseClient<Database>, id: string) {
  const { data } = await client.from("teams").select("*").eq("id", id).single();

  if (!data) {
    throw new Error("Team not found");
  }

  return data;
}

export async function updateTeam(client: SupabaseClient<Database>, id: string, values: Omit<Partial<Team>, "id">) {
  const { data } = await client.from("teams").update(values).eq("id", id).throwOnError();

  return data;
}
