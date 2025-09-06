'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Github, Plus, Search, Calendar, Users, Code, TrendingUp, Play, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Repository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  lastAnalyzedAt?: string;
}

interface RepositoryStats {
  id: string;
  name: string;
  lastAnalyzedAt: string | null;
  totalAnalyses: number;
  isAnalyzed: boolean;
  analysisStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null;
  analysisProgress: number | null;
}

interface DashboardStats {
  totalRepositories: number;
  totalStars: number;
  analyzedThisWeek: number;
  weeklyChangePercent: number;
  activeContributors: number;
  recentAnalyses: Array<{
    id: string;
    repositoryName: string;
    completedAt: string;
    summariesGenerated: number;
  }>;
  repositoryStats: RepositoryStats[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzingRepo, setAnalyzingRepo] = useState<string | null>(null);

  const isAnalysisInProgress = useMemo(() => 
    stats?.repositoryStats.some(r => r.analysisStatus === 'PROCESSING')
  , [stats]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    if (isAnalysisInProgress) {
      const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAnalysisInProgress]);

  const fetchData = async () => {
    try {
      const [reposResponse, statsResponse] = await Promise.all([
        fetch('/api/repositories'),
        fetch('/api/dashboard/stats'),
      ]);

      if (reposResponse.ok) {
        const reposData = await reposResponse.json();
        setRepositories(reposData);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeRepository = async (repoId: string) => {
    setAnalyzingRepo(repoId);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryId: repoId }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        console.error('Analysis failed:', error);
      }
    } catch (error) {
      console.error('Error analyzing repository:', error);
    } finally {
      setAnalyzingRepo(null);
    }
  };

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">GitLegend</h1>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback>{session.user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{session.user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {session.user?.name?.split(' ')[0]}!</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your repositories and generate beautiful legends for your projects.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRepositories || 0}</div>
              <p className="text-xs text-muted-foreground">
                Connected to GitLegend
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analyzed This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.analyzedThisWeek || 0}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stats?.weeklyChangePercent !== undefined && (
                  <>
                    {stats.weeklyChangePercent >= 0 ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={stats.weeklyChangePercent >= 0 ? "text-green-600" : "text-red-600"}>
                      {Math.abs(stats.weeklyChangePercent)}%
                    </span>
                    from last week
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Github className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStars?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Across all repositories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeContributors || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {stats?.recentAnalyses && stats.recentAnalyses.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Recent Analysis Activity</CardTitle>
              <CardDescription>Latest repository analyses completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentAnalyses.slice(0, 3).map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{analysis.repositoryName}</p>
                        <p className="text-sm text-muted-foreground">
                          {analysis.summariesGenerated} summaries generated
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(analysis.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/add-repository">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Repository
              </Button>
            </Link>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Repository Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepositories?.map((repo) => {
            const repoStats = stats?.repositoryStats?.find((s) => s.id === repo.id);
            const isAnalyzed = repoStats?.isAnalyzed || repo.lastAnalyzedAt;
            const isProcessing = repoStats?.analysisStatus === 'PROCESSING';

            return (
              <Card key={repo.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{repo.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {repo.fullName}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {repo.language && (
                        <Badge variant="outline">{repo.language}</Badge>
                      )}
                      {repoStats && repoStats.totalAnalyses > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {repoStats.totalAnalyses} analyses
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {repo.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Github className="w-4 h-4" />
                        <span>{repo.stars.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Code className="w-4 h-4" />
                        <span>{repo.forks.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {isProcessing ? (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Analyzing...</span>
                        <span className="text-sm font-bold">{repoStats.analysisProgress || 0}%</span>
                      </div>
                      <Progress value={repoStats.analysisProgress || 0} className="w-full" />
                    </div>
                  ) : isAnalyzed ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Analyzed {new Date(repo.lastAnalyzedAt!).toLocaleDateString()}
                        </span>
                      </div>
                      <Link href={`/legend/${repo.id}`}>
                        <Button variant="outline" size="sm">View Legend</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-orange-600">
                        <Calendar className="w-4 h-4" />
                        <span>Not analyzed</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => analyzeRepository(repo.id)}
                        disabled={analyzingRepo === repo.id}
                      >
                        {analyzingRepo === repo.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                        ) : (
                          <><Play className="w-4 h-4 mr-2" />Analyze Now</>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredRepositories.length === 0 && (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No repositories found</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {searchQuery ? "No repositories match your search." : "Get started by adding your first repository."}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/add-repository">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Repository
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}