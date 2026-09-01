import { HeroSearch } from '@/components/home/HeroSearch'
import { ExploreByAge } from '@/components/home/ExploreByAge'
// Temporarily hidden on home. Restore this import with <ParentingTipsPreview /> below.
// import { ParentingTipsPreview } from '@/components/home/ParentingTipsPreview'
import { PremiumBanner } from '@/components/home/PremiumBanner'
import { TopicGrid } from '@/components/home/TopicGrid'
import { TopDownloads } from '@/components/home/TopDownloads'
import { TrustMission } from '@/components/home/TrustMission'

export function HomePage() {
  return (
    <>
      <HeroSearch />
      <TopDownloads />
      <ExploreByAge />
      <TopicGrid />
      {/* Temporarily hidden: restore to show home parenting tips cards */}
      {/* <ParentingTipsPreview /> */}
      <PremiumBanner />
      <TrustMission />
    </>
  )
}

export default HomePage
