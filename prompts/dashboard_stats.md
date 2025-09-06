# Dashboard Stats
** Error When Callind Dashboard Stats **

PROBLEM ANALYSIS:
The db.commit.count() with select: { authorEmail: true } returns a count number, not an array of commit objects. The select clause in a count operation is invalid for Prisma's count method.

REQUIREMENTS:

Fix the query to properly count distinct authors/contributors

Maintain the existing functionality of counting unique authors who committed in the last 30 days

Ensure type safety throughout the fix

Keep the same response structure

Add appropriate error handling

EXPECTED BEHAVIOR:
The activeContributors should represent the count of distinct authors who made commits in the user's repositories in the last 30 days.

INVESTIGATION STEPS:

Analyze the current Prisma count query structure

Research the correct Prisma syntax for counting distinct values

Verify the fix maintains the same business logic

Test the solution to ensure it returns the correct count

IMPLEMENTATION CONSTRAINTS:

Use Prisma client with proper TypeScript types

Maintain the existing Promise.all structure if possible

Ensure backward compatibility with the frontend

Please provide the complete fixed code section with explanations.

## Original Message


2025-09-06T16:17:16.722Z [info] prisma:query SELECT COUNT(*) AS "_count._all" FROM (SELECT "public"."analyses"."id" FROM "public"."analyses" WHERE ("public"."analyses"."userId" = $1 AND "public"."analyses"."status" = CAST($2::text AS "public"."AnalysisStatus") AND "public"."analyses"."completedAt" >= $3 AND "public"."analyses"."completedAt" < $4) OFFSET $5) AS "sub"
2025-09-06T16:17:16.722Z [info] prisma:query SELECT COUNT(*) AS "_count._all" FROM (SELECT "public"."analyses"."id" FROM "public"."analyses" WHERE ("public"."analyses"."userId" = $1 AND "public"."analyses"."status" = CAST($2::text AS "public"."AnalysisStatus") AND "public"."analyses"."completedAt" >= $3) OFFSET $4) AS "sub"
2025-09-06T16:17:16.723Z [info] prisma:query SELECT "public"."repositories"."id", "public"."repositories"."githubId", "public"."repositories"."name", "public"."repositories"."fullName", "public"."repositories"."description", "public"."repositories"."language", "public"."repositories"."stars", "public"."repositories"."forks", "public"."repositories"."isPrivate", "public"."repositories"."lastAnalyzedAt", "public"."repositories"."createdAt", "public"."repositories"."updatedAt", "public"."repositories"."userId", COALESCE("aggr_selection_0_Analysis"."_aggr_count_analyses", 0) AS "_aggr_count_analyses" FROM "public"."repositories" LEFT JOIN (SELECT "public"."analyses"."repositoryId", COUNT(*) AS "_aggr_count_analyses" FROM "public"."analyses" WHERE 1=1 GROUP BY "public"."analyses"."repositoryId") AS "aggr_selection_0_Analysis" ON ("public"."repositories"."id" = "aggr_selection_0_Analysis"."repositoryId") WHERE "public"."repositories"."userId" = $1 OFFSET $2
2025-09-06T16:17:16.728Z [info] prisma:query SELECT COUNT("authorEmail") FROM (SELECT "public"."commits"."authorEmail" FROM "public"."commits" LEFT JOIN "public"."repositories" AS "j0" ON ("j0"."id") = ("public"."commits"."repositoryId") WHERE (("j0"."userId" = $1 AND ("j0"."id" IS NOT NULL)) AND "public"."commits"."authorDate" >= $2) OFFSET $3) AS "sub"
2025-09-06T16:17:16.729Z [info] prisma:query SELECT "public"."analyses"."id", "public"."analyses"."status"::text, "public"."analyses"."progress", "public"."analyses"."error", "public"."analyses"."completedAt", "public"."analyses"."createdAt", "public"."analyses"."updatedAt", "public"."analyses"."modelUsageStats", "public"."analyses"."summariesGenerated", "public"."analyses"."userId", "public"."analyses"."repositoryId" FROM "public"."analyses" WHERE "public"."analyses"."repositoryId" IN ($1,$2,$3,$4,$5,$6,$7,$8) ORDER BY "public"."analyses"."createdAt" DESC OFFSET $9
2025-09-06T16:17:16.730Z [info] prisma:query SELECT "public"."analyses"."id", "public"."analyses"."status"::text, "public"."analyses"."progress", "public"."analyses"."error", "public"."analyses"."completedAt", "public"."analyses"."createdAt", "public"."analyses"."updatedAt", "public"."analyses"."modelUsageStats", "public"."analyses"."summariesGenerated", "public"."analyses"."userId", "public"."analyses"."repositoryId" FROM "public"."analyses" WHERE ("public"."analyses"."userId" = $1 AND "public"."analyses"."status" = CAST($2::text AS "public"."AnalysisStatus")) ORDER BY "public"."analyses"."completedAt" DESC LIMIT $3 OFFSET $4
2025-09-06T16:17:16.730Z [error] Error fetching dashboard stats: TypeError: i.map is not a function
    at p (.next/server/app/api/dashboard/stats/route.js:1:4433)