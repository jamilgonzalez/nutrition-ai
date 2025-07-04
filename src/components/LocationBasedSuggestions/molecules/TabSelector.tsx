import TabButton from '../atoms/TabButton'
import { TabType } from '../types'

interface TabSelectorProps {
  selectedTab: TabType
  onTabChange: (tab: TabType) => void
  city?: string
}

export default function TabSelector({
  selectedTab,
  onTabChange,
  city,
}: TabSelectorProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-2 rounded-lg bg-muted p-1">
      <TabButton
        active={selectedTab === 'homecooked'}
        onClick={() => onTabChange('homecooked')}
      >
        Homecooked
      </TabButton>
      <TabButton
        active={selectedTab === 'restaurant'}
        onClick={() => onTabChange('restaurant')}
      >
        <span className="hidden sm:inline">Nearby Restaurants</span>
        <span className="sm:hidden">Restaurants</span>
        {city && <span className="ml-1 text-xs">({city})</span>}
      </TabButton>
    </div>
  )
}