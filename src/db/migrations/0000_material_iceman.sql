CREATE TYPE "public"."company_status" AS ENUM('operating', 'acquired', 'dead', 'pivoted', 'merged');--> statement-breakpoint
CREATE TYPE "public"."evidence_label" AS ENUM('known', 'estimated', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."evidence_weight" AS ENUM('strong_validator', 'weak_validator', 'disconfirming', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."maturity_status" AS ENUM('draft', 'proposed', 'established');--> statement-breakpoint
CREATE TYPE "public"."profitability_signal" AS ENUM('known_profitable', 'known_unprofitable', 'estimated_profitable_proxy', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."relationship_confidence" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."signal_confidence" AS ENUM('high', 'low');--> statement-breakpoint
CREATE TYPE "public"."timeline_event_type" AS ENUM('founding', 'product_launch', 'market_entry', 'acquisition', 'pivot', 'shutdown', 'capability_acquisition', 'funding');--> statement-breakpoint
CREATE TABLE "boundary_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" text NOT NULL,
	"option_a" text NOT NULL,
	"option_b" text NOT NULL,
	"chosen" text NOT NULL,
	"reason" text NOT NULL,
	"resolved_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"founded" integer,
	"country" text,
	"status" "company_status" DEFAULT 'operating' NOT NULL,
	"stage" text,
	"funding_history" text,
	"revenue_signal" text,
	"profitability_signal" "profitability_signal" DEFAULT 'unknown' NOT NULL,
	"profitability_proxy_applied" boolean DEFAULT false,
	"evidence_weight" "evidence_weight" DEFAULT 'unknown' NOT NULL,
	"signal_confidence" "signal_confidence" DEFAULT 'low' NOT NULL,
	"notable_facts" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_implementation_patterns" (
	"company_id" uuid NOT NULL,
	"implementation_pattern_id" uuid NOT NULL,
	"confidence" "relationship_confidence" DEFAULT 'high' NOT NULL,
	"source" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_implementation_patterns_company_id_implementation_pattern_id_pk" PRIMARY KEY("company_id","implementation_pattern_id")
);
--> statement-breakpoint
CREATE TABLE "company_problems" (
	"company_id" uuid NOT NULL,
	"problem_id" uuid NOT NULL,
	"confidence" "relationship_confidence" DEFAULT 'high' NOT NULL,
	"source" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_problems_company_id_problem_id_pk" PRIMARY KEY("company_id","problem_id")
);
--> statement-breakpoint
CREATE TABLE "company_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"event_type" timeline_event_type NOT NULL,
	"description" text NOT NULL,
	"implementation_pattern_id" uuid,
	"problem_id" uuid,
	"capability_deployed" text,
	"capability_acquired" text,
	"source" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "implementation_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"solution_pattern_id" uuid,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"first_observed" integer,
	"status" text,
	"business_model" text,
	"pricing_signal" text,
	"mechanism" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "implementation_patterns_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"statement" text NOT NULL,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"lifecycle" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "problems_statement_unique" UNIQUE("statement")
);
--> statement-breakpoint
CREATE TABLE "solution_pattern_problems" (
	"solution_pattern_id" uuid NOT NULL,
	"problem_id" uuid NOT NULL,
	"confidence" "relationship_confidence" DEFAULT 'high' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "solution_pattern_problems_solution_pattern_id_problem_id_pk" PRIMARY KEY("solution_pattern_id","problem_id")
);
--> statement-breakpoint
CREATE TABLE "solution_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"first_observed" integer,
	"pattern_durability" text,
	"winning_condition" text,
	"failure_condition" text,
	"winning_condition_maturity" "maturity_status",
	"winning_condition_valid_from" integer,
	"winning_condition_valid_through" integer,
	"winning_condition_superseded_by" uuid,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "solution_patterns_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "company_implementation_patterns" ADD CONSTRAINT "company_implementation_patterns_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_implementation_patterns" ADD CONSTRAINT "company_implementation_patterns_implementation_pattern_id_implementation_patterns_id_fk" FOREIGN KEY ("implementation_pattern_id") REFERENCES "public"."implementation_patterns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_problems" ADD CONSTRAINT "company_problems_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_problems" ADD CONSTRAINT "company_problems_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_timeline" ADD CONSTRAINT "company_timeline_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "implementation_patterns" ADD CONSTRAINT "implementation_patterns_solution_pattern_id_solution_patterns_id_fk" FOREIGN KEY ("solution_pattern_id") REFERENCES "public"."solution_patterns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_pattern_problems" ADD CONSTRAINT "solution_pattern_problems_solution_pattern_id_solution_patterns_id_fk" FOREIGN KEY ("solution_pattern_id") REFERENCES "public"."solution_patterns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_pattern_problems" ADD CONSTRAINT "solution_pattern_problems_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bc_company_name_idx" ON "boundary_cases" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "companies_name_idx" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE INDEX "companies_status_idx" ON "companies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "companies_founded_idx" ON "companies" USING btree ("founded");--> statement-breakpoint
CREATE INDEX "cip_company_idx" ON "company_implementation_patterns" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "cip_pattern_idx" ON "company_implementation_patterns" USING btree ("implementation_pattern_id");--> statement-breakpoint
CREATE INDEX "cp_company_idx" ON "company_problems" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "cp_problem_idx" ON "company_problems" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "timeline_company_id_idx" ON "company_timeline" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "timeline_year_idx" ON "company_timeline" USING btree ("year");--> statement-breakpoint
CREATE INDEX "timeline_company_year_idx" ON "company_timeline" USING btree ("company_id","year");--> statement-breakpoint
CREATE INDEX "implementation_patterns_name_idx" ON "implementation_patterns" USING btree ("name");--> statement-breakpoint
CREATE INDEX "impl_patterns_solution_pattern_idx" ON "implementation_patterns" USING btree ("solution_pattern_id");--> statement-breakpoint
CREATE INDEX "problems_statement_idx" ON "problems" USING btree ("statement");--> statement-breakpoint
CREATE INDEX "spp_pattern_idx" ON "solution_pattern_problems" USING btree ("solution_pattern_id");--> statement-breakpoint
CREATE INDEX "spp_problem_idx" ON "solution_pattern_problems" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "solution_patterns_name_idx" ON "solution_patterns" USING btree ("name");