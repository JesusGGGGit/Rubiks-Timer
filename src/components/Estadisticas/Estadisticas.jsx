import React, { useState, useEffect } from 'react';
import { useSessions } from '../Hooks/useSessions';
import { calculateStats } from '../utils/calculateStats';
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

  // Datos para barras últimos 50 tiempos
  const histogramData = stats.numericTimes?.slice(-50).map((t, i) => ({
    name: `#${i + 1}`,
    tiempo: t / 1000,
  })) || [];

  // Datos para LineChart evolución Ao5 y Ao12
  const ao5LineData = stats.ao5s?.map((ao5, i) => ({
    name: `#${i + 1}`,
    Ao5: ao5 / 1000,
  })) || [];
  const ao12LineData = stats.ao12s?.map((ao12, i) => ({
    name: `#${i + 1}`,
    Ao12: ao12 / 1000,
  })) || [];

  // Datos para PieChart proporción DNFs, +2 y válidos
  const validCount = stats.totalSolves - stats.totalDnfs - stats.totalPlusTwo;
  const pieData = [
    { name: 'Válidos', value: validCount },
    { name: '+2', value: stats.totalPlusTwo },
    { name: 'DNF', value: stats.totalDnfs },
  ];

  // Datos para AreaChart mejor tiempo (asumiendo progreso a lo largo del tiempo)
  const bestTimeProgression = stats.numericTimes?.map((t, i) => {
    const bestUpToNow = Math.min(...stats.numericTimes.slice(0, i + 1));
    return {
      name: `#${i + 1}`,
      mejorTiempo: bestUpToNow / 1000,
    };
  }) || [];

  // Datos para RadarChart: comparativa métricas clave (normalizadas para radar)
  const radarData = [
    { metric: 'Consistencia', value: stats.consistencyIndex ?? 0 },
    { metric: 'Desviación estándar', value: stats.stdDev ? 1 / (stats.stdDev + 1) : 0 },
    { metric: 'Tasa éxito', value: (stats.successRate ?? 0) / 100 },
    { metric: 'Tasa DNF', value: 1 - ((stats.dnfRate ?? 0) / 100) },
    { metric: 'Tasa +2', value: 1 - ((stats.plusTwoRate ?? 0) / 100) },
  ];

  return (
    <div className={styles['stats-container']}>
      <h2 className={styles['stats-title']}>📊 Estadísticas de la sesión</h2>

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
        <StatCard label="Mejor Ao50" value={formatTimeFull(stats.bestAo50)} />
        <StatCard label="Peor Ao50" value={formatTimeFull(stats.worstAo50)} />
        <StatCard label="Mejor Ao100" value={formatTimeFull(stats.bestAo100)} />
        <StatCard label="Peor Ao100" value={formatTimeFull(stats.worstAo100)} />

        {/* Cantidad y tasas */}
        <StatCard icon={<AlertTriangle />} label="DNFs" value={stats.totalDnfs} />
        <StatCard label="+2" value={stats.totalPlusTwo} />
        <StatCard label="Tasa de éxito" value={`${stats.successRate}%`} />
        <StatCard label="Tasa de DNF" value={`${stats.dnfRate}%`} />
        <StatCard label="Tasa de +2" value={`${stats.plusTwoRate}%`} />

        {/* Estadísticas de dispersión */}
        <StatCard label="Desviación estándar" value={stats.stdDev ? stats.stdDev.toFixed(0) + ' ms' : 'N/A'} />
        <StatCard label="Índice de consistencia" value={stats.consistencyIndex?.toFixed(3)} />

        {/* Contadores de rangos de tiempo */}
        <StatCard label="Sub 10s" value={stats.countSub10} />
        <StatCard label="Sub 15s" value={stats.countSub15} />
        <StatCard label="Sub 20s" value={stats.countSub20} />
        <StatCard label="Sub 30s" value={stats.countSub30} />
        <StatCard label="Sobre 30s" value={stats.countOver30} />

        {/* Medias de últimos X solves */}
        <StatCard label="Media últimos 5" value={formatTimeFull(stats.meanOfLast5)} />
        <StatCard label="Media últimos 12" value={formatTimeFull(stats.meanOfLast12)} />
        <StatCard label="Media últimos 50" value={formatTimeFull(stats.meanOfLast50)} />
        <StatCard label="Media últimos 100" value={formatTimeFull(stats.meanOfLast100)} />

        {/* Información adicional */}
        <StatCard label="Tiempo total" value={formatTimeFull(stats.totalTime)} />
        <StatCard label="Rango de tiempos" value={formatTimeFull(stats.timeRange)} />
        <StatCard label="Total solves" value={stats.totalSolves} />
        <StatCard label="Tasa de mejora (%)" value={stats.improvementRate ? stats.improvementRate.toFixed(2) + '%' : 'N/A'} />

        {/* Rachas */}
        <StatCard icon={<Flame />} label="Mejor racha sin DNF" value={stats.bestNonDNFStreak} />
        <StatCard label="Peor racha DNF" value={stats.worstDNFStreak} />
        <StatCard label="Mejor racha de mejora" value={stats.bestImprovementStreak} />

        {/* Pbs */}
        <StatCard label="Total PBs" value={stats.totalPBs} />
        <StatCard label="Tiempo desde último PB (ms)" value={stats.timeSinceLastPB ? stats.timeSinceLastPB.toFixed(0) : 'N/A'} />

        {/* Más listas y datos */}
        <StatCard label="Número de tiempos registrados" value={stats.numericTimes.length} />

        {/* Opcional: mostrar el detalle de promedios móviles si quieres */}
        <StatCard label="Cantidad Ao5 calculados" value={stats.ao5s.length} />
        <StatCard label="Cantidad Ao12 calculados" value={stats.ao12s.length} />
        <StatCard label="Cantidad Ao50 calculados" value={stats.ao50s.length} />
        <StatCard label="Cantidad Ao100 calculados" value={stats.ao100s.length} />
      </div>

      {/* Gráficos */}
      <div className={styles['charts-grid']}>
        {/* BarChart últimos tiempos */}
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

        {/* LineChart evolución Ao5 y Ao12 */}
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

        {/* PieChart DNFs, +2 y válidos */}
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

        {/* AreaChart mejor tiempo progresivo */}
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

        {/* RadarChart métricas clave */}
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
