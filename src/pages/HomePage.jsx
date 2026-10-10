import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import MinistryNews from "../components/MinistryNews";
import LatestDevelopments from "../components/LatestDevelopments";
import NewsCards from "../components/NewsCards";
import HelpingGuides from "../components/HelpingGuides";
import Footer from "../components/Footer";

import "../styles/home.css";

function HomePage() {
  return (
    <div className="home-page">
      <Navbar />

      <main>
        <WelcomeSection />

        <MinistryNews />

        <LatestDevelopments />

        <NewsCards />

        <HelpingGuides />
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;