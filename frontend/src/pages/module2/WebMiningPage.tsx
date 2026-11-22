import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractKeywords, extractTopics, getSentimentSummary, analyzeSentiment, scoreSingleText } from '../../services/api';
import { DataCard } from '../../components/cards/DataCard';
import { PieChartWidget } from '../../components/charts/PieChartWidget';
import { BarChartWidget } from '../../components/charts/BarChartWidget';
import { formatPercent, formatRating } from '../../utils/format';
import { Search, Sparkles, Smile, Frown, Meh, MessageSquare, Play, RotateCw } from 'lucide-react';

export const WebMiningPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [topKeywordsN, setTopKeywordsN] = useState(15);
  const [customReviewText, setCustomReviewText] = useState(
    'The sunrise at Vivekananda Rock Memorial was breathtaking! Incredible peaceful atmosphere and well-organized boat transfers.'
  );
  const [liveScoreResult, setLiveScoreResult] = useState<{
    compound: number;
    positive: number;
    neutral: number;
    negative: number;
    category: 'positive' | 'neutral' | 'negative';
  } | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  const handleScoreCustomReview = async () => {
    if (!customReviewText.trim()) return;
    setIsScoring(true);
    try {
      const res = await scoreSingleText(customReviewText);
      setLiveScoreResult(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScoring(false);
    }
  };

  // Fetch TF-IDF Keywords
  const { data: keywordsData, isLoading: isKeywordsLoading } = useQuery({
    queryKey: ['webMiningKeywords', topKeywordsN],
    queryFn: async () => {
      const res = await extractKeywords({ top_n: topKeywordsN });
      return res.data.data;
    },
  });

  // Fetch LDA Topics
  const { data: topicsData, isLoading: isTopicsLoading } = useQuery({
    queryKey: ['webMiningTopics'],
    queryFn: async () => {
      const res = await extractTopics({ n_topics: 4, top_words: 6 });
      return res.data.data;
    },
  });

  // Fetch Sentiment Summary
  const { data: sentimentData, isLoading: isSentimentLoading } = useQuery({
    queryKey: ['sentimentSummary'],
    queryFn: async () => {
      const res = await getSentimentSummary();
      return res.data.data;
    },
  });

  // Trigger Sentiment Re-run
  const sentimentMutation = useMutation({
    mutationFn: async () => {
      await analyzeSentiment();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentimentSummary'] });
    },
  });

  // Format Sentiment Pie
  const sentimentPieData = sentimentData
    ? [
        { name: 'Positive', value: sentimentData.positive_count },
        { name: 'Neutral', value: sentimentData.neutral_count },
        { name: 'Negative', value: sentimentData.negative_count },
      ]
    : [];

  // Destination sentiment bar chart
  const destSentimentBar = (sentimentData?.destination_breakdown || []).slice(0, 6).map((d) => ({
    name: d.name.split(' ')[0],
    visitors: Math.round(d.avg_score * 100),
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module Title */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <Search className="w-3.5 h-3.5 text-teal-600" />
            <span>Module 2 &bull; Web Mining & Sentiment Analysis</span>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Demonstration Data: Tamil Nadu Tourism Reviews
          </span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Web Mining and Sentiment Analysis
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Extracting key linguistic patterns using Scikit-learn TF-IDF, latent semantic topic discovery via LDA, and opinion polarity classification with VADER on the demonstration reviews dataset in MySQL.
        </p>
      </div>

      {/* Sentiment Overview KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Reviews Analyzed</p>
            <p className="text-2xl font-bold font-heading text-slate-900 mt-1">
              {sentimentData?.total_reviews_analyzed || 0}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Lexicon-scored reviews</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Positive Sentiment</p>
            <p className="text-2xl font-bold font-heading text-emerald-600 mt-1">
              {formatPercent(sentimentData?.positive_pct)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Compound score &ge; 0.05</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Smile className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Neutral Sentiment</p>
            <p className="text-2xl font-bold font-heading text-slate-600 mt-1">
              {formatPercent(sentimentData?.neutral_pct)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">-0.05 &lt; score &lt; 0.05</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
            <Meh className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">Negative Sentiment</p>
            <p className="text-2xl font-bold font-heading text-rose-600 mt-1">
              {formatPercent(sentimentData?.negative_pct)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Compound score &le; -0.05</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Frown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive Live Review Mining Tester */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white shadow-xl border border-teal-800/40">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Live Natural Language Processing (NLP) Lab</span>
            </div>
            <h3 className="text-lg font-bold font-heading text-white mt-1">Real-Time VADER Sentiment & Keyword Evaluator</h3>
            <p className="text-xs text-slate-300">
              Type or paste any tourism review to test the live NLTK lexical sentiment classifier in real-time.
            </p>
          </div>
          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setCustomReviewText("The sunrise at Vivekananda Rock Memorial was breathtaking! Majestic peaceful atmosphere and well-maintained ferries.")}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
            >
              Positive Sample
            </button>
            <button
              type="button"
              onClick={() => setCustomReviewText("Marina Beach was overcrowded, full of litter, with terrible parking and loud chaotic food vendors.")}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
            >
              Negative Sample
            </button>
            <button
              type="button"
              onClick={() => setCustomReviewText("Standard temple visit. Average waiting queues, normal amenities, reasonable entry ticket price.")}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors"
            >
              Neutral Sample
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-3">
            <textarea
              value={customReviewText}
              onChange={(e) => setCustomReviewText(e.target.value)}
              rows={3}
              placeholder="Enter your visitor review here to test the live model..."
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleScoreCustomReview()}
                disabled={isScoring || !customReviewText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
              >
                {isScoring ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>Classify Sentiment Live</span>
              </button>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Model Output Telemetry</p>
            {liveScoreResult ? (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Compound Score</span>
                  <span className={`text-base font-bold font-mono ${liveScoreResult.compound >= 0.05 ? 'text-emerald-400' : liveScoreResult.compound <= -0.05 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {liveScoreResult.compound > 0 ? `+${liveScoreResult.compound.toFixed(4)}` : liveScoreResult.compound.toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Polarity Cohort</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${liveScoreResult.category === 'positive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : liveScoreResult.category === 'negative' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                    {liveScoreResult.category}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <p className="text-emerald-400 font-bold">{Math.round(liveScoreResult.positive * 100)}%</p>
                    <p className="text-slate-400">Positive</p>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <p className="text-slate-300 font-bold">{Math.round(liveScoreResult.neutral * 100)}%</p>
                    <p className="text-slate-400">Neutral</p>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded">
                    <p className="text-rose-400 font-bold">{Math.round(liveScoreResult.negative * 100)}%</p>
                    <p className="text-slate-400">Negative</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-28 flex flex-col items-center justify-center text-slate-400 text-xs text-center">
                <Sparkles className="w-6 h-6 text-slate-500 mb-1" />
                <span>Click "Classify Sentiment Live" to evaluate text</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sentiment Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <DataCard
            title="Sentiment Polarity Proportions"
            subtitle="Categorized distribution of tourist feedback"
            action={
              <button
                onClick={() => sentimentMutation.mutate()}
                disabled={sentimentMutation.isPending}
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
              >
                {sentimentMutation.isPending ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Rescore</span>
              </button>
            }
          >
            <PieChartWidget data={sentimentPieData} height={260} innerRadius={50} />
          </DataCard>
        </div>

        <div className="lg:col-span-2">
          <DataCard
            title="Destination Positive Polarity Score"
            subtitle="Normalized compound polarity index (0 - 100)"
          >
            <BarChartWidget
              data={destSentimentBar as unknown as Array<Record<string, unknown>>}
              xKey="name"
              yKey="visitors"
              barColor="#0D9488"
              height={260}
            />
          </DataCard>
        </div>
      </div>

      {/* Web Mining: TF-IDF Keywords & LDA Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TF-IDF Table */}
        <DataCard
          title="TF-IDF Term Extraction"
          subtitle="Top weighted n-grams distinguishing visitor reviews"
        >
          <div className="overflow-x-auto max-h-80 rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <th className="px-4 py-2.5">Key Phrase</th>
                  <th className="px-4 py-2.5">TF-IDF Score</th>
                  <th className="px-4 py-2.5">Occurrences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {keywordsData?.map((k, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-sans font-semibold text-slate-800">{k.keyword}</td>
                    <td className="px-4 py-2 text-teal-600 font-bold">{k.tfidf_score.toFixed(4)}</td>
                    <td className="px-4 py-2 text-slate-500">{k.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataCard>

        {/* LDA Latent Topics */}
        <DataCard
          title="Latent Dirichlet Allocation (LDA) Topics"
          subtitle="Semantic topic groupings identified from text corpus"
        >
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {topicsData?.map((topic) => (
              <div
                key={topic.topic_id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-400 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 font-heading">
                    Topic {topic.topic_id}: {topic.label}
                  </span>
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold">
                    LDA Cluster
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {topic.top_terms.map((term, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono"
                    >
                      {term}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 italic">"{topic.sample_excerpts[0]}"</p>
              </div>
            ))}
          </div>
        </DataCard>
      </div>
    </div>
  );
};

