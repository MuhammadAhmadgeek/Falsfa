import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Printer, FileText, CalendarDays, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a28CFE', '#ff6b6b']

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('academic')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({ academic: null, attendance: null, finance: null })

  useEffect(() => {
    fetchData(activeTab)
  }, [activeTab])

  const fetchData = async (tab) => {
    if (data[tab]) return // Already loaded
    setLoading(true)
    try {
      const res = await api.get(`/reports/${tab}`)
      if (res.data.success) {
        setData(prev => ({ ...prev, [tab]: res.data.data }))
      }
    } catch (error) {
      console.error(`Failed to load ${tab} report`, error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Reports & Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Advanced multi-dimensional reporting</p>
        </div>
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" /> Export / Print
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="print:block">
        <TabsList className="print:hidden">
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        <div className="mt-6 print:mt-0">
          {loading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              {/* ACADEMIC TAB */}
              <TabsContent value="academic" className="space-y-6 print:block">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Subject Averages</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.academic?.subjectAverages || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="_id" />
                          <YAxis />
                          <ReTooltip />
                          <Bar dataKey="avgPercentage" fill="#3b82f6" name="Avg %" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader><CardTitle className="text-base">Grade Distribution</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={data.academic?.gradeDistribution || []}
                            dataKey="count"
                            nameKey="gradeBand"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {(data.academic?.gradeDistribution || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ReTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Top Performers</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead className="text-right">Avg %</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                          {(data.academic?.topStudents || []).map(s => (
                            <TableRow key={s.rollNo}>
                              <TableCell className="font-medium">{s.name}</TableCell>
                              <TableCell>{s.class}</TableCell>
                              <TableCell className="text-right font-bold text-emerald-600">{s.avgPercentage}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">At-Risk Students (&lt;60%)</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead className="text-right">Avg %</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                          {(data.academic?.atRiskStudents || []).map(s => (
                            <TableRow key={s.rollNo}>
                              <TableCell className="font-medium">{s.name}</TableCell>
                              <TableCell>{s.class}</TableCell>
                              <TableCell className="text-right font-bold text-red-600">{s.avgPercentage}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ATTENDANCE TAB */}
              <TabsContent value="attendance" className="space-y-6 print:block">
                 <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Class-wise Attendance</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.attendance?.classSummary || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="_id" />
                          <YAxis />
                          <ReTooltip />
                          <Bar dataKey="avgAttendancePct" fill="#10b981" name="Attendance %" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader><CardTitle className="text-base">At-Risk Students (&lt;75% Attendance)</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead className="text-right">Att %</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                          {(data.attendance?.atRiskStudents || []).map(s => (
                            <TableRow key={s.rollNo}>
                              <TableCell className="font-medium">{s.name}</TableCell>
                              <TableCell>{s.class}</TableCell>
                              <TableCell className="text-right font-bold text-red-600">{s.attendancePct}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* FINANCE TAB */}
              <TabsContent value="finance" className="space-y-6 print:block">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Monthly Collection Trend</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.finance?.monthlyTrend || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="_id" />
                          <YAxis />
                          <ReTooltip />
                          <Line type="monotone" dataKey="collectionRate" stroke="#8b5cf6" name="Collection Rate %" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader><CardTitle className="text-base">Class-wise Defaulters</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow><TableHead>Class</TableHead><TableHead className="text-center">Defaulters</TableHead><TableHead className="text-right">Outstanding</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                          {(data.finance?.classWiseDefaulters || []).map(c => (
                            <TableRow key={c._id}>
                              <TableCell className="font-medium">{c._id}</TableCell>
                              <TableCell className="text-center">{c.defaulterCount}</TableCell>
                              <TableCell className="text-right font-bold text-red-600">{formatCurrency(c.outstandingAmount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader><CardTitle className="text-base">Top 10 Defaulters</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead className="text-right">Total Owed</TableHead></TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data.finance?.topDefaulters || []).map(d => (
                          <TableRow key={d._id}>
                            <TableCell className="font-medium">{d.studentName}</TableCell>
                            <TableCell>{d.class}</TableCell>
                            <TableCell className="text-right font-bold text-red-600">{formatCurrency(d.totalOwed)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  )
}
