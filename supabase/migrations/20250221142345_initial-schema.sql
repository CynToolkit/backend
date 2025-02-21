create table "public"."polar_supabase" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "supabase_id" uuid not null default auth.uid(),
    "polar_id" text not null
);


CREATE UNIQUE INDEX polar_supabase_pkey ON public.polar_supabase USING btree (id);

CREATE UNIQUE INDEX polar_supabase_supabase_id_key ON public.polar_supabase USING btree (supabase_id);

alter table "public"."polar_supabase" add constraint "polar_supabase_pkey" PRIMARY KEY using index "polar_supabase_pkey";

alter table "public"."polar_supabase" add constraint "polar_supabase_supabase_id_key" UNIQUE using index "polar_supabase_supabase_id_key";

grant delete on table "public"."polar_supabase" to "anon";

grant insert on table "public"."polar_supabase" to "anon";

grant references on table "public"."polar_supabase" to "anon";

grant select on table "public"."polar_supabase" to "anon";

grant trigger on table "public"."polar_supabase" to "anon";

grant truncate on table "public"."polar_supabase" to "anon";

grant update on table "public"."polar_supabase" to "anon";

grant delete on table "public"."polar_supabase" to "authenticated";

grant insert on table "public"."polar_supabase" to "authenticated";

grant references on table "public"."polar_supabase" to "authenticated";

grant select on table "public"."polar_supabase" to "authenticated";

grant trigger on table "public"."polar_supabase" to "authenticated";

grant truncate on table "public"."polar_supabase" to "authenticated";

grant update on table "public"."polar_supabase" to "authenticated";

grant delete on table "public"."polar_supabase" to "service_role";

grant insert on table "public"."polar_supabase" to "service_role";

grant references on table "public"."polar_supabase" to "service_role";

grant select on table "public"."polar_supabase" to "service_role";

grant trigger on table "public"."polar_supabase" to "service_role";

grant truncate on table "public"."polar_supabase" to "service_role";

grant update on table "public"."polar_supabase" to "service_role";

create policy "Enable insert for authenticated users only"
on "public"."polar_supabase"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable users to view their own data only"
on "public"."polar_supabase"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = supabase_id));



