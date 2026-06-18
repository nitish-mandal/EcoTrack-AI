'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Zap, Utensils, Trash2, ShoppingBag, Droplets, ChevronRight, ChevronLeft, Check, BarChart3 } from 'lucide-react';
import { carbonAPI } from '@/services/api';
import DashboardLayout from '@/components/DashboardLayout';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type StepKey = 'transportation' | 'energy' | 'food' | 'waste' | 'shopping' | 'water';

interface FormData {
  transportation: { car: number; bus: number; train: number; metro: number; flight: number; bike: number };
  energy: { electricity: number; ac: number; appliances: number };
  food: { meat: number; mixed: number; vegetarian: number; vegan: number };
  waste: { plastic: number; organic: number; recyclable: number };
  shopping: { clothing: number; electronics: number };
  water: { daily: number };
}

const steps = [
  { key: 'transportation' as StepKey, label: 'Transportation', icon: Car, color: '#3B82F6', desc: 'Log your daily travel habits' },
  { key: 'energy' as StepKey, label: 'Energy', icon: Zap, color: '#F59E0B', desc: 'Home energy consumption' },
  { key: 'food' as StepKey, label: 'Food', icon: Utensils, color: '#EF4444', desc: 'Your dietary choices' },
  { key: 'waste' as StepKey, label: 'Waste', icon: Trash2, color: '#8B5CF6', desc: 'Waste generation & recycling' },
  { key: 'shopping' as StepKey, label: 'Shopping', icon: ShoppingBag, color: '#EC4899', desc: 'Consumer goods purchased' },
  { key: 'water' as StepKey, label: 'Water', icon: Droplets, color: '#06B6D4', desc: 'Daily water usage' },
];

const defaultForm: FormData = {
  transportation: { car: 0, bus: 0, train: 0, metro: 0, flight: 0, bike: 0 },
  energy: { electricity: 0, ac: 0, appliances: 0 },
  food: { meat: 0, mixed: 0, vegetarian: 0, vegan: 0 },
  waste: { plastic: 0, organic: 0, recyclable: 0 },
  shopping: { clothing: 0, electronics: 0 },
  water: { daily: 0 },
};

interface ResultData {
  breakdown: { transportCO2: number; energyCO2: number; foodCO2: number; wasteCO2: number; shoppingCO2: number; waterCO2: number };
  summary: { dailyCO2: number; weeklyCO2: number; monthlyCO2: number; annualCO2: number };
}

function InputField({ label, value, onChange, unit, hint }: { label: string; value: number; onChange: (v: number) => void; unit: string; hint?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-2)' }}>{label}</label>
      {/* Reserve fixed 18px height for hint line so all inputs in the same grid row stay aligned */}
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', minHeight: 18, margin: 0, lineHeight: '18px' }}>
        {hint || ''}
      </p>
      {/* Unit embedded inside the input row as a right-side badge — no overflow */}
      <div style={{ display: 'flex', alignItems: 'center', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s' }}
        onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)'; }}
        onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
        <input
          type="number" min={0} step="0.1" value={value || ''}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          style={{ flex: 1, padding: '13px 14px', background: 'transparent', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', border: 'none', fontFamily: 'var(--font)', minWidth: 0 }}
        />
        <span style={{ padding: '0 14px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, background: 'var(--bg-2)', borderLeft: '1px solid var(--border)', height: '100%', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (section: StepKey, field: string, value: number) => {
    setForm(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await carbonAPI.calculate(form);
      setResult(res.data.data);
      toast.success('Carbon footprint calculated! +10 Eco Points 🎉');
    } catch {
      const FACTORS = { car: 0.21, bus: 0.089, train: 0.041, metro: 0.035, flight: 0.255, electricity: 0.82, ac: 1.5, meat: 7.2, mixed: 5.0, vegetarian: 3.8, vegan: 2.9, plastic: 6.0, organic: 0.5, recyclable: 1.0, clothing: 15.0, electronics: 70.0, water: 0.001 };
      const transportCO2 = form.transportation.car * FACTORS.car + form.transportation.bus * FACTORS.bus + form.transportation.train * FACTORS.train + form.transportation.metro * FACTORS.metro + form.transportation.flight * FACTORS.flight;
      const energyCO2 = form.energy.electricity * FACTORS.electricity + form.energy.ac * FACTORS.ac;
      const foodCO2 = form.food.meat * FACTORS.meat + form.food.mixed * FACTORS.mixed + form.food.vegetarian * FACTORS.vegetarian + form.food.vegan * FACTORS.vegan;
      const wasteCO2 = form.waste.plastic * FACTORS.plastic + form.waste.organic * FACTORS.organic + form.waste.recyclable * FACTORS.recyclable;
      const shoppingCO2 = form.shopping.clothing * FACTORS.clothing + form.shopping.electronics * FACTORS.electronics;
      const waterCO2 = form.water.daily * FACTORS.water;
      const dailyCO2 = transportCO2 + energyCO2 + foodCO2 + wasteCO2 + shoppingCO2 + waterCO2;
      setResult({ breakdown: { transportCO2, energyCO2, foodCO2, wasteCO2, shoppingCO2, waterCO2 }, summary: { dailyCO2, weeklyCO2: dailyCO2 * 7, monthlyCO2: dailyCO2 * 30, annualCO2: dailyCO2 * 365 } });
      toast.success('Carbon footprint calculated locally!');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const s = steps[currentStep];
    // Responsive grids — minmax ensures wrapping before overflow
    const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', columnGap: 20, rowGap: 28 } as React.CSSProperties;
    const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', columnGap: 20, rowGap: 28 } as React.CSSProperties;
    const grid1 = { display: 'grid', gridTemplateColumns: '1fr', gap: 24 } as React.CSSProperties;
    switch (s.key) {
      case 'transportation':
        return (
          <div style={grid3}>
            <InputField label="Car" value={form.transportation.car} onChange={v => update('transportation', 'car', v)} unit="km/day" hint="Distance driven daily" />
            <InputField label="Bus" value={form.transportation.bus} onChange={v => update('transportation', 'bus', v)} unit="km/day" />
            <InputField label="Train" value={form.transportation.train} onChange={v => update('transportation', 'train', v)} unit="km/day" />
            <InputField label="Metro" value={form.transportation.metro} onChange={v => update('transportation', 'metro', v)} unit="km/day" />
            <InputField label="Flights" value={form.transportation.flight} onChange={v => update('transportation', 'flight', v)} unit="km/mo" hint="Monthly flight distance" />
            <InputField label="Bike" value={form.transportation.bike} onChange={v => update('transportation', 'bike', v)} unit="km/day" hint="Zero emissions! 🚲" />
          </div>
        );
      case 'energy':
        return (
          <div style={grid3}>
            <InputField label="Electricity" value={form.energy.electricity} onChange={v => update('energy', 'electricity', v)} unit="kWh/mo" hint="Monthly electricity bill units" />
            <InputField label="AC Usage" value={form.energy.ac} onChange={v => update('energy', 'ac', v)} unit="hrs/day" hint="Air conditioning hours per day" />
            <InputField label="Other Appliances" value={form.energy.appliances} onChange={v => update('energy', 'appliances', v)} unit="kWh/mo" />
          </div>
        );
      case 'food':
        return (
          <div style={grid2}>
            {[
              { k: 'meat', l: 'Meat-heavy days', h: 'Days per week with meat' },
              { k: 'mixed', l: 'Mixed diet days', h: 'Days with mixed meals' },
              { k: 'vegetarian', l: 'Vegetarian days', h: 'Days per week' },
              { k: 'vegan', l: 'Vegan days', h: 'Lowest carbon option! 🌱' },
            ].map(f => (
              <InputField key={f.k} label={f.l} value={form.food[f.k as keyof typeof form.food]} onChange={v => update('food', f.k, v)} unit="days/wk" hint={f.h} />
            ))}
          </div>
        );
      case 'waste':
        return (
          <div style={grid3}>
            <InputField label="Plastic Waste" value={form.waste.plastic} onChange={v => update('waste', 'plastic', v)} unit="kg/wk" hint="Weekly plastic generated" />
            <InputField label="Organic Waste" value={form.waste.organic} onChange={v => update('waste', 'organic', v)} unit="kg/wk" hint="Composting reduces this!" />
            <InputField label="Recyclable Waste" value={form.waste.recyclable} onChange={v => update('waste', 'recyclable', v)} unit="kg/wk" hint="Paper, glass, metal" />
          </div>
        );
      case 'shopping':
        return (
          <div style={grid2}>
            <InputField label="Clothing Items" value={form.shopping.clothing} onChange={v => update('shopping', 'clothing', v)} unit="items/mo" hint="New clothes bought monthly" />
            <InputField label="Electronics" value={form.shopping.electronics} onChange={v => update('shopping', 'electronics', v)} unit="items/yr" hint="Gadgets, devices per year" />
          </div>
        );
      case 'water':
        return (
          <div style={grid2}>
            <InputField label="Daily Water Usage" value={form.water.daily} onChange={v => update('water', 'daily', v)} unit="liters/day" hint="Average daily consumption" />
            <InputField label="Shower Duration" value={0} onChange={() => {}} unit="min/day" hint="Average shower time" />
          </div>
        );
    }
  };

  /* ── Results Screen ── */
  if (result) {
    const total = result.summary.dailyCO2;
    const avgIndian = 4.0;
    const better = total < avgIndian;
    const breakdownItems = [
      { label: 'Transportation', value: result.breakdown.transportCO2, color: '#3B82F6' },
      { label: 'Energy', value: result.breakdown.energyCO2, color: '#F59E0B' },
      { label: 'Food', value: result.breakdown.foodCO2, color: '#EF4444' },
      { label: 'Waste', value: result.breakdown.wasteCO2, color: '#8B5CF6' },
      { label: 'Shopping', value: result.breakdown.shoppingCO2, color: '#EC4899' },
      { label: 'Water', value: result.breakdown.waterCO2, color: '#06B6D4' },
    ];

    return (
      <DashboardLayout>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Result hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: better ? 'rgba(34,197,94,0.1)' : 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2.5rem' }}>
              {better ? '🎉' : '📊'}
            </div>
            <h1 className="page-title" style={{ textAlign: 'center', marginBottom: 10 }}>Your Results</h1>
            <p className="page-subtitle" style={{ textAlign: 'center' }}>{better ? 'Great job! You\'re below the national average.' : 'Here\'s where you can improve.'}</p>
          </motion.div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 20 }}>
            {[
              { l: 'Daily', v: result.summary.dailyCO2.toFixed(2), u: 'kg' },
              { l: 'Weekly', v: result.summary.weeklyCO2.toFixed(1), u: 'kg' },
              { l: 'Monthly', v: result.summary.monthlyCO2.toFixed(1), u: 'kg' },
              { l: 'Annual', v: (result.summary.annualCO2 / 1000).toFixed(2), u: 'ton' },
            ].map(s => (
              <motion.div key={s.l} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-card" style={{ borderRadius: 20, padding: '24px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg,#22C55E,#86EFAC,#16A34A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.v}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{s.u} CO₂ / {s.l}</div>
              </motion.div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="glass-card" style={{ borderRadius: 20, padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)', marginBottom: 24, fontSize: '1rem' }}>Breakdown by Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {breakdownItems.map(item => {
                const pct = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{item.value.toFixed(2)} kg ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.2 }}
                        style={{ height: '100%', borderRadius: 99, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={() => { setResult(null); setCurrentStep(0); setForm(defaultForm); }}
              className="btn-outline" style={{ flex: 1, padding: '14px', fontSize: '0.9375rem', fontWeight: 600 }}>
              Recalculate
            </button>
            <a href="/ai" className="btn-primary" style={{ flex: 1, padding: '14px', fontSize: '0.9375rem', fontWeight: 600, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Get AI Tips 🤖
            </a>
          </div>

        </div>
      </DashboardLayout>
    );
  }

  /* ── Calculator Steps ── */
  const step = steps[currentStep];
  const totalSteps = steps.length;
  const progressPct = ((currentStep + 1) / totalSteps) * 100;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Header */}
        <div>
          <h1 className="page-title">Carbon Calculator</h1>
          <p className="page-subtitle">Track your daily emissions across all categories</p>
        </div>

        {/* Progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span style={{ color: 'var(--primary)' }}>{Math.round(progressPct)}% complete</span>
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }}
              style={{ height: '100%', background: 'linear-gradient(90deg,#22C55E,#16A34A)', borderRadius: 99 }} />
          </div>
        </div>

        {/* Step tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {steps.map((s, i) => (
            <button key={s.key} onClick={() => setCurrentStep(i)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, fontSize: '0.8125rem', fontWeight: 600, flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                background: i === currentStep ? 'rgba(34,197,94,0.08)' : i < currentStep ? 'rgba(34,197,94,0.06)' : 'transparent',
                color: i === currentStep ? 'var(--primary-dark)' : i < currentStep ? 'var(--primary)' : 'var(--text-muted)',
                outline: i === currentStep ? '1.5px solid rgba(34,197,94,0.3)' : 'none',
              }}>
              <s.icon style={{ width: 14, height: 14 }} />
              {s.label}
              {i < currentStep && <Check style={{ width: 12, height: 12 }} />}
            </button>
          ))}
        </div>

        {/* Step content card */}
        <AnimatePresence mode="wait">
          <motion.div key={currentStep}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            className="glass-card" style={{ borderRadius: 20, padding: '32px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${step.color}18`, flexShrink: 0 }}>
                <step.icon style={{ width: 26, height: 26, color: step.color }} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--text)' }}>{step.label}</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 3 }}>{step.desc}</p>
              </div>
            </div>
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}
            className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 24px', fontSize: '0.9rem', opacity: currentStep === 0 ? 0.4 : 1 }}>
            <ChevronLeft style={{ width: 17, height: 17 }} /> Back
          </button>
          {currentStep < steps.length - 1 ? (
            <button onClick={() => setCurrentStep(currentStep + 1)}
              className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', fontSize: '0.9375rem' }}>
              Next: {steps[currentStep + 1].label} <ChevronRight style={{ width: 17, height: 17 }} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', fontSize: '0.9375rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', display: 'inline-block' }} /> : <><BarChart3 style={{ width: 17, height: 17 }} /> Calculate Results</>}
            </button>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
