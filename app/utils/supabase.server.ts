import { redirect } from "@remix-run/node";
import { type UploadHandlerPart } from "@remix-run/node";
import type { SupabaseClient } from "@supabase/auth-helpers-remix";
import { createServerClient as __createServerClient } from "@supabase/auth-helpers-remix";
import type { Database } from "supabase.types";

export function createServerClient({ request, response }: { request: Request; response: Response }) {
  return __createServerClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    request,
    response,
  });
}

const asyncIterableToStream = (asyncIterable: AsyncIterable<Uint8Array>) => {
  return new ReadableStream({
    async pull(controller) {
      for await (const entry of asyncIterable) {
        controller.enqueue(entry);
      }
      controller.close();
    },
  });
};

export function createSupabaseUploadHandler(supabase: SupabaseClient<Database>, bucketId: string) {
  return async (part: UploadHandlerPart) => {
    const stream = asyncIterableToStream(part.data);

    const path = `${part.filename?.replace(/[^a-z0-9.]/gi, "_")}`;

    const { error } = await supabase.storage.from(bucketId).upload(path, stream, {
      contentType: part.contentType,
      upsert: true,
    });

    if (error) {
      throw error;
    }

    return path;
  };
}

export async function authorize(request: Request) {
  const response = new Response();

  const client = createServerClient({
    request,
    response,
  });

  const { data } = await client.auth.getSession();

  if (!data.session) {
    throw redirect("password", {
      headers: response.headers,
    });
  }

  return data.session;
}
