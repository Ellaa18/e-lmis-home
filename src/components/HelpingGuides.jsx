
import { useState } from "react";

function HelpAndGuidance() {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const guides = [
    {
      id: 1,
      number: "01",
      title: "Open the Application Page · የማመልከቻ ገጹን ይክፈቱ",
      text: "Start from the official e-LMIS home page and select Fill Application Form. · ከe-LMIS ዋና ገጽ ጀምረው የማመልከቻ ቅጹን ይሙሉ የሚለውን ይምረጡ።",
      details: (
        <>
          <p>
            Open the e-LMIS website. On the home page, find and select
            <strong> Fill Application Form</strong>.
            <br />
            የe-LMIS ድረ-ገጽን ይክፈቱ። በዋናው ገጽ ላይ
            <strong> Fill Application Form · የማመልከቻ ቅጹን ይሙሉ</strong>
            የሚለውን ይምረጡ።
          </p>
          <ol>
            <li>Wait for the application page to load.</li>
            <li>Read the instructions shown on the page.</li>
            <li>Continue to the country selection.</li>
          </ol>
          <p>
            የማመልከቻ ገጹ እስኪከፈት ይጠብቁ፣ መመሪያዎቹን ያንብቡና
            ወደ አገር ምርጫው ይቀጥሉ።
          </p>
        </>
      ),
    },
    {
      id: 2,
      number: "02",
      title: "Select Your Destination · የሚሄዱበትን አገር ይምረጡ",
      text: "Choose the country that matches the application you need. · ከሚፈልጉት ማመልከቻ ጋር የሚስማማውን አገር ይምረጡ።",
      details: (
        <>
          <p>
            Select the correct destination from the countries available on
            the application page.
            <br />
            በማመልከቻ ገጹ ላይ ከቀረቡት አገሮች ትክክለኛውን መዳረሻ ይምረጡ።
          </p>
          <ul>
            <li>🇨🇦 Canada · ካናዳ</li>
            <li>🇦🇪 Dubai · ዱባይ</li>
            <li>🇰🇼 Kuwait · ኩዌት</li>
            <li>🇸🇦 Saudi Arabia · ሳዑዲ ዓረቢያ</li>
          </ul>
          <p>
            The available choices depend on what your website currently
            supports. Choose the country relevant to your application.
            <br />
            የሚታዩት አገሮች በድረ-ገጹ ላይ በተዘጋጁት አማራጮች ላይ ይመሰረታሉ።
            ከማመልከቻዎ ጋር የሚስማማውን አገር ይምረጡ።
          </p>
        </>
      ),
    },
    {
      id: 3,
      number: "03",
      title: "Prepare Your Documents · ሰነዶችዎን ያዘጋጁ",
      text: "Have your passport, personal details, contact information, and requested files ready. · ፓስፖርትዎን፣ የግል መረጃዎን፣ የመገኛ መረጃዎንና የተጠየቁ ሰነዶችን ያዘጋጁ።",
      details: (
        <>
          <p>
            Before filling in the form, prepare the information and
            documents requested by the application.
            <br />
            ቅጹን ከመሙላትዎ በፊት በማመልከቻው የተጠየቁትን መረጃዎችና
            ሰነዶች ያዘጋጁ።
          </p>
          <ul>
            <li>Passport or identification details · የፓስፖርት ወይም የመታወቂያ መረጃ</li>
            <li>Full name and date of birth · ሙሉ ስምና የትውልድ ቀን</li>
            <li>Phone number and email, if requested · ስልክ ቁጥርና ኢሜይል፣ ከተጠየቁ</li>
            <li>Employment details, if requested · የሥራ መረጃ፣ ከተጠየቀ</li>
            <li>Clear copies of the required documents · ግልጽ የሰነዶች ቅጂዎች</li>
          </ul>
          <p>
            Only provide information that is true and belongs to you.
            Do not upload another person's documents.
            <br />
            እውነተኛና የእርስዎ የሆነ መረጃ ብቻ ያስገቡ። የሌላ ሰውን
            ሰነድ አይጫኑ።
          </p>
        </>
      ),
    },
    {
      id: 4,
      number: "04",
      title: "Complete Your Personal Information · የግል መረጃዎን ይሙሉ",
      text: "Enter your details in the matching fields and follow the form instructions. · የግል መረጃዎን በተመሳሳይ መስኮች ውስጥ ያስገቡ።",
      details: (
        <>
          <p>
            Fill in every field requested by the selected application.
            Depending on the form, you may be asked for:
            <br />
            በመረጡት ማመልከቻ የተጠየቁትን መስኮች ይሙሉ። እንደ ቅጹ አይነት
            የሚከተሉት ሊጠየቁ ይችላሉ፦
          </p>
          <ul>
            <li>Full name · ሙሉ ስም</li>
            <li>Passport number · የፓስፖርት ቁጥር</li>
            <li>Date of birth · የትውልድ ቀን</li>
            <li>Place of birth · የትውልድ ቦታ</li>
            <li>Phone and other contact information · ስልክና ሌሎች የመገኛ መረጃዎች</li>
            <li>Employment or destination-specific information · የሥራ ወይም የመዳረሻ አገር መረጃ</li>
          </ul>
          <p>
            Match names, numbers, and dates to your official documents.
            Do not guess if you are unsure about a detail.
            <br />
            ስሞችን፣ ቁጥሮችንና ቀናትን ከኦፊሴላዊ ሰነዶችዎ ጋር ያመሳስሉ።
            ስለ መረጃ እርግጠኛ ካልሆኑ በግምት አይሙሉ።
          </p>
        </>
      ),
    },
    {
      id: 5,
      number: "05",
      title: "Upload the Required Files · አስፈላጊ ፋይሎችን ይጫኑ",
      text: "Choose the correct document for each upload field and wait for it to finish. · ለእያንዳንዱ የፋይል መስክ ትክክለኛውን ሰነድ ይምረጡ።",
      details: (
        <>
          <p>
            If the application includes document upload fields, use each
            upload control to select the file requested for that field.
            <br />
            ማመልከቻው የሰነድ መጫኛ መስኮች ካሉት፣ ለእያንዳንዱ መስክ
            የተጠየቀውን ፋይል ይምረጡ።
          </p>
          <ul>
            <li>Check the file before selecting it. · ፋይሉን ከመምረጥዎ በፊት ያረጋግጡ።</li>
            <li>Make sure names and numbers are readable. · ስሞችና ቁጥሮች ሊነበቡ እንደሚችሉ ያረጋግጡ።</li>
            <li>Follow any file-type or size limits displayed by the website. · በድረ-ገጹ የተገለጹ የፋይል አይነትና መጠን ገደቦችን ይከተሉ።</li>
            <li>Wait until the upload finishes. · ፋይሉ እስኪጫን ይጠብቁ።</li>
          </ul>
          <p>
            If an upload fails, check your internet connection and try
            again. Do not assume the file was saved until the page confirms it.
            <br />
            ፋይል መጫን ካልተሳካ፣ የኢንተርኔት ግንኙነትዎን ያረጋግጡና እንደገና
            ይሞክሩ። ገጹ እስኪያረጋግጥ ድረስ ፋይሉ ተቀምጧል ብለው አያስቡ።
          </p>
        </>
      ),
    },
    {
      id: 6,
      number: "06",
      title: "Review Before Submitting · ከማስገባትዎ በፊት ይገምግሙ",
      text: "Check every field and uploaded document before choosing a submission option. · የማስገቢያ አማራጭ ከመምረጥዎ በፊት መረጃዎንና ሰነዶችዎን ያረጋግጡ።",
      details: (
        <>
          <p>
            Review the whole application from beginning to end.
            <br />
            ማመልከቻውን ከመጀመሪያ እስከ መጨረሻ ይገምግሙ።
          </p>
          <ul>
            <li>Check spelling of your full name. · የሙሉ ስምዎን አጻጻፍ ያረጋግጡ።</li>
            <li>Check passport number and date of birth. · የፓስፖርት ቁጥርና የትውልድ ቀን ያረጋግጡ።</li>
            <li>Check the selected country. · የመረጡትን አገር ያረጋግጡ።</li>
            <li>Check phone and email details. · ስልክና ኢሜይል ያረጋግጡ።</li>
            <li>Make sure the correct documents are attached. · ትክክለኛ ሰነዶች መያያዛቸውን ያረጋግጡ።</li>
            <li>Fix any errors shown on the page. · በገጹ ላይ የሚታዩ ስህተቶችን ያስተካክሉ።</li>
          </ul>
          <p>
            Correct mistakes before submitting. If something is unclear,
            ask for assistance rather than entering incorrect information.
            <br />
            ከማስገባትዎ በፊት ስህተቶችን ያስተካክሉ። የማይገባዎት ነገር ካለ
            የተሳሳተ መረጃ ከማስገባት ይልቅ እርዳታ ይጠይቁ።
          </p>
        </>
      ),
    },
    {
      id: 7,
      number: "07",
      title: "Submit Your Registration · ምዝገባዎን ያስገቡ",
      text: "Use Submit & Print only when you are ready to send the application. · ማመልከቻውን ለማስገባት ዝግጁ ሲሆኑ Submit & Print ይጠቀሙ።",
      details: (
        <>
          <p>
            When your application is complete, select
            <strong> Submit & Print</strong> if that is the submission
            option provided by your form.
            <br />
            ማመልከቻዎ ሲጠናቀቅ በቅጹ ላይ የቀረበው የማስገቢያ አማራጭ
            <strong> Submit & Print · አስገባና አትም</strong> ከሆነ ይምረጡት።
          </p>
          <p>
            Wait for the website to finish processing and look for a success
            message or other confirmation. If an error appears, read it and
            follow the instructions.
            <br />
            ድረ-ገጹ ሂደቱን እስኪያጠናቅቅ ይጠብቁ፤ የስኬት መልዕክት ወይም
            ሌላ ማረጋገጫ ይፈልጉ። ስህተት ከታየ ያንብቡና መመሪያውን ይከተሉ።
          </p>
          <p>
            Do not repeatedly click the submit button while the first
            submission is still processing. Check whether the application
            was submitted before trying again.
            <br />
            የመጀመሪያው ማስገባት ሂደት እየተካሄደ ሳለ ቁልፉን ደጋግመው
            አይጫኑ። እንደገና ከመሞከርዎ በፊት ማመልከቻው መግባቱን ያረጋግጡ።
          </p>
          <p>
            Submitting an application does not automatically mean that a
            visa or permit has been approved.
            <br />
            ማመልከቻ ማስገባት ቪዛ ወይም ፈቃድ ተፈቅዷል ማለት አይደለም።
          </p>
        </>
      ),
    },
    {
      id: 8,
      number: "08",
      title: "Print or Save a Copy · ቅጂ ያትሙ ወይም ያስቀምጡ",
      text: "Understand the difference between Submit & Print and Print Only. · Submit & Print እና Print Only ያላቸውን ልዩነት ይረዱ።",
      details: (
        <>
          <h4>Submit & Print · አስገባና አትም</h4>
          <p>
            Use this option when you are ready to submit your application
            and the form says this button submits it.
            <br />
            ቅጹ ይህ ቁልፍ ማመልከቻውን እንደሚያስገባ ካመለከተና ለማስገባት
            ዝግጁ ከሆኑ ይህንን አማራጭ ይጠቀሙ።
          </p>
          <h4>Print Only · ለማተም ብቻ</h4>
          <p>
            Use this option to print or save a copy without submitting,
            if that is how your application form is designed.
            <br />
            ቅጹ እንዲህ ከተዘጋጀ፣ ማመልከቻውን ሳያስገቡ ቅጂ ለማተም ወይም
            ለማስቀመጥ Print Only ይጠቀሙ።
          </p>
          <p>
            To save a digital copy, choose Save as PDF in the browser's
            print window if available.
            <br />
            ዲጂታል ቅጂ ለማስቀመጥ በአሳሹ የማተሚያ መስኮት ውስጥ Save as PDF
            የሚለው ካለ ይምረጡ።
          </p>
        </>
      ),
    },
    {
      id: 9,
      number: "09",
      title: "Check Your Registration Status · የምዝገባዎን ሁኔታ ያረጋግጡ",
      text: "Return to the website and use the profile or status feature provided by your system. · ወደ ድረ-ገጹ ተመልሰው የፕሮፋይል ወይም የሁኔታ ማየቻውን ይጠቀሙ።",
      details: (
        <>
          <p>
            If your e-LMIS website provides a profile or registration-status
            page, open it using the method provided by the system.
            <br />
            የe-LMIS ድረ-ገጹ የፕሮፋይል ወይም የምዝገባ ሁኔታ ገጽ ካለው፣
            ስርዓቱ ባቀረበው መንገድ ይክፈቱት።
          </p>
          <ul>
            <li>
              <strong>Pending</strong> usually means a decision has not yet
              been recorded.
              <br />
              <strong>Pending · በመጠባበቅ ላይ</strong> ብዙውን ጊዜ ውሳኔ
              ገና አልተመዘገበም ማለት ነው።
            </li>
            <li>
              <strong>Accepted</strong> means the application was accepted
              within this system.
              <br />
              <strong>Accepted · ተቀባይነት አግኝቷል</strong> ማመልከቻው
              በዚህ ስርዓት መቀበሉን ያመለክታል።
            </li>
            <li>
              <strong>Declined</strong> means the application was declined
              in this system. Check for instructions on what to do next.
              <br />
              <strong>Declined · ውድቅ ተደርጓል</strong> ማመልከቻው ውድቅ
              መደረጉን ያመለክታል። ቀጣይ እርምጃ መመሪያ ካለ ያንብቡ።
            </li>
          </ul>
          <p>
            These labels describe the status recorded by your e-LMIS
            system. They do not by themselves prove that a government visa
            or work permit has been issued.
            <br />
            እነዚህ ሁኔታዎች በe-LMIS ስርዓት የተመዘገበውን ያመለክታሉ።
            በራሳቸው የመንግሥት ቪዛ ወይም የሥራ ፈቃድ መሰጠቱን አያረጋግጡም።
          </p>
        </>
      ),
    },
    {
      id: 10,
      number: "10",
      title: "If Something Goes Wrong · ችግር ካጋጠመዎት",
      text: "Know what to do if the form, upload, printing, or submission fails. · ቅጹ፣ ፋይል መጫን፣ ማተም ወይም ማስገባት ካልተሳካ ምን ማድረግ እንዳለብዎ ይወቁ።",
      details: (
        <>
          <p>
            If you encounter a problem, try these checks before starting
            the entire application again.
            <br />
            ችግር ካጋጠመዎት ማመልከቻውን ከመጀመሪያ እንደገና ከመጀመርዎ በፊት
            እነዚህን ይፈትሹ።
          </p>
          <ul>
            <li>Check your internet connection. · የኢንተርኔት ግንኙነትዎን ያረጋግጡ።</li>
            <li>Read the error message carefully. · የስህተት መልዕክቱን በጥንቃቄ ያንብቡ።</li>
            <li>Check whether the application was already submitted. · ማመልከቻው ከዚህ በፊት መግባቱን ያረጋግጡ።</li>
            <li>Keep any confirmation or printed copy. · ማንኛውንም ማረጋገጫ ወይም የታተመ ቅጂ ያስቀምጡ።</li>
            <li>Contact the website administrator if the problem continues. · ችግሩ ከቀጠለ የድረ-ገጹን አስተዳዳሪ ያነጋግሩ።</li>
          </ul>
          <p>
            Never share your password or sensitive personal information
            with someone you do not trust.
            <br />
            የይለፍ ቃልዎን ወይም ሚስጥራዊ የግል መረጃዎን ከማያምኑት ሰው ጋር
            አያጋሩ።
          </p>
        </>
      ),
    },
  ];

  return (
    <section className="content-section guides-section" id="guides">
      <div className="section-heading">
        <h2>How Registration Works · ምዝገባ እንዴት ይከናወናል?</h2>
        <p>
          Follow these practical steps to complete your application, submit
          it, print a copy, and check the status available in your account.
          <br />
          ማመልከቻዎን ለመሙላት፣ ለማስገባት፣ ቅጂ ለማተምና በመለያዎ ውስጥ
          የሚታየውን ሁኔታ ለማየት እነዚህን ተግባራዊ ደረጃዎች ይከተሉ።
        </p>
      </div>

      <div className="guides-list">
        {guides.map((guide) => (
          <article className="guide-card" key={guide.id}>
            <div className="guide-number">{guide.number}</div>

            <div className="guide-content">
              <h3>{guide.title}</h3>
              <p>{guide.text}</p>

              <button
                type="button"
                onClick={() => setSelectedGuide(guide)}
              >
                Learn More · ተጨማሪ ይወቁ
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedGuide && (
        <div
          className="ministry-modal-overlay"
          onClick={() => setSelectedGuide(null)}
        >
          <div
            className="ministry-modal guide-help-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-modal-title"
          >
            <button
              type="button"
              className="ministry-modal-close"
              onClick={() => setSelectedGuide(null)}
              aria-label="Close guide · መመሪያውን ዝጋ"
            >
              ×
            </button>

            <div className="ministry-modal-header">
              <span className="ministry-modal-label">
                REGISTRATION HELP · የምዝገባ እገዛ · STEP{" "}
                {selectedGuide.number} · ደረጃ {selectedGuide.number}
              </span>

              <h2 id="guide-modal-title">{selectedGuide.title}</h2>

              <p>
                Follow these instructions for this stage of registration.
                <br />
                በዚህ የምዝገባ ደረጃ እነዚህን መመሪያዎች ይከተሉ።
              </p>
            </div>

            <div className="guide-modal-content">
              {selectedGuide.details}
            </div>

            <button
              type="button"
              className="ambassador-close-button"
              onClick={() => setSelectedGuide(null)}
            >
              Close Guide · መመሪያውን ዝጋ
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default HelpAndGuidance;
