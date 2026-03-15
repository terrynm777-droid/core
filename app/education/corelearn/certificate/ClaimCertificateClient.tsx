"use client";

import { useState } from "react";

export default function ClaimCertificateClient() {
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function claimCertificate() {
    setError("");
    setSuccess("");

    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setError("Please enter the full name to print on the certificate.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/education/course/claim-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          fullName: trimmedName,
          downloadPdf: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to generate certificate PDF.");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "corelearn-certificate.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      setSuccess("Certificate generated and downloaded.");
    } catch {
      setError("Something went wrong while generating the certificate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#0B0F0E]">
        Claim your course certificate
      </h2>

      <p className="mt-3 text-sm leading-7 text-[#37413D]">
        Enter the exact name you want printed on your CORELEARN certificate.
      </p>

      <div className="mt-5">
        <label
          htmlFor="certificate-name"
          className="block text-sm font-medium text-[#0B0F0E]"
        >
          Full name for certificate
        </label>

        <input
          id="certificate-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="mt-2 w-full rounded-2xl border border-[#D7E4DD] bg-white px-4 py-3 text-sm text-[#0B0F0E] outline-none focus:border-[#22C55E]"
        />
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-2xl border border-[#D7E4DD] bg-[#E9F9EF] px-4 py-3 text-sm text-[#166534]">
          {success}
        </div>
      ) : null}

      <div className="mt-5">
        <button
          type="button"
          onClick={claimCertificate}
          disabled={loading}
          className="inline-flex rounded-2xl bg-[#22C55E] px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Generating PDF..." : "Download certificate PDF"}
        </button>
      </div>
    </div>
  );
}