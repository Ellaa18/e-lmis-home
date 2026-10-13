
import React from "react";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import HelpGuidance from "../components/HelpingGuides";
import "../styles/application.css";

const countries = [
  {
    id: "dubai",
    name: "Dubai (UAE)",
    amharicName: "ዱባይ (የተባበሩት የዓረብ ኤምሬቶች)",
    flag: "/images/dubiefl.jpg",
    description:
      "Dubai is a major business and employment destination in the United Arab Emirates. Applicants should review the relevant job, work-permit, visa, and documentation requirements before applying.",
    amharicDescription:
      "ዱባይ በተባበሩት የዓረብ ኤምሬቶች ውስጥ ዋና የንግድና የሥራ መዳረሻ ናት። ከማመልከትዎ በፊት ከሥራ፣ ከሥራ ፈቃድ፣ ከቪዛ እና ከሰነዶች ጋር የተያያዙ መስፈርቶችን ያረጋግጡ።",
    color: "dubai",
    buttonText: "Fill Dubai Form",
    buttonAmharic: "የዱባይ ቅጽ ለመሙላት ይህን ይንኩ",
  },
  {
    id: "kuwait",
    name: "Kuwait",
    amharicName: "ኩዌት",
    flag: "/images/qwitfl.jpg",
    description:
      "Kuwait offers employment opportunities in a range of sectors. Before completing your application, check the requirements for your job, work authorization, visa, and supporting documents.",
    amharicDescription:
      "ኩዌት በተለያዩ የሥራ ዘርፎች የቅጥር ዕድሎች ያሉባት አገር ናት። ማመልከቻዎን ከመሙላትዎ በፊት ስለ ሥራዎ፣ ስለ ሥራ ፈቃድ፣ ስለ ቪዛ እና ስለ ደጋፊ ሰነዶች መስፈርቶች ያረጋግጡ።",
    color: "kuwait",
    buttonText: "Fill Kuwait Form",
    buttonAmharic: "የኩዌት ቅጽ ለመሙላት ይህን ይንኩ",
  },
  {
    id: "canada",
    name: "Canada",
    amharicName: "ካናዳ",
    flag: "/images/canadafl.jpg",
    description:
      "Canada has different work and immigration pathways, each with its own eligibility and documentation requirements. Review the applicable program and official instructions before beginning your application.",
    amharicDescription:
      "ካናዳ የተለያዩ የሥራና የኢሚግሬሽን መንገዶች ያሏት አገር ናት። እያንዳንዱ ፕሮግራም የራሱ የብቃትና የሰነድ መስፈርቶች ስላሉት ማመልከቻዎን ከመጀመርዎ በፊት ተገቢውን ፕሮግራምና ኦፊሴላዊ መመሪያ ይመልከቱ።",
    color: "canada",
    buttonText: "Fill Canada Form",
    buttonAmharic: "የካናዳ ቅጽ ለመሙላት ይህን ይንኩ",
  },
];

function ApplicationPage() {
  // Explicit routes ensure every country opens its own form.
  const openCountryForm = (countryId) => {
    const countryRoutes = {
      dubai: "/application/dubai",
      kuwait: "/application/kuwait",
      canada: "/application/canada",
    };

    const destination = countryRoutes[countryId];

    if (destination) {
      window.location.href = destination;
    }
  };

  return (
    <div className="application-page">
      <header className="application-header">
        <div className="application-header-inner">
          <Logo />

          <nav className="application-nav" aria-label="Main navigation">
            <a href="/">Home / መነሻ</a>
            <a href="/application" className="active">
              Applications / ማመልከቻዎች
            </a>
            <a href="/#help-guidance">Help / እገዛ</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="application-hero">
          <div className="application-hero-content">
            <span className="application-hero-label">
              e-LMIS VISA APPLICATION PORTAL
            </span>

           
            <h1 lang="am">የሚፈልጉትን መዳረሻ አገር ይምረጡ</h1>

            

            <p lang="am">
              ለእያንዳንዱ መዳረሻ የተሰጠውን መረጃ ይመልከቱና ማመልከቻዎን ለመቀጠል
              ትክክለኛውን የአገር ቅጽ ይምረጡ።
            </p>
          </div>

          <div className="application-hero-decoration" aria-hidden="true">
            <span>✈</span>
            <span>🌍</span>
          </div>
        </section>

        <section className="country-section" id="country-forms">
        

          <div className="country-grid">
            {countries.map((country) => (
              <article
                className={`country-card country-card-${country.color}`}
                key={country.id}
              >
                <div className="country-card-top">
                  

                  <div className="country-flag-wrap">
                    <img
                      className="country-flag"
                      src={country.flag}
                      alt={`${country.name} flag`}
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="country-card-content">
                  <h3>{country.name}</h3>
                  <h4 lang="am">{country.amharicName}</h4>

                 

         
                  <div className="country-card-action">
                    <button
                      type="button"
                      className="country-form-button"
                      onClick={() => openCountryForm(country.id)}
                    >
                      <span>{country.buttonText}</span>
                      <span lang="am">{country.buttonAmharic}</span>
                      <span className="button-arrow" aria-hidden="true">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <HelpGuidance />

        <section className="application-note">
          <div className="application-note-icon" aria-hidden="true">
            ℹ
          </div>

          <div>
            <h3>Important Information</h3>
            <p>
              Requirements vary by country and application type. The
              descriptions on this page are general guidance, not a guarantee
              of eligibility or approval. Always follow the relevant official
              instructions.
            </p>

            <h4 lang="am">አስፈላጊ መረጃ</h4>
            <p lang="am">
              መስፈርቶች እንደ አገሩና እንደ ማመልከቻው ዓይነት ይለያያሉ። በዚህ ገጽ ያለው
              መረጃ አጠቃላይ መመሪያ ብቻ ነው፤ ብቁ መሆንን ወይም ማጽደቅን አያረጋግጥም።
              ሁልጊዜ ተገቢውን ኦፊሴላዊ መመሪያ ይከተሉ።
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ApplicationPage;
