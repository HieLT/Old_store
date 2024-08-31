import multer from 'multer';

class Multer {
    private upload = multer({
        limits: { fileSize: 5 * 1024 * 1024 },
        storage: multer.memoryStorage() 
    });

    public getUpload() {
        return this.upload;
    }
}

export default new Multer();
