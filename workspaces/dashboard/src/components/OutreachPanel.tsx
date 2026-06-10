"use client";

import { useState, useEffect } from "react";
import { Send, TrendingUp, Users, Target } from "lucide-react";
import { motion } from "framer-motion";

export function OutreachPanel() {
  const [stats, setStats] = useState({
    leads: 0,
    sent: 0,
    replied: 0,
    conversion_rate: "0%",
  });
  const [isRunning, setIsRunning] = useState(false);

  const fetchStats = () => {
    fetch("http://localhost:4000/api/v1/outreach/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartCycle = async () => {
    setIsRunning(true);
    try {
      await fetch("http://localhost:4000/api/v1/outreach/start", {
        method: "POST",
      });
      fetchStats();
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Automated Cold Acquisition
          </h2>
          <p className="text-slate-400">
            Manage the Apollo.io → PitchCrafter → Resend pipeline.
          </p>
        </div>

        <button
          onClick={handleStartCycle}
          disabled={isRunning}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {isRunning ? "Executing Cycle..." : "Trigger Outreach Cycle"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#0a0a0a] border border-slate-800 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-16 h-16" />
          </div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
            Total Leads In DB
          </p>
          <p className="text-4xl font-black text-white">{stats.leads}</p>
        </div>

        <div className="bg-[#0a0a0a] border border-slate-800 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Send className="w-16 h-16" />
          </div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
            Pitches Sent
          </p>
          <p className="text-4xl font-black text-blue-400">{stats.sent}</p>
        </div>

        <div className="bg-[#0a0a0a] border border-slate-800 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target className="w-16 h-16" />
          </div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
            Hot Replies
          </p>
          <p className="text-4xl font-black text-emerald-400">
            {stats.replied}
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-slate-800 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-16 h-16" />
          </div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">
            Conversion Rate
          </p>
          <p className="text-4xl font-black text-purple-400">
            {stats.conversion_rate}
          </p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-slate-800 rounded-xl p-8">
        <h3 className="text-lg font-bold mb-6">Pipeline Architecture</h3>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full p-4 border border-slate-700/50 rounded-lg text-center bg-[#020617]">
            <p className="font-bold text-blue-400 mb-1">1. Sourcing</p>
            <p className="text-xs text-slate-400">
              Apollo.io API / CSV Fallback
            </p>
          </div>
          <div className="text-slate-600 hidden md:block">→</div>
          <div className="flex-1 w-full p-4 border border-slate-700/50 rounded-lg text-center bg-[#020617]">
            <p className="font-bold text-purple-400 mb-1">2. Personalization</p>
            <p className="text-xs text-slate-400">
              PitchCrafter Agent (Groq LLaMA)
            </p>
          </div>
          <div className="text-slate-600 hidden md:block">→</div>
          <div className="flex-1 w-full p-4 border border-slate-700/50 rounded-lg text-center bg-[#020617]">
            <p className="font-bold text-orange-400 mb-1">3. Delivery</p>
            <p className="text-xs text-slate-400">Resend Mail API</p>
          </div>
          <div className="text-slate-600 hidden md:block">→</div>
          <div className="flex-1 w-full p-4 border border-slate-700/50 rounded-lg text-center bg-[#020617]">
            <p className="font-bold text-emerald-400 mb-1">4. Inbox Sync</p>
            <p className="text-xs text-slate-400">IMAP Monitor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
