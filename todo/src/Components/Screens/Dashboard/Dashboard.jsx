import React, { useState, useEffect } from "react"
import "./Dashboard.css"

import {LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
} from "recharts"

import { api } from "../../../api/axiosInstance"
import { toast } from 'sonner'
import { BarChart3, TrendingUp, CheckCircle2, AlertCircle, Star, Calendar } from "lucide-react"

import { useTheme } from "../../../Context/ThemeContext"


export default function Dashboard() {

    const [stats, setStats] = useState([
        { label: "Total Tasks", value: 0, icon: BarChart3, styleClass: "total", id: "total" },
        { label: "Completed", value: 0, icon: CheckCircle2, styleClass: "completed", id: "completed" },
        { label: "Pending", value: 0, icon: AlertCircle, styleClass: "pending", id: "pending" },
        { label: "High Priority", value: 0, icon: TrendingUp, styleClass: "high-priority", id: "highPriority" },
        { label: "Starred", value: 0, icon: Star, styleClass: "star", id: "starred" },
        { label: "Today's Tasks", value: 0, icon: Calendar, styleClass: "today", id: "today" },
    ])

    const [statLoading, setStatLoading] = useState(false)

    const [taskOverview, setTaskOverview] = useState([])

    const [trendData, setTrendData] = useState([])

    const [deadlineInsights, setDeadlineInsights] = useState({})

    const { isDarkMode } = useTheme()

    useEffect(() => {
        const fetchAllStats = async () => {
            setStatLoading(true)

            let hasError = false
            let errorMessage = "Failed to load dashboard data"

            const [statsResponse, trendResponse, deadlineInsightsResponse] =
                await Promise.allSettled([
                    api.get(`dashboard/stats`),
                    api.get(`dashboard/trend`),
                    api.get(`dashboard/deadline-insights`)
                ])

            if (statsResponse.status === "fulfilled") {
                const response = statsResponse.value

                const findStats = {
                    total: response.data.totalTasks,
                    completed: response.data.completedTasks,
                    pending: response.data.pendingTasks,
                    highPriority: response.data.highPriorityTasks,
                    starred: response.data.starredTasks,
                    today: response.data.dueTodayTasks,
                }

                const newStats = stats.map((stat) => {
                    stat.value = findStats[stat.id]
                    return stat
                })
                setStats(newStats)

                const taskOverviews = [
                    {
                        name: "Completed",
                        value: response.data.completedTasks,
                        color: "#4CAF50",
                    },
                    {
                        name: "Pending",
                        value: response.data.pendingTasks,
                        color: "#FFC470",
                    },
                ]
                setTaskOverview(taskOverviews)

                setStatLoading(false)

            } else {
                hasError = true
                errorMessage = statsResponse.reason?.message || errorMessage
            }

            if (trendResponse.status === "fulfilled") {
                const response = trendResponse.value
                setTrendData(response.data.trend)
            } else {
                hasError = true
            }

            if (deadlineInsightsResponse.status === "fulfilled") {
                const response = deadlineInsightsResponse.value
                
                const {overdue, thisWeek, later} = response.data.insights   

                const insights = [
                    { name: "Overdue", value: overdue, fill: "#DD5746" },
                    { name: "This Week", value: thisWeek, fill: "#FFC470" },
                    { name: "Later", value: later, fill: "#4CAF50" },
                ]    
                setDeadlineInsights(insights)
                
            } else {
                hasError = true
            }

            if (hasError) {
                toast.error("Some dashboard data failed to load. Please check your network and try later!")
            }

        }

        fetchAllStats()
    }, [])

    const chartColors = {
        line: isDarkMode ? "#5a9fff" : "#287fe5",
        grid: isDarkMode ? "#2a3a52" : "#e0e0e0",
        text: isDarkMode ? "#a0a8b8" : "#666",
        tooltip: isDarkMode ? "#1a2332" : "#fff",
    }

    
    return (
        <div className={`dashboard ${isDarkMode ? "dark" : ""}`}>
            <h2 className='dashboard-title'>
                <hr></hr>
                <div>
                    <span>Task</span> Dashboard
                </div>
            </h2>

            <div className='stats-grid'>
                {!statLoading && stats.length > 0
                    ? stats.map((stat) => (
                          <div className={`stat-card ${stat.styleClass}`}>
                              <div className='stat-icon'>
                                  <stat.icon size={32} />
                              </div>
                              <div className='stat-content'>
                                  <p className='stat-label'>{stat.label}</p>
                                  <p className='stat-value'>{stat.value}</p>
                              </div>
                          </div>
                      ))
                    : [...Array(5)].map((_, index) => (
                          <div className={`skeleton-loader stat-card total`}>
                              <div className='stat-icon'>
                                  <BarChart size={32} />
                              </div>
                              <div className='stat-content'>
                                  <p className='stat-label'></p>
                                  <p className='stat-value'></p>
                              </div>
                          </div>
                      ))}
            </div>

            <div className='charts-container'>
                <div className='chart-card'>
                    <h3 className='chart-title'>
                        <TrendingUp size={20} />
                        Productivity Trend (7 Days)
                    </h3>
                    {trendData && trendData.length > 0 ? (
                        <ResponsiveContainer width='100%' height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray='3 3' stroke={chartColors.grid} fontSize={13} />
                                <XAxis dataKey='day' stroke={chartColors.text} fontSize={13} />
                                <YAxis stroke={chartColors.text} fontSize={13} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: chartColors.tooltip,
                                        border: `1px solid ${chartColors.grid}`,
                                        borderRadius: "8px",
                                        color: isDarkMode ? "#e0e0e0" : "#333",
                                        fontSize: "13px",
                                    }}
                                />
                                <Line
                                    type='monotone'
                                    dataKey='rate'
                                    stroke={chartColors.line}
                                    strokeWidth={3}
                                    dot={{ fill: chartColors.line, r: 5 }}
                                    activeDot={{ r: 7 }}
                                    name='Completion Rate (%)'
                                />
                                <Legend
                                    wrapperStyle={{ color: chartColors.text }}
                                    formatter={(value, entry, index) => (
                                        <span style={{ fontSize: "13px", color: "#333" }}>{value}</span>
                                    )}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='skeleton-loader' style={{ width: "100%", height: "80%" }} />
                    )}
                </div>

                <div className='chart-card'>
                    <h3 className='chart-title'>Task Overview</h3>
                    {!statLoading  
                        ? stats && stats.find(stat=> stat.id === 'total' && stat.value === 0) 
                        ?    <div className="message"> You haven't created any task! </div>
                        :(
                        <ResponsiveContainer width='100%' height={300}>
                            <PieChart>
                                <Pie
                                    data={taskOverview}
                                    cx='50%'
                                    cy='50%'
                                    labelLine={false}
                                    label={({ name, value, percent }) =>
                                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                                    }
                                    outerRadius={100}
                                    fill='#8884d8'
                                    dataKey='value'>
                                    {taskOverview.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} fontSize={13} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: chartColors.tooltip,
                                        border: `1px solid ${chartColors.grid}`,
                                        borderRadius: "8px",
                                        color: "#333",
                                        fontSize: "13px",
                                        color: isDarkMode ? "#e0e0e0" : "#333",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='skeleton-loader' style={{ width: "100%", height: "80%" }} />
                    )}
                </div>

                <div className='chart-card full-width'>
                    <h3 className='chart-title'>
                        <Calendar size={20} />
                        Deadline Management Insights
                    </h3>
                    {deadlineInsights && Object.keys(deadlineInsights).length > 0 ? (
                        <ResponsiveContainer width='100%' height={300}>
                            <BarChart
                                data={[
                                    {
                                        name: "Status",
                                        ...Object.fromEntries(deadlineInsights.map((c) => [c.name, c.value])),
                                    },
                                ]}>
                                <CartesianGrid strokeDasharray='3 3' stroke={chartColors.grid} fontSize={13} />
                                <XAxis dataKey='name' stroke={chartColors.text} fontSize={13} />
                                <YAxis stroke={chartColors.text} fontSize={13} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: chartColors.tooltip,
                                        border: `1px solid ${chartColors.grid}`,
                                        borderRadius: "8px",
                                        color: isDarkMode ? "#e0e0e0" : "#333",
                                        fontSize: "13px",
                                    }}
                                />
                                {deadlineInsights.map((item, index) => (
                                    <Bar key={index} dataKey={item.name} fill={item.fill} stackId='a' fontSize={13} />
                                ))}
                                <Legend
                                    formatter={(value, entry, index) => (
                                        <span style={{ fontSize: "13px", color: "#333" }}>{value}</span>
                                    )}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className='skeleton-loader' style={{ width: "100%", height: "80%" }} />
                    )}
                </div>
            </div>
        </div>
    )
}

