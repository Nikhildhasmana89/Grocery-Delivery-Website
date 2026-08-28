import { getCombinedGroceries } from "@/lib/getCombinedGroceries";
import HeroSection from "./HeroSection";
import UserProductSection from "./UserProductSection";
import Nav, { UserInterface } from "./Nav";
import { UserThemeProvider } from "@/context/ThemeContext";

import Footer from "./Footer";
import AIAssistantWidget from "./AIAssistantWidget";

interface UserDashboardProps {
  user?: UserInterface;
}

async function UserDashboard({ user }: UserDashboardProps = {}) {
  const plainGroceries = await getCombinedGroceries();

  return (
    <UserThemeProvider>
      <div className="flex flex-col min-h-screen font-sans selection:bg-emerald-500 selection:text-slate-950">
        {/* Navigation Bar */}
        <Nav user={user} />

        {/* Main Container matching max-w-7xl and padding from HeroSection */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-8">
          {/* Hero Section */}
          <section>
            <HeroSection />
          </section>

          {/* Interactive Product & Category Section */}
          <UserProductSection initialGroceries={plainGroceries} />
        </main>

        {/* AI Assistant */}
        <AIAssistantWidget />

        {/* Footer */}
        <Footer />
      </div>
    </UserThemeProvider>
  );
}

export default UserDashboard;