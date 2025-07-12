CREATE TABLE "visitor_counter" (
	"id" serial PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1012 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
