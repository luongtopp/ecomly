const multer = require('multer')
const path = require('path')
const unlink = require('fs').promises

const ALLOWED_EXTENTION = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    cb(null, 'src/public/uploads')
  },
  filename: function (_, file, cb) {
    const filename = file.originalName
      .replace(' ', '-')
      .replace('jpg', '')
      .replace('jpeg', '')
      .replace('png', '')
    const extension = ALLOWED_EXTENTION[file.mimetype]
    cb(null, `${filename}-${Date.now()}.${extension}`)
  }
})

exports.upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (_, file, cb) => {
    const isValid = ALLOWED_EXTENTION[file.mimetype]
    let uploadError = new Error(`Invalid image type\n${file.mimetype} is not allowed`)
    if (!isValid) return cb(uploadError);
    return cb(null, true)
  }
})

exports.deleteImages = async function (imageUrls, continuteOnErrorName) {
  await Promise.all(imageUrls.map(async (imageUrl) => {
    const imagePath = path.resolve(
      __dirname,
      '..',
      'public',
      'uploads',
      path.basename(imageUrl)
    )
    try {
      await unlink(imagePath)
    } catch (error) {
      if (error.code === continuteOnErrorName) {
        console.error(`Continuing with the next image: ${error.message}`)
      } else {
        console.error(`Error deleting image: ${error.message}`)
        throw error
      }
    }
  }))
}
