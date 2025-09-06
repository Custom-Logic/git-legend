import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [userRepositories, analysesThisWeek, analysesLastWeek, recentAnalyses, activeContributors] = await Promise.all([
      db.repository.findMany({
        where: { userId },
        include: {
          _count: {
            select: { analyses: true },
          },
          analyses: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      }),
      db.analysis.count({
        where: {
          userId,
          status: "COMPLETED",
          completedAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      }),
      db.analysis.count({
        where: {
          userId,
          status: "COMPLETED",
          completedAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 14)),
            lt: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
        },
      }),
      db.analysis.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        take: 5,
        include: {
          repository: {
            select: { name: true },
          },
        },
      }),
      db.commit.count({
        where: {
          repository: { userId },
          authorDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
        select: { authorEmail: true },
      }),
    ]);

    const totalRepositories = userRepositories.length;
    const totalStars = userRepositories.reduce((sum, repo) => sum + (repo.stars || 0), 0);

    let weeklyChangePercent = 0;
    if (analysesLastWeek > 0) {
      weeklyChangePercent = ((analysesThisWeek - analysesLastWeek) / analysesLastWeek) * 100;
    } else if (analysesThisWeek > 0) {
      weeklyChangePercent = 100;
    }

    const repositoryStats = userRepositories.map((repo) => {
      const latestAnalysis = repo.analyses[0];
      const isAnalyzing = latestAnalysis && latestAnalysis.status === 'PROCESSING';

      return {
        id: repo.id,
        name: repo.name,
        lastAnalyzedAt: repo.lastAnalyzedAt?.toISOString() || null,
        totalAnalyses: repo._count.analyses,
        isAnalyzed: !!repo.lastAnalyzedAt,
        analysisStatus: latestAnalysis?.status || null,
        analysisProgress: isAnalyzing ? latestAnalysis.progress : null,
      };
    });

    const formattedRecentAnalyses = recentAnalyses.map((analysis) => ({
      id: analysis.id,
      repositoryName: analysis.repository.name,
      completedAt: analysis.completedAt!.toISOString(),
      summariesGenerated: analysis.summariesGenerated || 0,
    }));

    const distinctAuthors = new Set(activeContributors.map(c => c.authorEmail)).size;

    return NextResponse.json({
      totalRepositories,
      totalStars,
      analyzedThisWeek: analysesThisWeek,
      weeklyChangePercent: parseFloat(weeklyChangePercent.toFixed(1)),
      activeContributors: distinctAuthors,
      recentAnalyses: formattedRecentAnalyses,
      repositoryStats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          error: "Database error",
          code: error.code,
          meta: error.meta,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
