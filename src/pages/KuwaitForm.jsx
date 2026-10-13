import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import supabase from "../supabase";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import "../styles/KuwaitForm.css";

const today = new Date().toISOString().split("T")[0];
const PDF_BUCKET = "kuwait-registration-pdfs";
const PHOTO_BUCKET = "kuwait-applicant-photos";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const SUCCESS_MESSAGE =
  "ፎርሙን በትክክል ሞልተው ጨርሰዋል ። የሞሉትን ፎርም ስልክዎ ላይ ያገኙታል።";

const SUPPORTED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const initialForm = {
  full_name: "",
  gender: "",
  age: "",
  height: "",
  weight: "",
  phone: "",
  education_level: "",
  address: "",
  woreda: "",
  kebele: "",
  nationality: "ኢትዮጵያዊ",
  date_of_birth: "",
  place_of_birth: "",
  form_date: today,
  contact_full_name: "",
  contact_gender: "",
  contact_age: "",
  contact_occupation: "",
  contact_phone: "",
};

function makeId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function KuwaitForm() {
  const [formData, setFormData] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const paperRef = useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return undefined;
    }

    let cancelled = false;
    const reader = new FileReader();

    reader.onload = () => {
      if (!cancelled && typeof reader.result === "string") {
        setPhotoPreview(reader.result);
      }
    };

    reader.onerror = () => {
      if (!cancelled) {
        setPhotoPreview("");
        setPhotoFile(null);
        setMessage(
          "The photo could not be read. You can continue registration without it."
        );
        setMessageType("error");
      }
    };

    reader.readAsDataURL(photoFile);

    return () => {
      cancelled = true;
      if (reader.readyState === FileReader.LOADING) {
        reader.abort();
      }
    };
  }, [photoFile]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  // Check the actual image content by decoding it in the browser.
  const verifyImage = (file) =>
    new Promise((resolve, reject) => {
      if (!file || !SUPPORTED_IMAGE_TYPES[file.type]) {
        reject(
          new Error("Please select a JPEG, PNG, or WEBP image.")
        );
        return;
      }

      if (file.size <= 0 || file.size > MAX_PHOTO_SIZE) {
        reject(
          new Error(
            "The photo must be larger than 0 bytes and no more than 5 MB."
          )
        );
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        const valid =
          image.naturalWidth > 0 && image.naturalHeight > 0;

        URL.revokeObjectURL(objectUrl);

        if (valid) {
          resolve(file);
        } else {
          reject(
            new Error(
              "This image cannot be decoded. Please choose another image."
            )
          );
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(
          new Error(
            "This image is damaged or unsupported. Please choose another image."
          )
        );
      };

      image.src = objectUrl;
    });

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Clear the old selection first, so an invalid photo cannot block registration.
    setPhotoFile(null);
    setPhotoPreview("");
    setShowPreview(false);
    setMessage("");

    try {
      await verifyImage(file);
      setPhotoFile(file);
      setMessage("Photo checked successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage(
        `${error.message} Registration can continue without a photo.`
      );
      setMessageType("error");

      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    }
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setMessage("እባክዎ የተመዝጋቢውን ሙሉ ስም ያስገቡ።");
      setMessageType("error");
      return false;
    }

    if (!formData.phone.trim()) {
      setMessage("እባክዎ የተመዝጋቢውን ስልክ ቁጥር ያስገቡ።");
      setMessageType("error");
      return false;
    }

    return true;
  };

  // A failed optional photo upload never prevents the registration from saving.
  const uploadPhoto = async (file) => {
    if (!file) return null;

    await verifyImage(file);

    const extension = SUPPORTED_IMAGE_TYPES[file.type];
    const filePath = `applicants/${Date.now()}-${makeId()}.${extension}`;

    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from(PHOTO_BUCKET)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("Could not obtain the uploaded photo URL.");
    }

    return data.publicUrl;
  };

  const handlePreview = () => {
    if (!validateForm()) return;

    setShowPreview(true);
    setMessage("Preview is ready. Please check the form before registering.");
    setMessageType("success");

    window.setTimeout(() => {
      paperRef.current?.scrollIntoView({
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
        if (!image.complete) {
          await new Promise((resolve) => {
            image.onload = resolve;
            image.onerror = resolve;
          });
        }

        if (
          typeof image.decode === "function" &&
          image.naturalWidth > 0
        ) {
          try {
            await image.decode();
          } catch (error) {
            console.warn("An image could not be decoded:", error);
          }
        }
      })
    );
  };

  const getPdfFileName = () => {
    const safeName =
      formData.full_name
        .trim()
        .toLowerCase()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .replace(/\s+/g, "_")
        .replace(/^_+|_+$/g, "") || "applicant";

    return `Kuwait_Registration_${safeName}.pdf`;
  };

  const createPdfBlob = async () => {
    if (!paperRef.current) {
      throw new Error("The form preview could not be found.");
    }

    const originalPaper = paperRef.current;
    await waitForImages(originalPaper);

    const pdfContainer = document.createElement("div");
    const pdfPaper = originalPaper.cloneNode(true);

    Object.assign(pdfContainer.style, {
      position: "fixed",
      left: "-12000px",
      top: "0",
      width: "794px",
      minWidth: "794px",
      background: "#ffffff",
      zIndex: "-1",
      pointerEvents: "none",
    });

    Object.assign(pdfPaper.style, {
      display: "block",
      boxSizing: "border-box",
      width: "794px",
      minWidth: "794px",
      maxWidth: "794px",
      minHeight: "1123px",
      height: "auto",
      margin: "0",
      padding: "32px",
      overflow: "visible",
      border: "0",
      boxShadow: "none",
      background: "#ffffff",
      transform: "none",
    });

    const tableGrid = pdfPaper.querySelector(
      ".kuwait-paper-table-grid"
    );

    if (tableGrid) {
      Object.assign(tableGrid.style, {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "8px",
        alignItems: "start",
        width: "100%",
      });
    }

    const signatures = pdfPaper.querySelector(
      ".kuwait-paper-signatures"
    );

    if (signatures) {
      Object.assign(signatures.style, {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "18px 24px",
      });
    }

    // The photo is optional; remove an empty photo frame in the PDF copy.
    const photoFrame = pdfPaper.querySelector(
      ".kuwait-paper-photo"
    );
    const sourcePhoto = originalPaper.querySelector(
      ".kuwait-paper-photo img"
    );
    const pdfPhoto = pdfPaper.querySelector(
      ".kuwait-paper-photo img"
    );

    if (sourcePhoto && pdfPhoto && sourcePhoto.src) {
      pdfPhoto.src = sourcePhoto.currentSrc || sourcePhoto.src;
      pdfPhoto.style.display = "block";
      pdfPhoto.style.width = "100%";
      pdfPhoto.style.height = "100%";
      pdfPhoto.style.objectFit = "cover";

      try {
        await new Promise((resolve) => {
          if (pdfPhoto.complete && pdfPhoto.naturalWidth > 0) {
            resolve();
            return;
          }

          let settled = false;
          let timeoutId;

          const finish = () => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeoutId);
            resolve();
          };

          pdfPhoto.onload = finish;
          pdfPhoto.onerror = finish;
          timeoutId = window.setTimeout(finish, 5000);
        });

        if (!pdfPhoto.naturalWidth && photoFrame) {
          photoFrame.remove();
        }
      } catch {
        if (photoFrame) photoFrame.remove();
      }
    } else if (photoFrame) {
      photoFrame.remove();
    }

    pdfContainer.appendChild(pdfPaper);
    document.body.appendChild(pdfContainer);

    try {
      await waitForImages(pdfPaper);

      const canvas = await html2canvas(pdfPaper, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        windowWidth: 1200,
        windowHeight: 1200,
        scrollX: 0,
        scrollY: 0,
      });

      const imageData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 5;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      const ratio = Math.min(
        availableWidth / canvas.width,
        availableHeight / canvas.height
      );

      const imageWidth = canvas.width * ratio;
      const imageHeight = canvas.height * ratio;

      pdf.addImage(
        imageData,
        "PNG",
        (pageWidth - imageWidth) / 2,
        (pageHeight - imageHeight) / 2,
        imageWidth,
        imageHeight,
        undefined,
        "FAST"
      );

      const blob = pdf.output("blob");

      if (!blob || blob.size === 0) {
        throw new Error("The generated PDF is empty.");
      }

      return { blob, fileName: getPdfFileName() };
    } finally {
      pdfContainer.remove();
    }
  };

  const downloadPdfBlob = (blob, fileName) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  };

  // PDF upload is optional after registration succeeds.
  const uploadPdf = async (blob, fileName) => {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `registrations/${Date.now()}-${makeId()}-${safeFileName}`;

    const { error } = await supabase.storage
      .from(PDF_BUCKET)
      .upload(filePath, blob, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });

    if (error) throw new Error(error.message);

    return filePath;
  };

  const handleRegisterAndPrint = async () => {
    if (loading) return;
    if (!validateForm()) return;

    if (!showPreview) {
      setMessage(
        "Please click Preview Form and check the form before registering."
      );
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("Saving registration to Supabase...");
    setMessageType("info");

    let registrationId = null;

    try {
      // STEP 1: Save registration FIRST. Photo and PDF are not prerequisites.
      const payload = {
        full_name: formData.full_name.trim(),
        gender: formData.gender || null,
        age: formData.age === "" ? null : Number(formData.age),
        height: formData.height === "" ? null : Number(formData.height),
        weight: formData.weight === "" ? null : Number(formData.weight),
        phone: formData.phone.trim(),
        education_level: formData.education_level || null,
        address: formData.address.trim() || null,
        woreda: formData.woreda.trim() || null,
        kebele: formData.kebele.trim() || null,
        nationality: formData.nationality.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        place_of_birth: formData.place_of_birth.trim() || null,
        form_date: formData.form_date || null,
        contact_full_name: formData.contact_full_name.trim() || null,
        contact_gender: formData.contact_gender || null,
        contact_age:
          formData.contact_age === ""
            ? null
            : Number(formData.contact_age),
        contact_occupation: formData.contact_occupation.trim() || null,
        contact_phone: formData.contact_phone.trim() || null,
        profile_photo_url: null,
        pdf_path: null,
        pdf_url: null,
      };

      const { data: insertedRows, error: insertError } = await supabase
        .from("kuwait_registrations")
        .insert([payload])
        .select("id");

      if (insertError) {
        throw new Error(
          `Registration could not be saved to Supabase: ${insertError.message}`
        );
      }

      registrationId = insertedRows?.[0]?.id ?? null;

      // The registration is now saved. Nothing below can undo that save.
      const warnings = [];
      let photoUrl = null;
      let pdfPath = null;

      // STEP 2: Attempt photo upload without blocking the registration.
      if (photoFile) {
        try {
          setMessage("Registration saved. Uploading profile photo...");
          photoUrl = await uploadPhoto(photoFile);

          if (registrationId) {
            const { error } = await supabase
              .from("kuwait_registrations")
              .update({ profile_photo_url: photoUrl })
              .eq("id", registrationId);

            if (error) {
              warnings.push(
                "Photo uploaded, but its URL could not be saved."
              );
            }
          }
        } catch (error) {
          console.warn("Optional photo upload failed:", error);
          warnings.push(
            "Profile photo was not saved; registration is complete."
          );
        }
      }

      // STEP 3: Generate the PDF. Success is shown only if this succeeds.
      let pdfBlob = null;
      let fileName = getPdfFileName();
      let pdfGenerated = false;

      try {
        setMessage("Registration saved. Generating PDF...");

        const generated = await createPdfBlob();

        pdfBlob = generated.blob;
        fileName = generated.fileName;
        pdfGenerated = true;
      } catch (error) {
        console.warn("PDF generation failed:", error);
        warnings.push("PDF generation failed.");
      }

      // PDF upload is optional; it does not determine whether PDF generation succeeded.
      if (pdfBlob) {
        try {
          setMessage("Registration saved. Uploading PDF...");

          pdfPath = await uploadPdf(pdfBlob, fileName);

          if (registrationId) {
            const { error } = await supabase
              .from("kuwait_registrations")
              .update({ pdf_path: pdfPath })
              .eq("id", registrationId);

            if (error) {
              warnings.push(
                "PDF uploaded, but its path could not be saved to the registration."
              );
            }
          }
        } catch (error) {
          console.warn("PDF upload failed:", error);
          warnings.push(
            "PDF upload failed; the registration is still saved."
          );
        }

        try {
          downloadPdfBlob(pdfBlob, fileName);
        } catch (error) {
          console.warn("PDF download failed:", error);
          warnings.push("Automatic PDF download failed.");
        }
      }

      // Show the exact success message only when registration and PDF generation succeed.
      if (pdfGenerated) {
        setMessage(SUCCESS_MESSAGE);
        setMessageType("success");
      } else {
        setMessage(
          "Registration was saved, but PDF generation failed. Please try downloading the PDF again."
        );
        setMessageType("error");
      }

      if (warnings.length > 0) {
        console.warn("Registration completed with notices:", warnings);
      }
    } catch (error) {
      console.error("Kuwait registration error:", error);

      setMessage(
        error.message ||
          "Could not save registration. Please check your internet connection and Supabase settings."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOnly = async () => {
    if (loading) return;

    if (!showPreview) {
      setMessage("Please click Preview Form before downloading the PDF.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("Preparing your PDF...");
    setMessageType("info");

    try {
      const { blob, fileName } = await createPdfBlob();
      downloadPdfBlob(blob, fileName);

      setMessage("PDF downloaded successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("Kuwait PDF download error:", error);
      setMessage(error.message || "Could not download the PDF.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label, name, options = {}) => (
    <label className="kuwait-field" key={name}>
      <span>
        {label}
        {options.required ? " *" : ""}
      </span>

      {options.type === "select" ? (
        <select
          name={name}
          value={formData[name]}
          onChange={updateField}
          required={options.required}
        >
          <option value="">Select / ይምረጡ</option>
          {options.options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          type={options.type || "text"}
          value={formData[name]}
          onChange={updateField}
          required={options.required}
          min={options.min}
          max={options.max}
          step={options.step}
          placeholder={options.placeholder || ""}
        />
      )}
    </label>
  );

  return (
    <div className="kuwait-page">
      <header className="kuwait-header">
        <Logo />
      </header>

      <main className="kuwait-main">
        <section className="kuwait-intro">
          <h2>የኩዌት ምዝገባ ፎርም</h2>
          <h2>kuwait Registration Form</h2>
          <p>
            እባክዎ ሁሉንም መረጃ በትክክል ይሙሉ።
          </p>
          <p>Please complete all information accurately</p>
        </section>

        <form
          className="kuwait-form-card"
          onSubmit={(event) => {
            event.preventDefault();
            handlePreview();
          }}
        >


          <div className="kuwait-photo-upload">
            <div className="kuwait-photo-preview">
              {photoPreview ? (
                <img src={photoPreview} alt="Applicant preview" />
              ) : (
                <div className="kuwait-photo-placeholder">
                  <span aria-hidden="true">＋</span>
                  <small>Profile photo</small>
                </div>
              )}
            </div>

            <div className="kuwait-photo-details">
              <h3>Applicant Photo /የ አመልካች ፎቶ</h3>
              <p>Upload a clear image. maximum 5MB.</p>

              <input
                ref={photoInputRef}
                className="kuwait-photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
              />

              <button
                className="kuwait-button kuwait-button-light"
                type="button"
                onClick={() => photoInputRef.current?.click()}
              >
                Choose Photo / ፎቶ ይምረጡ
              </button>

              {photoFile && (
                <span className="kuwait-file-name">{photoFile.name}</span>
              )}
            </div>
          </div>

          <div className="kuwait-section-title">
            <span>01</span>
            <div>
              <h3>የተመዝጋቢው ማንነት</h3>
              <p>Applicant Identity</p>
            </div>
          </div>

          <div className="kuwait-input-grid">
            {renderField("ሙሉ ስም እስከ  አያት", "full_name", {
              required: true,
            })}
            {renderField(" ፆታ", "gender", {
              type: "select",
              options: [
                { value: "Male", label: "Male / ወንድ" },
                { value: "Female", label: "Female / ሴት" },
              ],
            })}
            {renderField("እድሜ", "age", {
              type: "number",
              min: 0,
              max: 120,
            })}
           
            {renderField("የፓስፖርት ቁጥር", "weight", {
              type: "number",
              min: 0,
              step: "0.1",
            })}
            {renderField(" ስልክ ቁጥር", "phone", {
              type: "tel",
              required: true,
            })}
            
          </div>

          <div className="kuwait-section-title">
            <span>02</span>
            <div>
              <h3>መኖሪያ አድራሻ እና የትውልድ መረጃ</h3>
              <p>Address and Birth Information</p>
            </div>
          </div>

          <div className="kuwait-input-grid">
            
            {renderField(" ወረዳ", "woreda")}
            {renderField(" ቀበሌ", "kebele")}
            {renderField(" ዜግነት", "nationality")}
            
            {renderField("Form Date / ቅጹ የተሞላበት ቀን", "form_date", {
              type: "date",
            })}
          </div>

          <div className="kuwait-section-title">
            <span>03</span>
            <div>
              <h3>የቅርብ ተጠሪ ወይም ተያዥ</h3>
              <p>Emergency Contact</p>
            </div>
          </div>

          <div className="kuwait-input-grid">
            {renderField(" ሙሉ ስም እስከ አያት", "contact_full_name")}
            {renderField(" ፆታ", "contact_gender", {
              type: "select",
              options: [
                { value: "Male", label: "Male / ወንድ" },
                { value: "Female", label: "Female / ሴት" },
              ],
            })}
            {renderField(" እድሜ", "contact_age", {
              type: "number",
              min: 0,
              max: 120,
            })}
           
            {renderField(" ስልክ ቁጥር", "contact_phone", {
              type: "tel",
            })}
          </div>

          {/* Keep the success message exclusively below Submit. */}
          {message &&
            !(messageType === "success" && message === SUCCESS_MESSAGE) && (
              <div
                className={`kuwait-message kuwait-message-${messageType}`}
                role="status"
              >
                {message}
              </div>
            )}

          <div className="kuwait-form-actions">
            <button
              className="kuwait-button kuwait-button-light"
              type="submit"
              disabled={loading}
            >
              የሞሉትን ፎርም ለመመልከት እዚጋ ይንኩ
            </button>
          </div>
        </form>

        {showPreview && (
          <section className="kuwait-preview-section">
            <div className="kuwait-preview-toolbar">
              <div>
                <h2>Form Preview</h2>
                <p>Review the information before registering.</p>
              </div>
            </div>

            <article className="kuwait-paper" ref={paperRef}>
              <img
                className="kuwait-paper-watermark"
                src="/images/qwitfl.jpg"
                alt=""
                aria-hidden="true"
                crossOrigin="anonymous"
              />

              <div className="kuwait-paper-content">
                <div className="kuwait-paper-top">
                  <div className="kuwait-paper-photo">
                    {photoPreview && (
                      <img src={photoPreview} alt="Applicant" />
                    )}
                  </div>

                  <div className="kuwait-paper-date">
                    <strong>ቀን / Date:</strong>
                    <span>{formData.form_date || "________________"}</span>
                  </div>
                </div>

                <div className="kuwait-paper-heading">
                  <h2>የኩዌት የስራ ቪዛ ተመዝጋቢ ቅጽ</h2>
                  <h3>KUWAIT WORK VISA APPLICANT REGISTRATION FORM</h3>
                  <div className="kuwait-paper-rule" />
                </div>

                <div className="kuwait-paper-introduction" lang="am">
                  <p>
                    በቅድሚያ የማክበር ሰላምታችንን እያቀረብን የኩዌት መንግስት አዲስ
                    ባወጣው የስራ እድል መግለጫ መሰረት ብዛት ያለው የሰው ሀይል
                    እንደሚያስፈልግ ያሳወቀ ሲሆን በዚህም መሰረት፦
                  </p>
                  <p>
                    እኔ አቶ/ወ/ሮ {formData.full_name || "________________"}{" "}
                    አዲስ በወጣው የስራ መግለጫ መሰረት ተመዝጋቢ ሆኜ ቀርቤአለሁ።
                    ስለሆነም በኢትዮጵያዊነቴ በመንግስት እርዳታ ወደ ኩዌት በስራ ቪዛ
                    ለመሄድ መስማማቴን ከዚህ በታች በሞላሁት ቅጽ ፈርሜ አስቀምጫለሁ።
                  </p>
                </div>

                <div
                  className="kuwait-paper-table-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "8px",
                    alignItems: "start",
                    width: "100%",
                  }}
                >
                  <section className="kuwait-paper-table-block">
                    <h3>❖ የተመዝጋቢው ማንነት / Applicant Identity</h3>
                    <table>
                      <tbody>
                        <tr><th>ሙሉ ስም </th><td>{formData.full_name || "—"}</td></tr>
                        <tr><th>ፆታ </th><td>{formData.gender || "—"}</td></tr>
                        <tr><th>እድሜ </th><td>{formData.age || "—"}</td></tr>
                        
                        <tr><th>የፓስፖርት ቁጥር </th><td>{formData.weight || "—"}</td></tr>
                        <tr><th>ስ.ቁ </th><td>{formData.phone || "—"}</td></tr>
                      
                      </tbody>
                    </table>
                  </section>

                  <section className="kuwait-paper-table-block">
                    <h3>የአድራሻ መረጃ / Address Information</h3>
                    <table>
                      <tbody>
                       
                        <tr><th>ወረዳ </th><td>{formData.woreda || "—"}</td></tr>
                        <tr><th>ቀበሌ</th><td>{formData.kebele || "—"}</td></tr>
                        <tr><th>ዜግነት </th><td>{formData.nationality || "—"}</td></tr>
                      
                        <tr><th>ቅጽ የተሞላበት ቀን </th><td>{formData.form_date || "—"}</td></tr>
                      </tbody>
                    </table>
                  </section>
                </div>

                <section
                  className="kuwait-paper-table-block kuwait-contact-table"
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "8px",
                    clear: "both",
                  }}
                >
                  <h3>❖ የቅርብ ተጠሪ ወይም ተያዥ / Emergency Contact</h3>
                  <table>
                    <tbody>
                      <tr><th>ሙሉ ስም </th><td>{formData.contact_full_name || "—"}</td></tr>
                      <tr><th>ፆታ </th><td>{formData.contact_gender || "—"}</td></tr>
                      <tr><th>እድሜ </th><td>{formData.contact_age || "—"}</td></tr>
                     
                      <tr><th>ስ.ቁ </th><td>{formData.contact_phone || "—"}</td></tr>
                    </tbody>
                  </table>
                </section>

                <div className="kuwait-paper-signatures">
                  <p>
                    የተመዝጋቢው ስም :
                    <strong>
                      {formData.full_name || "________________________"}
                    </strong>
                  </p>
                  <p>
                    የቅርብ ተጠሪ ስም :
                    <strong>
                      {formData.contact_full_name || "________________________"}
                    </strong>
                  </p>
                </div>
              </div>
            </article>

            <div className="kuwait-preview-bottom-actions">
              <button
                className="kuwait-button kuwait-button-primary"
                type="button"
                onClick={handleRegisterAndPrint}
                disabled={loading}
              >
                {loading
                  ? "በመመዝገብ ላይ ነው ትንሽ ይጠብቁ.../ ፎርሙን የ እርስዎ ስልክ ላይ ያገኙታል..."
                  : "ፎርሙን ለማስገባት እዚጋ ይንኩ"}
              </button>

              {/* The registration success message appears only here, below Submit. */}
              {message && (
                <div
                  className={`kuwait-message kuwait-message-${messageType}`}
                  role="status"
                  aria-live="polite"
                >
                  {message}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default KuwaitForm;