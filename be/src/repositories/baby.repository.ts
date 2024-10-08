import Baby, { IBaby } from "../models/baby";


class BabyRepo {
    async getBaby(babyId: string): Promise<IBaby | null> {
        try{
            const result = await Baby.findOne({ _id: babyId});

            return result;
        } catch(err){
            throw err
        }
    }
    async getBabies(parentId: string): Promise<IBaby[]> {
        try {
            const result = await Baby.find({ parent_ids: parentId });

            return result;
        } catch (err) {
            throw err;
        }
    }
    
    async createBaby(baby: Partial<IBaby>): Promise<boolean> {
        try {     
            const create : Partial<IBaby> = { ...baby }; 

            const result = await Baby.create(create);

            return result ? true : false;
        } catch (err) {
            console.log('here');
            
            throw err;
        }
    }
    
    async updateBaby(id: string, baby: Partial<IBaby>): Promise<boolean> {
        try {
            const update : Partial<IBaby> = {...baby};

            const result =  await Baby.findOneAndUpdate({ _id: id }, update);

            return result ? true : false;
            
        } catch (err) {
            throw err;
        }
    }

    async deleteBaby(id : string): Promise<boolean> {
        try {
            const result = await Baby.findByIdAndDelete(id);

            return result ? true : false ;
            
        } catch(err) {
            throw err;
        }
    }
}
export default new BabyRepo();