import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck } from "lucide-react";

interface Props {
  certNumber: string;
  studentName: string;
  studentIdCode?: string | null;
  programName: string;
  certTitle: string;
  issuedAt: string;
  signatory?: string;
}

/**
 * Real-feel certificate with verification QR + cert number.
 * Burgundy/Ivory/Gold per ScrollUniversity brand.
 */
export function CertificateView({
  certNumber,
  studentName,
  studentIdCode,
  programName,
  certTitle,
  issuedAt,
  signatory = "Office of the Registrar",
}: Props) {
  const verifyUrl = `${window.location.origin}/verify/${certNumber}`;

  return (
    <div
      className="relative mx-auto bg-[#FAF6EC] text-[#3a1217] border-8 border-[#5C1F2A] p-8 sm:p-12 max-w-3xl rounded-lg shadow-2xl"
      style={{ aspectRatio: "1.414 / 1" }}
    >
      {/* Inner gold frame */}
      <div className="absolute inset-3 border border-[#C9A84C] rounded pointer-events-none" />

      <div className="relative h-full flex flex-col text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <ShieldCheck className="h-7 w-7 text-[#C9A84C]" />
          <span className="font-serif text-xs sm:text-sm tracking-[0.3em] uppercase text-[#5C1F2A]">
            ScrollUniversity
          </span>
        </div>

        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#7a4146] mt-4">
          This certifies that
        </p>

        <h1 className="font-serif text-2xl sm:text-4xl text-[#5C1F2A] mt-3">
          {studentName}
        </h1>
        {studentIdCode && (
          <p className="text-[10px] text-[#7a4146] mt-1 font-mono">{studentIdCode}</p>
        )}

        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#7a4146] mt-4">
          has successfully completed
        </p>

        <h2 className="font-serif text-xl sm:text-2xl text-[#3a1217] mt-2 px-4">
          {programName}
        </h2>

        <p className="text-xs sm:text-sm italic text-[#7a4146] mt-2">{certTitle}</p>

        <div className="flex-1" />

        <div className="grid grid-cols-3 gap-4 items-end mt-6 text-left">
          <div className="text-[10px] sm:text-xs">
            <p className="border-t border-[#5C1F2A] pt-1 font-serif">{new Date(issuedAt).toLocaleDateString()}</p>
            <p className="text-[#7a4146] uppercase tracking-wider">Date Issued</p>
          </div>

          <div className="flex flex-col items-center justify-end">
            <div className="bg-white p-1.5 rounded border border-[#C9A84C]">
              <QRCodeSVG value={verifyUrl} size={72} level="M" />
            </div>
            <p className="text-[8px] sm:text-[9px] text-[#7a4146] mt-1 font-mono">{certNumber}</p>
            <p className="text-[8px] text-[#7a4146]">Scan to verify</p>
          </div>

          <div className="text-[10px] sm:text-xs text-right">
            <p className="border-t border-[#5C1F2A] pt-1 font-serif">{signatory}</p>
            <p className="text-[#7a4146] uppercase tracking-wider">Authorized Seal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
