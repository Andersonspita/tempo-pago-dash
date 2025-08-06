import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Calculator } from "lucide-react";
import { useTimesheet } from "@/hooks/useTimesheet";
import { TimeEntry } from "@/types/timesheet";

interface TimeEntryFormProps {
  onBack: () => void;
  editEntry?: TimeEntry | null;
}

export const TimeEntryForm = ({ onBack, editEntry }: TimeEntryFormProps) => {
  const { addEntry, updateEntry, calculateHours, settings } = useTimesheet();
  
  const [formData, setFormData] = useState({
    date: editEntry?.date || new Date().toISOString().split('T')[0],
    startTime: editEntry?.startTime || '',
    endTime: editEntry?.endTime || '',
    description: editEntry?.description || '',
    hourlyRate: editEntry?.hourlyRate || settings.defaultHourlyRate,
    isPaid: editEntry?.isPaid || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Hora inicial é obrigatória';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Hora final é obrigatória';
    }

    if (formData.startTime && formData.endTime) {
      const hours = calculateHours(formData.startTime, formData.endTime);
      if (hours <= 0) {
        newErrors.endTime = 'Hora final deve ser posterior à hora inicial';
      }
      if (hours > 24) {
        newErrors.endTime = 'Período não pode exceder 24 horas';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (formData.hourlyRate <= 0) {
      newErrors.hourlyRate = 'Valor por hora deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editEntry) {
      updateEntry(editEntry.id, formData);
    } else {
      addEntry(formData);
    }
    
    onBack();
  };

  const calculatedHours = formData.startTime && formData.endTime 
    ? calculateHours(formData.startTime, formData.endTime)
    : 0;

  const calculatedEarnings = calculatedHours * formData.hourlyRate;

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
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="self-start">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {editEntry ? 'Editar Registro' : 'Novo Registro'}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {editEntry ? 'Atualize as informações do registro' : 'Adicione um novo registro de horas'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Preencha os dados da tarefa realizada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={errors.date ? 'border-destructive' : ''}
                  />
                  {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Hora Inicial</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className={errors.startTime ? 'border-destructive' : ''}
                  />
                  {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Hora Final</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className={errors.endTime ? 'border-destructive' : ''}
                  />
                  {errors.endTime && <p className="text-sm text-destructive">{errors.endTime}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição da Tarefa</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o que foi realizado..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações de Pagamento</CardTitle>
              <CardDescription>
                Configure o valor e status de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Valor por Hora (R$)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className={errors.hourlyRate ? 'border-destructive' : ''}
                  />
                  {errors.hourlyRate && <p className="text-sm text-destructive">{errors.hourlyRate}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Status de Pagamento</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPaid"
                      checked={formData.isPaid}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
                    />
                    <Label htmlFor="isPaid" className="text-sm">
                      {formData.isPaid ? 'Pago' : 'Pendente'}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Preview */}
          {calculatedHours > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Resumo do Cálculo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Horas Trabalhadas</p>
                    <p className="text-2xl font-bold text-primary">{formatHours(calculatedHours)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Valor por Hora</p>
                    <p className="text-2xl font-bold">{formatCurrency(formData.hourlyRate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total a Receber</p>
                    <p className="text-2xl font-bold text-success">{formatCurrency(calculatedEarnings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onBack} className="order-2 sm:order-1">
              Cancelar
            </Button>
            <Button type="submit" className="order-1 sm:order-2">
              <Save className="w-4 h-4 mr-2" />
              <span className="sm:hidden">{editEntry ? 'Salvar' : 'Adicionar'}</span>
              <span className="hidden sm:inline">{editEntry ? 'Salvar Alterações' : 'Adicionar Registro'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};