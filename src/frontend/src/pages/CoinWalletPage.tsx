import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@tanstack/react-router';
import { Coins, TrendingUp, Video, Star, Calendar, Award } from 'lucide-react';
import { format } from 'date-fns';

// Mock data - will be replaced with actual backend calls once implemented
const mockCoinBalance = 2450n;
const mockLevel = {
  level: 5,
  currentCoins: 2450n,
  coinsForNextLevel: 3000n,
  progress: 81.67
};

const mockCoinHistory = [
  {
    id: '1',
    amount: 100n,
    source: 'review' as const,
    timestamp: BigInt(Date.now() * 1000000),
    details: 'Submitted 5-star review for Advanced Calculus'
  },
  {
    id: '2',
    amount: 20n,
    source: 'video_watch' as const,
    timestamp: BigInt((Date.now() - 3600000) * 1000000),
    details: 'Watched 10 minutes of Linear Algebra lecture'
  },
  {
    id: '3',
    amount: 50n,
    source: 'daily_login' as const,
    timestamp: BigInt((Date.now() - 86400000) * 1000000),
    details: 'Daily login reward'
  },
  {
    id: '4',
    amount: 16n,
    source: 'video_watch' as const,
    timestamp: BigInt((Date.now() - 172800000) * 1000000),
    details: 'Watched 8 minutes of Trigonometry lecture'
  }
];

export default function CoinWalletPage() {
  const { identity } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Please login to view your RDMcoin wallet</p>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'daily_login':
        return <Calendar className="h-4 w-4" />;
      case 'video_watch':
        return <Video className="h-4 w-4" />;
      case 'review':
        return <Star className="h-4 w-4" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'daily_login':
        return 'Daily Login';
      case 'video_watch':
        return 'Video Watch';
      case 'review':
        return '5-Star Review';
      case 'admin_adjustment':
        return 'Admin Adjustment';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <img src="/assets/generated/wallet-icon-transparent.png" alt="Wallet" className="h-10 w-10" />
          My RDMcoins
        </h1>
        <p className="text-muted-foreground">Track your earnings and level progress</p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-chart-1/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src="/assets/generated/rdmcoin-icon-transparent.png" alt="RDMcoin" className="h-6 w-6" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-primary mb-2">{Number(mockCoinBalance).toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">RDMcoins</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-3/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <img src="/assets/generated/level-badge-transparent.png" alt="Level" className="h-6 w-6" />
              Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">Level {mockLevel.level}</div>
                <p className="text-sm text-muted-foreground">
                  {Number(mockLevel.coinsForNextLevel - mockLevel.currentCoins).toLocaleString()} coins to next level
                </p>
              </div>
              <Award className="h-12 w-12 text-chart-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{mockLevel.progress.toFixed(1)}%</span>
              </div>
              <Progress value={mockLevel.progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earning Methods */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How to Earn RDMcoins</CardTitle>
          <CardDescription>Multiple ways to earn rewards while learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Calendar className="h-8 w-8 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Daily Login</h3>
                <p className="text-sm text-muted-foreground">Earn 50 coins every day you log in</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Video className="h-8 w-8 text-chart-1 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Watch Videos</h3>
                <p className="text-sm text-muted-foreground">Earn 2 coins per minute of watch time</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Star className="h-8 w-8 text-chart-2 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">5-Star Reviews</h3>
                <p className="text-sm text-muted-foreground">Earn 100 coins for each 5-star review</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
          <CardDescription>Your coin earning history</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="video">Video Watch</TabsTrigger>
              <TabsTrigger value="review">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {mockCoinHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No transactions yet</div>
              ) : (
                mockCoinHistory.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">{getSourceIcon(transaction.source)}</div>
                      <div>
                        <p className="font-medium">{getSourceLabel(transaction.source)}</p>
                        <p className="text-sm text-muted-foreground">{transaction.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(Number(transaction.timestamp) / 1000000), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">+{Number(transaction.amount)}</div>
                      <div className="text-xs text-muted-foreground">coins</div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="login" className="space-y-3">
              {mockCoinHistory
                .filter((t) => t.source === 'daily_login')
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">{getSourceIcon(transaction.source)}</div>
                      <div>
                        <p className="font-medium">{getSourceLabel(transaction.source)}</p>
                        <p className="text-sm text-muted-foreground">{transaction.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(Number(transaction.timestamp) / 1000000), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">+{Number(transaction.amount)}</div>
                      <div className="text-xs text-muted-foreground">coins</div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="video" className="space-y-3">
              {mockCoinHistory
                .filter((t) => t.source === 'video_watch')
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">{getSourceIcon(transaction.source)}</div>
                      <div>
                        <p className="font-medium">{getSourceLabel(transaction.source)}</p>
                        <p className="text-sm text-muted-foreground">{transaction.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(Number(transaction.timestamp) / 1000000), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">+{Number(transaction.amount)}</div>
                      <div className="text-xs text-muted-foreground">coins</div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="review" className="space-y-3">
              {mockCoinHistory
                .filter((t) => t.source === 'review')
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">{getSourceIcon(transaction.source)}</div>
                      <div>
                        <p className="font-medium">{getSourceLabel(transaction.source)}</p>
                        <p className="text-sm text-muted-foreground">{transaction.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(Number(transaction.timestamp) / 1000000), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">+{Number(transaction.amount)}</div>
                      <div className="text-xs text-muted-foreground">coins</div>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
