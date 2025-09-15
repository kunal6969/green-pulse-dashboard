import React, { useState, useContext, useMemo, useRef } from 'react';
import Card from '../ui/Card';
import ConsumptionOverview from '../dashboard/EnergyChart';
import { Filter, Calendar, Download, Loader2, Cpu } from 'lucide-react';
import { SimulationContext } from '../../contexts/SimulationContext';
import { EnergyDataPoint, ReportSummary } from '../../types';
import { generateReportConsultation } from '../../services/geminiService';

// Add a declaration for the jsPDF and html2canvas globals
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

const ReportsPage: React.FC = () => {
  const { buildingId, buildingData } = useContext(SimulationContext);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<EnergyDataPoint[] | null>(null);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [aiConsultation, setAiConsultation] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);

  const dateRange = useMemo(() => {
    if (buildingData.length === 0) return { min: undefined, max: undefined };
    
    const firstDate = buildingData[0].historical;
    const lastDate = buildingData[buildingData.length - 1].historical;

    const toYYYYMMDD = (d: Date | undefined) => d ? new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : undefined;

    return { min: toYYYYMMDD(firstDate), max: toYYYYMMDD(lastDate) };
  }, [buildingData]);

  const calculateSummary = (data: EnergyDataPoint[], start: Date, end: Date): ReportSummary => {
      let totalActualKwh = 0;
      let totalPredictedKwh = 0;
      let anomalyCount = 0;
      let peakConsumption = { value: -Infinity, time: '' };
      let lowestConsumption = { value: Infinity, time: '' };

      data.forEach(p => {
          const actual = p.actual ?? 0;
          const predicted = p.predicted ?? 0;

          totalActualKwh += actual;
          totalPredictedKwh += predicted;

          if (actual > peakConsumption.value) peakConsumption = { value: actual, time: p.historical!.toLocaleString() };
          if (actual < lowestConsumption.value) lowestConsumption = { value: actual, time: p.historical!.toLocaleString() };

          if (predicted > 0) {
              const deviation = (actual - predicted) / predicted;
              if (Math.abs(deviation) > 0.20) anomalyCount++;
          }
      });

      return {
          buildingId,
          startDate: start.toLocaleDateString(),
          endDate: end.toLocaleDateString(),
          totalActualKwh,
          totalPredictedKwh,
          netSavingsKwh: totalPredictedKwh - totalActualKwh,
          peakConsumption,
          lowestConsumption,
          anomalyCount,
      };
  };

  const handleGenerateReport = async () => {
    setError(null);
    if (!startDate || !endDate) {
      setError('Please select both a start and end date.');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);

    if (start > end) {
      setError('Start date cannot be after end date.');
      return;
    }

    setIsGenerating(true);
    setReportData(null);
    setAiConsultation(null);
    setReportSummary(null);

    const filtered = buildingData.filter(p => p.historical && p.historical >= start && p.historical <= end);
    
    if (filtered.length > 0) {
        setReportData(filtered);
        const summary = calculateSummary(filtered, start, end);
        setReportSummary(summary);
      
        try {
            const consultation = await generateReportConsultation(summary);
            setAiConsultation(consultation);
        } catch (aiError) {
            console.error("AI Consultation Error:", aiError);
            setAiConsultation("### AI Analysis Error\n- Could not generate consultation. Please check the connection or API key configuration.");
        }
    } else {
        setReportData([]);
    }
    
    setIsGenerating(false);
  };
  
  const handleDownloadPdf = () => {
    const { jsPDF } = window.jspdf;
    const reportElement = reportContentRef.current;
    if (!reportElement) return;

    // FIX: Correctly call html2canvas from the window object.
    window.html2canvas(reportElement, {
      backgroundColor: '#1A2929',
      scale: 2,
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4',
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const height = pdfWidth / ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height > pdfHeight ? pdfHeight : height);
      pdf.save(`GreenPulse_Report_${buildingId}_${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in-down">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Filter Report Data</h3>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={dateRange.min} max={dateRange.max} className="bg-bg-secondary border border-border-color rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-48 text-text-primary" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={dateRange.min} max={dateRange.max} className="bg-bg-secondary border border-border-color rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-48 text-text-primary" />
            </div>
            <button onClick={handleGenerateReport} disabled={isGenerating} className="bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center disabled:opacity-50">
              {isGenerating ? <Loader2 className="animate-spin mr-2" size={16}/> : <Cpu size={16} className="mr-2"/>}
              Generate Report
            </button>
            {reportData && <button onClick={handleDownloadPdf} className="bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center"><Download size={16} className="mr-2"/>Download PDF</button>}
          </div>
        </div>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </Card>
      
      {isGenerating && <Card><div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-8 w-8 text-primary" /><p className="ml-4 text-text-secondary">Generating AI Analysis...</p></div></Card>}

      {!isGenerating && reportData && (
        <div ref={reportContentRef} className="p-4 bg-card-bg rounded-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {aiConsultation && (
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">AI-Powered Consultation</h3>
                  <div className="prose prose-invert prose-sm max-w-none text-text-secondary p-4 border border-border-color rounded-lg bg-bg-secondary" dangerouslySetInnerHTML={{ __html: aiConsultation.replace(/\n/g, '<br />').replace(/### (.*?)/g, '<h3>$1</h3>') }} />
                </div>
              )}
              <ConsumptionOverview data={reportData} />
              <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Statistical Highlights</h3>
                  {reportSummary && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-bg-secondary p-3 rounded-md">
                          <p className="text-text-secondary">Total Actual Usage</p>
                          <p className="text-text-primary font-bold text-lg">{reportSummary.totalActualKwh.toFixed(1)} kWh</p>
                      </div>
                      <div className="bg-bg-secondary p-3 rounded-md">
                          <p className="text-text-secondary">Total Predicted Usage</p>
                          <p className="text-text-primary font-bold text-lg">{reportSummary.totalPredictedKwh.toFixed(1)} kWh</p>
                      </div>
                      <div className={`p-3 rounded-md ${reportSummary.netSavingsKwh >= 0 ? 'bg-primary/10' : 'bg-red-500/10'}`}>
                          <p className={`${reportSummary.netSavingsKwh >= 0 ? 'text-primary' : 'text-red-400'}`}>Net Savings</p>
                          <p className={`font-bold text-lg ${reportSummary.netSavingsKwh >= 0 ? 'text-primary' : 'text-red-400'}`}>{reportSummary.netSavingsKwh.toFixed(1)} kWh</p>
                      </div>
                       <div className={`p-3 rounded-md ${reportSummary.anomalyCount > 0 ? 'bg-secondary/10' : 'bg-primary/10'}`}>
                          <p className={`${reportSummary.anomalyCount > 0 ? 'text-secondary' : 'text-primary'}`}>Anomalies Detected</p>
                          <p className={`font-bold text-lg ${reportSummary.anomalyCount > 0 ? 'text-secondary' : 'text-primary'}`}>{reportSummary.anomalyCount}</p>
                      </div>
                    </div>
                  )}
              </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Detailed Log</h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border-color text-text-secondary sticky top-0 bg-card-bg">
                  <tr><th className="p-2">Timestamp</th><th className="p-2">Actual (kWh)</th><th className="p-2">Predicted (kWh)</th><th className="p-2">Variance</th></tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => {
                    const variance = (row.actual ?? 0) - (row.predicted ?? 0);
                    return (<tr key={index} className="border-b border-border-color/50 hover:bg-white/5"><td className="p-2 font-mono">{row.historical?.toLocaleString()}</td><td className="p-2">{row.actual?.toFixed(2) ?? 'N/A'}</td><td className="p-2">{row.predicted?.toFixed(2) ?? 'N/A'}</td><td className={`p-2 font-semibold ${variance > 0 ? 'text-red-400' : 'text-primary'}`}>{variance.toFixed(2)}</td></tr>);
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {!isGenerating && reportData === null && <Card><div className="text-center py-20 text-text-secondary"><p>Select a date range and click "Generate Report" to view data.</p></div></Card>}
      {!isGenerating && reportData?.length === 0 && <Card><div className="text-center py-20 text-text-secondary"><p>No data available for the selected range.</p></div></Card>}

    </div>
  );
};

export default ReportsPage;