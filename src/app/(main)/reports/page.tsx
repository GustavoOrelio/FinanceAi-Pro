'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AreaChart, BarChart, DonutChart } from '@tremor/react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useReports } from '@/hooks/useReports';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

export default function ReportsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState('3');
  const {
    chartData,
    categoryData,
    totalGasto,
    mediaGastoMensal,
    categoriasMaisGastos,
    maiorGastoUnico,
    tendencias,
    diasMaisGastos,
    lojasMaisFrequentes,
    metricasImportantes,
    previsaoProximoMes,
    limiteMensalAtingido
  } = useReports(period);

  // Prepara dados para o Tremor
  const areaChartData = chartData.map(item => ({
    date: item.month,
    Total: item.total,
    ...item.categories
  }));

  const barChartData = categoryData.map(item => ({
    category: item.category,
    Total: item.total
  }));

  const donutData = categoriasMaisGastos.map(item => ({
    name: item.category,
    valor: item.total
  }));

  // Exportar para PDF
  const exportPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Você precisa estar logado para exportar o PDF');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            chartData,
            categoryData,
            totalGasto,
            mediaGastoMensal,
            categoriasMaisGastos,
            maiorGastoUnico,
            tendencias,
            diasMaisGastos,
            lojasMaisFrequentes,
            metricasImportantes,
            previsaoProximoMes,
            limiteMensalAtingido
          },
          period
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          router.push('/login');
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar PDF');
      }

      // Converte a resposta para blob
      const blob = await response.blob();

      // Verifica se o blob é válido
      if (blob.size === 0) {
        throw new Error('PDF gerado está vazio');
      }

      // Verifica o tipo do blob
      if (!blob.type.includes('pdf')) {
        throw new Error('Arquivo gerado não é um PDF válido');
      }

      // Cria um link para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio-gastos.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      if (error instanceof Error) {
        toast.error(`Erro ao exportar PDF: ${error.message}`);
      } else {
        toast.error('Erro ao exportar PDF');
      }
    }
  };

  // Exportar para Excel
  const exportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Dados gerais
      const generalData = [
        {
          'Período': `Últimos ${period} meses`,
          'Total Gasto': totalGasto,
          'Média Mensal': mediaGastoMensal,
          'Ticket Médio': metricasImportantes.ticketMedio,
          'Total Compras': metricasImportantes.totalCompras,
          'Gastos Pendentes': metricasImportantes.gastosPendentes,
          'Total Parcelado': metricasImportantes.totalParcelado,
          'Percentual Parcelado': metricasImportantes.percentualParcelado
        }
      ];

      const wsGeneral = XLSX.utils.json_to_sheet(generalData);
      XLSX.utils.book_append_sheet(wb, wsGeneral, 'Resumo');

      // Dados por categoria
      const wsCategory = XLSX.utils.json_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(wb, wsCategory, 'Por Categoria');

      // Dados por mês
      const wsMonthly = XLSX.utils.json_to_sheet(chartData.map(month => ({
        Mês: month.month,
        Total: month.total,
        ...month.categories
      })));
      XLSX.utils.book_append_sheet(wb, wsMonthly, 'Por Mês');

      // Tendências
      const wsTrends = XLSX.utils.json_to_sheet(tendencias.map(t => ({
        Categoria: t.category,
        Total: t.total,
        'Variação (%)': t.variacao,
        'Percentual do Total (%)': t.percentual,
        Status: t.status
      })));
      XLSX.utils.book_append_sheet(wb, wsTrends, 'Tendências');

      // Dias mais gastos
      const wsDays = XLSX.utils.json_to_sheet(diasMaisGastos);
      XLSX.utils.book_append_sheet(wb, wsDays, 'Por Dia');

      // Lojas mais frequentes
      const wsStores = XLSX.utils.json_to_sheet(lojasMaisFrequentes.map(l => ({
        Loja: l.store,
        Total: l.total,
        'Quantidade de Compras': l.count,
        'Ticket Médio': l.average,
        'Última Compra': format(l.lastPurchase, 'dd/MM/yyyy')
      })));
      XLSX.utils.book_append_sheet(wb, wsStores, 'Por Loja');

      XLSX.writeFile(wb, 'relatorio-gastos.xlsx');
      toast.success('Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar Excel');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Relatórios e Análises</h2>
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Últimos 3 meses</SelectItem>
              <SelectItem value="6">Últimos 6 meses</SelectItem>
              <SelectItem value="12">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportPDF}>Exportar PDF</Button>
          <Button onClick={exportExcel}>Exportar Excel</Button>
        </div>
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {limiteMensalAtingido > 80 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Limite Mensal</AlertTitle>
            <AlertDescription>
              Você já utilizou {limiteMensalAtingido.toFixed(1)}% do seu limite mensal!
            </AlertDescription>
          </Alert>
        )}
        {metricasImportantes.gastosPendentes > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gastos Pendentes</AlertTitle>
            <AlertDescription>
              Você tem R$ {metricasImportantes.gastosPendentes.toFixed(2)} em gastos pendentes.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Gasto</CardTitle>
            <CardDescription>No período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalGasto.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {metricasImportantes.totalCompras} compras
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Média Mensal</CardTitle>
            <CardDescription>Gastos por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {mediaGastoMensal.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Ticket médio: R$ {metricasImportantes.ticketMedio.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maior Gasto</CardTitle>
            <CardDescription>Compra mais cara</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {maiorGastoUnico.amount.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {maiorGastoUnico.description}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Previsão</CardTitle>
            <CardDescription>Próximo mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {previsaoProximoMes.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {previsaoProximoMes > mediaGastoMensal ? (
                <span className="text-red-500 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Tendência de aumento
                </span>
              ) : (
                <span className="text-green-500 flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  Tendência de redução
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Análises */}
      <Tabs defaultValue="evolucao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="tendencias">Tendências</TabsTrigger>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
        </TabsList>

        <TabsContent value="evolucao" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de Evolução de Gastos */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Gastos</CardTitle>
                <CardDescription>Acompanhe seus gastos ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <AreaChart
                    data={areaChartData}
                    index="date"
                    categories={['Total', ...Object.keys(chartData[0]?.categories || {})]}
                    colors={['indigo', 'cyan', 'pink', 'amber', 'green', 'blue', 'red']}
                    valueFormatter={(value) => `R$ ${value.toFixed(2)}`}
                    showLegend
                    showGridLines
                    showAnimation
                  />
                </div>
              </CardContent>
            </Card>

            {/* Comparativo entre Períodos */}
            <Card>
              <CardHeader>
                <CardTitle>Comparativo entre Períodos</CardTitle>
                <CardDescription>Variação dos gastos entre períodos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.map((month, index) => {
                    const prevMonth = chartData[index - 1];
                    if (!prevMonth) return null;

                    const variation = ((month.total - prevMonth.total) / prevMonth.total) * 100;

                    return (
                      <div key={month.month} className="flex justify-between items-center">
                        <span>{month.month}</span>
                        <div className="flex items-center gap-2">
                          <span>R$ {month.total.toFixed(2)}</span>
                          <span className={variation > 0 ? 'text-red-500' : 'text-green-500'}>
                            {variation > 0 ? '↑' : '↓'} {Math.abs(variation).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de Gastos por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
                <CardDescription>Distribuição dos seus gastos por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <BarChart
                    data={barChartData}
                    index="category"
                    categories={['Total']}
                    colors={['emerald']}
                    valueFormatter={(value) => `R$ ${value.toFixed(2)}`}
                    showLegend
                    showGridLines
                    showAnimation
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Pizza */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição dos Gastos</CardTitle>
                <CardDescription>Proporção por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <DonutChart
                    data={donutData}
                    category="valor"
                    index="name"
                    valueFormatter={(value) => `R$ ${value.toFixed(2)}`}
                    colors={['slate', 'violet', 'indigo', 'rose', 'cyan', 'amber']}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tendências por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências por Categoria</CardTitle>
                <CardDescription>Variação em relação ao mês anterior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tendencias.map((trend) => (
                    <div key={trend.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{trend.category}</span>
                        <Badge variant={
                          trend.status === 'up' ? 'destructive' :
                            trend.status === 'down' ? 'default' :
                              'secondary'
                        }>
                          <span className="flex items-center gap-1">
                            {trend.status === 'up' ? <ArrowUpIcon className="h-3 w-3" /> :
                              trend.status === 'down' ? <ArrowDownIcon className="h-3 w-3" /> :
                                <MinusIcon className="h-3 w-3" />}
                            {trend.variacao > 0 ? '+' : ''}{trend.variacao.toFixed(1)}%
                          </span>
                        </Badge>
                      </div>
                      <Progress value={trend.percentual} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>R$ {trend.total.toFixed(2)}</span>
                        <span>{trend.percentual.toFixed(1)}% do total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Análise por Dia da Semana */}
            <Card>
              <CardHeader>
                <CardTitle>Análise por Dia da Semana</CardTitle>
                <CardDescription>Padrões de gastos semanais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diasMaisGastos.map((dia) => (
                    <div key={dia.dayOfWeek} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{dia.dayOfWeek}</span>
                        <span className="text-sm text-muted-foreground">
                          {dia.count} compras
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total: R$ {dia.total.toFixed(2)}</span>
                        <span>Média: R$ {dia.average.toFixed(2)}</span>
                      </div>
                      <Progress
                        value={(dia.total / diasMaisGastos[0].total) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detalhes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lojas Mais Frequentes */}
            <Card>
              <CardHeader>
                <CardTitle>Lojas Mais Frequentes</CardTitle>
                <CardDescription>Onde você mais compra</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lojasMaisFrequentes.slice(0, 5).map((loja) => (
                    <div key={loja.store} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{loja.store}</span>
                        <span className="text-sm text-muted-foreground">
                          {loja.count}x
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total: R$ {loja.total.toFixed(2)}</span>
                        <span>Média: R$ {loja.average.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Última compra: {format(loja.lastPurchase, 'dd/MM/yyyy')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Métricas Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas Adicionais</CardTitle>
                <CardDescription>Informações complementares</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Maior Mês</div>
                      <div className="text-2xl font-bold">
                        R$ {metricasImportantes.maiorMes.valor.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {metricasImportantes.maiorMes.mes}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Menor Mês</div>
                      <div className="text-2xl font-bold">
                        R$ {metricasImportantes.menorMes.valor.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {metricasImportantes.menorMes.mes}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Gastos Parcelados</div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>R$ {metricasImportantes.totalParcelado.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Percentual:</span>
                      <span>{metricasImportantes.percentualParcelado.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={metricasImportantes.percentualParcelado}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Gastos Pendentes</div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>R$ {metricasImportantes.gastosPendentes.toFixed(2)}</span>
                    </div>
                    <Progress
                      value={(metricasImportantes.gastosPendentes / totalGasto) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Tendências</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-red-500" />
                        <span>Em alta: {metricasImportantes.categoriaEmAlta}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-green-500" />
                        <span>Em baixa: {metricasImportantes.categoriaEmBaixa}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 