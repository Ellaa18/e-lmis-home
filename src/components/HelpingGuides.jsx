
import { useState } from "react";

function HelpAndGuidance() {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const guides = [
    {
      id: 1,
      number: "01",
      title: "Start Your Application · ማመልከቻዎን ይጀምሩ",
      text: "Begin your application by clicking the Fill Application Form button. · የማመልከቻ ቅጹን ሙላ የሚለውን ቁልፍ በመጫን ማመልከቻዎን ይጀምሩ።",
      details: (
        <>
          <p>
            To begin your application, click the{" "}
            <strong>Fill Application Form</strong> button in the welcome
            section of the website.
            <br />
            ማመልከቻዎን ለመጀመር በድረ-ገጹ የመግቢያ ክፍል ውስጥ ያለውን{" "}
            <strong>Fill Application Form · የማመልከቻ ቅጹን ሙላ</strong>{" "}
            የሚለውን ቁልፍ ይጫኑ።
          </p>
          <p>
            This will take you to the application page where you can select
            the country for which you want to apply.
            <br />
            ይህ ለማመልከት የሚፈልጉበትን አገር መምረጥ ወደሚችሉበት የማመልከቻ ገጽ ይወስድዎታል።
          </p>
          <p>
            Make sure you are ready with your personal information and
            official documents before starting.
            <br />
            ከመጀመርዎ በፊት የግል መረጃዎንና ኦፊሴላዊ ሰነዶችዎን አዘጋጅተው መያዝዎን ያረጋግጡ።
          </p>
        </>
      ),
    },

    {
      id: 2,
      number: "02",
      title: "Choose Your Country · አገርዎን ይምረጡ",
      text: "Select the country for which you are completing your application. · ማመልከቻውን የሚሞሉለትን አገር ይምረጡ።",
      details: (
        <>
          <p>
            After opening the application page, select the country you want
            to apply for.
            <br />
            የማመልከቻ ገጹን ከከፈቱ በኋላ ማመልከት የሚፈልጉበትን አገር ይምረጡ።
          </p>
          <p>
            The available application choices are:
            <br />
            የሚከተሉት የአገር ምርጫዎች ይገኛሉ፦
          </p>
          <ul>
            <li>🇨🇦 <strong>Canada · ካናዳ</strong></li>
            <li>🇦🇪 <strong>Dubai · ዱባይ</strong></li>
            <li>🇰🇼 <strong>Kuwait · ኩዌት</strong></li>
            <li>🇸🇦 <strong>Saudi Arabia · ሳዑዲ ዓረቢያ</strong></li>
          </ul>
          <p>
            Carefully select the correct country before continuing with the
            application.
            <br />
            ወደ ቀጣዩ ደረጃ ከመሄድዎ በፊት ትክክለኛውን አገር በጥንቃቄ ይምረጡ።
          </p>
        </>
      ),
    },

    {
      id: 3,
      number: "03",
      title: "Understand the Application Form · የማመልከቻ ቅጹን ይረዱ",
      text: "Read the form carefully before entering your information. · መረጃዎን ከማስገባትዎ በፊት ቅጹን በጥንቃቄ ያንብቡ።",
      details: (
        <>
          <p>
            Once you select a country, the corresponding application form
            will appear.
            <br />
            አገር ከመረጡ በኋላ ለዚያ አገር የሚሆነው የማመልከቻ ቅጽ ይታያል።
          </p>
          <p>
            Before filling anything in, take a moment to look through the
            entire form and understand the information being requested.
            <br />
            ማንኛውንም መረጃ ከማስገባትዎ በፊት ቅጹን በሙሉ ይመልከቱና የሚጠየቀውን መረጃ ይረዱ።
          </p>
          <p>
            Fields marked as required must be completed before the
            application can be submitted.
            <br />
            አስፈላጊ ተብለው የተመለከቱ መስኮች ማመልከቻውን ከማስገባትዎ በፊት መሞላት አለባቸው።
          </p>
        </>
      ),
    },

    {
      id: 4,
      number: "04",
      title: "Enter Your Full Name · ሙሉ ስምዎን ያስገቡ",
      text: "Enter your name exactly as it appears on your official documents. · ስምዎን በኦፊሴላዊ ሰነዶችዎ ላይ እንደተጻፈው በትክክል ያስገቡ።",
      details: (
        <>
          <p>
            Enter your full name carefully in the personal information
            section.
            <br />
            በግል መረጃ ክፍል ውስጥ ሙሉ ስምዎን በጥንቃቄ ያስገቡ።
          </p>
          <p>
            Your name should match your official passport or identification
            document.
            <br />
            ስምዎ በኦፊሴላዊ ፓስፖርትዎ ወይም በመታወቂያ ሰነድዎ ላይ ከተጻፈው ጋር መመሳሰል አለበት።
          </p>
          <ul>
            <li>Check the spelling carefully. · አጻጻፉን በጥንቃቄ ያረጋግጡ።</li>
            <li>Do not accidentally leave out part of your name. · የስምዎን ክፍል በስህተት አይተዉ።</li>
            <li>Do not add unnecessary characters. · አላስፈላጊ ምልክቶችን አይጨምሩ።</li>
            <li>Review the name again before submitting. · ከማስገባትዎ በፊት ስምዎን እንደገና ይመልከቱ።</li>
          </ul>
        </>
      ),
    },

    {
      id: 5,
      number: "05",
      title: "Enter Passport Information · የፓስፖርት መረጃዎን ያስገቡ",
      text: "Enter your passport details accurately and carefully. · የፓስፖርት መረጃዎን በትክክልና በጥንቃቄ ያስገቡ።",
      details: (
        <>
          <p>
            Enter your passport information exactly as it appears on your
            passport.
            <br />
            የፓስፖርት መረጃዎን በፓስፖርትዎ ላይ እንደተጻፈው በትክክል ያስገቡ።
          </p>
          <ul>
            <li>Passport number · የፓስፖርት ቁጥር</li>
            <li>Passport-related information requested by the form · በቅጹ የተጠየቀ ከፓስፖርት ጋር የተያያዘ መረጃ</li>
            <li>Other identification details when required · አስፈላጊ ሲሆን ሌሎች የመታወቂያ ዝርዝሮች</li>
          </ul>
          <p>
            Pay special attention to letters and numbers because a single
            incorrect character can make the information incorrect.
            <br />
            አንድ ፊደል ወይም ቁጥር ብቻ እንኳን ስህተት ከሆነ መረጃውን ሊያሳስት ስለሚችል ለፊደሎችና ቁጥሮች ልዩ ትኩረት ይስጡ።
          </p>
        </>
      ),
    },

    {
      id: 6,
      number: "06",
      title: "Enter Date of Birth · የትውልድ ቀንዎን ያስገቡ",
      text: "Provide your correct date of birth. · ትክክለኛውን የትውልድ ቀንዎን ያስገቡ።",
      details: (
        <>
          <p>
            Enter your date of birth exactly as shown on your official
            documents.
            <br />
            የትውልድ ቀንዎን በኦፊሴላዊ ሰነዶችዎ ላይ እንደተመለከተው በትክክል ያስገቡ።
          </p>
          <p>
            Check the day, month, and year carefully before continuing.
            <br />
            ከመቀጠልዎ በፊት ቀኑን፣ ወሩንና ዓመቱን በጥንቃቄ ያረጋግጡ።
          </p>
          <p>
            If the form provides a date selector, use it carefully and make
            sure the selected date is correct.
            <br />
            ቅጹ የቀን መምረጫ ካቀረበ፣ በጥንቃቄ ይጠቀሙበትና የመረጡት ቀን ትክክል መሆኑን ያረጋግጡ።
          </p>
        </>
      ),
    },

    {
      id: 7,
      number: "07",
      title: "Enter Place of Birth · የትውልድ ቦታዎን ያስገቡ",
      text: "Provide your correct place of birth. · ትክክለኛውን የትውልድ ቦታዎን ያስገቡ።",
      details: (
        <>
          <p>
            Enter your place of birth according to your official documents.
            <br />
            የትውልድ ቦታዎን በኦፊሴላዊ ሰነዶችዎ መሠረት ያስገቡ።
          </p>
          <p>
            Check the spelling of the city, town, or other location before
            continuing.
            <br />
            ከመቀጠልዎ በፊት የከተማውን ወይም የሌላውን ቦታ ስም አጻጻፍ ያረጋግጡ።
          </p>
          <p>
            Do not enter your current residence if the form specifically
            asks for your place of birth.
            <br />
            ቅጹ የትውልድ ቦታዎን በግልጽ ከጠየቀ አሁን የሚኖሩበትን ቦታ አያስገቡ።
          </p>
        </>
      ),
    },

    {
      id: 8,
      number: "08",
      title: "Enter Contact Information · የመገኛ መረጃዎን ያስገቡ",
      text: "Provide a correct phone number and other requested contact information. · ትክክለኛ ስልክ ቁጥርና ሌሎች የተጠየቁ የመገኛ መረጃዎችን ያስገቡ።",
      details: (
        <>
          <p>
            Enter your current contact information carefully.
            <br />
            አሁን የሚጠቀሙበትን የመገኛ መረጃ በጥንቃቄ ያስገቡ።
          </p>
          <ul>
            <li>Phone number · ስልክ ቁጥር</li>
            <li>Email address, if requested · ኢሜይል አድራሻ፣ ከተጠየቀ</li>
            <li>Other contact information requested by the form · በቅጹ የተጠየቁ ሌሎች የመገኛ መረጃዎች</li>
          </ul>
          <p>
            Make sure your phone number and email address are entered
            correctly so that you can be contacted if necessary.
            <br />
            አስፈላጊ ሲሆን ሊያገኙዎት እንዲችሉ ስልክ ቁጥርዎና ኢሜይል አድራሻዎ ትክክል መሆናቸውን ያረጋግጡ።
          </p>
        </>
      ),
    },

    {
      id: 9,
      number: "09",
      title: "Enter Employment Information · የሥራ መረጃዎን ያስገቡ",
      text: "Complete the employment and work-related information requested by the form. · በቅጹ የተጠየቀውን የሥራ መረጃ ይሙሉ።",
      details: (
        <>
          <p>
            Complete the employment section carefully.
            <br />
            የሥራ መረጃ ክፍሉን በጥንቃቄ ይሙሉ።
          </p>
          <p>
            Enter the requested employer, employment, job, or work-related
            information accurately.
            <br />
            የአሠሪ፣ የቅጥር፣ የሥራ ወይም ከሥራ ጋር የተያያዘውን የተጠየቀ መረጃ በትክክል ያስገቡ።
          </p>
          <p>
            Make sure the information you enter matches the documents or
            information provided to you by your employer when applicable.
            <br />
            አስፈላጊ በሆነበት ጊዜ የሚያስገቡት መረጃ ከአሠሪዎ ከተሰጡዎት ሰነዶችና መረጃዎች ጋር መጣጣሙን ያረጋግጡ።
          </p>
        </>
      ),
    },

    {
      id: 10,
      number: "10",
      title: "Complete All Required Fields · ሁሉንም አስፈላጊ መስኮች ይሙሉ",
      text: "Make sure every required field has been completed. · ሁሉም አስፈላጊ መስኮች መሞላታቸውን ያረጋግጡ።",
      details: (
        <>
          <p>
            Before moving forward, check the entire form for required
            fields.
            <br />
            ወደ ቀጣዩ ደረጃ ከመሄድዎ በፊት ቅጹን በሙሉ በመመልከት አስፈላጊ መስኮችን ያረጋግጡ።
          </p>
          <ul>
            <li>Do not leave required fields empty. · አስፈላጊ መስኮችን ባዶ አይተዉ።</li>
            <li>Check that every required selection has been made. · ሁሉም አስፈላጊ ምርጫዎች መደረጋቸውን ያረጋግጡ።</li>
            <li>Make sure text fields contain the correct information. · የጽሑፍ መስኮች ትክክለኛ መረጃ መያዛቸውን ያረጋግጡ።</li>
            <li>Correct any validation errors shown by the form. · በቅጹ የሚታዩ የማረጋገጫ ስህተቶችን ያስተካክሉ።</li>
          </ul>
          <p>
            Completing all required fields will help prevent problems during
            submission.
            <br />
            ሁሉንም አስፈላጊ መስኮች መሙላት በማመልከቻ ማስገባት ወቅት ችግሮችን ለመቀነስ ይረዳል።
          </p>
        </>
      ),
    },

    {
      id: 11,
      number: "11",
      title: "Upload Required Documents · አስፈላጊ ሰነዶችን ይጫኑ",
      text: "Upload the documents requested by the application. · በማመልከቻው የተጠየቁትን ሰነዶች ይጫኑ።",
      details: (
        <>
          <p>
            If the application asks you to upload documents, select the
            appropriate files from your device.
            <br />
            ማመልከቻው ሰነዶችን እንዲጭኑ ከጠየቀዎት ከመሣሪያዎ ትክክለኛዎቹን ፋይሎች ይምረጡ።
          </p>
          <p>
            Make sure that each uploaded document is the correct document
            and is readable.
            <br />
            የጫኑት እያንዳንዱ ሰነድ ትክክለኛ መሆኑንና ሊነበብ እንደሚችል ያረጋግጡ።
          </p>
          <ul>
            <li>Use the correct document for each field. · ለእያንዳንዱ መስክ ትክክለኛውን ሰነድ ይጠቀሙ።</li>
            <li>Make sure images are clear enough to read. · ምስሎቹ በቂ ግልጽነት እንዳላቸው ያረጋግጡ።</li>
            <li>Do not accidentally upload another person's document. · የሌላ ሰውን ሰነድ በስህተት አይጫኑ።</li>
            <li>Check that the upload completed successfully. · የሰነድ መጫኑ በትክክል መጠናቀቁን ያረጋግጡ።</li>
          </ul>
        </>
      ),
    },

    {
      id: 12,
      number: "12",
      title: "Check Your Documents · ሰነዶችዎን ያረጋግጡ",
      text: "Review the uploaded documents before continuing. · ከመቀጠልዎ በፊት የጫኗቸውን ሰነዶች ይመልከቱ።",
      details: (
        <>
          <p>
            After uploading your documents, carefully check them.
            <br />
            ሰነዶችዎን ከጫኑ በኋላ በጥንቃቄ ያረጋግጡ።
          </p>
          <ul>
            <li>Confirm that the document belongs to you. · ሰነዱ የእርስዎ መሆኑን ያረጋግጡ።</li>
            <li>Confirm that the correct document was uploaded. · ትክክለኛው ሰነድ መጫኑን ያረጋግጡ።</li>
            <li>Check that the information is visible. · መረጃው በግልጽ መታየቱን ያረጋግጡ።</li>
            <li>Check that the document is not accidentally duplicated. · ሰነዱ በስህተት ሁለት ጊዜ አለመጫኑን ያረጋግጡ።</li>
          </ul>
          <p>
            If you notice a mistake, replace the document before continuing.
            <br />
            ስህተት ካገኙ ከመቀጠልዎ በፊት ሰነዱን በትክክለኛው ይተኩ።
          </p>
        </>
      ),
    },

    {
      id: 13,
      number: "13",
      title: "Review Your Application · ማመልከቻዎን ይገምግሙ",
      text: "Carefully review every section before finishing the application. · ማመልከቻዎን ከማጠናቀቅዎ በፊት እያንዳንዱን ክፍል በጥንቃቄ ይመልከቱ።",
      details: (
        <>
          <p>
            This is one of the most important steps.
            <br />
            ይህ ከሁሉም አስፈላጊ ደረጃዎች አንዱ ነው።
          </p>
          <p>
            Review all information you entered before selecting either
            printing option.
            <br />
            ማንኛውንም የማተሚያ አማራጭ ከመምረጥዎ በፊት ያስገቡትን መረጃ በሙሉ ይገምግሙ።
          </p>
          <ul>
            <li>Full name · ሙሉ ስም</li>
            <li>Passport information · የፓስፖርት መረጃ</li>
            <li>Date of birth · የትውልድ ቀን</li>
            <li>Place of birth · የትውልድ ቦታ</li>
            <li>Phone and contact information · ስልክና የመገኛ መረጃ</li>
            <li>Employment information · የሥራ መረጃ</li>
            <li>Country selection · የአገር ምርጫ</li>
            <li>Uploaded documents · የተጫኑ ሰነዶች</li>
          </ul>
          <p>
            Correct any mistakes you find before continuing.
            <br />
            ከመቀጠልዎ በፊት ያገኙትን ማንኛውንም ስህተት ያስተካክሉ።
          </p>
        </>
      ),
    },

    {
      id: 14,
      number: "14",
      title: "Check for Spelling Mistakes · የአጻጻፍ ስህተቶችን ያረጋግጡ",
      text: "Make sure names, numbers, and other information are written correctly. · ስሞች፣ ቁጥሮችና ሌሎች መረጃዎች በትክክል መጻፋቸውን ያረጋግጡ።",
      details: (
        <>
          <p>
            Carefully check spelling and numbers throughout the application.
            <br />
            በማመልከቻው ውስጥ ያሉትን አጻጻፎችና ቁጥሮች በጥንቃቄ ያረጋግጡ።
          </p>
          <p>
            Pay particular attention to names, passport numbers, phone
            numbers, dates, and other identification information.
            <br />
            ለስሞች፣ ለፓስፖርት ቁጥሮች፣ ለስልክ ቁጥሮች፣ ለቀናትና ለሌሎች የመታወቂያ መረጃዎች ልዩ ትኩረት ይስጡ።
          </p>
          <p>
            Do not assume the information is correct simply because the form
            accepted it. Review it yourself.
            <br />
            ቅጹ መረጃውን ተቀብሎታል ብለው ብቻ ትክክል ነው ብለው አያስቡ። እርስዎ ራስዎ እንደገና ይመልከቱት።
          </p>
        </>
      ),
    },

    {
      id: 15,
      number: "15",
      title: "Choose Submit & Print · አስገባና አትም ይምረጡ",
      text: "Use Submit & Print when you are ready to officially submit the application. · ማመልከቻዎን በይፋ ለማስገባት ዝግጁ ሲሆኑ Submit & Print ይምረጡ።",
      details: (
        <>
          <p>
            At the bottom of the application form, select{" "}
            <strong>Submit & Print</strong> when your application is complete
            and you are ready to submit it.
            <br />
            ማመልከቻዎን ሲያጠናቅቁና ለማስገባት ዝግጁ ሲሆኑ በቅጹ ታች ያለውን{" "}
            <strong>Submit & Print · አስገባና አትም</strong> የሚለውን ይምረጡ።
          </p>
          <p>
            This option is intended to submit the application and prepare
            the completed application information for printing.
            <br />
            ይህ አማራጭ ማመልከቻውን ለማስገባትና የተሞላውን መረጃ ለማተም ለማዘጋጀት የተዘጋጀ ነው።
          </p>
          <p>
            Before selecting this option, make sure all information is
            correct because this is the submission step.
            <br />
            ይህ የማስገቢያ ደረጃ ስለሆነ ከመምረጥዎ በፊት ሁሉም መረጃዎች ትክክል መሆናቸውን ያረጋግጡ።
          </p>
        </>
      ),
    },

    {
      id: 16,
      number: "16",
      title: "Use Print Only · ለማተም ብቻ ይጠቀሙ",
      text: "Use Print Only when you want a copy without submitting the application. · ማመልከቻውን ሳያስገቡ ቅጂ ለማተም ወይም ለማስቀመጥ Print Only ይጠቀሙ።",
      details: (
        <>
          <p>
            Select <strong>Print Only</strong> if you want to print or save a
            copy of the completed application without submitting it.
            <br />
            የተሞላውን ማመልከቻ ሳያስገቡ ቅጂ ማተም ወይም ማስቀመጥ ከፈለጉ{" "}
            <strong>Print Only · ለማተም ብቻ</strong> የሚለውን ይምረጡ።
          </p>
          <p>
            <strong>Print Only does not submit your application.</strong>
            <br />
            <strong>Print Only ማመልከቻዎን አያስገባም።</strong>
          </p>
          <p>
            This option can be useful when you want to review the completed
            information or keep a copy before officially submitting it.
            <br />
            ይህ አማራጭ ማመልከቻዎን በይፋ ከማስገባትዎ በፊት የተሞላውን መረጃ ለመመልከት ወይም ቅጂ ለማስቀመጥ ይጠቅማል።
          </p>
        </>
      ),
    },

    {
      id: 17,
      number: "17",
      title: "Understand the Difference · ልዩነቱን ይረዱ",
      text: "Know exactly what happens when you select each printing option. · እያንዳንዱን የማተሚያ አማራጭ ሲመርጡ ምን እንደሚፈጠር በትክክል ይረዱ።",
      details: (
        <>
          <h4>Submit & Print · አስገባና አትም</h4>
          <p>
            <strong>Submit & Print</strong> is the option to use when you
            want to submit your completed application and print the
            application information.
            <br />
            <strong>Submit & Print</strong> የተሞላውን ማመልከቻ ለማስገባትና የማመልከቻውን መረጃ ለማተም የሚጠቀሙበት አማራጭ ነው።
          </p>
          <h4>Print Only · ለማተም ብቻ</h4>
          <p>
            <strong>Print Only</strong> creates a printable copy without
            submitting the application.
            <br />
            <strong>Print Only</strong> ማመልከቻውን ሳያስገቡ የሚታተም ቅጂ ያዘጋጃል።
          </p>
          <p>
            Always choose the option that matches what you want to do.
            <br />
            ሁልጊዜ ከሚፈልጉት ዓላማ ጋር የሚስማማውን አማራጭ ይምረጡ።
          </p>
        </>
      ),
    },

    {
      id: 18,
      number: "18",
      title: "Keep Your Application Copy · የማመልከቻዎን ቅጂ ያስቀምጡ",
      text: "Keep a printed or saved copy of your completed application for your records. · የተሞላውን ማመልከቻ የታተመ ወይም የተቀመጠ ቅጂ ለመዝገብዎ ያስቀምጡ።",
      details: (
        <>
          <p>
            After printing your application, keep the printed copy or saved
            copy in a safe place.
            <br />
            ማመልከቻዎን ካተሙ በኋላ የታተመውን ወይም የተቀመጠውን ቅጂ በደህና ቦታ ያስቀምጡ።
          </p>
          <p>
            Your copy can help you remember the information that was entered
            and may be useful for your personal records.
            <br />
            ቅጂው ያስገቡትን መረጃ እንዲያስታውሱና ለግል መዝገብዎ እንዲጠቀሙበት ሊረዳ ይችላል።
          </p>
          <p>
            Make sure the printed information is readable before closing or
            leaving the application.
            <br />
            ማመልከቻውን ከመዝጋትዎ ወይም ከመውጣትዎ በፊት የታተመው መረጃ ሊነበብ የሚችል መሆኑን ያረጋግጡ።
          </p>
        </>
      ),
    },

    {
      id: 19,
      number: "19",
      title: "Check Your Profile · ፕሮፋይልዎን ይመልከቱ",
      text: "After registration, check your profile to view your application information and status. · ከምዝገባ በኋላ የማመልከቻዎን መረጃና ሁኔታ ለማየት ፕሮፋይልዎን ይመልከቱ።",
      details: (
        <>
          <p>
            After your application has been processed, you may be able to
            check your profile through the system.
            <br />
            ማመልከቻዎ ከተስተናገደ በኋላ በስርዓቱ በኩል ፕሮፋይልዎን ማየት ይችላሉ።
          </p>
          <p>
            Review the information displayed on your profile and make sure
            it corresponds to your application.
            <br />
            በፕሮፋይልዎ ላይ የሚታየውን መረጃ ይመልከቱና ከማመልከቻዎ ጋር መጣጣሙን ያረጋግጡ።
          </p>
          <p>
            If a registered visa or application status is displayed, review
            the information carefully.
            <br />
            የተመዘገበ ቪዛ ወይም የማመልከቻ ሁኔታ ከታየ መረጃውን በጥንቃቄ ይመልከቱ።
          </p>
        </>
      ),
    },

    {
      id: 20,
      number: "20",
      title: "Important Final Reminders · አስፈላጊ የመጨረሻ ማሳሰቢያዎች",
      text: "Always check your information carefully before completing your application. · ማመልከቻዎን ከማጠናቀቅዎ በፊት መረጃዎን ሁልጊዜ በጥንቃቄ ያረጋግጡ።",
      details: (
        <>
          <p>
            Before finishing your application, remember these important
            points:
            <br />
            ማመልከቻዎን ከማጠናቀቅዎ በፊት እነዚህን አስፈላጊ ነጥቦች ያስታውሱ፦
          </p>
          <ul>
            <li>
              <strong>Use your real and correct information. · እውነተኛና ትክክለኛ መረጃዎን ይጠቀሙ።</strong>
            </li>
            <li>
              <strong>Check your passport information carefully. · የፓስፖርት መረጃዎን በጥንቃቄ ያረጋግጡ።</strong>
            </li>
            <li>
              <strong>Check dates and numbers carefully. · ቀናትንና ቁጥሮችን በጥንቃቄ ያረጋግጡ።</strong>
            </li>
            <li>
              <strong>Make sure required fields are completed. · አስፈላጊ መስኮች መሞላታቸውን ያረጋግጡ።</strong>
            </li>
            <li>
              <strong>Upload the correct documents. · ትክክለኛዎቹን ሰነዶች ይጫኑ።</strong>
            </li>
            <li>
              <strong>Review the entire application before submission. · ማመልከቻውን ከማስገባትዎ በፊት በሙሉ ይገምግሙ።</strong>
            </li>
            <li>
              <strong>Use Submit & Print only when you are ready to submit. · ለማስገባት ዝግጁ ሲሆኑ ብቻ Submit & Print ይጠቀሙ።</strong>
            </li>
            <li>
              <strong>Use Print Only when you do not want to submit. · ማመልከቻውን ማስገባት በማይፈልጉበት ጊዜ Print Only ይጠቀሙ።</strong>
            </li>
          </ul>
          <p>
            Taking a few extra minutes to review your application can help
            prevent avoidable mistakes.
            <br />
            ማመልከቻዎን ለመመርመር ተጨማሪ ጥቂት ደቂቃዎችን መውሰድ ሊከላከሉ የሚችሉ ስህተቶችን ለመቀነስ ይረዳል።
          </p>
        </>
      ),
    },
  ];

  return (
    <section className="content-section guides-section" id="guides">
      <div className="section-heading">
        <h2>Help & Guidance · እገዛና መመሪያ</h2>

        <p>
          Follow these step-by-step instructions to complete your application
          correctly, submit it, and print your application.
          <br />
          ማመልከቻዎን በትክክል ለመሙላት፣ ለማስገባትና ለማተም እነዚህን ደረጃ በደረጃ የተዘጋጁ መመሪያዎች ይከተሉ።
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
                HELP & GUIDANCE · እገዛና መመሪያ · STEP {selectedGuide.number} · ደረጃ {selectedGuide.number}
              </span>

              <h2>{selectedGuide.title}</h2>

              <p>
                Follow the instructions below to complete this step correctly.
                <br />
                ይህንን ደረጃ በትክክል ለማጠናቀቅ ከታች ያሉትን መመሪያዎች ይከተሉ።
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
