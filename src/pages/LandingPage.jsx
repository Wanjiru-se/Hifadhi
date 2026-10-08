/*
  Public-facing Hifadhi landing page.
  Sections: navbar, hero, the problem, How Hifadhi works, Why Hifadhi,
  About Hifadhi, the final call to action and the footer.
*/
import LandingAbout from '../components/landing/LandingAbout';
import LandingCta from '../components/landing/LandingCta';
import LandingFooter from '../components/landing/LandingFooter';
import LandingHero from '../components/landing/LandingHero';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHowItWorks from '../components/landing/LandingHowItWorks';
import LandingProblem from '../components/landing/LandingProblem';
import LandingWhy from '../components/landing/LandingWhy';

export default function LandingPage() {
  return (
    <div className="lp">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingProblem />
        <LandingHowItWorks />
        <LandingWhy />
        <LandingAbout />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
