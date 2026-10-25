import { useTheme } from './hooks/useTheme';
import { useIntroPhase } from './lib/intro';
import IntroLoader from './components/IntroLoader';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import JourneySection from './components/JourneySection';
import SkillsSection from './components/SkillsSection';
import CertificatesSection from './components/CertificatesSection';
import ProjectsSection from './components/ProjectsSection';
import ServicesSection from './components/ServicesSection';
import ExperienceSection from './components/ExperienceSection';
import EducationSection from './components/EducationSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const introUp = useIntroPhase() === 'running';

  return (
    <>
      <IntroLoader />
      <div className="min-h-screen" aria-hidden={introUp || undefined}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:px-4 focus:py-2 focus:bg-titanium-text focus:text-titanium-bg dark:focus:bg-obsidian-text dark:focus:text-obsidian-bg"
        >
          Skip to content
        </a>
        <Navbar toggleTheme={toggleTheme} />
        {/* Reading order: who, what he built, where, with what, how he learned, then contact. */}
        <main id="main">
          <HeroSection isDark={isDark} />
          <AboutSection />
          <JourneySection />
          <ProjectsSection />
        <ServicesSection />
          <ExperienceSection isDark={isDark} />
          <SkillsSection isDark={isDark} />
          <EducationSection />
          <CertificatesSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
}