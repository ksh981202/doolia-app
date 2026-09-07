import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { CatalogLayout } from '@/components/layout/CatalogLayout'
import { PageFallback } from '@/components/layout/PageFallback'
import { ProtectedAdminLayout } from '@/layouts/AdminLayout'

const PlayHubPage = lazy(() => import('@/pages/PlayHubPage'))
const PrintableDetailPage = lazy(() => import('@/pages/PrintableDetailPage'))
const CategoryPage = lazy(() => import('@/pages/CategoryPage'))
const SituationPage = lazy(() => import('@/pages/SituationPage'))
const PlayRecipeDetailPage = lazy(() => import('@/pages/PlayRecipeDetailPage'))
const ParentingTipsPage = lazy(() => import('@/pages/ParentingTipsPage'))
const ParentingTipDetailPage = lazy(() => import('@/pages/ParentingTipDetailPage'))
const BookmarksPage = lazy(() => import('@/pages/BookmarksPage').then((module) => ({ default: module.BookmarksPage })))
const AboutPage = lazy(() => import('@/pages/LegalPages').then((module) => ({ default: module.AboutPage })))
const PrivacyPage = lazy(() => import('@/pages/LegalPages').then((module) => ({ default: module.PrivacyPage })))
const TermsPage = lazy(() => import('@/pages/LegalPages').then((module) => ({ default: module.TermsPage })))
const ContactPage = lazy(() => import('@/pages/LegalPages').then((module) => ({ default: module.ContactPage })))
const PremiumPage = lazy(() => import('@/pages/LegalPages').then((module) => ({ default: module.PremiumPage })))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminPrintablesPage = lazy(() => import('@/pages/admin/AdminPrintablesPage'))
const AdminUploadPage = lazy(() => import('@/pages/admin/AdminUploadPage'))
const AdminTipsPage = lazy(() => import('@/pages/admin/AdminTipsPage'))

export function AppRouter() {
  return (
    <BrowserRouter>
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
            <Route path="/premium" element={<PremiumPage />} />
          </Route>
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
          </Route>
          <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
          <Route element={<ProtectedAdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/printables" element={<AdminPrintablesPage />} />
            <Route path="/admin/printables/upload" element={<AdminUploadPage />} />
            <Route path="/admin/tips" element={<AdminTipsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
