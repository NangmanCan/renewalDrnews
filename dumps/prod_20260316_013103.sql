


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."articles" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "summary" "text",
    "content" "text" NOT NULL,
    "category" "text" DEFAULT '정책'::"text" NOT NULL,
    "author" "text" DEFAULT '편집부'::"text",
    "image" "text",
    "placement" "text" DEFAULT 'news'::"text",
    "is_headline" boolean DEFAULT false,
    "views" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."articles" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."articles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."articles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."articles_id_seq" OWNED BY "public"."articles"."id";



CREATE TABLE IF NOT EXISTS "public"."banners" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "image" "text" NOT NULL,
    "link" "text" DEFAULT '#'::"text",
    "type" "text" DEFAULT 'sidebar'::"text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "position_sidebar_top" boolean DEFAULT false,
    "position_sidebar_bottom" boolean DEFAULT false,
    "position_mobile_between" boolean DEFAULT false,
    "position_mobile_inline" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."banners" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."banners_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."banners_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."banners_id_seq" OWNED BY "public"."banners"."id";



CREATE TABLE IF NOT EXISTS "public"."ceo_reports" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "content" "text" NOT NULL,
    "category" "text" DEFAULT '경영철학'::"text",
    "author" "text" DEFAULT '김의료'::"text",
    "author_title" "text" DEFAULT 'Dr.News 대표'::"text",
    "author_image" "text",
    "week_number" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ceo_reports" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."ceo_reports_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."ceo_reports_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."ceo_reports_id_seq" OWNED BY "public"."ceo_reports"."id";



CREATE TABLE IF NOT EXISTS "public"."opinions" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "summary" "text",
    "content" "text" NOT NULL,
    "category" "text" DEFAULT '칼럼'::"text",
    "author" "text" NOT NULL,
    "author_title" "text",
    "author_image" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_featured" boolean DEFAULT true
);


ALTER TABLE "public"."opinions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."opinions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."opinions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."opinions_id_seq" OWNED BY "public"."opinions"."id";



ALTER TABLE ONLY "public"."articles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."articles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."banners" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."banners_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."ceo_reports" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."ceo_reports_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."opinions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."opinions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."banners"
    ADD CONSTRAINT "banners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ceo_reports"
    ADD CONSTRAINT "ceo_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."opinions"
    ADD CONSTRAINT "opinions_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_articles_category" ON "public"."articles" USING "btree" ("category");



CREATE INDEX "idx_articles_created_at" ON "public"."articles" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_articles_is_headline" ON "public"."articles" USING "btree" ("is_headline");



CREATE INDEX "idx_articles_placement" ON "public"."articles" USING "btree" ("placement");



CREATE INDEX "idx_banners_is_active" ON "public"."banners" USING "btree" ("is_active");



CREATE INDEX "idx_banners_type" ON "public"."banners" USING "btree" ("type");



CREATE INDEX "idx_opinions_category" ON "public"."opinions" USING "btree" ("category");



CREATE OR REPLACE TRIGGER "update_articles_updated_at" BEFORE UPDATE ON "public"."articles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_banners_updated_at" BEFORE UPDATE ON "public"."banners" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ceo_reports_updated_at" BEFORE UPDATE ON "public"."ceo_reports" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_opinions_updated_at" BEFORE UPDATE ON "public"."opinions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE POLICY "Allow authenticated delete on articles" ON "public"."articles" FOR DELETE USING (true);



CREATE POLICY "Allow authenticated delete on banners" ON "public"."banners" FOR DELETE USING (true);



CREATE POLICY "Allow authenticated delete on ceo_reports" ON "public"."ceo_reports" FOR DELETE USING (true);



CREATE POLICY "Allow authenticated delete on opinions" ON "public"."opinions" FOR DELETE USING (true);



CREATE POLICY "Allow authenticated insert on articles" ON "public"."articles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on banners" ON "public"."banners" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on ceo_reports" ON "public"."ceo_reports" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on opinions" ON "public"."opinions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow authenticated update on articles" ON "public"."articles" FOR UPDATE USING (true);



CREATE POLICY "Allow authenticated update on banners" ON "public"."banners" FOR UPDATE USING (true);



CREATE POLICY "Allow authenticated update on ceo_reports" ON "public"."ceo_reports" FOR UPDATE USING (true);



CREATE POLICY "Allow authenticated update on opinions" ON "public"."opinions" FOR UPDATE USING (true);



CREATE POLICY "Allow public read access on articles" ON "public"."articles" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on banners" ON "public"."banners" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on ceo_reports" ON "public"."ceo_reports" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on opinions" ON "public"."opinions" FOR SELECT USING (true);



CREATE POLICY "Allow service role full access on articles" ON "public"."articles" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."articles" TO "anon";
GRANT ALL ON TABLE "public"."articles" TO "authenticated";
GRANT ALL ON TABLE "public"."articles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."articles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."articles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."articles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."banners" TO "anon";
GRANT ALL ON TABLE "public"."banners" TO "authenticated";
GRANT ALL ON TABLE "public"."banners" TO "service_role";



GRANT ALL ON SEQUENCE "public"."banners_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."banners_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."banners_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."ceo_reports" TO "anon";
GRANT ALL ON TABLE "public"."ceo_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."ceo_reports" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ceo_reports_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ceo_reports_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ceo_reports_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."opinions" TO "anon";
GRANT ALL ON TABLE "public"."opinions" TO "authenticated";
GRANT ALL ON TABLE "public"."opinions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."opinions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."opinions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."opinions_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































