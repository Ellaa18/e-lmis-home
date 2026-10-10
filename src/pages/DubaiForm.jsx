
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

    setMessage("");
    setPhotoFile(file);
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

  // Wait for the applicant photo, watermark, and stamp to load.
  const waitForImages = async (element) => {
    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map(async (image) => {
        if (image.complete && image.naturalWidth > 0) return;

        if (typeof image.decode === "function") {
          try {
            await image.decode();
            return;
          } catch {
            // Continue to the load/error fallback.
          }
        }

        await new Promise((resolve) => {
          image.onload = resolve;
          image.onerror = resolve;
        });
      })
    );
  };

  // Export the entire form onto ONE A4 portrait page.
  const downloadPdf = async () => {
    const printArea = document.getElementById("dubai-print-area");
    const paper = printArea?.querySelector(".dubai-paper");

    if (!printArea || !paper) {
      throw new Error("Form preview is not ready. Please open Preview first.");
    }

    setDownloading(true);

    try {
      await waitForImages(paper);

      const safeName =
        (formData.full_name || "Dubai-Registration")
          .trim()
          .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 70) || "Dubai-Registration";

      // Capture the complete paper as one canvas image.
      const canvas = await html2canvas(paper, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        logging: false,
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("The form could not be rendered. Please try again.");
      }

      // Create a new PDF with exactly one A4 portrait page.
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Fit the complete form inside the page without cropping it.
      const scale = Math.min(
        pageWidth / canvas.width,
        pageHeight / canvas.height
      );

      const imageWidth = canvas.width * scale;
      const imageHeight = canvas.height * scale;

      // Center the image on the page.
      const x = (pageWidth - imageWidth) / 2;
      const y = (pageHeight - imageHeight) / 2;

      const imageData = canvas.toDataURL("image/jpeg", 0.98);

      pdf.addImage(
        imageData,
        "JPEG",
        x,
        y,
        imageWidth,
        imageHeight,
        undefined,
        "FAST"
      );

      pdf.save(`${safeName}-Dubai-Registration.pdf`);

      return true;
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = () => {
    setMessage("");
    setShowPreview(true);
  };

  const handleSavePdf = async () => {
    if (!photoPreview) {
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

      // Allow React to render the preview before exporting it.
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
              {photoPreview ? (
                <img
                  src={photoPreview}
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
                This document will be downloaded as a PDF in the layout shown
                below.
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
                      ቀን / Date፦ {formData.form_date || "........................"}
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
            PDF ፋይሉ  የእርሶ ፋይል ውስጥ ይቀመጣል።
            <br />
            The PDF will be downloaded to your  folder.
          </p>
        </section>
      )}

      <Footer />
    </main>
  );
}

export default DubaiForm;