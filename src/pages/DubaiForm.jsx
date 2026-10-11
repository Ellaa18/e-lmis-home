import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import supabase from "../supabase";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import "../styles/DubaiForm.css";

const initialForm = {
  full_name: "",
  address: "",
  woreda: "",
  kebele: "",
  nationality: "ኢትዮጵያዊ",
  gender: "",
  age: "",
  date_of_birth: "",
  place_of_birth: "",
  occupation: "",
  id_number: "",
  form_date: new Date().toISOString().slice(0, 10),
  weight: "",
  height: "",
  phone: "",
  contact_full_name: "",
  contact_address: "",
  contact_region: "",
  contact_woreda: "",
  contact_kebele: "",
  contact_id_number: "",
  contact_date_of_birth: "",
  contact_place_of_birth: "",
  contact_phone: "",
  applicant_signature: "",
};

const applicantFields = [
  { name: "full_name", label: "ሙሉ ስም", en: "Full Name", required: true },
  { name: "address", label: "አድራሻ", en: "Address" },
  { name: "woreda", label: "ወረዳ", en: "Woreda / District" },
  { name: "kebele", label: "ቀበሌ", en: "Kebele" },
  { name: "nationality", label: "ዜግነት", en: "Nationality" },
  {
    name: "gender",
    label: "ጾታ",
    en: "Gender",
    type: "select",
    options: [
      { value: "ወንድ", label: "ወንድ / Male" },
      { value: "ሴት", label: "ሴት / Female" },
    ],
  },
  { name: "age", label: "እድሜ", en: "Age", type: "number" },
  { name: "date_of_birth", label: "የትውልድ ዘመን", en: "Date of Birth" },
  { name: "place_of_birth", label: "የትውልድ ቦታ", en: "Place of Birth" },
  { name: "occupation", label: "የመተዳደሪያ የሥራ ዓይነት", en: "Occupation" },
  { name: "id_number", label: "የመታወቂያ ቁጥር", en: "ID Number" },
  { name: "form_date", label: "ፎርም የተሞላበት ቀን", en: "Form Date", type: "date" },
  { name: "weight", label: "ክብደት", en: "Weight" },
  { name: "height", label: "ቁመት", en: "Height" },
  { name: "phone", label: "ስልክ ቁጥር", en: "Phone Number", type: "tel" },
];

const contactFields = [
  { name: "contact_full_name", label: "ሙሉ ስም", en: "Full Name" },
  { name: "contact_address", label: "አድራሻ", en: "Address" },
  { name: "contact_region", label: "ክልል", en: "Region" },
  { name: "contact_woreda", label: "ወረዳ", en: "Woreda / District" },
  { name: "contact_kebele", label: "ቀበሌ", en: "Kebele" },
  { name: "contact_id_number", label: "የመታወቂያ ቁጥር", en: "ID Number" },
  { name: "contact_date_of_birth", label: "የትውልድ ዘመን", en: "Date of Birth" },
  { name: "contact_place_of_birth", label: "የትውልድ ቦታ", en: "Place of Birth" },
  { name: "contact_phone", label: "ስልክ ቁጥር", en: "Phone Number", type: "tel" },
];

function DubaiForm() {
  const [formData, setFormData] = useState(initialForm);
 const [photoFile, setPhotoFile] = useState(null);
const [photoPreview, setPhotoPreview] = useState("");
const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  const previewRef = useRef(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  useEffect(() => {
    if (!showPreview) return undefined;

    const timer = window.setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [showPreview]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

 
const handlePhoto = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setMessage(
      "እባክዎ የምስል ፋይል ይምረጡ። / Please select an image file."
    );
    event.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setMessage(
      "የፎቶው መጠን ከ5MB መብለጥ የለበትም። / Photo size must not exceed 5MB."
    );
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    if (typeof reader.result !== "string") {
      setMessage("Could not read the applicant photo. Please try again.");
      return;
    }

    setPhotoFile(file);
    setPhotoDataUrl(reader.result);
    setPhotoPreview(reader.result);
    setMessage("");
  };

  reader.onerror = () => {
    setMessage("Could not read the applicant photo. Please try again.");
  };

  reader.readAsDataURL(file);
};

  const displayValue = (name) => {
    const value = formData[name];
    return value && String(value).trim() ? value : "";
  };

  const renderFields = (fields) =>
    fields.map((field) => (
      <label className="dubai-field" key={field.name}>
        <span className="dubai-field-label">
          <strong>{field.label}</strong>
          <span className="dubai-field-english">{field.en}</span>
          {field.required && <b className="required-mark"> *</b>}
        </span>

        {field.type === "select" ? (
          <select
            name={field.name}
            value={formData[field.name]}
            onChange={updateField}
            required={field.required}
          >
            <option value="">ይምረጡ / Select</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={field.name}
            type={field.type || "text"}
            value={formData[field.name]}
            onChange={updateField}
            required={field.required}
            dir="auto"
          />
        )}
      </label>
    ));

  const uploadPhoto = async () => {
    if (!photoFile) {
      throw new Error(
        "እባክዎ የተመዝጋቢውን ፎቶ ያስገቡ። / Please upload the applicant's photo."
      );
    }

    const extension = photoFile.name.split(".").pop() || "jpg";
    const uniqueName =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const filePath = `${Date.now()}-${uniqueName}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("dubai-photos")
      .upload(filePath, photoFile, {
        contentType: photoFile.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("dubai-photos")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error(
        "የፎቶውን አድራሻ ማግኘት አልተቻለም። / Could not get the photo URL."
      );
    }

    return data.publicUrl;
  };

  // Wait until each image has actually loaded and decoded.
  // This is important for the applicant photo, watermark, and stamp.
  const waitForImages = async (element) => {
    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map(async (img) => {
        if (!img.getAttribute("src")) return;

        if (!img.complete || img.naturalWidth === 0) {
          await new Promise((resolve) => {
            const finish = () => {
              img.removeEventListener("load", finish);
              img.removeEventListener("error", finish);
              resolve();
            };

            img.addEventListener("load", finish, { once: true });
            img.addEventListener("error", finish, { once: true });

            // Handle the case where the image finished loading
            // between the initial check and event registration.
            if (img.complete) finish();
          });
        }

        if (img.naturalWidth > 0 && typeof img.decode === "function") {
          try {
            await img.decode();
          } catch {
            // A loaded image can still be captured if decode rejects.
          }
        }
      })
    );
  };

  // Always export a fixed A4 portrait paper, never the responsive
  // screen-sized version of the preview.
  const downloadPdf = async () => {
    const paper = document.querySelector(
      "#dubai-print-area .dubai-paper"
    );

    if (!paper) {
      throw new Error("Form preview is not ready. Please open Preview first.");
    }

    setDownloading(true);

    let exportHost = null;

    try {
      // Wait for the actual preview images before making the export copy.
      await waitForImages(paper);

      // Create a separate fixed-width copy so phone and desktop layouts
      // cannot change the downloaded PDF.
      exportHost = document.createElement("div");
      exportHost.className = "dubai-pdf-export-host";

      Object.assign(exportHost.style, {
        position: "fixed",
        left: "-20000px",
        top: "0",
        width: "210mm",
        height: "297mm",
        overflow: "hidden",
        background: "#ffffff",
        pointerEvents: "none",
        zIndex: "-1",
      });

     
const exportPaper = paper.cloneNode(true);

exportPaper.classList.add("dubai-paper-export");

// Embed the applicant photo directly into the PDF export copy.
// This avoids relying on a temporary browser object URL.
const originalPhoto = paper.querySelector(".dubai-paper-photo img");
const copiedPhoto = exportPaper.querySelector(".dubai-paper-photo img");

if (originalPhoto && copiedPhoto && photoDataUrl) {
  copiedPhoto.src = photoDataUrl;
  copiedPhoto.removeAttribute("crossorigin");
}

      Object.assign(exportPaper.style, {
        display: "block",
        position: "relative",
        boxSizing: "border-box",
        width: "210mm",
        minWidth: "210mm",
        maxWidth: "none",
        height: "297mm",
        minHeight: "297mm",
        maxHeight: "297mm",
        margin: "0",
        padding: "15mm 16mm 18mm",
        overflow: "hidden",
        border: "none",
        borderRadius: "0",
        boxShadow: "none",
        transform: "none",
        background: "#eff0f0",
        color: "#111111",
        fontFamily:
          '"Noto Sans Ethiopic", "Nyala", "Abyssinica SIL", Arial, sans-serif',
        fontSize: "12pt",
        fontWeight: "900",
        lineHeight: "1.8",
      });

      exportHost.appendChild(exportPaper);
      document.body.appendChild(exportHost);

      // Wait for fonts, including Ethiopic fonts, when supported.
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await waitForImages(exportPaper);

      // Let the browser lay out the fixed A4 copy before capture.
      await new Promise((resolve) =>
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(resolve)
        )
      );

      const canvas = await html2canvas(exportPaper, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#eff0f0",
        logging: false,
        imageTimeout: 15000,
        width: exportPaper.scrollWidth,
        height: exportPaper.scrollHeight,
        windowWidth: 1200,
        windowHeight: 1600,
        scrollX: 0,
        scrollY: 0,
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("The form could not be rendered. Please try again.");
      }

      const safeName =
        (formData.full_name || "Dubai-Registration")
          .trim()
          .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 70) || "Dubai-Registration";

      // A4 is always 210 × 297 mm, regardless of screen size.
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
        putOnlyUsedFonts: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;

      // Fill the fixed A4 page without distortion.
      const imageData = canvas.toDataURL("image/jpeg", 0.98);

      pdf.addImage(
        imageData,
        "JPEG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "FAST"
      );

      pdf.save(`${safeName}-Dubai-Registration.pdf`);

      return true;
    } finally {
      // Remove the temporary export copy even if export fails.
      if (exportHost?.parentNode) {
        exportHost.parentNode.removeChild(exportHost);
      }

      setDownloading(false);
    }
  };

  const handlePreview = () => {
    setMessage("");
    setShowPreview(true);
  };

  const handleSavePdf = async () => {
   if (!photoDataUrl) {
      setMessage(
        "ከPDF በፊት የተመዝጋቢውን ፎቶ ያስገቡ። / Upload the applicant's photo before saving the PDF."
      );
      return;
    }

    setMessage("");

    if (!showPreview) {
      setShowPreview(true);
      setMessage(
        "ቅድመ እይታው ሲከፈት PDF ማውረድ ይችላሉ። / Please open the preview and click Save as PDF again."
      );
      return;
    }

    try {
      await downloadPdf();
      setMessage("PDF በተሳካ ሁኔታ ወርዷል። / PDF downloaded successfully.");
    } catch (error) {
      console.error("Dubai PDF download error:", error);
      setMessage(
        `PDF ማውረድ አልተሳካም። / PDF download failed: ${
          error.message || "Please try again."
        }`
      );
    }
  };

  const handleRegisterAndPrint = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!photoFile) {
      setMessage(
        "እባክዎ የተመዝጋቢውን ፎቶ ያስገቡ። / Please upload the applicant's photo."
      );
      return;
    }

    setSaving(true);

    let registrationSaved = false;

    try {
      const photoUrl = await uploadPhoto();

      const { error } = await supabase
        .from("dubai_registrations")
        .insert([
          {
            ...formData,
            profile_photo_url: photoUrl,
          },
        ]);

      if (error) throw error;

      registrationSaved = true;
      setShowPreview(true);
      setMessage(
        "ምዝገባው ተቀምጧል። PDF በመዘጋጀት ላይ... / Registration saved. Preparing your PDF..."
      );

      // Give React time to render the preview before PDF export.
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      await downloadPdf();

      setMessage(
        "ምዝገባው በSupabase ተቀምጧል፤ PDF ወርዷል። / Registration saved to Supabase and PDF downloaded successfully."
      );
    } catch (error) {
      console.error("Dubai registration/PDF error:", error);

      if (registrationSaved) {
        setMessage(
          `ምዝገባው ተቀምጧል፣ ግን PDF ማውረድ አልተሳካም። / Registration was saved, but the PDF download failed: ${
            error.message || "Please click Save as PDF to try again."
          }`
        );
      } else {
        setMessage(
          `ምዝገባው አልተሳካም። / Registration failed: ${
            error.message || "Please try again."
          }`
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="dubai-form-page">
      <div className="dubai-site-logo">
        <Logo />
      </div>

      <section className="dubai-form-card">
        <header className="dubai-form-heading">
          <h1>የዱባይ ምዝገባ ፎርም</h1>
          <h2>Dubai Registration Form</h2>
          <p>እባክዎ ሁሉንም መረጃ በትክክል ይሙሉ።</p>
          <p>Please complete all information accurately.</p>
        </header>

        <form
          id="dubai-registration-form"
          onSubmit={handleRegisterAndPrint}
        >
          <section className="dubai-photo-upload">
            <div className="dubai-photo-box">
             {photoDataUrl ? (
  <img
    src={photoDataUrl}
    alt="የተመዝጋቢው ፎቶ / Applicant photo"
  />
) : (
                <strong>
                  የተመዝጋቢው
                  <br />
                  ፎቶ ግራፍ
                  <br />
                  Applicant Photo
                </strong>
              )}
            </div>

            <label className="dubai-upload-button">
              <span>ፎቶ ይምረጡ / Choose Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
              />
            </label>

            <small>
              የምስል ፋይል፤ እስከ 5MB / Image file, maximum 5MB
            </small>
          </section>

          <section className="dubai-form-section">
            <h2>
              1. የተመዝጋቢው ማንነት
              <span>Applicant Information</span>
            </h2>
            <div className="dubai-fields-grid">
              {renderFields(applicantFields)}
            </div>
          </section>

          <section className="dubai-form-section">
            <h2>
              2. የቅርብ ተጠሪ ወይም ተያዥ
              <span>Emergency Contact / Guarantor</span>
            </h2>
            <div className="dubai-fields-grid">
              {renderFields(contactFields)}
            </div>
          </section>
        </form>

        {message && (
          <p className="dubai-form-message" role="status">
            {message}
          </p>
        )}

        <div className="dubai-form-actions">
          <button
            type="button"
            className="dubai-button dubai-button-secondary"
            onClick={handlePreview}
            disabled={saving || downloading}
          >
            Preview / የሞሉትን ፎርም ይመልከቱ
          </button>
        </div>
      </section>

      {showPreview && (
        <section
          className="dubai-preview-section"
          id="dubai-preview"
          ref={previewRef}
        >
          <div className="dubai-preview-heading">
            <div>
              <h2>የፎርሙ ቅድመ እይታ / Form Preview</h2>
              <p>ይህ ወረቀት በሚታየው ቅርጽ ይቀመጣል።</p>
              <p>
                This document will be downloaded as a fixed A4 PDF,
                regardless of your screen size.
              </p>
            </div>
          </div>

          <div id="dubai-print-area">
            <article className="dubai-paper">
              <img
                className="dubai-paper-watermark"
                src="/images/dubiefl.jpg"
                alt=""
                aria-hidden="true"
                crossOrigin="anonymous"
              />

              <div className="dubai-paper-content">
                <div className="dubai-paper-top">
                  <div className="dubai-paper-photo">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="የተመዝጋቢው ፎቶ / Applicant photo"
                      />
                    ) : (
                      <strong>
                        የተመዝጋቢው ፎቶ / Applicant Photo
                      </strong>
                    )}
                  </div>

                  <div className="dubai-paper-date">
                    <strong>
                      ቀን / Date፦{" "}
                      {formData.form_date || "........................"}
                    </strong>
                  </div>
                </div>

                <p className="dubai-paper-intro">
                  በቅድሚያ የማክበር ሰላምታችንን እያቀረብን የዱባይ
                  መንግስት አዲስ ባወጣቸው መግለጫ መሰረት ከፍተኛ
                  የሰው ሀይል እንደሚያስፈልጋት እንደገለፀች ይታወቃል፡፡
                </p>

                <p className="dubai-paper-intro">
                  በዚህ መሰረት አቶ/ወሮ{" "}
                  <strong>{displayValue("full_name")}</strong> ከዚህ
                  በወጣው መግለጫ መሰረት ተመዝጋቢ ሆኜ ቀርቤአለሁ።
                  ስለሆነም በኢትዮጵያዊነቴ በመንግስት እርዳታ ወደ
                  ዱባይ ለመሄድ መስማማቴን ከዚህ በታች በሞላሁት
                  ፎርም አስቀምጫለሁ፡፡
                </p>

                <h3 className="dubai-paper-section-title">
                  1. የተመዝጋቢው ማንነት
                </h3>

                <div className="dubai-paper-fields">
                  {applicantFields.map((field) => (
                    <div className="dubai-paper-field" key={field.name}>
                      <strong>
                        {field.label} / {field.en}:
                      </strong>
                      <span>{displayValue(field.name)}</span>
                    </div>
                  ))}
                </div>

                <h3 className="dubai-paper-section-title">
                  2. የቅርብ ተጠሪ ወይም ተያዥ
                </h3>

                <div className="dubai-paper-fields">
                  {contactFields.map((field) => (
                    <div className="dubai-paper-field" key={field.name}>
                      <strong>
                        {field.label} / {field.en}:
                      </strong>
                      <span>{displayValue(field.name)}</span>
                    </div>
                  ))}
                </div>

                <div className="dubai-paper-signature">
                  <span>{displayValue("applicant_signature")}</span>
                </div>

                <div className="dubai-paper-stamp">
                  <img
                    src="/images/dubieseg.jpg"
                    alt="ማህተም / Stamp"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            </article>
          </div>

          <div className="dubai-preview-actions">
            <button
              type="button"
              className="dubai-button dubai-button-secondary"
              onClick={() => {
                setShowPreview(false);
                setMessage("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={saving || downloading}
            >
              ወደ ፎርሙ ተመለስ / Back to Form
            </button>

            <button
              type="button"
              className="dubai-button dubai-button-outline"
              onClick={handleSavePdf}
              disabled={saving || downloading}
            >
              {downloading
                ? "PDF በማዘጋጀት ላይ... / Creating PDF..."
                : "አስቀምጥ ፕሪንት / Download as PDF"}
            </button>

            <button
              type="submit"
              form="dubai-registration-form"
              className="dubai-button dubai-button-primary"
              disabled={saving || downloading}
            >
              {saving
                ? "በመመዝገብ ላይ... / Registering..."
                : "Submit the form /ፎርሙን አስገባ"}
            </button>
          </div>

          <p className="dubai-print-note">
            PDF ፋይሉ የእርሶ ፋይል ውስጥ ይቀመጣል။
            <br />
            The PDF will be downloaded to your Downloads folder.
          </p>
        </section>
      )}

      <Footer />
    </main>
  );
}

export default DubaiForm;