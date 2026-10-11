import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import supabase from "../supabase";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import "../styles/CanadaForm.css";

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
  contact_nationality: "",
  contact_id_number: "",
  contact_phone: "",
};

const applicantFields = [
  { name: "full_name", label: "ሙሉ ስም", type: "text", required: true },
  { name: "address", label: "አድራሻ", type: "text" },
  { name: "woreda", label: "ወረዳ", type: "text" },
  { name: "kebele", label: "ቀበሌ", type: "text" },
  { name: "nationality", label: "ዜግነት", type: "text" },
  { name: "gender", label: "ጾታ", type: "select" },
  { name: "age", label: "እድሜ", type: "number" },
  { name: "date_of_birth", label: "የትውልድ ዘመን", type: "date" },
  { name: "place_of_birth", label: "የትውልድ ቦታ", type: "text" },
  { name: "occupation", label: "የመተዳደሪያ የሥራ ዓይነት", type: "text" },
  { name: "id_number", label: "የመታወቂያ ቁጥር", type: "text" },
  { name: "form_date", label: "ፎርም የተሞላበት ቀን", type: "date" },
  { name: "weight", label: "ክብደት", type: "number" },
  { name: "height", label: "ቁመት", type: "number" },
  { name: "phone", label: "ስልክ ቁጥር", type: "tel" },
];

const contactFields = [
  { name: "contact_full_name", label: "ሙሉ ስም", type: "text" },
  { name: "contact_address", label: "አድራሻ", type: "text" },
  { name: "contact_region", label: "ክልል", type: "text" },
  { name: "contact_woreda", label: "ወረዳ", type: "text" },
  { name: "contact_kebele", label: "ቀበሌ", type: "text" },
  { name: "contact_nationality", label: "ዜግነት", type: "text" },
  { name: "contact_id_number", label: "የመታወቂያ ቁጥር", type: "text" },
  { name: "contact_phone", label: "ስልክ ቁጥር", type: "tel" },
];

function CanadaForm() {
  const [formData, setFormData] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("እባክዎ የፎቶ ፋይል ብቻ ይምረጡ።");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("የፎቶው መጠን ከ5MB መብለጥ የለበትም።");
      event.target.value = "";
      return;
    }

    setPhotoFile(file);
    setShowPreview(false);
    setMessage("");
  };

  const handlePreview = () => {
    if (!formData.full_name.trim()) {
      setMessage("እባክዎ የተመዝጋቢውን ሙሉ ስም ያስገቡ።");
      return;
    }

    setShowPreview(true);
    setMessage("");

    setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // Wait for images to load and decode before rendering the PDF.
  const waitForImages = async (element) => {
    if (!element) return;

    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map(async (image) => {
        if (!image.complete || image.naturalWidth === 0) {
          await new Promise((resolve) => {
            const finish = () => resolve();

            image.addEventListener("load", finish, { once: true });
            image.addEventListener("error", finish, { once: true });

            if (image.complete) finish();
          });
        }

        if (image.naturalWidth > 0 && typeof image.decode === "function") {
          try {
            await image.decode();
          } catch (error) {
            console.warn("Could not decode PDF image:", error);
          }
        }
      })
    );
  };

  // Export a fixed A4 portrait page, independent of screen width.
  const downloadPdf = async () => {
    if (!showPreview || !previewRef.current) {
      setMessage("እባክዎ መጀመሪያ Preview ይጫኑ።");
      return;
    }

    const paper = previewRef.current.querySelector(".canada-paper");

    if (!paper) {
      setMessage("የፎርሙ ቅድመ እይታ አልተገኘም።");
      return;
    }

    let pdfContainer;

    try {
      setMessage("PDF እየተዘጋጀ ነው...");

      await waitForImages(paper);

      // Clone the form so the PDF does not use the responsive screen layout.
      pdfContainer = document.createElement("div");
      const pdfPaper = paper.cloneNode(true);

      Object.assign(pdfContainer.style, {
        position: "fixed",
        left: "-12000px",
        top: "0",
        width: "794px",
        minWidth: "794px",
        background: "#ffffff",
        pointerEvents: "none",
        zIndex: "-1",
      });

      Object.assign(pdfPaper.style, {
        position: "relative",
        display: "block",
        boxSizing: "border-box",
        width: "794px",
        minWidth: "794px",
        maxWidth: "794px",
        height: "1123px",
        minHeight: "1123px",
        maxHeight: "1123px",
        margin: "0",
        padding: "40px 45px 32px",
        border: "0",
        borderRadius: "0",
        boxShadow: "none",
        background: "#ffffff",
        overflow: "hidden",
        transform: "none",
        flex: "none",
      });

      // Keep the PDF's contents laid out like a full-width paper.
      const paperTop = pdfPaper.querySelector(".canada-paper-top");
      if (paperTop) {
        Object.assign(paperTop.style, {
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          width: "100%",
        });
      }

      const paperFields = pdfPaper.querySelectorAll(".canada-paper-fields");
      paperFields.forEach((fields) => {
        Object.assign(fields.style, {
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          columnGap: "22px",
          rowGap: "9px",
          width: "100%",
        });
      });

      const paperPhoto = pdfPaper.querySelector(".canada-paper-photo");
      if (paperPhoto) {
        Object.assign(paperPhoto.style, {
          display: "flex",
          flex: "0 0 132px",
          width: "132px",
          height: "162px",
          overflow: "hidden",
        });
      }

      const photo = pdfPaper.querySelector(".canada-paper-photo img");

      if (photo) {
        const originalPhoto = paper.querySelector(
          ".canada-paper-photo img"
        );

        const photoSource =
          originalPhoto?.currentSrc || originalPhoto?.src || photoPreview;

        if (!photoSource) {
          throw new Error("የተመዝጋቢው ፎቶ አልተገኘም።");
        }

        photo.src = photoSource;

        Object.assign(photo.style, {
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        });
      } else {
        throw new Error("የተመዝጋቢው ፎቶ በፎርሙ ውስጥ አልተገኘም።");
      }

      const watermark = pdfPaper.querySelector(".canada-paper-watermark");
      if (watermark) {
        Object.assign(watermark.style, {
          position: "absolute",
          display: "block",
          maxWidth: "none",
        });
      }

      const stamp = pdfPaper.querySelector(".canada-paper-stamp img");
      if (stamp) {
        Object.assign(stamp.style, {
          display: "block",
          maxWidth: "100%",
          objectFit: "contain",
        });
      }

      pdfContainer.appendChild(pdfPaper);
      document.body.appendChild(pdfContainer);

      await waitForImages(pdfPaper);

      // Give the browser a chance to apply the fixed-width layout.
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );

      const canvas = await html2canvas(pdfPaper, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        height: 1123,
        windowWidth: 1200,
        windowHeight: 1200,
        scrollX: 0,
        scrollY: 0,
      });

      const imageData = canvas.toDataURL("image/jpeg", 0.98);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // Standard A4 portrait: 210 × 297 mm.
      // A small margin keeps the page edges clean.
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 4;

      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      const ratio = Math.min(
        availableWidth / canvas.width,
        availableHeight / canvas.height
      );

      const imageWidth = canvas.width * ratio;
      const imageHeight = canvas.height * ratio;

      const x = (pageWidth - imageWidth) / 2;
      const y = (pageHeight - imageHeight) / 2;

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

      const safeName =
        formData.full_name.trim().replace(/[^\p{L}\p{N}_-]+/gu, "_") ||
        "Canada_Application";

      pdf.save(`Canada_Application_${safeName}.pdf`);

      setMessage("PDF በተሳካ ሁኔታ ወርዷል።");
    } catch (error) {
      console.error("Canada PDF export error:", error);
      setMessage(
        error.message || "PDF ማውረድ አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
      );
    } finally {
      pdfContainer?.remove();
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) {
      throw new Error("እባክዎ የተመዝጋቢውን ፎቶ ይጫኑ።");
    }

    const extension = photoFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("canada-applicant-photos")
      .upload(filePath, photoFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: photoFile.type,
      });

    if (uploadError) {
      throw new Error(
        `ፎቶውን ወደ Supabase መላክ አልተቻለም፦ ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from("canada-applicant-photos")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("የፎቶውን URL ማግኘት አልተቻለም።");
    }

    return data.publicUrl;
  };

  const handleRegisterAndPrint = async () => {
    if (busy) return;

    if (!formData.full_name.trim()) {
      setMessage("እባክዎ የተመዝጋቢውን ሙሉ ስም ያስገቡ።");
      return;
    }

    if (!photoFile) {
      setMessage("እባክዎ የተመዝጋቢውን ፎቶ ይጫኑ።");
      return;
    }

    if (!showPreview) {
      setMessage("እባክዎ መጀመሪያ Preview ይጫኑ።");
      return;
    }

    setBusy(true);
    setMessage("መረጃው እየተመዘገበ ነው...");

    try {
      const photoUrl = await uploadPhoto();

      const payload = {
        ...formData,
        age: formData.age === "" ? null : Number(formData.age),
        weight: formData.weight === "" ? null : Number(formData.weight),
        height: formData.height === "" ? null : Number(formData.height),
        date_of_birth: formData.date_of_birth || null,
        form_date: formData.form_date || null,
        profile_photo_url: photoUrl,
      };

      const { error: insertError } = await supabase
        .from("canada_registrations")
        .insert([payload]);

      if (insertError) {
        throw new Error(`ምዝገባው አልተሳካም፦ ${insertError.message}`);
      }

      setMessage("ምዝገባው ተሳክቷል። PDF እየተዘጋጀ ነው...");
      await downloadPdf();
    } catch (error) {
      console.error("Canada registration error:", error);
      setMessage(error.message || "ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።");
    } finally {
      setBusy(false);
    }
  };

  const displayValue = (value) =>
    value !== undefined && value !== null && String(value).trim()
      ? String(value)
      : "................................";

  const renderInput = (field) => (
    <label className="canada-field" key={field.name}>
      <span>
        {field.label}
        {field.required ? " *" : ""}
      </span>

      {field.type === "select" ? (
        <select
          name={field.name}
          value={formData[field.name]}
          onChange={updateField}
          required={field.required}
        >
          <option value="">ይምረጡ</option>
          <option value="ወንድ">ወንድ</option>
          <option value="ሴት">ሴት</option>
        </select>
      ) : (
        <input
          name={field.name}
          type={field.type}
          value={formData[field.name]}
          onChange={updateField}
          required={field.required}
          min={field.type === "number" ? "0" : undefined}
        />
      )}
    </label>
  );

  const paperField = (label, value, key) => (
    <div className="canada-paper-field" key={key || label}>
      <strong>{label}፦</strong> {displayValue(value)}
    </div>
  );

  return (
    <div className="canada-form-page">
      <div className="canada-site-logo">
        <Logo />
      </div>

      <main className="canada-form-card">
        <h1 className="canada-form-heading">የካናዳ ማመልከቻ ፎርም</h1>

        <div className="canada-photo-upload">
          <div className="canada-photo-box">
            {photoPreview ? (
              <img src={photoPreview} alt="የተመዝጋቢው ፎቶ" />
            ) : (
              <span>የተመዝጋቢው ፎቶ ግራፍ</span>
            )}
          </div>

          <div className="canada-photo-controls">
            <label className="canada-upload-button" htmlFor="canada-photo">
              Upload Profile Photo
            </label>

            <input
              ref={fileInputRef}
              id="canada-photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              hidden
            />

            <p>የፎቶ መጠን ከ5MB በታች መሆን አለበት።</p>
          </div>
        </div>

        <section className="canada-form-section">
          <h2>1. የተመዝጋቢው ማንነት</h2>
          <div className="canada-fields-grid">
            {applicantFields.map(renderInput)}
          </div>
        </section>

        <section className="canada-form-section">
          <h2>2. የቅርብ ተጠሪ ወይም ተያዥ</h2>
          <div className="canada-fields-grid">
            {contactFields.map(renderInput)}
          </div>
        </section>

        {message && (
          <p className="canada-form-message" role="status">
            {message}
          </p>
        )}

        <div className="canada-form-actions">
          <button
            type="button"
            className="canada-button canada-preview-button"
            onClick={handlePreview}
            disabled={busy}
          >
            Preview
          </button>
        </div>
      </main>

      {showPreview && (
        <section
          className="canada-preview-section"
          ref={previewRef}
          aria-label="የካናዳ ማመልከቻ ቅድመ እይታ"
        >
          <h2>የማመልከቻው ቅድመ እይታ</h2>

          <article className="canada-paper">
            <img
              className="canada-paper-watermark"
              src="/images/canadafl.jpg"
              alt=""
              aria-hidden="true"
              crossOrigin="anonymous"
            />

            <div className="canada-paper-top">
              <div className="canada-paper-photo">
                {photoPreview ? (
                  <img src={photoPreview} alt="የተመዝጋቢው ፎቶ" />
                ) : (
                  <span>የተመዝጋቢው ፎቶ ግራፍ</span>
                )}
              </div>

              <div className="canada-paper-title">
                <p>ቀን፦ {displayValue(formData.form_date)}</p>
              </div>
            </div>

            <div className="canada-paper-intro">
              <p>
                በቅድሚያ የማክበር ሰላምታችንን እያቀረብን የካናዳ መንግስት
                አዲስ ባወጣቸው መግለጫ መሰረት ከፍተኛ የሰው ሀይል
                እንደሚያስፈልጋት እንደገለፀ ይታወቃል፡፡
              </p>

              <p>
                በዚህ መሰረት አቶ/ወሮ{" "}
                {displayValue(formData.full_name)}{" "}
                በዚህ በወጣው መግለጫ መሰረት ተመዝጋቢ ሆኜ ቀርቤአለሁ።
                ስለሆነም በኢትዮጵያዊነቴ በመንግስት እርዳታ ወደ ካናዳ
                ለመሄድ መስማማቴን ከዚህ በታች በሞላሁት ፎርም
                አስቀምጫለሁ፡፡
              </p>
            </div>

            <h3>1. የተመዝጋቢው ማንነት</h3>
            <div className="canada-paper-fields">
              {applicantFields.map((field) =>
                paperField(field.label, formData[field.name], field.name)
              )}
            </div>

            <h3>2. የቅርብ ተጠሪ ወይም ተያዥ</h3>
            <div className="canada-paper-fields">
              {contactFields.map((field) =>
                paperField(field.label, formData[field.name], field.name)
              )}
            </div>

            <div className="canada-paper-stamp">
              <img
                src="/images/canadaseg.jpg"
                alt="Stamp"
                crossOrigin="anonymous"
              />
            </div>

            <div className="canada-paper-motto">
              "ብቁ ሰራተኛ . ብቁ ቀጣሪ . ብቁ ውሳኔ ሰጪ።"
            </div>

            <div className="canada-paper-footer">
              <hr />

              <div className="canada-paper-footer-row">
                <span>ፋክስ፦ +251116671566</span>
                <span>አዲስ አበባ፣ ኢትዮጵያ</span>
              </div>

              <div className="canada-paper-footer-row">
                <span>e-mail: info@elmis.gov.et</span>
                <span>web: www.elmis.gov.et</span>
              </div>
            </div>
          </article>

          <div className="canada-preview-actions">
            <button
              type="button"
              className="canada-button"
              onClick={downloadPdf}
              disabled={busy}
            >
              Print
            </button>

            <button
              type="button"
              className="canada-button canada-register-button"
              onClick={handleRegisterAndPrint}
              disabled={busy}
            >
              {busy ? "Registering..." : "Register and Print"}
            </button>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default CanadaForm;