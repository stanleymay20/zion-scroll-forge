-- CreateTable for Competitive Analysis System
-- Supporting requirements 1.1, 1.2, 1.3, 1.4 for platform comparison data storage

-- Competitive Analysis main table
CREATE TABLE "competitive_analyses" (
    "id" TEXT NOT NULL,
    "analysis_date" TIMESTAMP(3) NOT NULL,
    "scroll_university_data" TEXT NOT NULL,
    "learntube_ai_data" TEXT NOT NULL,
    "comparison_matrix" TEXT NOT NULL,
    "market_analysis" TEXT NOT NULL,
    "strategic_recommendations" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitive_analyses_pkey" PRIMARY KEY ("id")
);

-- Research Data table for storing collected competitive intelligence
CREATE TABLE "research_data" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "reliability" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "verification_status" TEXT NOT NULL DEFAULT 'pending',
    "spiritual_alignment" BOOLEAN,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_data_pkey" PRIMARY KEY ("id")
);

-- Platform Profiles table for storing detailed platform information
CREATE TABLE "platform_profiles" (
    "id" TEXT NOT NULL,
    "platform_name" TEXT NOT NULL,
    "architecture_data" TEXT NOT NULL,
    "features_data" TEXT NOT NULL,
    "market_data" TEXT NOT NULL,
    "strengths" TEXT NOT NULL DEFAULT '[]',
    "weaknesses" TEXT NOT NULL DEFAULT '[]',
    "last_analyzed" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_profiles_pkey" PRIMARY KEY ("id")
);

-- Feature Comparisons table for detailed feature-by-feature analysis
CREATE TABLE "feature_comparisons" (
    "id" TEXT NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "feature_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "scroll_university_availability" TEXT NOT NULL,
    "learntube_ai_availability" TEXT NOT NULL,
    "competitive_advantage" TEXT NOT NULL,
    "strategic_importance" TEXT NOT NULL,
    "spiritual_alignment" BOOLEAN NOT NULL DEFAULT false,
    "kingdom_purpose" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_comparisons_pkey" PRIMARY KEY ("id")
);

-- Strategic Recommendations table
CREATE TABLE "strategic_recommendations" (
    "id" TEXT NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "timeline" TEXT NOT NULL,
    "expected_impact" TEXT NOT NULL,
    "required_resources" TEXT NOT NULL DEFAULT '[]',
    "spiritual_considerations" TEXT NOT NULL DEFAULT '[]',
    "kingdom_alignment" BOOLEAN NOT NULL DEFAULT false,
    "success_metrics" TEXT NOT NULL DEFAULT '[]',
    "implementation_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strategic_recommendations_pkey" PRIMARY KEY ("id")
);

-- Market Opportunities table
CREATE TABLE "market_opportunities" (
    "id" TEXT NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "market_size" INTEGER NOT NULL,
    "timeline" TEXT NOT NULL,
    "required_capabilities" TEXT NOT NULL DEFAULT '[]',
    "spiritual_alignment" BOOLEAN NOT NULL DEFAULT false,
    "kingdom_impact" BOOLEAN NOT NULL DEFAULT false,
    "priority_score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_opportunities_pkey" PRIMARY KEY ("id")
);

-- Competitive Intelligence Sources table
CREATE TABLE "intelligence_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "reliability_score" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "last_accessed" TIMESTAMP(3),
    "access_frequency" TEXT NOT NULL DEFAULT 'weekly',
    "spiritual_filter_required" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intelligence_sources_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better query performance
CREATE INDEX "competitive_analyses_analysis_date_idx" ON "competitive_analyses"("analysis_date");
CREATE INDEX "competitive_analyses_version_idx" ON "competitive_analyses"("version");

CREATE INDEX "research_data_source_idx" ON "research_data"("source");
CREATE INDEX "research_data_platform_idx" ON "research_data"("platform");
CREATE INDEX "research_data_data_type_idx" ON "research_data"("data_type");
CREATE INDEX "research_data_verification_status_idx" ON "research_data"("verification_status");
CREATE INDEX "research_data_spiritual_alignment_idx" ON "research_data"("spiritual_alignment");

CREATE INDEX "platform_profiles_platform_name_idx" ON "platform_profiles"("platform_name");
CREATE INDEX "platform_profiles_last_analyzed_idx" ON "platform_profiles"("last_analyzed");

CREATE INDEX "feature_comparisons_analysis_id_idx" ON "feature_comparisons"("analysis_id");
CREATE INDEX "feature_comparisons_category_idx" ON "feature_comparisons"("category");
CREATE INDEX "feature_comparisons_spiritual_alignment_idx" ON "feature_comparisons"("spiritual_alignment");

CREATE INDEX "strategic_recommendations_analysis_id_idx" ON "strategic_recommendations"("analysis_id");
CREATE INDEX "strategic_recommendations_category_idx" ON "strategic_recommendations"("category");
CREATE INDEX "strategic_recommendations_priority_idx" ON "strategic_recommendations"("priority");
CREATE INDEX "strategic_recommendations_kingdom_alignment_idx" ON "strategic_recommendations"("kingdom_alignment");

CREATE INDEX "market_opportunities_analysis_id_idx" ON "market_opportunities"("analysis_id");
CREATE INDEX "market_opportunities_spiritual_alignment_idx" ON "market_opportunities"("spiritual_alignment");
CREATE INDEX "market_opportunities_kingdom_impact_idx" ON "market_opportunities"("kingdom_impact");

CREATE INDEX "intelligence_sources_type_idx" ON "intelligence_sources"("type");
CREATE INDEX "intelligence_sources_active_idx" ON "intelligence_sources"("active");
CREATE INDEX "intelligence_sources_spiritual_filter_idx" ON "intelligence_sources"("spiritual_filter_required");

-- Add foreign key constraints
ALTER TABLE "feature_comparisons" ADD CONSTRAINT "feature_comparisons_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "competitive_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "strategic_recommendations" ADD CONSTRAINT "strategic_recommendations_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "competitive_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "market_opportunities" ADD CONSTRAINT "market_opportunities_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "competitive_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;