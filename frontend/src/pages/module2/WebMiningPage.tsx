import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractKeywords, extractTopics, getSentimentSummary, analyzeSentiment } from '../../services/api';
import { DataCard } from '../../components/cards/DataCard';
import { PieChartWidget } from '../../components/charts/PieChartWidget';
import { BarChartWidget } from '../../components/charts/BarChartWidget';
import { formatPercent, formatRating } from '../../utils/format';
import { Search, Sparkles, Smile, Frown, Meh, MessageSquare, Play, RotateCw } from 'lucide-react';

export const WebMiningPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [topKeywordsN, setTopKeywordsN] = useState(15);

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

