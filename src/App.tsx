import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import { SessionProvider } from './context/SessionContext'
import { RequireAuth } from './components/RequireAuth'
import { AppShell } from './components/layout/AppShell'
import { AlertsPage } from './pages/AlertsPage'
import { CentreDetailPage } from './pages/CentreDetailPage'
import { CentresPage } from './pages/CentresPage'
import { ClientDetailPage } from './pages/ClientDetailPage'
import { ClientsPage } from './pages/ClientsPage'
import { DashboardPage } from './pages/DashboardPage'
import { DirectoryPage } from './pages/DirectoryPage'
import { EngagementDetailPage } from './pages/EngagementDetailPage'
import { EngagementsPage } from './pages/EngagementsPage'
import { FinancialsPage } from './pages/FinancialsPage'
import { LoginPage } from './pages/LoginPage'
import { PeoplePage } from './pages/PeoplePage'
import { RegisterPage } from './pages/RegisterPage'
import { ReportsPage } from './pages/ReportsPage'

export default function App() {
  return (
    <SessionProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/people" element={<PeoplePage />} />
                <Route path="/centres" element={<CentresPage />} />
                <Route path="/centres/:id" element={<CentreDetailPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/clients/:id" element={<ClientDetailPage />} />
                <Route path="/engagements" element={<EngagementsPage />} />
                <Route path="/engagements/:id" element={<EngagementDetailPage />} />
                <Route path="/directory" element={<DirectoryPage />} />
                <Route path="/financials" element={<FinancialsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </SessionProvider>
  )
}
