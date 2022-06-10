const multer = require('multer')
const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/png||jpeg||jpg||gif$i/)) {
        cb(new Error("Invalid image format!"));
        return;
      }
      cb(null, true);
    }
  })

  module.exports = upload