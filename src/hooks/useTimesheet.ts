import { useState, useEffect } from 'react';
import { TimeEntry, DailySummary, TimesheetStats } from '@/types/timesheet';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'timesheet_entries';
const SETTINGS_KEY = 'timesheet_settings';

interface TimesheetSettings {
  defaultHourlyRate: number;
}

export const useTimesheet = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [settings, setSettings] = useState<TimesheetSettings>({ defaultHourlyRate: 50 });
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(STORAGE_KEY);
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
      
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados salvos.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Save entries to localStorage
  const saveEntries = (newEntries: TimeEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (error) {
      console.error('Error saving entries:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  // Save settings to localStorage
  const saveSettings = (newSettings: TimesheetSettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  // Calculate hours worked
  const calculateHours = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end < start) {
      // Handle overnight work
      end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end.getTime() - start.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  };

  // Add new entry
  const addEntry = (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: crypto.randomUUID(),
      hourlyRate: entry.hourlyRate || settings.defaultHourlyRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newEntries = [...entries, newEntry];
    saveEntries(newEntries);
    
    toast({
      title: "Registro adicionado",
      description: "Novo registro de horas foi adicionado com sucesso.",
    });
  };

  // Update entry
  const updateEntry = (id: string, updates: Partial<TimeEntry>) => {
    const newEntries = entries.map(entry =>
      entry.id === id
        ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
        : entry
    );
    
    saveEntries(newEntries);
    
    toast({
      title: "Registro atualizado",
      description: "O registro foi atualizado com sucesso.",
    });
  };

  // Delete entry
  const deleteEntry = (id: string) => {
    const newEntries = entries.filter(entry => entry.id !== id);
    saveEntries(newEntries);
    
    toast({
      title: "Registro excluído",
      description: "O registro foi excluído com sucesso.",
    });
  };

  // Toggle paid status
  const togglePaidStatus = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      updateEntry(id, { isPaid: !entry.isPaid });
    }
  };

  // Get daily summaries
  const getDailySummaries = (): DailySummary[] => {
    const summaries = new Map<string, DailySummary>();

    entries.forEach(entry => {
      const hours = calculateHours(entry.startTime, entry.endTime);
      const earnings = hours * (entry.hourlyRate || 0);

      if (summaries.has(entry.date)) {
        const existing = summaries.get(entry.date)!;
        existing.totalHours += hours;
        existing.totalEarnings += earnings;
        existing.entriesCount += 1;
        existing.isPaid = existing.isPaid && entry.isPaid;
      } else {
        summaries.set(entry.date, {
          date: entry.date,
          totalHours: hours,
          totalEarnings: earnings,
          entriesCount: 1,
          isPaid: entry.isPaid,
        });
      }
    });

    return Array.from(summaries.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  // Get statistics
  const getStats = (): TimesheetStats => {
    let totalHours = 0;
    let totalEarnings = 0;
    let paidHours = 0;
    let unpaidHours = 0;
    let paidEarnings = 0;
    let unpaidEarnings = 0;

    entries.forEach(entry => {
      const hours = calculateHours(entry.startTime, entry.endTime);
      const earnings = hours * (entry.hourlyRate || 0);

      totalHours += hours;
      totalEarnings += earnings;

      if (entry.isPaid) {
        paidHours += hours;
        paidEarnings += earnings;
      } else {
        unpaidHours += hours;
        unpaidEarnings += earnings;
      }
    });

    const uniqueDates = new Set(entries.map(e => e.date));
    const daysWorked = uniqueDates.size;
    const averageHoursPerDay = daysWorked > 0 ? totalHours / daysWorked : 0;

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      paidHours: Math.round(paidHours * 100) / 100,
      unpaidHours: Math.round(unpaidHours * 100) / 100,
      paidEarnings: Math.round(paidEarnings * 100) / 100,
      unpaidEarnings: Math.round(unpaidEarnings * 100) / 100,
      averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
      daysWorked,
    };
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Data',
      'Hora Inicial',
      'Hora Final',
      'Horas Trabalhadas',
      'Descrição',
      'Valor/Hora',
      'Total Ganho',
      'Status Pagamento'
    ];

    const csvData = entries.map(entry => {
      const hours = calculateHours(entry.startTime, entry.endTime);
      const earnings = hours * (entry.hourlyRate || 0);
      
      return [
        new Date(entry.date).toLocaleDateString('pt-BR'),
        entry.startTime,
        entry.endTime,
        hours.toString().replace('.', ','),
        `"${entry.description}"`,
        `R$ ${(entry.hourlyRate || 0).toFixed(2).replace('.', ',')}`,
        `R$ ${earnings.toFixed(2).replace('.', ',')}`,
        entry.isPaid ? 'Pago' : 'Pendente'
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.join(';'))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `controle-horas-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Planilha exportada",
      description: "Os dados foram exportados com sucesso para CSV.",
    });
  };

  return {
    entries,
    settings,
    addEntry,
    updateEntry,
    deleteEntry,
    togglePaidStatus,
    getDailySummaries,
    getStats,
    exportToCSV,
    saveSettings,
    calculateHours,
  };
};