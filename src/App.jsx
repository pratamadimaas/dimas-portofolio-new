import { useTheme } from './hooks/useTheme';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import SkillsSection from './components/SkillsSection';
import CertificatesSection from './components/CertificatesSection';
import ProjectsSection from './components/ProjectsSection';
import TimelineSection from './components/TimelineSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function App() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <main>
        <HeroSection isDark={isDark} />
        <AboutSection />
        <TimelineSection />
        <SkillsSection />
        <CertificatesSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}