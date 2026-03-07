declare module 'qrcode' {
  interface QRCodeColor {
    dark?: string
    light?: string
  }

  interface QRCodeToDataURLOptions {
    width?: number
    margin?: number
    color?: QRCodeColor
  }

  export function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions,
  ): Promise<string>

  const QRCode: {
    toDataURL: typeof toDataURL
  }

  export default QRCode
}
