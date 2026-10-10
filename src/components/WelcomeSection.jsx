
import { useEffect, useState } from "react";

function WelcomeSection() {

  const images = [
    "/images/1.jpg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/4.jpg",
    "/images/5.jpg",
    "/images/6.jpg",
    "/images/7.jpg",
  ];

  // Writing displayed on each sliding picture
  const slideTexts = [
    {
      title: "e-LMIS Visa Registration",
      amharic: "የe-LMIS ቪዛ ምዝገባ",
      description: "Register your visa application easily and securely.",
      amharicDescription: "የቪዛ ማመልከቻዎን በቀላሉና በደህና ይመዝግቡ።",
    },
    {
      title: "Expatriate Work Permit",
      amharic: "የውጭ ዜጎች የሥራ ፈቃድ",
      description: "Access services for expatriate work permit registration.",
      amharicDescription: "ለውጭ ዜጎች የሥራ ፈቃድ ምዝገባ አገልግሎቶችን ያግኙ።",
    },
    {
      title: "Simple & Efficient Registration",
      amharic: "ቀላልና ቀልጣፋ ምዝገባ",
      description: "Complete your registration process quickly and efficiently.",
      amharicDescription: "የምዝገባ ሂደትዎን በፍጥነትና በቀላሉ ያጠናቅቁ።",
    },
    {
      title: "Secure Information",
      amharic: "የተጠበቀ መረጃ",
      description: "Provide accurate information for a secure registration process.",
      amharicDescription: "ለደህንነት የተጠበቀ የምዝገባ ሂደት ትክክለኛ መረጃ ይስጡ።",
    },
    {
      title: "Online Visa Services",
      amharic: "የመስመር ላይ የቪዛ አገልግሎት",
      description: "Access important visa registration services online.",
      amharicDescription: "አስፈላጊ የቪዛ ምዝገባ አገልግሎቶችን በመስመር ላይ ያግኙ።",
    },
    {
      title: "Complete Your Application",
      amharic: "ማመልከቻዎን ያጠናቅቁ",
      description: "Make sure all required information is completed correctly.",
      amharicDescription: "ሁሉም አስፈላጊ መረጃዎች በትክክል መሞላታቸውን ያረጋግጡ።",
    },
    {
      title: "Welcome to e-LMIS",
      amharic: "ወደ e-LMIS እንኳን በደህና መጡ",
      description: "Your gateway to visa registration and expatriate work permits.",
      amharicDescription: "ወደ ቪዛ ምዝገባና የውጭ ዜጎች የሥራ ፈቃድ አገልግሎት የሚያስገባዎ መድረክ።",
    },
  ];

  const [currentImage, setCurrentImage] = useState(0);

  // Automatic image slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="welcome-section">
      <div className="welcome-content">

        <div className="welcome-text">

          <p className="welcome-small-title">
            E-LMIS
          </p>

          <h1>
            Welcome to the e-LMIS Visa Registration Portal. 
            
          </h1>

          

          <p className="welcome-description">
            ለቪዛ ምዝገባ እና ለውጭ ዜጎች የሥራ ፈቃድ አስፈላጊ
            መረጃዎችንና አገልግሎቶችን ያግኙ። የምዝገባ ሂደቱ ቀላል፣
            ፈጣን እና ቀልጣፋ እንዲሆን ትክክለኛ መረጃ በመስጠት
            ሁሉንም አስፈላጊ መረጃዎች ይሙሉ።
          </p>

          {/* Application Button */}
          <button
            className="welcome-application-button"
            onClick={() => {
              window.location.href = "/application";
            }}
          >
            <span>Fill Application Form</span>
            <span className="button-divider">/</span>
            <span>የማመልከቻ ቅጹን ይሙሉ</span>
            <span className="button-arrow">→</span>
          </button>

        </div>

        {/* Automatic Image Slider */}
        <div className="welcome-image-container">

          <div className="welcome-image-slider">

            {images.map((image, index) => (
              <img
                key={image}
                src={image}
                alt={`e-LMIS ${index + 1}`}
                className={`welcome-slide ${
                  index === currentImage ? "active" : ""
                }`}
              />
            ))}

            {/* Writing on the sliding picture */}
            <div className="welcome-slide-writing">

              <h2>
                {slideTexts[currentImage].title}
              </h2>

              <h3>
                {slideTexts[currentImage].amharic}
              </h3>

              <p>
                {slideTexts[currentImage].description}
              </p>

              <p className="welcome-slide-amharic-description">
                {slideTexts[currentImage].amharicDescription}
              </p>

            </div>

            {/* Slider dots */}
            <div className="welcome-slider-dots">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  aria-label={`Show image ${index + 1}`}
                  className={`welcome-slider-dot ${
                    index === currentImage ? "active" : ""
                  }`}
                  onClick={() => setCurrentImage(index)}
                />
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default WelcomeSection;

