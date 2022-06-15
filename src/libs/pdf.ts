import Jimp from "jimp";
import * as pdflib from 'pdf-lib'

const { PDFDocument } = pdflib;

export async function generate_watermark(str: string) {
    const width = str.length * 32
    let image = await new Promise<Jimp>((res, rej) =>
        new Jimp(width, 32, '#00000000', (err, image) => {
            if (err) rej(err)
            res(image)
        }))

    await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
        .then(font => {
            image.print(font, 0, 0, str)
            image.opacity(0.3)
            return image
        }).then(image => {
            let file = `new_name.${image.getExtension()}`
            return image.write(file) // save
        })

    return new Promise<Buffer>((res, rej) => {
        image.getBuffer("image/png", (e, v) => {
            if (e) rej(e)
            res(v)
        })
    })
}

export async function gen_pdf_with_watermark(pdfbytes: Buffer, watermark_text: string) {
    const pdfDoc = await PDFDocument.load(pdfbytes);
    const pages = pdfDoc.getPages();
    const imgobj = await generate_watermark(watermark_text)
    const pimg = await pdfDoc.embedPng(imgobj)


    for (const page of pages) {
        const w = page.getWidth()
        const h = page.getHeight()
        const dims = pimg.scale(0.25 * (w / 720))
        const distance_x = dims.width * 1
        const distance_y = dims.height * 10

        for (let i = 0; i < w / (distance_x); i++)
            for (let j = 0; j < h / (distance_y); j++) {
                page.drawImage(pimg, {
                    x: i * distance_x + 8,
                    y: j * distance_y,
                    width: dims.width,
                    height: dims.height,
                    rotate: pdflib.degrees(45)
                })
            }
    }
    const out_pdfbytes = await pdfDoc.save();
    return Buffer.from(out_pdfbytes)
}

