import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [
      totalRepositories,
      totalStars,
      analyzedThisWeek,
      analyzedLastWeek,
      activeContributors,
      recentAnalyses,
      repositoryStats,
    ] = await Promise.all([
      db.repository.count({ where: { userId: session.user.id } }),
      db.repository.aggregate({
        where: { userId: session.user.id },
        _sum: { stars: true },
      }),
      db.analysis.count({
        where: {
          userId: session.user.id,
          status: 'COMPLETED',
          completedAt: { gte: sevenDaysAgo },
        },
      }),
      db.analysis.count({
        where: {
          userId: session.user.id,
          status: 'COMPLETED',
          completedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      }),
      db.commit.groupBy({
        by: ['authorEmail'],
        where: {
          repository: {
            userId: session.user.id,
          },
          authorDate: { gte: thirtyDaysAgo },
        },
      }),
      db.analysis.findMany({
        where: { userId: session.user.id, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 5,
        include: { repository: { select: { name: true } } },
      }),
      db.repository.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          name: true,
          lastAnalyzedAt: true,
          analyses: {
            select: {
              status: true,
              progress: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              analyses: true,
            },
          },
        },
      }),
    ]);

    const weeklyChangePercent =
      analyzedLastWeek > 0
        ? ((analyzedThisWeek - analyzedLastWeek) / analyzedLastWeek) * 100
        : analyzedThisWeek > 0
        ? 100
        : 0;

    const formattedRepoStats = repositoryStats.map((repo) => {
      const latestAnalysis = repo.analyses[0];
      return {
        id: repo.id,
        name: repo.name,
        lastAnalyzedAt: repo.lastAnalyzedAt,
        totalAnalyses: repo._count.analyses,
        isAnalyzed: !!repo.lastAnalyzedAt,
        analysisStatus: latestAnalysis?.status || null,
        analysisProgress: latestAnalysis?.progress || null,
      };
    });

    const formattedRecentAnalyses = recentAnalyses.map((analysis) => ({
      id: analysis.id,
      repositoryName: analysis.repository.name,
      completedAt: analysis.completedAt,
      summariesGenerated: analysis.summariesGenerated,
    }));

    return NextResponse.json({
      totalRepositories,
      totalStars: totalStars._sum.stars || 0,
      analyzedThisWeek,
      weeklyChangePercent: Math.round(weeklyChangePercent),
      activeContributors: activeContributors.length,
      recentAnalyses: formattedRecentAnalyses,
      repositoryStats: formattedRepoStats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}