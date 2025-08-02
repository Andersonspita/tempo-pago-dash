import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Calendar, TrendingUp, Download, Settings } from "lucide-react";
import { useTimesheet } from "@/hooks/useTimesheet";

interface DashboardProps {
  onAddEntry: () => void;
  onViewEntries: () => void;
  onSettings: () => void;
}

export const Dashboard = ({ onAddEntry, onViewEntries, onSettings }: DashboardProps) => {
  const { getStats, exportToCSV, getDailySummaries } = useTimesheet();
  const stats = getStats();
  const recentSummaries = getDailySummaries().slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Horas</h1>
            <p className="text-muted-foreground">Gerencie suas tarefas e pagamentos</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={onSettings} variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={onAddEntry}>
              Novo Registro
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatHours(stats.totalHours)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.daysWorked} dias trabalhados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
              <p className="text-xs text-muted-foreground">
                Média: {formatCurrency(stats.averageHoursPerDay * 50)}/dia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valores Pagos</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(stats.paidEarnings)}</div>
              <p className="text-xs text-muted-foreground">
                {formatHours(stats.paidHours)} pagas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valores Pendentes</CardTitle>
              <Calendar className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{formatCurrency(stats.unpaidEarnings)}</div>
              <p className="text-xs text-muted-foreground">
                {formatHours(stats.unpaidHours)} pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Últimos 5 dias trabalhados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSummaries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum registro encontrado
                  </p>
                ) : (
                  recentSummaries.map((summary) => (
                    <div key={summary.date} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {new Date(summary.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {summary.entriesCount} {summary.entriesCount === 1 ? 'tarefa' : 'tarefas'}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">{formatHours(summary.totalHours)}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs">{formatCurrency(summary.totalEarnings)}</p>
                          <Badge 
                            variant={summary.isPaid ? "default" : "secondary"}
                            className={summary.isPaid ? "bg-success text-success-foreground" : ""}
                          >
                            {summary.isPaid ? 'Pago' : 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {recentSummaries.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={onViewEntries}
                >
                  Ver Todos os Registros
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Mensal</CardTitle>
              <CardDescription>
                Estatísticas do período atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Horas médias/dia:</span>
                  <span className="text-sm font-medium">{formatHours(stats.averageHoursPerDay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de pagamento:</span>
                  <span className="text-sm font-medium">
                    {stats.totalEarnings > 0 
                      ? Math.round((stats.paidEarnings / stats.totalEarnings) * 100)
                      : 0
                    }%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total de dias:</span>
                  <span className="text-sm font-medium">{stats.daysWorked}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Eficiência:</span>
                    <Badge variant="outline">
                      {stats.daysWorked > 0 && stats.averageHoursPerDay >= 6 ? 'Alta' : 
                       stats.daysWorked > 0 && stats.averageHoursPerDay >= 4 ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};