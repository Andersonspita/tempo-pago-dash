import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock,
  Filter,
  Calendar,
  DollarSign
} from "lucide-react";
import { useTimesheet } from "@/hooks/useTimesheet";
import { TimeEntry } from "@/types/timesheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeEntryListProps {
  onBack: () => void;
  onEdit: (entry: TimeEntry) => void;
}

export const TimeEntryList = ({ onBack, onEdit }: TimeEntryListProps) => {
  const { entries, deleteEntry, togglePaidStatus, calculateHours } = useTimesheet();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [sortBy, setSortBy] = useState<"date" | "hours" | "earnings">("date");

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filter and sort entries
  const filteredEntries = entries
    .filter(entry => {
      const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.date.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "paid" && entry.isPaid) ||
                           (statusFilter === "unpaid" && !entry.isPaid);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "hours":
          const hoursA = calculateHours(a.startTime, a.endTime);
          const hoursB = calculateHours(b.startTime, b.endTime);
          return hoursB - hoursA;
        case "earnings":
          const earningsA = calculateHours(a.startTime, a.endTime) * (a.hourlyRate || 0);
          const earningsB = calculateHours(b.startTime, b.endTime) * (b.hourlyRate || 0);
          return earningsB - earningsA;
        default:
          return 0;
      }
    });

  const totalStats = filteredEntries.reduce((acc, entry) => {
    const hours = calculateHours(entry.startTime, entry.endTime);
    const earnings = hours * (entry.hourlyRate || 0);
    return {
      totalHours: acc.totalHours + hours,
      totalEarnings: acc.totalEarnings + earnings,
      paidEarnings: acc.paidEarnings + (entry.isPaid ? earnings : 0),
      unpaidEarnings: acc.unpaidEarnings + (!entry.isPaid ? earnings : 0),
    };
  }, { totalHours: 0, totalEarnings: 0, paidEarnings: 0, unpaidEarnings: 0 });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="self-start">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Registros de Horas</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {filteredEntries.length} {filteredEntries.length === 1 ? 'registro' : 'registros'} encontrados
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por descrição ou data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status de Pagamento</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="paid">Pagos</SelectItem>
                    <SelectItem value="unpaid">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ordenar por</label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="hours">Horas Trabalhadas</SelectItem>
                    <SelectItem value="earnings">Valor Ganho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Horas</p>
                  <p className="font-bold">{formatHours(totalStats.totalHours)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Ganho</p>
                  <p className="font-bold">{formatCurrency(totalStats.totalEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Valores Pagos</p>
                  <p className="font-bold text-success">{formatCurrency(totalStats.paidEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="font-bold text-warning">{formatCurrency(totalStats.unpaidEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum registro encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "Tente ajustar os filtros de busca" 
                    : "Adicione seu primeiro registro de horas para começar"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEntries.map((entry) => {
              const hours = calculateHours(entry.startTime, entry.endTime);
              const earnings = hours * (entry.hourlyRate || 0);

              return (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium text-base sm:text-lg">{formatDate(entry.date)}</h3>
                              <p className="text-sm text-muted-foreground">
                                {entry.startTime} - {entry.endTime} • {formatHours(hours)}
                              </p>
                            </div>
                            <Badge 
                              variant={entry.isPaid ? "default" : "secondary"}
                              className={entry.isPaid ? "bg-success text-success-foreground" : ""}
                            >
                              {entry.isPaid ? 'Pago' : 'Pendente'}
                            </Badge>
                          </div>

                          <p className="text-foreground text-sm sm:text-base">{entry.description}</p>

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{formatCurrency(entry.hourlyRate || 0)}/hora</span>
                            </div>
                            <div className="font-medium text-primary">
                              Total: {formatCurrency(earnings)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t sm:border-t-0 sm:pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePaidStatus(entry.id)}
                          className="flex-1 sm:flex-none"
                        >
                          <CheckCircle className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">
                            {entry.isPaid ? 'Marcar Pendente' : 'Marcar Pago'}
                          </span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(entry)}
                          className="flex-1 sm:flex-none"
                        >
                          <Edit className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                              <Trash2 className="w-4 h-4 sm:mr-2" />
                              <span className="hidden sm:inline">Excluir</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir registro</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteEntry(entry.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};