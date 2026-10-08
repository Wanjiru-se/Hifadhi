/*
  Landing page hero: headline and CTA on the left, rotating product
  analysis visual on the right (HeroProductStory).
*/
import Icon from '../ui/Icon';
import HeroProductStory from './HeroProductStory';

export default function LandingHero() {
  return (
    <section id="home" className="lp-hero" aria-labelledby="lp-hero-title">
      <div className="lp-container lp-hero-inner">
        <div className="lp-hero-content">
          <h1 id="lp-hero-title" className="lp-hero-title">
            <span>Predict risk.</span>
            <span className="lp-hero-accent">Reduce waste.</span>
          </h1>
          <p className="lp-hero-sub">
            Make smarter inventory decisions before perishables reach expiry.
          </p>
          <a href="#solution" className="lp-btn-primary">
            Explore Hifadhi
            <Icon name="arrowRight" size={20} />
          </a>
        </div>

        <div className="lp-hero-visual" aria-hidden="true">
          <HeroProductStory />
        </div>
      </div>
    </section>
  );
}
