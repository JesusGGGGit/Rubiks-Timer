// Estadisticas.js
import React from 'react';
import { useSessions } from '../../Hooks/useSessions';
import { calculateStats } from '../../utils/calculateStats';
import { formatTimeDisplay, formatTimeFull } from '../../utils/formatUtils';
import { getSortedTimes } from '../../utils/sorting';
import { getStdDevColor } from '../../utils/Descriptions';
import { Link } from 'react-router-dom';
import { useTheme } from '../../Hooks/useTheme';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Sector
} from 'recharts';
import styles from './Estadisticas.module.css';

const Estadisticas = () => {
  const { sessions, activeSession, activeSessionId, switchSession } = useSessions();
  const { textColor, bgColor } = useTheme();
  const stats = calculateStats(activeSession?.times || [], activeSession?.plusTwoTimes || [], activeSession?.dnfTimes || []);

  const sessionData = sessions.map(session => ({
    name: session.name,
    solves: session.times.length,
    best: calculateStats(session.times, session.plusTwoTimes, session.dnfTimes).bestTime,
    avg: calculateStats(session.times, session.plusTwoTimes, session.dnfTimes).overallAverage
  }));

  const timeDistributionData = () => {
    if (!stats.numericTimes || stats.numericTimes.length === 0) return [];

    const maxTime = Math.max(...stats.numericTimes);
    const minTime = Math.min(...stats.numericTimes);
    const range = maxTime - minTime;
    const step = range / 5;

    const buckets = [];
    for (let i = 0; i < 5; i++) {
      const lower = minTime + (i * step);
      const upper = minTime + ((i + 1) * step);
      const count = stats.numericTimes.filter(t => t >= lower && t < upper).length;

      buckets.push({
        name: `${formatTimeDisplay(lower)} - ${formatTimeDisplay(upper)}`,
        count
      });
    }

    return buckets;
  };

  const progressionData = () => {
    if (!activeSession?.times || activeSession.times.length === 0) return [];

    return activeSession.times.map((time, index) => ({
      solve: index + 1,
      time: activeSession.dnfTimes.includes(index) ? null :
        (activeSession.plusTwoTimes.includes(index) ? time.time + 2000 : time.time),
      isDNF: activeSession.dnfTimes.includes(index),
      isPlusTwo: activeSession.plusTwoTimes.includes(index)
    })).filter(item => item.time !== null);
  };

  const aoProgressionData = () => {
    if (!activeSession?.times || activeSession.times.length < 5) return [];

    const data = [];
    for (let i = 4; i < activeSession.times.length; i++) {
      const slice = activeSession.times.slice(i - 4, i + 1);
      const dnfCount = slice.filter((_, idx) =>
        activeSession.dnfTimes.includes(i - 4 + idx)).length;

      if (dnfCount > 1) continue;

      const times = slice.map((t, idx) => {
        const globalIdx = i - 4 + idx;
        if (activeSession.dnfTimes.includes(globalIdx)) return Infinity;
        if (activeSession.plusTwoTimes.includes(globalIdx)) return t.time + 2000;
        return t.time;
      }).filter(t => t !== Infinity);

      if (times.length < 3) continue;

      const sorted = [...times].sort((a, b) => a - b);
      const trimmed = sorted.slice(1, -1);
      const avg = trimmed.reduce((sum, t) => sum + t, 0) / trimmed.length;

      data.push({
        solve: i + 1,
        ao5: avg,
        isDNF: dnfCount === 1
      });
    }

    return data;
  };

  const bestWorstComparison = () => {
    if (!stats.bestTime || !stats.worstTime) return null;

    return [
      { name: 'Mejor', time: stats.bestTime },
      { name: 'Promedio', time: stats.overallAverage },
      { name: 'Peor', time: stats.worstTime }
    ];
  };

  const successRateData = [
    { name: 'Éxitos', value: stats.totalSolves - stats.totalDnfs, color: '#4CAF50' },
    { name: 'DNFs', value: stats.totalDnfs, color: '#F44336' },
    { name: '+2', value: activeSession?.plusTwoTimes?.length || 0, color: '#FFC107' }
  ];

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

    return (
      <g>
        <text x={cx} y={cy} dy={-10} textAnchor="middle" fill={textColor}>
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={10} textAnchor="middle" fill={textColor}>
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className={styles.estadisticasWrapper}>
      <div className={styles.estadisticasContainer}>


        <div className={styles.sessionSelector}>
          <h2>Sesión actual: {activeSession?.name}</h2>
          <select 
            value={activeSessionId} 
            onChange={(e) => switchSession(e.target.value)}
            className={styles.sessionSelect}
          >
            {sessions.map(session => (
              <option key={session.id} value={session.id}>{session.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.statsGrid}>
          <div className={`${styles.statsCard} ${styles.quickSummary}`}>
            <h3>Resumen Rápido</h3>
            <div className={styles.quickStats}>
              <div className={styles.quickStat}>
                <span className={styles.statLabel}>Mejor tiempo:</span>
                <span className={styles.statValue}>{stats.bestTime ? formatTimeDisplay(stats.bestTime) : '--'}</span>
              </div>
              <div className={styles.quickStat}>
                <span className={styles.statLabel}>Promedio:</span>
                <span className={styles.statValue}>{stats.overallAverage ? formatTimeDisplay(stats.overallAverage) : '--'}</span>
              </div>
              <div className={styles.quickStat}>
                <span className={styles.statLabel}>Solves:</span>
                <span className={styles.statValue}>{stats.totalSolves}</span>
              </div>
              <div className={styles.quickStat}>
                <span className={styles.statLabel}>DNFs:</span>
                <span className={styles.statValue}>{stats.totalDnfs} ({stats.dnfRate}%)</span>
              </div>
              <div className={styles.quickStat}>
                <span className={styles.statLabel}>+2:</span>
                <span className={styles.statValue}>{activeSession?.plusTwoTimes?.length || 0} ({stats.plusTwoRate}%)</span>
              </div>
              <div className={styles.quickStat}>
                <span className={styles.statLabel}>Desviación estándar:</span>
                <span className={styles.statValue} style={{ color: getStdDevColor(stats.stdDev) }}>
                  {stats.stdDev ? formatTimeDisplay(stats.stdDev) : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Gráficas */}
          <div className={styles.statsCard}>
            <h3>Progresión de Tiempos</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressionData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="solve" />
                  <YAxis tickFormatter={formatTimeDisplay} />
                  <Tooltip formatter={(value) => [formatTimeDisplay(value), "Tiempo"]} labelFormatter={(value) => `Solve #${value}`} />
                  <Line type="monotone" dataKey="time" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.statsCard}>
            <h3>Distribución de Tiempos</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeDistributionData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.statsCard}>
            <h3>Comparación</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bestWorstComparison()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatTimeDisplay} />
                  <Tooltip formatter={(value) => [formatTimeDisplay(value), "Tiempo"]} />
                  <Bar dataKey="time">
                    {bestWorstComparison()?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        index === 0 ? '#4CAF50' :
                          index === 1 ? '#2196F3' : '#F44336'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.statsCard}>
            <h3>Progresión de AO5</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={aoProgressionData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="solve" />
                  <YAxis tickFormatter={formatTimeDisplay} />
                  <Tooltip formatter={(value) => [formatTimeDisplay(value), "AO5"]} labelFormatter={(value) => `Solve #${value}`} />
                  <Line type="monotone" dataKey="ao5" stroke="#FF9800" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.statsCard}>
            <h3>Éxitos vs Fallos</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    activeIndex={0}
                    activeShape={renderActiveShape}
                    data={successRateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {successRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value, name, props) => [
                    `${value} (${(props.payload.percent * 100).toFixed(1)}%)`,
                    name
                  ]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.statsCard}>
            <h3>Comparación entre Sesiones</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sessionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" tickFormatter={formatTimeDisplay} />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) =>
                    name === 'avg' || name === 'best' ?
                      [formatTimeDisplay(value), name === 'avg' ? 'Promedio' : 'Mejor'] :
                      [value, 'Solves']
                  } />
                  <Legend />
                  <Bar yAxisId="right" dataKey="solves" fill="#9E9E9E" name="Solves" />
                  <Bar yAxisId="left" dataKey="best" fill="#4CAF50" name="Mejor" />
                  <Bar yAxisId="left" dataKey="avg" fill="#2196F3" name="Promedio" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${styles.statsCard} ${styles.detailedStats}`}>
            <h3>Estadísticas Detalladas</h3>
            <div className={styles.detailedStatsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Mejor AO5:</span>
                <span className={styles.statValue}>{stats.bestAo5 ? formatTimeDisplay(stats.bestAo5) : '--'}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Peor AO5:</span>
                <span className={styles.statValue}>{stats.worstAo5 ? formatTimeDisplay(stats.worstAo5) : '--'}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Mejor AO12:</span>
                <span className={styles.statValue}>{stats.bestAo12 ? formatTimeDisplay(stats.bestAo12) : '--'}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Peor AO12:</span>
                <span className={styles.statValue}>{stats.worstAo12 ? formatTimeDisplay(stats.worstAo12) : '--'}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Sub-10:</span>
                <span className={styles.statValue}>{stats.countSub10}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Sub-15:</span>
                <span className={styles.statValue}>{stats.countSub15}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Sub-20:</span>
                <span className={styles.statValue}>{stats.countSub20}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Mediana:</span>
                <span className={styles.statValue}>{stats.median ? formatTimeDisplay(stats.median) : '--'}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Promedio últimos 50:</span>
                <span className={styles.statValue}>{stats.meanOfLast50 ? formatTimeDisplay(stats.meanOfLast50) : '--'}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Promedio últimos 100:</span>
                <span className={styles.statValue}>{stats.meanOfLast100 ? formatTimeDisplay(stats.meanOfLast100) : '--'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;
