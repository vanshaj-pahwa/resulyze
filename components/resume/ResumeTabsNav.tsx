import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ResumeTabsNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  atsData: any;
}

const ResumeTabsNav: React.FC<ResumeTabsNavProps> = ({ activeTab, setActiveTab, atsData }) => {
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(false);
  
  // Check if we need to show scroll indicators
  React.useEffect(() => {
    const checkScroll = () => {
      if (!tabsContainerRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer for rounding errors
    };
    
    checkScroll();
    
    const tabsContainer = tabsContainerRef.current;
    if (tabsContainer) {
      tabsContainer.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      
      return () => {
        tabsContainer.removeEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);
      };
    }
  }, []);
  
  // Scroll to the active tab when it changes
  React.useEffect(() => {
    if (tabsContainerRef.current) {
      const tabsContainer = tabsContainerRef.current;
      const activeTabElement = tabsContainer.querySelector(`[data-state="active"]`);
      
      if (activeTabElement) {
        const containerRect = tabsContainer.getBoundingClientRect();
        const tabRect = activeTabElement.getBoundingClientRect();
        
        // Calculate if the tab is outside the visible area
        if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
          const scrollLeft = tabRect.left + tabsContainer.scrollLeft - containerRect.left - (containerRect.width / 2) + (tabRect.width / 2);
          tabsContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }
    }
  }, [activeTab]);
  
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 150; // Adjust scroll amount as needed
      const newScrollLeft = tabsContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      tabsContainerRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };
  
  // Generate tabs data
  const tabs = [
    { value: "personal", label: "Personal", mobileLabel: "Info" },
    { value: "experience", label: "Experience", mobileLabel: "Exp" },
    { value: "skills", label: "Skills", mobileLabel: "Skills" },
    { value: "projects", label: "Projects", mobileLabel: "Proj" },
    { value: "ats-score", label: "ATS Score", mobileLabel: "ATS" }
  ];
  
  return (
    <div className="relative">
      {/* Mobile Dropdown Menu */}
      <div className="md:hidden mb-4">
        <div className="relative">
          <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
            <button 
              onClick={() => {
                const dropdown = document.getElementById('mobile-tab-dropdown');
                if (dropdown) dropdown.classList.toggle('hidden');
              }}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                {tabs.find(tab => tab.value === activeTab)?.label}
                {activeTab === "ats-score" && atsData && <span className="text-green-500">✓</span>}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>
          <div id="mobile-tab-dropdown" className="absolute z-10 hidden w-full mt-1 bg-white border rounded-lg shadow-lg">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  document.getElementById('mobile-tab-dropdown')?.classList.add('hidden');
                }}
                className={`flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 ${tab.value === activeTab ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                <span>{tab.label}</span>
                {tab.value === "ats-score" && atsData && <span className="text-green-500">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Horizontal Scrollable TabsList for larger screens */}
      <div className="hidden md:block relative">
        {/* Left scroll arrow */}
        {showLeftArrow && (
          <button 
            onClick={() => scrollTabs('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 hover:bg-gray-100"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        {/* Tabs container with horizontal scrolling */}
        <div 
          ref={tabsContainerRef}
          className="overflow-x-auto no-scrollbar"
          style={{ paddingLeft: showLeftArrow ? '28px' : '0', paddingRight: showRightArrow ? '28px' : '0' }}
        >
          <TabsList className="w-full inline-flex">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="flex-shrink-0 flex-1 text-center min-w-[100px] relative"
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
                {tab.value === "ats-score" && atsData && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {/* Right scroll arrow */}
        {showRightArrow && (
          <button 
            onClick={() => scrollTabs('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-1 hover:bg-gray-100"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeTabsNav;
