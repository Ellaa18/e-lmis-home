
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import supabase from "../supabase";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import "../styles/CanadaForm.css";

const PDF_BUCKET = "canada-registration-pdfs";
const PHOTO_BUCKET = "canada-applicant-photos";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const SUCCESS_MESSAGE =
  "ፎርሙን በትክክል ሞልተው ጨርሰዋል ። የሞሉትን ፎርም ስልክዎ ላይ ያገኙታል።";

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

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  { name: "full_name", label: "ሙሉ ስም እስከ አያት", type: "text", required: true },
  
  { name: "woreda", label: "ወረዳ", type: "text" },
  { name: "kebele", label: "ቀበሌ", type: "text" },
  { name: "nationality", label: "ዜግነት", type: "text" },
  { name: "gender", label: "ጾታ", type: "select" },
  { name: "age", label: "እድሜ", type: "number" },
 
 
  { name: "id_number", label: "የፓስፖርት ቁጥር", type: "text" },
  { name: "form_date", label: "ፎርም የተሞላበት ቀን", type: "date" },
 
  { name: "phone", label: "ስልክ ቁጥር", type: "tel" },
];

const contactFields = [
  { name: "contact_full_name", label: "ሙሉ ስም እስከ አያት", type: "text" },
  
  { name: "contact_region", label: "ክልል", type: "text" },

  { name: "contact_nationality", label: "ዜግነት", type: "text" },

  { name: "contact_phone", label: "ስልክ ቁጥር", type: "tel" },
];

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("የፎቶውን ፋይል ማንበብ አልተቻለም።"));
      }
    };

    reader.onerror = () =>
      reject(new Error("የፎቶውን ፋይል ማንበብ አልተቻለም።"));

    reader.readAsDataURL(file);
  });

// Decode supported images and convert them to standard JPEG.
// This avoids uploading HEIC, SVG, or other inconsistent formats.
const normalizePhoto = async (file) => {
  if (!file) return null;

  const supportedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!supportedTypes.includes(file.type.toLowerCase())) {
    throw new Error("JPG, PNG ወይም WebP ፎቶ ብቻ ይምረጡ።");
  }

  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error("የፎቶው መጠን ከ5MB መብለጥ የለበትም።");
  }

  let source;
  let imageBitmap = false;

  try {
    if (typeof createImageBitmap === "function") {
      source = await createImageBitmap(file);
      imageBitmap = true;
    } else {
      source = await new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(image);
        };

        image.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("ይህን ፎቶ መክፈት አልተቻለም።"));
        };

        image.src = objectUrl;
      });
    }

    const originalWidth = source.width || source.naturalWidth;
    const originalHeight = source.height || source.naturalHeight;

    if (!originalWidth || !originalHeight) {
      throw new Error("የፎቶው መጠን ትክክል አይደለም።");
    }

    const maxDimension = 1600;
    const ratio = Math.min(
      1,
      maxDimension / Math.max(originalWidth, originalHeight)
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(originalWidth * ratio));
    canvas.height = Math.max(1, Math.round(originalHeight * ratio));

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("የፎቶውን ማስተካከያ ማዘጋጀት አልተቻለም።");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);

    const jpegBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            reject(new Error("ፎቶውን ወደ JPEG መቀየር አልተቻለም።"));
          }
        },
        "image/jpeg",
        0.88
      );
    });

    if (jpegBlob.size > MAX_PHOTO_SIZE) {
      throw new Error("የተስተካከለው ፎቶ ከ5MB በላይ ነው።");
    }

    return new File(
      [jpegBlob],
      `applicant-${createUniqueId()}.jpg`,
      { type: "image/jpeg", lastModified: Date.now() }
    );
  } finally {
    if (imageBitmap && source?.close) {
      source.close();
    }
  }
};

function CanadaForm() {
  const [formData, setFormData] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Success appears only after registration and PDF generation succeed.
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");

    try {
      const normalizedPhoto = await normalizePhoto(file);

      setPhotoFile(normalizedPhoto);
      setShowPreview(false);
      setMessage("ፎቶው ተቀብሏል።");
    } catch (error) {
      console.warn("Invalid applicant photo:", error);

      setPhotoFile(null);
      setShowPreview(false);
      setMessage(
        `${error?.message || "ፎቶው አልተቀበለም።"} ምዝገባውን ያለ ፎቶም ማድረግ ይችላሉ።`
      );

      event.target.value = "";
    }
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
      images.map(
        (image) =>
          new Promise((resolve) => {
            if (image.complete) {
              resolve();
              return;
            }

            let finished = false;

            const finish = () => {
              if (finished) return;
              finished = true;
              image.removeEventListener("load", finish);
              image.removeEventListener("error", finish);
              clearTimeout(timeoutId);
              resolve();
            };

            const timeoutId = window.setTimeout(finish, 8000);

            image.addEventListener("load", finish, { once: true });
            image.addEventListener("error", finish, { once: true });
          })
      )
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
      const photoDataUrl = photoFile
        ? await fileToDataUrl(photoFile)
        : "";

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

      if (photo && photoDataUrl) {
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
      } else if (photo) {
        photo.remove();
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

      pdfPaper.querySelectorAll(".canada-paper h3").forEach((heading) => {
        heading.style.borderBottom = "0";
        heading.style.paddingBottom = "0";
      });

      pdfContainer.appendChild(pdfPaper);
      document.body.appendChild(pdfContainer);

      await waitForImages(pdfPaper);

      await new Promise((resolve) => {
        if (typeof window.requestAnimationFrame !== "function") {
          window.setTimeout(resolve, 100);
          return;
        }

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(resolve);
        });
      });

      const canvas = await html2canvas(pdfPaper, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 8000,
        width: 794,
        height: 1123,
        windowWidth: 1200,
        windowHeight: 1200,
        scrollX: 0,
        scrollY: 0,
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("የPDF ምስል ማዘጋጀት አልተቻለም።");
      }

      const imageData = canvas.toDataURL("image/jpeg", 0.92);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const margin = 4;

      pdf.addImage(
        imageData,
        "JPEG",
        margin,
        margin,
        210 - margin * 2,
        297 - margin * 2,
        undefined,
        "FAST"
      );

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
      setMessage("PDF ተዘጋጅቷል።");
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
    if (!photoFile) return null;

    const filePath = `applicants/${Date.now()}-${createUniqueId()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(filePath, photoFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/jpeg",
      });

    if (uploadError) throw uploadError;

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

    if (uploadError) throw uploadError;

    return filePath;
  };

  // Registration is saved first. Photo/PDF work happens afterward.
  const handleRegisterAndPrint = async () => {
    if (busy || isDownloading) return;

    if (!formData.full_name.trim()) {
      setRegistrationSuccess(false);
      setMessage("እባክዎ የተመዝጋቢውን ሙሉ ስም ያስገቡ።");
      return;
    }

    // Hide any previous success message when a new registration is attempted.
    setRegistrationSuccess(false);
    setBusy(true);
    setMessage("ምዝገባው ወደ Supabase እየተመዘገበ ነው...");

    const warnings = [];
    let registrationId = null;
    let generatedPdf = null;

    try {
      const payload = {
        ...formData,
        age: formData.age === "" ? null : Number(formData.age),
        weight: formData.weight === "" ? null : Number(formData.weight),
        height: formData.height === "" ? null : Number(formData.height),
        date_of_birth: formData.date_of_birth || null,
        form_date: formData.form_date || null,
        profile_photo_url: null,
        pdf_path: null,
      };

      // Save the actual registration first. File processing cannot prevent this insert.
      const { data: insertedRow, error: insertError } = await supabase
        .from("canada_registrations")
        .insert([payload])
        .select("id")
        .single();

      if (insertError) {
        throw new Error(`ምዝገባው አልተሳካም፦ ${insertError.message}`);
      }

      registrationId = insertedRow?.id;

      // Do not show success yet. Wait for PDF generation to finish successfully.
      if (!registrationId) {
        warnings.push(
          "ምዝገባው ተልኳል፣ ግን የምዝገባ ID ስለሌለ ፋይሎችን ማያያዝ አልተቻለም"
        );
      } else {
        // Photo is optional. A photo error will not cancel the saved registration.
        if (photoFile) {
          try {
            setMessage("ምዝገባው ተቀምጧል። ፎቶው ወደ Supabase እየተላከ ነው...");

            const photoUrl = await uploadPhoto();

            const { error: photoUpdateError } = await supabase
              .from("canada_registrations")
              .update({ profile_photo_url: photoUrl })
              .eq("id", registrationId);

            if (photoUpdateError) throw photoUpdateError;
          } catch (photoError) {
            console.error("Canada photo upload/update error:", photoError);
            warnings.push("ፎቶው አልተቀመጠም");
          }
        } else {
          warnings.push("ፎቶ አልተጨመረም");
        }

        // PDF creation, upload, and download are all optional after registration.
        if (showPreview && previewRef.current) {
          try {
            setMessage("ምዝገባው ተቀምጧል። PDF እየተዘጋጀ ነው...");

            generatedPdf = await createPdfBlob();

            setMessage("PDF ወደ Supabase እየተላከ ነው...");

            const pdfPath = await uploadPdf(
              generatedPdf.blob,
              generatedPdf.fileName
            );

            const { error: pdfUpdateError } = await supabase
              .from("canada_registrations")
              .update({ pdf_path: pdfPath })
              .eq("id", registrationId);

            if (pdfUpdateError) {
              console.error("Canada PDF path update error:", pdfUpdateError);
              warnings.push("PDF ተልኳል ግን ከምዝገባው ጋር ማያያዝ አልተቻለም");
            }
          } catch (pdfError) {
            console.error("Canada PDF generation/upload error:", pdfError);
            warnings.push("PDF መዘጋጀት ወይም መቀመጥ አልተሳካም");
          }
        } else {
          warnings.push("PDF አልተዘጋጀም፤ Preview አልተከፈተም");
        }

        if (generatedPdf) {
          try {
            savePdfToDevice(generatedPdf.blob, generatedPdf.fileName);
          } catch (downloadError) {
            console.error("Canada PDF download error:", downloadError);
            warnings.push("PDF ወደ ስልክዎ/ኮምፒውተርዎ ማውረድ አልተቻለም");
          }
        }
      }

      // Show success only if registration was saved and PDF generation completed.
      setRegistrationSuccess(Boolean(registrationId && generatedPdf));

      // Keep warnings in the existing message area without duplicating the success text.
      if (warnings.length) {
        setMessage(
          `ምዝገባው በSupabase ተቀምጧል። ${warnings.join("፤ ")}።`
        );
      } else {
        setMessage("");
      }
    } catch (error) {
      console.error("Canada registration error:", error);

      // A failed registration must never show the success message.
      setRegistrationSuccess(false);

      setMessage(
        error?.message ||
          "ምዝገባው አልተሳካም። እባክዎ ደግመው ይሞክሩ።"
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
          disabled={busy || isDownloading}
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
          disabled={busy || isDownloading}
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
              ፎቶ ያስገቡ
            </label>

            <input
              ref={fileInputRef}
              id="canada-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              disabled={isBusy}
              hidden
            />

            <p> ከ5MB በታች።</p>
            <p>ፎቶ ካልተሳካ ምዝገባውን ማድረግ ይችላሉ።</p>
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
            የሞሉትን ፎርም ለመመልከት እዚጋ ይንኩ
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
              className="canada-button canada-register-button"
              onClick={handleRegisterAndPrint}
              disabled={isBusy}
            >
              {busy ? (
                <>
                  <span className="canada-spinner" aria-hidden="true" />
                  በመመዝገብ ላይ ነው ትንሽ ይጠብቁ.../ የሞሉትን ፎርም የ እርስዎ ስልክ ላይ ያገኙታል...
                </>
              ) : (
                " ፎርሙን ለማስገባት እዚጋ ይንኩ "
              )}
            </button>

            {/* Success appears below Submit only after registration and PDF generation succeed. */}
            {registrationSuccess && (
              <p
                className="canada-registration-success"
                role="status"
                aria-live="polite"
                style={{
                  marginTop: "14px",
                  padding: "14px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#e8f7ed",
                  color: "#176534",
                  border: "1px solid #a8dfb8",
                  textAlign: "center",
                  fontWeight: 600,
                  lineHeight: 1.8,
                }}
              >
                {SUCCESS_MESSAGE}
              </p>
            )}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default CanadaForm;
