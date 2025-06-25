import React, { useState, useEffect } from 'react';
import { useSessions } from '../Hooks/useSessions';
import { formatTimeFull } from '../utils/formatUtils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Legend,
} from 'recharts';
import { Timer, TrendingUp, Trophy, Flame, AlertTriangle, CheckCircle } from 'lucide-react';
import styles from './Estadisticas.module.css';
import { calculateStats } from '../utils/calculateStats';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function SessionStatsAdvanced() {
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    activeSession,
  } = useSessions();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (activeSession) {
      const { times = [], plusTwoTimes = [], dnfTimes = [] } = activeSession;
      const stats = calculateStats(times, plusTwoTimes, dnfTimes);
      setStats(stats);
    }
  }, [activeSession]);

  const handleSessionChange = (e) => {
    setActiveSessionId(e.target.value);
  };

  if (!activeSession) return <p>No hay sesión activa</p>;
  if (!stats) return <p>Cargando estadísticas...</p>;

  // Datos para gráficos
  const histogramData = stats.numericTimes?.slice(-50).map((t, i) => ({
    name: `#${i + 1}`,
    tiempo: t / 1000,
  })) || [];

  const ao5LineData = stats.ao5s?.map((ao5, i) => ({
    name: `#${i + 1}`,
    Ao5: ao5 / 1000,
  })) || [];

  const ao12LineData = stats.ao12s?.map((ao12, i) => ({
    name: `#${i + 1}`,
    Ao12: ao12 / 1000,
  })) || [];

  const validCount = stats.totalSolves - stats.totalDnfs - stats.totalPlusTwo;
  const pieData = [
    { name: 'Válidos', value: validCount },
    { name: '+2', value: stats.totalPlusTwo },
    { name: 'DNF', value: stats.totalDnfs },
  ];

  const bestTimeProgression = stats.numericTimes?.map((t, i) => {
    const bestUpToNow = Math.min(...stats.numericTimes.slice(0, i + 1));
    return {
      name: `#${i + 1}`,
      mejorTiempo: bestUpToNow / 1000,
    };
  }) || [];

  const radarData = [
    { metric: 'Consistencia', value: stats.consistencyIndex ?? 0 },
    { metric: 'Desviación estándar', value: stats.stdDev ? 1 / (stats.stdDev + 1) : 0 },
    { metric: 'Tasa éxito', value: (stats.successRate ?? 0) / 100 },
    { metric: 'Tasa DNF', value: 1 - ((stats.dnfRate ?? 0) / 100) },
    { metric: 'Tasa +2', value: 1 - ((stats.plusTwoRate ?? 0) / 100) },
  ];

  // Datos para nuevos gráficos
  const timeDistributionData = Object.entries(stats.distributionStats.timeDistribution)
    .map(([bin, count]) => ({
      bin: parseInt(bin) / 1000,
      count
    }))
    .sort((a, b) => a.bin - b.bin);

  const timeOfDayData = stats.timeStats.timeOfDayDistribution;

  return (
    <div className={styles['stats-container']}>
      <h2 className={styles['stats-title']}>📊 Estadísticas Avanzadas</h2>

      <label className={styles['stats-select-label']}>
        Seleccionar sesión:
        <select
          value={activeSessionId}
          onChange={handleSessionChange}
          className={styles['stats-select']}
        >
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {`${session.name} (${session.cubeType || '3x3'}) • ${session.times.length}`}
            </option>
          ))}
        </select>
      </label>

      <div className={styles['stats-grid']}>
        {/* Estadísticas básicas */}
        <StatCard icon={<Trophy />} label="Mejor tiempo" value={formatTimeFull(stats.bestTime)} />
        <StatCard icon={<Timer />} label="Peor tiempo" value={formatTimeFull(stats.worstTime)} />
        <StatCard icon={<TrendingUp />} label="Promedio general" value={formatTimeFull(stats.overallAverage)} />
        <StatCard icon={<CheckCircle />} label="Mediana" value={formatTimeFull(stats.median)} />

        {/* Estadísticas de distribución */}
        <StatCard label="Asimetría (skewness)" value={stats.distributionStats.skewness?.toFixed(3)} />
        <StatCard label="Curtosis" value={stats.distributionStats.kurtosis?.toFixed(3)} />
        <StatCard label="Moda" value={stats.distributionStats.mode ? formatTimeFull(stats.distributionStats.mode) : 'N/A'} />
        <StatCard label="Rango intercuartílico" value={stats.distributionStats.iqr ? formatTimeFull(stats.distributionStats.iqr) : 'N/A'} />

        {/* Averages */}
        <StatCard label="Ao5" value={formatTimeFull(stats.ao5)} />
        <StatCard label="Ao12" value={formatTimeFull(stats.ao12)} />
        <StatCard label="Ao50" value={formatTimeFull(stats.ao50)} />
        <StatCard label="Ao100" value={formatTimeFull(stats.ao100)} />
        <StatCard label="Mo3" value={formatTimeFull(stats.mo3)} />

        {/* Best/Worst Averages */}
        <StatCard label="Mejor Ao5" value={formatTimeFull(stats.bestAo5)} />
        <StatCard label="Peor Ao5" value={formatTimeFull(stats.worstAo5)} />
        <StatCard label="Mejor Ao12" value={formatTimeFull(stats.bestAo12)} />
        <StatCard label="Peor Ao12" value={formatTimeFull(stats.worstAo12)} />

        {/* Estadísticas de consistencia */}
        <StatCard label="Coef. Variación" value={stats.advancedConsistency.coefficientOfVariation?.toFixed(1) + '%'} />
        <StatCard label="Dentro de 1σ" value={stats.advancedConsistency.within1StdDev?.toFixed(1) + '%'} />
        <StatCard label="Consistencia percentil" value={stats.advancedConsistency.percentileConsistency?.toFixed(3)} />

        {/* Cantidad y tasas */}
        <StatCard icon={<AlertTriangle />} label="DNFs" value={stats.totalDnfs} />
        <StatCard label="+2" value={stats.totalPlusTwo} />
        <StatCard label="Tasa de éxito" value={`${stats.successRate}%`} />
        <StatCard label="Tasa de DNF" value={`${stats.dnfRate}%`} />

        {/* Estadísticas de dispersión */}
        <StatCard label="Desviación estándar" value={stats.stdDev ? stats.stdDev.toFixed(0) + ' ms' : 'N/A'} />
        <StatCard label="Índice de consistencia" value={stats.consistencyIndex?.toFixed(3)} />

        {/* Contadores de rangos de tiempo */}
        <StatCard label="Sub 10s" value={stats.countSub10} />
        <StatCard label="Sub 15s" value={stats.countSub15} />
        <StatCard label="Sub 20s" value={stats.countSub20} />

        {/* Estadísticas de tendencia */}
        <StatCard label="Tendencia (ms/solve)" value={stats.trendStats.linearTrend?.slope?.toFixed(3)} />
        <StatCard label="R² de tendencia" value={stats.trendStats.linearTrend?.rSquared?.toFixed(3)} />
        <StatCard label="Mejora relativa" value={stats.trendStats.relativeImprovement?.relative?.toFixed(1) + '%'} />

        {/* Estadísticas de PB */}
        <StatCard label="Total PBs" value={stats.pbStats.totalPBs} />
        <StatCard label="Frecuencia PBs" value={stats.pbStats.pbFrequency?.average?.toFixed(1) + ' solves'} />
        <StatCard label="Mejora media PB" value={stats.pbStats.pbImprovementRates?.average?.toFixed(1) + '%'} />

        {/* Más estadísticas */}
        <StatCard label="Tiempo total" value={formatTimeFull(stats.totalTime)} />
        <StatCard icon={<Flame />} label="Mejor racha sin DNF" value={stats.bestNonDNFStreak} />
        <StatCard label="Outliers" value={stats.distributionStats.outlierCount} />
      </div>

      {/* Gráficos principales */}
      <div className={styles['charts-grid']}>
        <div className={styles['chart-card']}>
          <h3>Últimos 50 tiempos (s)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={histogramData}>
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tiempo" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles['chart-card']}>
          <h3>Evolución Ao5 y Ao12 (s)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart>
              <XAxis dataKey="name" data={ao5LineData} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Ao5" data={ao5LineData} stroke="#8884d8" dot={false} />
              <Line type="monotone" dataKey="Ao12" data={ao12LineData} stroke="#82ca9d" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles['chart-card']}>
          <h3>Proporción DNFs / +2 / Válidos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles['chart-card']}>
          <h3>Progresión del mejor tiempo (s)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={bestTimeProgression}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="mejorTiempo" stroke="#ff7300" fill="#ff7300" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles['chart-card']}>
          <h3>Métricas clave comparadas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={30} domain={[0, 1]} />
              <Radar name="Métricas" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Nuevos gráficos */}
        <div className={styles['chart-card']}>
          <h3>Distribución de tiempos (s)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeDistributionData}>
              <XAxis dataKey="bin" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles['chart-card']}>
          <h3>Actividad por hora del día</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeOfDayData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className={styles['stat-card']}>
      {icon && <div className={styles['stat-icon']}>{icon}</div>}
      <div>
        <p className={styles['stat-label']}>{label}</p>
        <p className={styles['stat-value']}>{value ?? 'N/A'}</p>
      </div>
    </div>
  );
}
