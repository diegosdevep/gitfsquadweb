import { QRCodeSVG } from "qrcode.react";
import { site } from "../config";

export default function QrDescarga({ size = 116, fg = "#211733" }) {
  return (
    <div className="qr-box">
      <QRCodeSVG
        value={site.appStoreUrl || site.urlDescarga}
        size={size}
        bgColor="#ffffff"
        fgColor={fg}
        level="M"
        marginSize={0}
      />
    </div>
  );
}
