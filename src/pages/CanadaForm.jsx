
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import supabase from "../supabase";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import "../styles/CanadaForm.css";

const PDF_BUCKET = "canada-registration-pdfs";
const PHOTO_BUCKET = "canada-applicant-photos";

// Generate a unique filename across supported browsers.
const createUniqueId = () => {
  try {
    if (
      typeof globalThis.crypto !== "undefined" &&
      typeof globalThis.crypto.randomUUID === "function"
    ) {
      return globalThis.crypto.randomUUID();
    }

    if (
      typeof globalThis.crypto !== "undefined" &&
      typeof globalThis.crypto.getRandomValues === "function"
    ) {
      const bytes = new Uint8Array(16);
      globalThis.crypto.getRandomValues(bytes);

      return Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");
    }
  } catch (error) {
    console.warn("Secure ID generation unavailable:", error);
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}-${Math.random().toString(36).slice(2)}`;
};

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

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("እባክዎ የተመዝጋቢውን ፎቶ ይጫኑ።"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("የተመዝጋቢውን ፎቶ ማንበብ አልተቻለም።"));
      }
    };

    reader.onerror = () =>
      reject(new Error("የተመዝጋቢውን ፎቶ ማንበብ አልተቻለም።"));

    reader.readAsDataURL(file);
  });

function CanadaForm() {
  const [formData, setFormData] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

    window.setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const waitForImages = async (element) => {
    if (!element) return;

    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map(async (image) => {
        if (!image.complete || image.naturalWidth === 0) {
          await new Promise((resolve) => {
            let finished = false;
            let timeoutId;

            const finish = () => {
              if (finished) return;
              finished = true;

              image.removeEventListener("load", finish);
              image.removeEventListener("error", finish);

              if (timeoutId) clearTimeout(timeoutId);
              resolve();
            };

            timeoutId = window.setTimeout(finish, 10000);

            image.addEventListener("load", finish, { once: true });
            image.addEventListener("error", finish, { once: true });

            if (image.complete) finish();
          });
        }

        if (
          image.naturalWidth > 0 &&
          typeof image.decode === "function"
        ) {
          try {
            await image.decode();
          } catch (error) {
            console.warn("Could not decode PDF image:", error);
          }
        }
      })
    );
  };

  const createPdfBlob = async () => {
    if (!showPreview || !previewRef.current) {
      throw new Error("እባክዎ መጀመሪያ Preview ይጫኑ።");
    }

    const paper = previewRef.current.querySelector(".canada-paper");

    if (!paper) {
      throw new Error("የፎርሙ ቅድመ እይታ አልተገኘም።");
    }

    let pdfContainer;

    try {
      const photoDataUrl = await fileToDataUrl(photoFile);

      await waitForImages(paper);

      pdfContainer = document.createElement("div");
      const pdfPaper = paper.cloneNode(true);

      Object.assign(pdfContainer.style, {
        position: "fixed",
        left: "-12000px",
        top: "0",
        width: "794px",
        minWidth: "794px",
        height: "1123px",
        background: "#ffffff",
        pointerEvents: "none",
        zIndex: "-1",
        overflow: "hidden",
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

      pdfPaper.querySelectorAll(".canada-paper-fields").forEach((fields) => {
        Object.assign(fields.style, {
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          columnGap: "22px",
          rowGap: "9px",
          width: "100%",
        });
      });

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

      if (!photo) {
        throw new Error("የተመዝጋቢው ፎቶ በፎርሙ ውስጥ አልተገኘም።");
      }

      photo.removeAttribute("srcset");
      photo.src = photoDataUrl;
      photo.loading = "eager";

      Object.assign(photo.style, {
        display: "block",
        width: "100%",
        height: "100%",
        maxWidth: "none",
        objectFit: "cover",
      });

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

      pdfPaper.querySelectorAll(".canada-paper h3").forEach((heading) => {
        heading.style.borderBottom = "0";
        heading.style.paddingBottom = "0";
      });

      pdfContainer.appendChild(pdfPaper);
      document.body.appendChild(pdfContainer);

      await waitForImages(pdfPaper);

      if (!photo.complete || photo.naturalWidth === 0) {
        throw new Error(
          "የተመዝጋቢው ፎቶ መጫን አልተቻለም። እባክዎ ደግመው ይሞክሩ።"
        );
      }

      // Wait for layout. Include a fallback for browsers without RAF.
      await new Promise((resolve) => {
        if (typeof window.requestAnimationFrame !== "function") {
          window.setTimeout(resolve, 100);
          return;
        }

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(resolve);
        });
      });

      // Lower scale reduces memory use on mobile devices.
      const canvas = await html2canvas(pdfPaper, {
        scale: 2,
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

      const imageData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 4;

      pdf.addImage(
        imageData,
        "JPEG",
        margin,
        margin,
        pageWidth - margin * 2,
        pageHeight - margin * 2,
        undefined,
        "FAST"
      );

      // Avoid Unicode-property-regex compatibility issues in older browsers.
      const safeName =
        formData.full_name.trim().replace(/[^a-zA-Z0-9_-]+/g, "_") ||
        "Canada_Application";

      return {
        blob: pdf.output("blob"),
        fileName: `Canada_Application_${safeName}.pdf`,
      };
    } finally {
      pdfContainer?.remove();
    }
  };

  const savePdfToDevice = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    // Give the browser time to start the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const downloadPdf = async () => {
    if (isDownloading || busy) return;

    if (!showPreview || !previewRef.current) {
      setMessage("እባክዎ መጀመሪያ Preview ይጫኑ።");
      return;
    }

    setIsDownloading(true);
    setMessage("PDF እየተዘጋጀ ነው። እባክዎ ይጠብቁ...");

    try {
      const generatedPdf = await createPdfBlob();

      savePdfToDevice(generatedPdf.blob, generatedPdf.fileName);
      setMessage("PDF ተዘጋጅቷል። ካልወረደ ከማውረጃዎች ይመልከቱ።");
    } catch (error) {
      console.error("Canada PDF export error:", error);
      setMessage(
        error?.message ||
          "PDF ማውረድ አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const uploadPhoto = async () => {
    if (!photoFile) {
      throw new Error("እባክዎ የተመዝጋቢውን ፎቶ ይጫኑ።");
    }

    const extension =
      photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `${Date.now()}-${createUniqueId()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(filePath, photoFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: photoFile.type || "image/jpeg",
      });

    if (uploadError) {
      throw new Error(
        `ፎቶውን ወደ Supabase መላክ አልተቻለም፦ ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from(PHOTO_BUCKET)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("የፎቶውን URL ማግኘት አልተቻለም።");
    }

    return data.publicUrl;
  };

  const uploadPdf = async (pdfBlob, fileName) => {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `registrations/${Date.now()}-${createUniqueId()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(PDF_BUCKET)
      .upload(filePath, pdfBlob, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });

    if (uploadError) {
      throw new Error(
        `PDF ወደ Supabase መላክ አልተቻለም፦ ${uploadError.message}`
      );
    }

    return filePath;
  };

  // Save the registration independently of PDF creation and download.
  const handleRegisterAndPrint = async () => {
    if (busy || isDownloading) return;

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
    setMessage("ምዝገባው እየተካሄደ ነው። እባክዎ ይጠብቁ...");

    let uploadedPhotoUrl = null;
    let uploadedPdfPath = null;
    let generatedPdf = null;
    const warnings = [];

    try {
      // Attempt photo upload, but don't let a storage failure alone
      // prevent the registration row from being saved.
      try {
        setMessage("ፎቶው ወደ Supabase እየተላከ ነው...");

        uploadedPhotoUrl = await uploadPhoto();
      } catch (photoError) {
        console.error("Canada photo upload error:", photoError);
        warnings.push("ፎቶው ወደ Supabase አልተላከም");
      }

      // PDF generation/upload are attempted before inserting the row,
      // but failures here do not automatically cancel registration.
      try {
        setMessage("PDF እየተዘጋጀ ነው...");

        generatedPdf = await createPdfBlob();

        setMessage("PDF ወደ Supabase እየተላከ ነው...");

        uploadedPdfPath = await uploadPdf(
          generatedPdf.blob,
          generatedPdf.fileName
        );
      } catch (pdfError) {
        console.error("Canada PDF generation/upload error:", pdfError);
        warnings.push("PDF መዘጋጀት ወይም ወደ Supabase መላክ አልተሳካም");
      }

      const payload = {
        ...formData,
        age: formData.age === "" ? null : Number(formData.age),
        weight: formData.weight === "" ? null : Number(formData.weight),
        height: formData.height === "" ? null : Number(formData.height),
        date_of_birth: formData.date_of_birth || null,
        form_date: formData.form_date || null,
        profile_photo_url: uploadedPhotoUrl,
        pdf_path: uploadedPdfPath,
      };

      setMessage("መረጃው ወደ Supabase እየተመዘገበ ነው...");

      const { error: insertError } = await supabase
        .from("canada_registrations")
        .insert([payload]);

      if (insertError) {
        if (uploadedPdfPath) {
          try {
            await supabase.storage
              .from(PDF_BUCKET)
              .remove([uploadedPdfPath]);
          } catch (cleanupError) {
            console.warn("PDF cleanup failed:", cleanupError);
          }
        }

        throw new Error(`ምዝገባው አልተሳካም፦ ${insertError.message}`);
      }

      // The database insert succeeded. A download problem must not
      // change the registration result.
      if (generatedPdf) {
        try {
          savePdfToDevice(generatedPdf.blob, generatedPdf.fileName);
        } catch (downloadError) {
          console.error("Canada PDF download error:", downloadError);
          warnings.push("PDF በራስ-ሰር ማውረድ አልተቻለም");
        }
      } else {
        warnings.push("PDF አልተዘጋጀም");
      }

      if (warnings.length > 0) {
        setMessage(
          `ምዝገባው ተሳክቷል። ማስታወሻ፦ ${warnings.join("፤ ")}።`
        );
      } else {
        setMessage("ምዝገባው ተሳክቷል። PDF ተመዝግቦ ወርዷል።");
      }
    } catch (error) {
      console.error("Canada registration error:", error);

      setMessage(
        error?.message ||
          "ስህተት ተፈጥሯል። እባክዎ ደግመው ይሞክሩ።"
      );
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

  const isBusy = busy || isDownloading;

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
          <p className="canada-form-message" role="status" aria-live="polite">
            {isBusy && <span className="canada-spinner" aria-hidden="true" />}
            {message}
          </p>
        )}

        <div className="canada-form-actions">
          <button
            type="button"
            className="canada-button canada-preview-button"
            onClick={handlePreview}
            disabled={isBusy}
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
              disabled={isBusy}
            >
              {isDownloading ? (
                <>
                  <span className="canada-spinner" aria-hidden="true" />
                  Saving PDF...
                </>
              ) : (
                "Print"
              )}
            </button>

            <button
              type="button"
              className="canada-button canada-register-button"
              onClick={handleRegisterAndPrint}
              disabled={isBusy}
            >
              {busy ? (
                <>
                  <span className="canada-spinner" aria-hidden="true" />
                  Registering...
                </>
              ) : isDownloading ? (
                <>
                  <span className="canada-spinner" aria-hidden="true" />
                  Saving PDF...
                </>
              ) : (
                "Register and Print"
              )}
            </button>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default CanadaForm;