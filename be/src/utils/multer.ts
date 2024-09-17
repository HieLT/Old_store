import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

class Multer {
  private fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    const fileTypes = /jpeg|jpg|png|gif/; 
    const extname = fileTypes.test(file.mimetype); 

    if (extname) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF files are allowed.'));
    }
  };

  private upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    storage: multer.memoryStorage(),
    fileFilter: this.fileFilter, // Use the file filter method
  });

  public getUpload() {
    return this.upload;
  }
}

export default new Multer();
