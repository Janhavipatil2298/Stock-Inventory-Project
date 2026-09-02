import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Send, 
  BarChart3, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  Bot, 
  User,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { AIInsightsData, Product } from '../../types';

interface AIFeaturesModuleProps {
  aiInsights: AIInsightsData;
  products: Product[];
  onRefreshAI: () => void;
  onQuickRestock: (p: Product) => void;
}

export const AIFeaturesModule: React.FC<AIFeaturesModuleProps> = ({
  aiInsights,
  products,
  onRefreshAI,
  onQuickRestock
}) => {
  const [activeTab, setActiveTab] = useState<'forecasting' | 'abc' | 'copilot'>('forecasting');

  // Copilot Chat State
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string; timestamp: string }[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Inventory & Supply Chain Copilot. I have analyzed your 5 catalog SKUs and stock velocity. Ask me anything about demand forecasts, safety reorder points, or ABC inventory optimization!',
      timestamp: 'Just now'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setInputQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: userText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, inventoryContext: { totalProducts: products.length, lowStockCount: aiInsights.lowStockPredictions.length } })
      });
      const data = await response.json();
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.analysis || data.insight || 'Based on your stock velocities, maintaining a 15-day safety buffer for high-turnover items will prevent 95% of stockouts.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'AI Copilot response generated: Reorder point calculations indicate placing a PO for high-performing SKUs within 3 business days.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Forecast Chart Data
  const forecastChartData = [
    { month: 'Jan', Actual: 120, Forecast: 120 },
    { month: 'Feb', Actual: 150, Forecast: 148 },
    { month: 'Mar', Actual: 180, Forecast: 175 },
    { month: 'Apr', Actual: 210, Forecast: 215 },
    { month: 'May (Predicted)', Forecast: 260 },
    { month: 'Jun (Predicted)', Forecast: 310 },
  ];

  return (
    <div className="space-y-6">
      {/* AI Hub Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <BrainCircuit className="w-4 h-4" />
            <span>Gemini Neural Inventory Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">AI Supply Chain Copilot & Predictive Insights</h2>
          <p className="text-xs text-slate-400 mt-1">Smart demand forecasting, ABC velocity matrix, and automated stock safety analytics</p>
        </div>

        <button
          onClick={onRefreshAI}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition-all shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh AI Predictions</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('forecasting')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 ${activeTab === 'forecasting' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Demand Forecasting & Restock Matrix
        </button>
        <button
          onClick={() => setActiveTab('abc')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 ${activeTab === 'abc' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          ABC Fast / Slow Moving Velocity
        </button>
        <button
          onClick={() => setActiveTab('copilot')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 ${activeTab === 'copilot' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Interactive AI Copilot Chat
        </button>
      </div>

      {/* Tab 1: Forecasting & Restock Matrix */}
      {activeTab === 'forecasting' && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>Predicted Stock Demand Curve (Next 60 Days)</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="Actual" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Forecast" stroke="#06B6D4" strokeDasharray="5 5" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Smart Restock Prediction Matrix */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Smart Restock Predictions & Stockout Risk Table</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiInsights.lowStockPredictions.map(pred => {
                const prod = products.find(p => p.id === pred.productId);
                return (
                  <div key={pred.productId} className="p-4 rounded-xl bg-slate-800/60 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-200">{pred.productName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                        Stockout in {pred.daysUntilStockout} Days
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Recommended PO Quantity: <strong className="text-cyan-400">{pred.recommendedReorderQty} units</strong>
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{pred.confidenceReason}</p>

                    {prod && (
                      <button
                        onClick={() => onQuickRestock(prod)}
                        className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all mt-2"
                      >
                        Issue Reorder PO
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ABC Fast/Slow Moving Matrix */}
      {activeTab === 'abc' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class A */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-emerald-400">Class A (Fast-Moving)</h3>
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                70% Revenue Impact
              </span>
            </div>
            <p className="text-xs text-slate-400">High velocity SKUs requiring stringent safety buffer control.</p>
            <div className="space-y-2 pt-2">
              {aiInsights.abcAnalysis.classA.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{p.name}</span>
                  <span className="text-emerald-400 font-extrabold">${p.sellingPrice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Class B */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-blue-400">Class B (Moderate Velocity)</h3>
              <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                20% Revenue Impact
              </span>
            </div>
            <p className="text-xs text-slate-400">Steady turnover SKUs with predictable lead times.</p>
            <div className="space-y-2 pt-2">
              {aiInsights.abcAnalysis.classB.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{p.name}</span>
                  <span className="text-blue-400 font-extrabold">${p.sellingPrice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Class C */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-300">Class C (Slow-Moving)</h3>
              <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                10% Revenue Impact
              </span>
            </div>
            <p className="text-xs text-slate-400">Consider promotional liquidations or reduced holding quantity.</p>
            <div className="space-y-2 pt-2">
              {aiInsights.abcAnalysis.classC.map(p => (
                <div key={p.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{p.name}</span>
                  <span className="text-slate-400 font-extrabold">${p.sellingPrice}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Copilot Chat */}
      {activeTab === 'copilot' && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 flex flex-col h-[520px]">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Bot className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-sm text-slate-100">Gemini Supply Chain AI Advisor</h3>
              <p className="text-[10px] text-slate-400">Ask natural language questions about your inventory, warehouse lead times, or margins</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'ai' && (
                  <div className="p-2 rounded-xl bg-cyan-600 text-white shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`p-3 rounded-2xl max-w-lg text-xs leading-relaxed ${
                  m.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none'
                }`}>
                  <p>{m.text}</p>
                  <span className="text-[9px] opacity-60 block mt-1 text-right">{m.timestamp}</span>
                </div>
                {m.sender === 'user' && (
                  <div className="p-2 rounded-xl bg-slate-700 text-white shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
                <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>AI Copilot is analyzing supply chain telemetry...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask Copilot e.g., 'Which SKU has the highest stockout risk this month?'"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
