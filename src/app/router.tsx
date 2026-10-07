import { lazy, Suspense, useLayoutEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { CatalogLayout } from '@/components/layout/CatalogLayout'
import { PageFallback } from '@/components/layout/PageFallback'
import { ProtectedAdminLayout } from '@/layouts/AdminLayout'
import { LocalAdminGate } from '@/admin/AdminGuard'

const PlayHubPage = lazy(() => import('@/pages/PlayHubPage'))
const PrintableDetailPage = lazy(() => import('@/pages/PrintableDetailPage'))
const CategoryPage = lazy(() => import('@/pages/CategoryPage'))
const SituationPage = lazy(() => import('@/pages/SituationPage'))
const PlayRecipeDetailPage = lazy(() => import('@/pages/PlayRecipeDetailPage'))
const ParentingTipsPage = lazy(() => import('@/pages/ParentingTipsPage'))
const ParentingTipDetailPage = lazy(() => import('@/pages/ParentingTipDetailPage'))
const BookmarksPage = lazy(() => import('@/pages/BookmarksPage').then((module) => ({ default: module.BookmarksPage })))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const FaqPage = lazy(() => import('@/pages/FaqPage'))
const CopyrightReportPage = lazy(() => import('@/pages/CopyrightReportPage'))
const PremiumPage = lazy(() => import('@/pages/LegalPages').then((module) => ({ default: module.PremiumPage })))
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminPrintablesPage = lazy(() => import('@/pages/admin/AdminPrintablesPage'))
const AdminUploadPage = lazy(() => import('@/pages/admin/AdminUploadPage'))
const AdminTipsPage = lazy(() => import('@/pages/admin/AdminTipsPage'))
const AdminCopyrightReportsPage = lazy(() => import('@/pages/admin/AdminCopyrightReportsPage'))
const AdminGeneralInquiriesPage = lazy(() => import('@/pages/admin/AdminGeneralInquiriesPage'))

function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<PlayHubPage />} />
            <Route path="/v2" element={<PlayHubPage />} />
            <Route path="/printable/:id" element={<PrintableDetailPage />} />
            <Route path="/printables/:id" element={<PrintableDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/report" element={<CopyrightReportPage />} />
            <Route path="/premium" element={<PremiumPage />} />
            <Route element={<CatalogLayout />}>
              <Route path="/category" element={<CategoryPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/situation/:situationId" element={<SituationPage />} />
              <Route path="/situation/:situationId/:recipeId" element={<PlayRecipeDetailPage />} />
              <Route path="/parenting-tips" element={<ParentingTipsPage />} />
              <Route path="/parenting-tips/:slug" element={<ParentingTipDetailPage />} />
              <Route path="/tips" element={<Navigate to="/parenting-tips" replace />} />
              <Route path="/tips/:slug" element={<ParentingTipDetailPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/saved" element={<Navigate to="/bookmarks" replace />} />
            </Route>
          </Route>
          <Route element={<LocalAdminGate />}>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<ProtectedAdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/printables" element={<AdminPrintablesPage />} />
              <Route path="/admin/printables/upload" element={<AdminUploadPage />} />
              <Route path="/admin/tips" element={<AdminTipsPage />} />
              <Route path="/admin/reports" element={<AdminCopyrightReportsPage />} />
              <Route path="/admin/inquiries" element={<AdminGeneralInquiriesPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
