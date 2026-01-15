import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

// Mock data - will be replaced with actual backend calls once implemented
const mockLeaderboard = [
  {
    user: 'user1',
    userName: 'Sarah Johnson',
    coins: 15420n,
    level: 12,
    rank: 1
  },
  {
    user: 'user2',
    userName: 'Michael Chen',
    coins: 14850n,
    level: 11,
    rank: 2
  },
  {
    user: 'user3',
    userName: 'Emma Williams',
    coins: 13990n,
    level: 11,
    rank: 3
  },
  {
    user: 'user4',
    userName: 'James Brown',
    coins: 12340n,
    level: 10,
    rank: 4
  },
  {
    user: 'user5',
    userName: 'Olivia Davis',
    coins: 11890n,
    level: 10,
    rank: 5
  },
  {
    user: 'user6',
    userName: 'William Martinez',
    coins: 10560n,
    level: 9,
    rank: 6
  },
  {
    user: 'user7',
    userName: 'Sophia Garcia',
    coins: 9870n,
    level: 9,
    rank: 7
  },
  {
    user: 'user8',
    userName: 'Benjamin Rodriguez',
    coins: 9120n,
    level: 8,
    rank: 8
  },
  {
    user: 'user9',
    userName: 'Isabella Wilson',
    coins: 8650n,
    level: 8,
    rank: 9
  },
  {
    user: 'user10',
    userName: 'Lucas Anderson',
    coins: 8230n,
    level: 8,
    rank: 10
  },
  {
    user: 'user11',
    userName: 'Mia Thomas',
    coins: 7890n,
    level: 7,
    rank: 11
  },
  {
    user: 'user12',
    userName: 'Alexander Taylor',
    coins: 7450n,
    level: 7,
    rank: 12
  },
  {
    user: 'user13',
    userName: 'Charlotte Moore',
    coins: 7120n,
    level: 7,
    rank: 13
  },
  {
    user: 'user14',
    userName: 'Daniel Jackson',
    coins: 6780n,
    level: 6,
    rank: 14
  },
  {
    user: 'user15',
    userName: 'Amelia Martin',
    coins: 6450n,
    level: 6,
    rank: 15
  },
  {
    user: 'user16',
    userName: 'Henry Lee',
    coins: 6120n,
    level: 6,
    rank: 16
  },
  {
    user: 'user17',
    userName: 'Evelyn Perez',
    coins: 5890n,
    level: 5,
    rank: 17
  },
  {
    user: 'user18',
    userName: 'Sebastian White',
    coins: 5560n,
    level: 5,
    rank: 18
  },
  {
    user: 'user19',
    userName: 'Harper Harris',
    coins: 5230n,
    level: 5,
    rank: 19
  },
  {
    user: 'user20',
    userName: 'Jack Clark',
    coins: 4980n,
    level: 5,
    rank: 20
  }
];

export default function LeaderboardPage() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Award className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getRankBadgeVariant = (rank: number): 'default' | 'secondary' | 'outline' => {
    if (rank <= 3) return 'default';
    if (rank <= 10) return 'secondary';
    return 'outline';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <img src="/assets/generated/leaderboard-trophy-transparent.png" alt="Leaderboard" className="h-10 w-10" />
          Global Leaderboard
        </h1>
        <p className="text-muted-foreground">Top 20 learners ranked by RDMcoins earned</p>
        <p className="text-sm text-muted-foreground mt-2">
          <TrendingUp className="h-4 w-4 inline mr-1" />
          Updated weekly • Top performers receive rank level upgrades
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {mockLeaderboard.slice(0, 3).map((entry, index) => (
          <Card
            key={entry.user}
            className={`${
              index === 0
                ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/50'
                : index === 1
                  ? 'bg-gradient-to-br from-gray-400/10 to-gray-500/10 border-gray-400/50'
                  : 'bg-gradient-to-br from-amber-600/10 to-amber-700/10 border-amber-600/50'
            }`}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">{getRankIcon(entry.rank)}</div>
              <CardTitle className="text-2xl">#{entry.rank}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarFallback className="text-2xl">{getInitials(entry.userName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{entry.userName}</p>
                <Badge variant={getRankBadgeVariant(entry.rank)} className="mt-2">
                  Level {entry.level}
                </Badge>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-center gap-2">
                  <img src="/assets/generated/rdmcoin-icon-transparent.png" alt="RDMcoin" className="h-5 w-5" />
                  <span className="text-2xl font-bold text-primary">{Number(entry.coins).toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total Coins</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Remaining Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Rankings 4-20</CardTitle>
          <CardDescription>Keep learning to climb the leaderboard!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockLeaderboard.slice(3).map((entry) => (
              <div
                key={entry.user}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted font-bold text-lg">
                    #{entry.rank}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{getInitials(entry.userName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{entry.userName}</p>
                    <Badge variant={getRankBadgeVariant(entry.rank)} className="mt-1">
                      Level {entry.level}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <img src="/assets/generated/rdmcoin-icon-transparent.png" alt="RDMcoin" className="h-5 w-5" />
                    <span className="text-xl font-bold text-primary">{Number(entry.coins).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">coins</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-8 bg-gradient-to-br from-primary/5 to-chart-1/5">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <TrendingUp className="h-8 w-8 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">How Rankings Work</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Rankings are updated automatically every week</li>
                <li>• Top 20 users receive rank level upgrades based on their position</li>
                <li>• Earn more coins by logging in daily, watching videos, and submitting 5-star reviews</li>
                <li>• Your rank is determined by your total coin balance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
