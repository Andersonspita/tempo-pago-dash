import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, DollarSign, Download, Upload, Trash2 } from "lucide-react";
import { useTimesheet } from "@/hooks/useTimesheet";
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
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  onBack: () => void;
}

export const Settings = ({ onBack }: SettingsProps) => {
  const { settings, saveSettings, entries, exportToCSV } = useTimesheet();
  const { toast } = useToast();
  
  const [hourlyRate, setHourlyRate] = useState(settings.defaultHourlyRate);

  const handleSaveSettings = () => {
    if (hourlyRate <= 0) {
      toast({
        title: "Erro de validação",
        description: "O valor por hora deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    saveSettings({ defaultHourlyRate: hourlyRate });
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso.",
    });
  };

  const handleExportData = () => {
    try {
      const dataToExport = {
        entries,
        settings,
        exportDate: new Date().toISOString(),
        version: "1.0"
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
        type: 'application/json' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `backup-controle-horas-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Backup exportado",
        description: "O backup dos dados foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível criar o backup dos dados.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.entries && Array.isArray(data.entries)) {
          localStorage.setItem('timesheet_entries', JSON.stringify(data.entries));
        }
        
        if (data.settings) {
          localStorage.setItem('timesheet_settings', JSON.stringify(data.settings));
          setHourlyRate(data.settings.defaultHourlyRate || 50);
        }

        toast({
          title: "Dados importados",
          description: "Os dados foram importados com sucesso. Recarregue a página para ver as alterações.",
        });
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Não foi possível importar os dados. Verifique se o arquivo está correto.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleClearAllData = () => {
    localStorage.removeItem('timesheet_entries');
    localStorage.removeItem('timesheet_settings');
    
    toast({
      title: "Dados removidos",
      description: "Todos os dados foram removidos. Recarregue a página para ver as alterações.",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="self-start">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Configurações</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Gerencie as configurações do sistema</p>
          </div>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Configure os valores padrão para novos registros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Valor Padrão por Hora (R$)</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 50.00"
              />
              <p className="text-sm text-muted-foreground">
                Valor atual: {formatCurrency(hourlyRate)}
              </p>
            </div>

            <Button onClick={handleSaveSettings}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Dados</CardTitle>
            <CardDescription>
              Exporte, importe ou remova seus dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Exportar Dados</h4>
                <p className="text-sm text-muted-foreground">
                  Criar backup dos registros em CSV
                </p>
                <Button variant="outline" onClick={exportToCSV} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Backup Completo</h4>
                <p className="text-sm text-muted-foreground">
                  Salvar todos os dados em JSON
                </p>
                <Button variant="outline" onClick={handleExportData} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Criar Backup
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <h4 className="font-medium">Importar Backup</h4>
                <p className="text-sm text-muted-foreground">
                  Restaurar dados de um arquivo de backup
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    id="import-file"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('import-file')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            <CardDescription>
              Ações irreversíveis que afetam todos os dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Remover Todos os Dados</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta ação irá apagar permanentemente todos os registros de horas e configurações.
                  Esta ação não pode ser desfeita.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover Todos os Dados
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar remoção de dados</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover TODOS os dados? Esta ação irá:
                        <br />• Apagar todos os registros de horas
                        <br />• Remover todas as configurações
                        <br />• Esta ação NÃO PODE ser desfeita
                        <br /><br />
                        Recomendamos criar um backup antes de continuar.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAllData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Confirmar Remoção
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Total de Registros:</p>
                <p className="text-muted-foreground">{entries.length}</p>
              </div>
              <div>
                <p className="font-medium">Versão:</p>
                <p className="text-muted-foreground">1.0.0</p>
              </div>
              <div>
                <p className="font-medium">Armazenamento:</p>
                <p className="text-muted-foreground">Local (localStorage)</p>
              </div>
              <div>
                <p className="font-medium">Backup Automático:</p>
                <p className="text-muted-foreground">Não configurado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};