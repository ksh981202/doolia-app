import { HeroSearch } from '@/components/home/HeroSearch'
import { ExploreByAge } from '@/components/home/ExploreByAge'
import { ParentingTipsPreview } from '@/components/home/ParentingTipsPreview'
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
      <ParentingTipsPreview />
      <PremiumBanner />
      <TrustMission />
    </>
  )
}

export default HomePage
