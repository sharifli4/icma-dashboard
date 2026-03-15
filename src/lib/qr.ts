import QRCode from "qrcode";

export async function toQrSvg(value: string): Promise<string> {
  return QRCode.toString(value, { type: "svg", margin: 1, width: 256 });
}
