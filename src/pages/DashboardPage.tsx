import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const areaData = [
  { month: 'Jan', value: 4000 },
  { month: 'Feb', value: 3000 },
  { month: 'Mar', value: 5000 },
  { month: 'Apr', value: 4500 },
  { month: 'May', value: 6000 },
  { month: 'Jun', value: 5500 },
  { month: 'Jul', value: 7000 },
]

const barData = [
  { name: 'Mon', revenue: 2400 },
  { name: 'Tue', revenue: 1398 },
  { name: 'Wed', revenue: 9800 },
  { name: 'Thu', revenue: 3908 },
  { name: 'Fri', revenue: 4800 },
  { name: 'Sat', revenue: 3800 },
  { name: 'Sun', revenue: 4300 },
]

const pieData = [
  { name: 'Category A', value: 400 },
  { name: 'Category B', value: 300 },
  { name: 'Category C', value: 200 },
  { name: 'Category D', value: 100 },
]

const PIE_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7']

const statCards = [
  { label: 'Total Users', value: '12,345', change: '+12%', icon: '👥', positive: true },
  { label: 'Revenue', value: '$45,678', change: '+8.2%', icon: '💰', positive: true },
  { label: 'Active Sessions', value: '1,234', change: '-3.1%', icon: '📊', positive: false },
  { label: 'Conversion Rate', value: '3.24%', change: '+0.5%', icon: '🎯', positive: true },
]

export default function DashboardPage() {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-sidebar-background lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-lg">
            🚀
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground">Project Magang</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {[
            { icon: '📊', label: 'Dashboard', active: true },
            { icon: '📈', label: 'Analytics', active: false },
            { icon: '👥', label: 'Users', active: false },
            { icon: '⚙️', label: 'Settings', active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                item.active
                  ? 'bg-sidebar-primary/20 text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            🚪 Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Welcome back! Here's what's happening.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="lg:hidden">
            Sign Out
          </Button>
        </header>

        <div className="p-6 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                  <p className={`mt-1 text-xs font-medium ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Area Chart */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar + Pie */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Weekly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8' }}
                      itemStyle={{ color: '#6366f1' }}
                    />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
